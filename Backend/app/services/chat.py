"""Streaming client for the Groq chat completions API."""

from __future__ import annotations

import json
from collections.abc import Iterator

import requests

from app.config import Settings
from app.schemas import ChatMessage, PlanData
from app.services.prompt import SYSTEM_PROMPT

CONNECT_TIMEOUT_SECONDS = 10
READ_TIMEOUT_SECONDS = 60
SSE_DONE = "data: [DONE]\n\n"


def build_system_prompt(document: str, plan: PlanData | None) -> str:
    return SYSTEM_PROMPT.format(document=document, plan_context=_plan_context(plan))


def _plan_context(plan: PlanData | None) -> str:
    if plan is None:
        return ""
    unknown = "necunoscut"
    return "\n".join(
        [
            "Date din Planul de Învățământ (SURSA DE ADEVĂR):",
            f"- Credite: {plan.credits or unknown}",
            f"- Tip evaluare: {plan.evaluation_type or unknown}",
            "- Competențe profesionale: "
            + (", ".join(plan.professional_competencies) or unknown),
            "- Competențe transversale: "
            + (", ".join(plan.transversal_competencies) or unknown),
        ]
    )


def sse_text(text: str) -> str:
    return f"data: {json.dumps({'text': text})}\n\n"


def sse_error(message: str) -> str:
    return f"data: {json.dumps({'error': message})}\n\n"


def stream_chat(
    settings: Settings, system: str, messages: list[ChatMessage]
) -> Iterator[str]:
    """Yield server-sent events with the assistant's reply, chunk by chunk.

    Failures are sent as {"error": ...} events inside the stream, because by
    the time they happen the HTTP status line has already been sent.
    """
    payload = {
        "model": settings.groq_model,
        "stream": True,
        "messages": [
            {"role": "system", "content": system},
            *(message.model_dump() for message in messages),
        ],
    }
    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    try:
        with requests.post(
            settings.groq_api_url,
            headers=headers,
            json=payload,
            stream=True,
            timeout=(CONNECT_TIMEOUT_SECONDS, READ_TIMEOUT_SECONDS),
        ) as response:
            if response.status_code != 200:
                yield sse_error(
                    f"Serviciul AI a răspuns cu eroarea {response.status_code}: "
                    f"{response.text}"
                )
            else:
                for line in response.iter_lines():
                    text = _delta_text(line)
                    if text is None:
                        break
                    if text:
                        yield sse_text(text)
    except requests.RequestException as error:
        yield sse_error(f"Eroare de conexiune cu serviciul AI: {error}")

    yield SSE_DONE


def _delta_text(line: bytes) -> str | None:
    """Text carried by one upstream SSE line; None once the stream is done."""
    decoded = line.decode("utf-8") if line else ""
    if not decoded.startswith("data: "):
        return ""
    data = decoded[len("data: ") :].strip()
    if data == "[DONE]":
        return None
    try:
        choices = json.loads(data).get("choices") or [{}]
    except json.JSONDecodeError:
        return ""
    return choices[0].get("delta", {}).get("content") or ""
