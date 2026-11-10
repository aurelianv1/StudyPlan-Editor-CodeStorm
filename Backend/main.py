"""Entry point kept so that `uvicorn main:app --reload` still works."""

from app.main import app

__all__ = ["app"]
