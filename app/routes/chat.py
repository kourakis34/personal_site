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
        print(f"Calling OpenRouter with headers: {headers}")
        print(f"Payload: {payload}")
        response = await client.post(
            "https://openrouter.io/api/v1/chat/completions",
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
    return ChatResponse(response="Hello! I'm a test response from your backend.", session_id=request.session_id)
