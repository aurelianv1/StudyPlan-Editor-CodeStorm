"""Endpoint for the AI assistant."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.config import Settings, get_settings
from app.schemas import ChatRequest
from app.services.chat import build_system_prompt, stream_chat

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest, settings: Settings = Depends(get_settings)):
    """Stream the assistant's answer as server-sent events."""
    if not settings.groq_api_key:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Asistentul AI nu este configurat: lipsește GROQ_API_KEY pe server.",
        )

    system = build_system_prompt(request.document, request.plan_data)
    return StreamingResponse(
        stream_chat(settings, system, request.messages),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
