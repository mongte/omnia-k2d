from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "Pharos Agents"
    openai_api_key: str | None = None
    supabase_url: str | None = None
    supabase_key: str | None = None
    fred_api_key: str | None = None
    
    class Config:
        env_file = ".env"

@lru_cache
def get_settings():
    return Settings()
