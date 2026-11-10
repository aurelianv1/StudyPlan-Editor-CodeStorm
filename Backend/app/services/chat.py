"""Streaming client for the Groq chat completions API."""

from __future__ import annotations

import json
from collections.abc import Iterator

import requests

from app.config import Settings
from app.services.prompt import SYSTEM_PROMPT


def build_system_prompt(document: str, plan_data: dict) -> str:
    plan_context = ""
    if plan_data:
        plan_context = f"""
    Date din Planul de Învățământ (SURSA DE ADEVĂR):
    - Credite: {plan_data.get('credite', 'necunoscut')}
    - Tip evaluare: {plan_data.get('tip_evaluare', 'necunoscut')}
    - Competențe profesionale: {', '.join(plan_data.get('competente_profesionale', []))}
    """
    return SYSTEM_PROMPT.format(document=document, plan_context=plan_context)


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload)}\n\n"


def stream_chat(settings: Settings, system: str, messages: list[dict]) -> Iterator[str]:
    """Yield server-sent events with the assistant's reply, chunk by chunk."""
    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.groq_model,
        "stream": True,
        "messages": [{"role": "system", "content": system}, *messages],
    }

    with requests.post(
        settings.groq_api_url, headers=headers, json=payload, stream=True
    ) as response:
        if response.status_code != 200:
            yield _sse({"text": f"Eroare API: {response.text}"})
            return

        for line in response.iter_lines():
            if not line:
                continue
            decoded = line.decode("utf-8")
            if not decoded.startswith("data: "):
                continue
            data = decoded[len("data: ") :]
            if data.strip() == "[DONE]":
                break
            try:
                delta = json.loads(data)["choices"][0].get("delta", {})
            except json.JSONDecodeError:
                continue
            text = delta.get("content", "")
            if text:
                yield _sse({"text": text})

    yield "data: [DONE]\n\n"
