from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    openrouter_api_key: str
    typesafe_api_key: str
    llm_model: str = "openai/gpt-3.5-turbo"
    allowed_origin: str = "http://localhost:5173"
    rate_limit_per_minute: int = 10
    max_message_length: int = 500
    enable_logging: bool = True

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
