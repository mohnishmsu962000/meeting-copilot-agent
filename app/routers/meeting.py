import structlog
from fastapi import APIRouter, HTTPException
from app.models.meeting import MeetingEndRequest, MeetingSummary, ActionItem
from app.services.suggestions import generate_summary
from app.routers.ws import sessions

logger = structlog.get_logger()

router = APIRouter(prefix="/meeting", tags=["meeting"])


@router.post("/end/{session_id}", response_model=MeetingSummary)
async def end_meeting(session_id: str):
    """End a meeting session and generate a full summary."""
    log = logger.bind(session_id=session_id)

    transcript_manager = sessions.get(session_id)

    if not transcript_manager:
        raise HTTPException(status_code=404, detail="Session not found")

    chunks = transcript_manager.get_full_transcript()

    if not chunks:
        raise HTTPException(status_code=400, detail="No transcript data found")

    # Build full transcript text
    lines = []
    for chunk in chunks:
        speaker = chunk.speaker or "Speaker"
        lines.append(f"{speaker}: {chunk.text}")
    transcript_text = "\n".join(lines)

    log.info("generating_meeting_summary", chunks=len(chunks))

    summary_data = await generate_summary(transcript_text)

    if not summary_data:
        raise HTTPException(status_code=500, detail="Failed to generate summary")

    action_items = [
        ActionItem(**item) for item in summary_data.get("action_items", [])
    ]

    return MeetingSummary(
        title=summary_data.get("title", "Meeting Summary"),
        overview=summary_data.get("overview", ""),
        key_points=summary_data.get("key_points", []),
        action_items=action_items,
        decisions_made=summary_data.get("decisions_made", []),
        follow_up_questions=summary_data.get("follow_up_questions", []),
    )


@router.get("/transcript/{session_id}")
async def get_transcript(session_id: str):
    """Get the current transcript for a session."""
    transcript_manager = sessions.get(session_id)

    if not transcript_manager:
        raise HTTPException(status_code=404, detail="Session not found")

    chunks = transcript_manager.get_full_transcript()

    return {
        "session_id": session_id,
        "chunk_count": len(chunks),
        "transcript": [chunk.model_dump() for chunk in chunks],
    }