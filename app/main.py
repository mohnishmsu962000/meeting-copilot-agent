import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.config import get_settings
from app.routers.ws import router as ws_router
from app.routers.meeting import router as meeting_router

logger = structlog.get_logger()
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered meeting copilot that transcribes conversations in real time and generates live suggestions, insights and post-meeting summaries.",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_router)
app.include_router(meeting_router)


@app.get("/", tags=["health"])
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}