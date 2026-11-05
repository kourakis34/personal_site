from pydantic import BaseModel, Field


from typing import Literal


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., max_length=4000)


class ChatRequest(BaseModel):
    session_id: str
    message: str = Field(..., min_length=1, max_length=500)
    # Recent turns from this visitor's conversation, oldest first, so follow-ups make sense.
    history: list[HistoryMessage] = Field(default_factory=list, max_length=20)


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
