import logging
from supabase import create_client
from app.config import settings

logger = logging.getLogger(__name__)
_supabase = None


def get_supabase():
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _supabase


def log_conversation(session_id: str, user_message: str, assistant_response: str, model_used: str, latency_ms: int):
    """Log conversation to Supabase (fire and forget)."""
    if not settings.enable_logging:
        return

    try:
        print(f"[LOG] Starting conversation log for session {session_id[:8]}...")
        supabase = get_supabase()
        result = supabase.table("conversations").insert({
            "session_id": session_id,
            "user_message": user_message,
            "assistant_response": assistant_response,
            "model_used": model_used,
            "latency_ms": latency_ms,
        }).execute()
        print(f"[LOG] Conversation logged successfully: {result}")
    except Exception as e:
        print(f"[LOG_ERROR] Failed to log conversation: {type(e).__name__}: {e}")
        logger.error(f"Database write failed: {e}", exc_info=True)
