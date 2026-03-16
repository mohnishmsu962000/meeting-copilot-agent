import structlog
import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.transcription import TranscriptManager, connect_to_deepgram
from app.services.suggestions import generate_suggestion
from app.models.meeting import WSMessage

logger = structlog.get_logger()

router = APIRouter(prefix="/ws", tags=["websocket"])

sessions: dict[str, TranscriptManager] = {}


async def send_ws(websocket: WebSocket, type: str, data: dict):
    message = WSMessage(type=type, data=data)
    await websocket.send_text(message.model_dump_json())


@router.websocket("/meeting/{session_id}")
async def meeting_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    log = logger.bind(session_id=session_id)
    log.info("websocket_connected")

    transcript_manager = TranscriptManager()
    sessions[session_id] = transcript_manager
    deepgram_ws = None

    async def receive_from_deepgram():
        """Listen to Deepgram and process transcripts."""
        try:
            async for message in deepgram_ws:
                data = json.loads(message)

                # Only process final transcripts
                if data.get("type") != "Results":
                    continue

                transcript = data.get("channel", {}).get("alternatives", [{}])[0].get("transcript", "")
                if not transcript.strip():
                    continue

                # Extract speaker from diarization
                words = data.get("channel", {}).get("alternatives", [{}])[0].get("words", [])
                speaker = f"Speaker {words[0].get('speaker', 0)}" if words else None

                chunk = transcript_manager.add_chunk(text=transcript, speaker=speaker)

                await send_ws(websocket, "transcript", {
                    "text": chunk.text,
                    "speaker": chunk.speaker,
                    "timestamp": chunk.timestamp,
                })

                log.info("transcript_chunk", text=transcript[:50])

                if transcript_manager.should_generate_suggestion():
                    context = transcript_manager.get_context_as_text()
                    suggestion = await generate_suggestion(context)
                    if suggestion:
                        await send_ws(websocket, "suggestion", {
                            "insight": suggestion.insight,
                            "follow_up_question": suggestion.follow_up_question,
                            "technical_explanation": suggestion.technical_explanation,
                        })

        except Exception as e:
            log.error("deepgram_receive_failed", error=str(e))

    async def forward_to_deepgram():
        """Receive audio from frontend and forward to Deepgram."""
        try:
            while True:
                data = await websocket.receive_bytes()
                await deepgram_ws.send(data)
        except WebSocketDisconnect:
            log.info("client_disconnected")
        except Exception as e:
            log.error("forward_failed", error=str(e))

    try:
        deepgram_ws = await connect_to_deepgram()
        await send_ws(websocket, "status", {"status": "connected", "session_id": session_id})

        # Run both tasks concurrently
        await asyncio.gather(
            receive_from_deepgram(),
            forward_to_deepgram(),
        )

    except WebSocketDisconnect:
        log.info("websocket_disconnected")

    except Exception as e:
        log.error("websocket_error", error=str(e))

    finally:
        if deepgram_ws:
            await deepgram_ws.close()
        sessions.pop(session_id, None)
        log.info("session_cleaned_up")