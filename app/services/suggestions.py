import structlog
from openai import AsyncOpenAI
from app.config import get_settings
from app.models.meeting import Suggestion

logger = structlog.get_logger()
settings = get_settings()

client = AsyncOpenAI(api_key=settings.openai_api_key)

SUGGESTION_SYSTEM_PROMPT = """
You are an expert meeting copilot assistant. You listen to meeting conversations and provide real-time intelligent support to the participant.

Given the last few utterances from a meeting, generate:
1. A key insight from what was just discussed
2. A smart follow-up question the participant could ask
3. A brief technical explanation if any complex topic was mentioned (optional)

Be concise, sharp, and immediately actionable. The participant is reading this in real time during the meeting.

Respond in this exact JSON format:
{
  "insight": "...",
  "follow_up_question": "...",
  "technical_explanation": "..." or null
}

Return only valid JSON, no explanation, no markdown.
"""

SUMMARY_SYSTEM_PROMPT = """
You are an expert meeting summarizer. Given a full meeting transcript, generate a comprehensive but concise meeting summary.

Respond in this exact JSON format:
{
  "title": "...",
  "overview": "...",
  "key_points": ["...", "..."],
  "action_items": [
    {"task": "...", "owner": "..." or null, "deadline": "..." or null}
  ],
  "decisions_made": ["...", "..."],
  "follow_up_questions": ["...", "..."]
}

Return only valid JSON, no explanation, no markdown.
"""


async def generate_suggestion(context: str) -> Suggestion | None:
    log = logger.bind(context_length=len(context))

    try:
        log.info("generating_suggestion")

        response = await client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.7,
            max_tokens=300,
            messages=[
                {"role": "system", "content": SUGGESTION_SYSTEM_PROMPT},
                {"role": "user", "content": f"Meeting transcript so far:\n\n{context}"},
            ],
        )

        import json
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)
        suggestion = Suggestion(**data)

        log.info("suggestion_generated")
        return suggestion

    except Exception as e:
        log.error("suggestion_failed", error=str(e))
        return None


async def generate_summary(transcript_text: str) -> dict | None:
    log = logger.bind(transcript_length=len(transcript_text))

    try:
        log.info("generating_summary")

        response = await client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.3,
            max_tokens=1000,
            messages=[
                {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
                {"role": "user", "content": f"Full meeting transcript:\n\n{transcript_text}"},
            ],
        )

        import json
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)

        log.info("summary_generated")
        return data

    except Exception as e:
        log.error("summary_failed", error=str(e))
        return None