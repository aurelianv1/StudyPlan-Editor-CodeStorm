"""FastAPI application factory."""

from __future__ import annotations

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import chat, documents
from app.config import get_settings
from app.services.docx_reader import InvalidDocumentError


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="StudyPlan Editor API",
        description="Compare, validate and migrate university discipline sheets.",
        version="1.0.0",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(documents.router, tags=["documents"])
    app.include_router(chat.router, tags=["assistant"])

    @app.exception_handler(InvalidDocumentError)
    async def invalid_document(_: Request, __: InvalidDocumentError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={
                "detail": "Fișierul nu a putut fi citit. Verificați că este un "
                "document Word (.docx) valid."
            },
        )

    @app.get("/health", tags=["meta"])
    async def health() -> dict:
        return {
            "status": "ok",
            "demo_mode": settings.demo_mode,
            "assistant_configured": bool(settings.groq_api_key),
        }

    return app


app = create_app()
