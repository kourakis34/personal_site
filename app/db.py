from supabase import create_client
from app.config import settings

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


def log_conversation(session_id: str, user_message: str, assistant_response: str, model_used: str, latency_ms: int):
    """Log conversation to Supabase (fire and forget)."""
    try:
        supabase.table("conversations").insert({
            "session_id": session_id,
            "user_message": user_message,
            "assistant_response": assistant_response,
            "model_used": model_used,
            "latency_ms": latency_ms,
        }).execute()
    except Exception as e:
        print(f"Failed to log conversation: {e}")
