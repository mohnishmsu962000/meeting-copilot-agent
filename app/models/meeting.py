from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class MeetingStatus(str, Enum):
    IDLE = "idle"
    ACTIVE = "active"
    ENDED = "ended"


class TranscriptChunk(BaseModel):
    text: str
    speaker: Optional[str] = None
    timestamp: float


class Suggestion(BaseModel):
    insight: str
    follow_up_question: str
    technical_explanation: Optional[str] = None


class WSMessage(BaseModel):
    type: str  # "transcript" | "suggestion" | "error" | "status"
    data: dict


class MeetingEndRequest(BaseModel):
    transcript: list[TranscriptChunk]


class ActionItem(BaseModel):
    task: str
    owner: Optional[str] = None
    deadline: Optional[str] = None


class MeetingSummary(BaseModel):
    title: str
    overview: str
    key_points: list[str]
    action_items: list[ActionItem]
    decisions_made: list[str]
    follow_up_questions: list[str]