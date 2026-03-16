from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "Meeting Copilot"
    app_version: str = "0.1.0"
    debug: bool = False

    # OpenAI
    openai_api_key: str
    openai_model: str = "gpt-4o"

    # Deepgram
    deepgram_api_key: str

    # Transcription
    context_window_size: int = 10  # last N utterances to send to LLM
    suggestion_interval: int = 3   # generate suggestion every N transcript chunks

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()