import time
import httpx
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models import ChatRequest, ChatResponse
from app.config import settings
from app.db import log_conversation

router = APIRouter()


async def call_llm(message: str) -> tuple[str, int, int]:
    """Call OpenRouter LLM and return response, input tokens, output tokens."""
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "HTTP-Referer": settings.allowed_origin,
        "X-Title": "Nick's Personal Site Chat",
    }

    payload = {
        "model": settings.llm_model,
        "messages": [
            {
                "role": "system",
                "content": "You are a friendly chatbot assistant. Be conversational, helpful, and concise."
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
            "https://openrouter.io/api/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=30.0
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="LLM call failed")

        data = response.json()
        assistant_message = data["choices"][0]["message"]["content"]
        input_tokens = data.get("usage", {}).get("prompt_tokens", 0)
        output_tokens = data.get("usage", {}).get("completion_tokens", 0)

        return assistant_message, input_tokens, output_tokens


@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    """Chat endpoint: accept message, call LLM, return response."""

    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if len(request.message) > settings.max_message_length:
        raise HTTPException(status_code=400, detail=f"Message exceeds max length of {settings.max_message_length}")

    start_time = time.time()

    try:
        response_text, input_tokens, output_tokens = await call_llm(request.message)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    latency_ms = int((time.time() - start_time) * 1000)

    # Log to Supabase in background (non-blocking)
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
