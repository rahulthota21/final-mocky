from typing import Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class StressService:
    def __init__(self, whisper_service):
        self.whisper_service = whisper_service

    def analyze_stress(self, audio_path: str, duration: float = 60.0) -> Dict:
        """
        Analyze stress based on uploaded audio file and provided duration.
        - audio_path: path to the audio file
        - duration: duration in seconds (default 60s if unavailable)
        """
        try:
            # 1. Transcribe audio
            transcription = self.whisper_service.transcribe_audio(audio_path)
            word_count = len(transcription.split())

            # 2. Calculate speaking speed (words per minute)
            # Sanity check duration to avoid division by zero
            if duration < 1.0:
                duration = 60.0  # Fallback default
            
            wpm = (word_count / duration) * 60

            # 3. Calculate audio-based stress score (Heuristic)
            # Normal speaking speed is approx 130-150 WPM.
            # Significant deviations (too fast or too slow) indicate stress/nervousness.
            
            stress = 50.0  # Start at neutral baseline
            
            if wpm > 160:
                # Penalty for speaking too fast (nervous energy)
                stress += (wpm - 160) * 0.5
            elif wpm < 110:
                # Penalty for speaking too slow (hesitation/uncertainty)
                stress += (110 - wpm) * 0.5
            
            # Clamp score between 0 and 100
            stress = max(0.0, min(100.0, stress))

            # 4. Determine Stress Level
            stress_level = (
                "High Stress" if stress > 70 else
                "Moderate Stress" if stress > 40 else
                "Low Stress"
            )

            logger.info(f"Stress Analysis - WPM: {wpm:.1f}, Score: {stress:.1f} ({stress_level})")

            return {
                "score": stress,
                "level": stress_level,
                "individual_scores": [
                    {"metric": "audio_speaking_speed", "value": wpm, "score": stress}
                ]
            }
            
        except Exception as e:
            logger.error(f"Error analyzing stress: {str(e)}")
            # Propagate error so the caller knows analysis failed
            raise Exception(f"Error analyzing stress: {str(e)}")