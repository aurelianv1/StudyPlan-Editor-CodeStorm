"""Endpoint for the AI assistant."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.config import Settings, get_settings
from app.services.chat import build_system_prompt, stream_chat

router = APIRouter()


@router.post("/chat")
async def chat(data: dict, settings: Settings = Depends(get_settings)):
    """Stream the assistant's answer as server-sent events."""
    system = build_system_prompt(
        document=data.get("document", ""), plan_data=data.get("plan_data", {})
    )
    return StreamingResponse(
        stream_chat(settings, system, data.get("messages", [])),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
