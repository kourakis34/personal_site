import time
import httpx
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models import ChatRequest, ChatResponse
from app.config import settings
from app.db import log_conversation

router = APIRouter()


async def is_question_about_nick(message: str) -> bool:
    """Check if question is related to Nick using LLM classification."""
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "HTTP-Referer": settings.allowed_origin,
        "X-Title": "Nick's Personal Site Chat",
    }

    payload = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": "You are a classifier. Respond with only 'yes' or 'no'. A question is related to Nick if it asks about: Nick Kourakis, his experience, skills, projects, background, education, work, books he's read, or anything about him personally. Generic questions or requests unrelated to Nick are 'no'."
            },
            {
                "role": "user",
                "content": f"Is this question related to Nick? '{message}'"
            }
        ],
        "max_tokens": 5,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=10.0
            )

            if response.status_code != 200:
                print(f"Classification API error: {response.status_code}")
                return True

            data = response.json()
            classification = data["choices"][0]["message"]["content"].strip().lower()
            return "yes" in classification
    except Exception as e:
        print(f"Classification error: {e}")
        return True


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
        print(f"Calling OpenRouter with headers: {headers}")
        print(f"Payload: {payload}")
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=30.0
        )

        print(f"OpenRouter Response: {response.status_code}")
        print(f"Response headers: {response.headers}")
        print(f"Response body: {response.text}")

        if response.status_code != 200:
            error_text = response.text
            print(f"OpenRouter API Error: {response.status_code} - {error_text}")
            raise HTTPException(status_code=response.status_code, detail=f"LLM call failed: {error_text}")

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

    # Check if question is about Nick
    is_relevant = await is_question_about_nick(request.message)
    if not is_relevant:
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
