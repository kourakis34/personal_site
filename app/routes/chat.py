import time
import httpx
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.concurrency import run_in_threadpool
from app.models import ChatRequest, ChatResponse
from app.config import settings
from app.db import log_conversation
from app.profile import SYSTEM_PROMPT
from app.rate_limit import check_rate_limit
from typesafe_sdk import Noul, TypeSafeClient

client = TypeSafeClient(api_key=settings.typesafe_api_key)
router = APIRouter()



RELEVANCE_INSTRUCTIONS = (
    "Is this message a question or request about Nick Kourakis, the owner of this personal website? "
    "Count it as about Nick if it asks about him directly or with 'you', 'he' or 'his' "
    "(for example his studies, school, work, internships, projects, skills, job search, soccer, "
    "languages, background, interests, books, or how to contact him), or is a greeting or a "
    "follow-up in a conversation about him. General questions or tasks unrelated to Nick "
    "(trivia, coding help, writing poems, math) are not about Nick."
)


def _classify(message: str) -> float:
    response = client.system_one(
        state=message,
        questions={"is_relevant": Noul(instructions=RELEVANCE_INSTRUCTIONS)},
    )
    return response.answers["is_relevant"].noul


async def is_question_about_nick(message: str) -> tuple[bool, float]:
    """Return (is_relevant, score). Fails open so a classifier outage doesn't break chat."""
    try:
        score = await run_in_threadpool(_classify, message)
    except Exception as e:
        print(f"Relevance classifier failed, allowing message: {type(e).__name__}: {e}")
        return True, 1.0
    return score >= settings.relevance_threshold, score


async def call_llm(message: str) -> tuple[str, int, int]:
    """Call OpenRouter LLM and return response, input tokens, output tokens."""
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "HTTP-Referer": settings.allowed_origin.split(",")[0].strip(),
        "X-Title": "Nick's Personal Site Chat",
    }

    payload = {
        "model": settings.llm_model,
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": message
            }
        ],
        "max_tokens": 500,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=30.0
        )

        if response.status_code != 200:
            # Log the upstream error server-side only; never log request headers (they hold the API key).
            print(f"OpenRouter API Error: {response.status_code} - {response.text[:500]}")
            raise HTTPException(status_code=502, detail="The chat model is unavailable right now.")

        data = response.json()
        assistant_message = data["choices"][0]["message"]["content"]
        input_tokens = data.get("usage", {}).get("prompt_tokens", 0)
        output_tokens = data.get("usage", {}).get("completion_tokens", 0)

        return assistant_message, input_tokens, output_tokens


@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, http_request: Request, background_tasks: BackgroundTasks):
    """Chat endpoint: accept message, call LLM, return response."""

    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if len(request.message) > settings.max_message_length:
        raise HTTPException(status_code=400, detail=f"Message exceeds max length of {settings.max_message_length}")

    check_rate_limit(http_request)

    start_time = time.time()

    # Check if question is about Nick
    is_relevant = await is_question_about_nick(request.message)

    if not is_relevant[0]:
        response_text = "Keep questions related to Nick and his experience."
        latency_ms = int((time.time() - start_time) * 1000)
        if settings.enable_logging:
            background_tasks.add_task(
                log_conversation,
                session_id=request.session_id,
                user_message=request.message,
                assistant_response=response_text,
                model_used="classifier",
                latency_ms=latency_ms
            )
        return ChatResponse(response=response_text, session_id=request.session_id)

    try:
        response_text, input_tokens, output_tokens = await call_llm(request.message)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    latency_ms = int((time.time() - start_time) * 1000)

    if settings.enable_logging:
        background_tasks.add_task(
            log_conversation,
            session_id=request.session_id,
            user_message=request.message,
            assistant_response=response_text,
            model_used=settings.llm_model,
            latency_ms=latency_ms
        )

    return ChatResponse(response=response_text, session_id=request.session_id)
