import structlog
import time
import json
import asyncio
import websockets
from app.config import get_settings
from app.models.meeting import TranscriptChunk

logger = structlog.get_logger()
settings = get_settings()


DEEPGRAM_URL = "wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&smart_format=true&interim_results=true&utterance_end_ms=1000&vad_events=true&diarize=true"



class TranscriptManager:
    def __init__(self):
        self.chunks: list[TranscriptChunk] = []
        self.chunk_count: int = 0

    def add_chunk(self, text: str, speaker: str = None) -> TranscriptChunk:
        chunk = TranscriptChunk(
            text=text,
            speaker=speaker,
            timestamp=time.time(),
        )
        self.chunks.append(chunk)
        self.chunk_count += 1
        return chunk

    def get_context_window(self) -> list[TranscriptChunk]:
        return self.chunks[-settings.context_window_size:]

    def get_context_as_text(self) -> str:
        window = self.get_context_window()
        lines = []
        for chunk in window:
            speaker = chunk.speaker or "Speaker"
            lines.append(f"{speaker}: {chunk.text}")
        return "\n".join(lines)

    def get_full_transcript(self) -> list[TranscriptChunk]:
        return self.chunks

    def should_generate_suggestion(self) -> bool:
        return self.chunk_count > 0 and self.chunk_count % settings.suggestion_interval == 0

    def reset(self):
        self.chunks = []
        self.chunk_count = 0


async def connect_to_deepgram() -> websockets.WebSocketClientProtocol:
    """Open a raw WebSocket connection to Deepgram."""
    try:
        connection = await websockets.connect(
            DEEPGRAM_URL,
            additional_headers={"Authorization": f"Token {settings.deepgram_api_key}"}
        )
        logger.info("deepgram_connection_opened")
        return connection
    except websockets.exceptions.InvalidStatus as e:
        logger.error("deepgram_rejected", status=e.response.status_code, body=e.response.body)
        raise