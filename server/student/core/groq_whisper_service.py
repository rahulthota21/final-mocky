from groq import Groq
from config.settings import settings
import logging

# Configure logger
logger = logging.getLogger(__name__)

class GroqWhisperService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        # Using Groq's optimized Whisper model
        self.model = "whisper-large-v3-turbo"

    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribe an audio file to text using Groq's Whisper API.
        
        Args:
            audio_file_path (str): Path to the audio file on disk.
            
        Returns:
            str: Transcribed text.
        """
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    file=audio_file,
                    model=self.model,
                    # response_format="text" returns the string directly
                    response_format="text"
                )
            return transcription
        except Exception as e:
            logger.error(f"Error transcribing audio with Groq Whisper: {str(e)}")
            raise Exception(f"Error transcribing audio with Groq Whisper: {str(e)}")