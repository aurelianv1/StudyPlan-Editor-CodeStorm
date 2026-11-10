"""Application settings, read once from the environment (and Backend/.env)."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv

_TRUE_VALUES = {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    groq_api_key: str
    groq_model: str
    groq_api_url: str
    cors_origins: tuple[str, ...]
    max_upload_bytes: int
    demo_mode: bool


def _split_csv(value: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in value.split(",") if item.strip())


@lru_cache
def get_settings() -> Settings:
    load_dotenv()
    return Settings(
        groq_api_key=os.getenv("GROQ_API_KEY", "").strip(),
        groq_model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        groq_api_url=os.getenv(
            "GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions"
        ),
        cors_origins=_split_csv(os.getenv("CORS_ORIGINS", "http://localhost:3000")),
        max_upload_bytes=int(float(os.getenv("MAX_UPLOAD_MB", "5")) * 1024 * 1024),
        demo_mode=os.getenv("DEMO_MODE", "false").strip().lower() in _TRUE_VALUES,
    )
