# Meeting Copilot

AI-powered meeting copilot that transcribes conversations in real time and generates live suggestions, insights and post-meeting summaries.

## What it does

- Transcribes your meeting live as you speak
- Generates AI insights and follow-up questions in real time
- Shows everything in a split-panel companion UI
- Produces a full summary with action items and decisions when the meeting ends

## Architecture
```
Browser mic (MediaRecorder)
        ↓
FastAPI WebSocket server
        ↓
Deepgram WebSocket (raw wss://) — streaming STT
        ↓
Transcript manager (sliding context window)
        ↓
OpenAI GPT-4o — suggestions every N utterances
        ↓
React companion UI (transcript left / suggestions right)
        ↓
End meeting → GPT-4o summary → summary screen
```

## Tech Stack

**Backend**
- **FastAPI** — WebSocket server
- **Deepgram** — real-time streaming speech-to-text via raw WebSocket
- **OpenAI GPT-4o** — live suggestions and post-meeting summary
- **asyncio** — concurrent audio forwarding and transcript processing
- **Structlog** — structured JSON logging
- **Docker** — containerization

**Frontend**
- **React** — companion UI
- **Vite** — build tool
- **MediaRecorder API** — browser mic capture
- **WebSocket API** — real-time communication with backend

## Features

- Live transcript with speaker diarization
- AI suggestions every 3 utterances:
  - Key insight
  - Follow-up question
  - Technical explanation (when relevant)
- Post-meeting summary:
  - Overview
  - Key points
  - Action items with owner and deadline
  - Decisions made
  - Follow-up questions

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/meeting-copilot.git
cd meeting-copilot
```

### 2. Backend setup
```bash
python -m venv venv
source venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
```

Add your keys to `.env`:
- `OPENAI_API_KEY` — from platform.openai.com
- `DEEPGRAM_API_KEY` — from console.deepgram.com

### 3. Run the backend
```bash
uvicorn app.main:app --reload
```

### 4. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Open the UI
```
http://localhost:3000
```

Click **Start Meeting**, allow microphone access, and start speaking.

## Project Structure
```
app/
├── config.py                  # Settings and environment config
├── main.py                    # FastAPI app entry point
├── models/
│   └── meeting.py             # Pydantic models
├── services/
│   ├── transcription.py       # Deepgram WebSocket connection + transcript manager
│   └── suggestions.py        # OpenAI suggestions and summary
└── routers/
    ├── ws.py                  # WebSocket endpoint — real-time pipeline
    └── meeting.py             # REST endpoints — end meeting, get transcript

frontend/
├── src/
│   ├── App.jsx                # Root component — layout and summary screen
│   ├── hooks/
│   │   └── useMeeting.js      # All meeting state and WebSocket logic
│   └── components/
│       ├── TranscriptPanel.jsx   # Live transcript panel
│       ├── SuggestionPanel.jsx   # AI suggestions panel
│       └── MeetingControls.jsx   # Start/end controls and timer
```

## Running with Docker
```bash
docker-compose up --build
```

## Demo

Record a Loom showing:
1. Start meeting
2. Speak for 2-3 minutes
3. Transcript appearing live on the left
4. AI suggestions appearing on the right
5. End meeting → summary screen