from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    session_id: str
    message: str = Field(..., min_length=1, max_length=500)


class ChatResponse(BaseModel):
    response: str
    session_id: str


class ConversationLog(BaseModel):
    session_id: str
    user_message: str
    assistant_response: str
    model_used: str
    latency_ms: int
    input_tokens: int = 0
    output_tokens: int = 0
