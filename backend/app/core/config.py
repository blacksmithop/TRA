from typing import List, Union
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    REDIS_HOST: str = Field("redis", description="Redis host")
    REDIS_PORT: int = Field(6379, description="Redis port")

    ALLOWED_ORIGINS: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "https://blacksmithop.github.io",
            "https://tornrevive.page",
        ],
        description="Parsed list of allowed origins",
    )

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()