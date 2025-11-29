# File: storage_utils.py
import os
import uuid
import mimetypes
from pathlib import Path
from supabase import create_client
from dotenv import load_dotenv

# --- FIX: Force load the local .env file ---
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path, override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in environment variables.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_resume_info_to_db(
    file_name: str,
    file_path: str,
    job_id: str,
    user_id: str,
    candidate_name: str = "Unknown",
):
    resume_id = str(uuid.uuid4())

    try:
        with open(file_path, "rb") as f:
            file_content = f.read()
    except Exception as e:
        print(f"🚨 Could not open {file_path}: {e}")
        return None

    content_type, _ = mimetypes.guess_type(file_path)
    if not content_type:
        content_type = "application/octet-stream"

    storage_path = f"{job_id}/{file_name}"
    
    try:
        supabase.storage.from_("resumes").upload(
            path=storage_path,
            file=file_content,
            file_options={"content-type": content_type},
        )
    except Exception as e:
        print(f"🚨 Upload failed: {e}")
        return None

    public_url = f"{SUPABASE_URL}/storage/v1/object/public/resumes/{storage_path}"

    try:
        supabase.table("resume_uploads").insert(
            {
                "resume_id": resume_id,
                "user_id": user_id,
                "job_id": job_id,
                "file_name": file_name,
                "file_path": public_url,
                "candidate_name": candidate_name,
            }
        ).execute()
        
        print(f"📥 Saved metadata in DB for {file_name}")
        return resume_id

    except Exception as e:
        print(f"🚨 DB insert failed: {e}")
        return None
        
    finally:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"⚠️ Failed to delete local file {file_path}: {e}")