from fastapi import APIRouter, HTTPException, Depends, Query
from api.dependencies import get_supabase, get_whisper_service
import logging
import os
import uuid
import asyncio
import tempfile

from utils.supabase_utils import download_file

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stress", tags=["stress"])

@router.post("/analyze-stress/{session_id}/{question_number}")
async def analyze_stress(
    session_id: str,
    question_number: int,
    duration: float = Query(60.0, description="Duration of the audio recording in seconds"),
    supabase=Depends(get_supabase),
    whisper_service=Depends(get_whisper_service),
):
    """
    Analyze stress based on audio transcription and speaking speed (WPM).
    Duration should be provided by the frontend for accuracy.
    """
    # Short buffer to ensure file availability
    await asyncio.sleep(2)

    # Validate UUID
    try:
        uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid session_id format. Must be a valid UUID."
        )

    # Download audio file (uploaded by frontend)
    audio_bucket_path = f"answers/{session_id}/{question_number}/audio.webm"
    try:
        raw_audio = download_file("mock.interview.answers", audio_bucket_path)
    except Exception as e:
        logger.warning(f"Audio not found: {e}")
        raise HTTPException(status_code=404, detail="Audio not found in bucket")

    # Write audio to a temp file for whisper
    with tempfile.TemporaryDirectory() as tmp:
        aud_file = os.path.join(tmp, "audio.webm")
        with open(aud_file, "wb") as f:
            f.write(raw_audio)

        # Transcribe audio
        # whisper_service is now GroqWhisperService from dependencies
        transcript = whisper_service.transcribe_audio(aud_file)
        
        # Calculate metrics
        word_count = len(transcript.split())
        
        # Sanity check duration to avoid division by zero
        if duration < 1.0: 
            duration = 60.0

        wpm = (word_count / duration) * 60

    # Heuristic stress scoring based on WPM
    # Normal speaking rate is ~130-150 wpm.
    # Too fast (>160) or too slow (<120) can indicate stress/nervousness.
    stress = 50.0 # Base neutral score
    
    if wpm > 160:
        stress += (wpm - 160) * 0.5
    elif wpm < 110:
        stress += (110 - wpm) * 0.5
        
    # Cap stress between 0 and 100
    stress = max(0.0, min(100.0, stress))

    level = (
        "High" if stress > 70 else
        "Moderate" if stress > 40 else
        "Low"
    )

    # Upsert into Supabase
    try:
        supabase.table("mock_interview_stress_analysis").upsert(
            {
                "session_id": session_id,
                "question_number": question_number,
                "stress_score": stress,
                "stress_level": level,
                "individual_scores": [{"metric": "wpm", "value": wpm, "score": stress}],
            }, 
            on_conflict="session_id,question_number"
        ).execute()
    except Exception as e:
        logger.error(f"Database error saving stress analysis: {e}")
        # We don't raise here to return the result to the user anyway

    logger.info(
        f"Stress analysis complete for {session_id}@Q{question_number}: "
        f"{stress:.1f} ({level}) - WPM: {wpm:.1f}"
    )
    return {"stress_score": stress, "stress_level": level, "wpm": wpm}

@router.get("/average-stress/{session_id}")
async def average_stress(session_id: str, supabase=Depends(get_supabase)):
    # Validate UUID
    try:
        uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid session_id format. Must be a valid UUID."
        )

    result = supabase.table("mock_interview_stress_analysis") \
                     .select("stress_score") \
                     .eq("session_id", session_id) \
                     .execute()

    entries = result.data or []
    if not entries:
        # Return a neutral default instead of 404 to prevent frontend breakage
        return {
            "average_stress": 50.0,
            "average_stress_level": "Not Analyzed",
            "individual_scores": []
        }

    scores = [e["stress_score"] for e in entries if e["stress_score"] is not None]
    
    if not scores:
        return {
            "average_stress": 0.0,
            "average_stress_level": "Low",
            "individual_scores": []
        }

    avg = sum(scores) / len(scores)
    level = (
        "High" if avg > 70 else
        "Moderate" if avg > 40 else
        "Low"
    )

    logger.info(f"Average stress for {session_id}: {avg:.1f} ({level})")
    return {
        "average_stress": avg,
        "average_stress_level": level,
        "individual_scores": scores
    }