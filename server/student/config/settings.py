import os
from pathlib import Path
from dotenv import load_dotenv

# Fix: Force load the .env file from the server root (3 levels up)
# Structure: server/student/config/settings.py -> server/.env
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path, override=True)

class Settings:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    
    # Use the specific key verified to work on the recruiter side
    SUPABASE_KEY = os.getenv("SUPABASE_KEY") 
    
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # Fix: Centralize model name to prevent "Decommissioned" errors
    GROQ_MODEL_NAME = os.getenv("GROQ_MODEL_NAME", "llama-3.3-70b-versatile")

settings = Settings()