"""Client de streaming pentru Groq (API compatibil OpenAI)."""

import json
from collections.abc import Iterator

import requests

from config import GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL, GROQ_TIMEOUT_SECONDS
from services.prompt import SYSTEM_PROMPT

_SSE_DATA_PREFIX = "data: "
_SSE_DONE = "[DONE]"


def build_system_prompt(document: str, plan_data: dict) -> str:
    return SYSTEM_PROMPT.format(
        document=document, plan_context=_format_plan_context(plan_data)
    )


def stream_chat_events(system_prompt: str, messages: list[dict]) -> Iterator[str]:
    """
    Trimite conversația către Groq și re-emite răspunsul ca evenimente SSE
    de forma `data: {"text": "..."}`, terminate cu `data: [DONE]`.
    """
    for text in _stream_completion(system_prompt, messages):
        yield _sse_event({"text": text})
    yield f"{_SSE_DATA_PREFIX}{_SSE_DONE}\n\n"


def _format_plan_context(plan_data: dict) -> str:
    if not plan_data:
        return ""
    competences = ", ".join(plan_data.get("competente_profesionale", []))
    return f"""
    Date din Planul de Învățământ (SURSA DE ADEVĂR):
    - Credite: {plan_data.get('credite', 'necunoscut')}
    - Tip evaluare: {plan_data.get('tip_evaluare', 'necunoscut')}
    - Competențe profesionale: {competences}
    """


def _stream_completion(system_prompt: str, messages: list[dict]) -> Iterator[str]:
    if not GROQ_API_KEY:
        yield "Eroare API: lipsește GROQ_API_KEY din fișierul .env al backend-ului."
        return

    payload = {
        "model": GROQ_MODEL,
        "stream": True,
        "messages": [{"role": "system", "content": system_prompt}, *messages],
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        with requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            stream=True,
            timeout=GROQ_TIMEOUT_SECONDS,
        ) as response:
            if response.status_code != 200:
                yield f"Eroare API: {response.text}"
                return
            yield from _iter_content_deltas(response.iter_lines())
    except requests.RequestException as exc:
        yield f"Eroare API: {exc}"


def _iter_content_deltas(lines: Iterator[bytes]) -> Iterator[str]:
    for line in lines:
        decoded = line.decode("utf-8") if line else ""
        if not decoded.startswith(_SSE_DATA_PREFIX):
            continue

        data = decoded[len(_SSE_DATA_PREFIX):].strip()
        if data == _SSE_DONE:
            return

        try:
            text = json.loads(data)["choices"][0].get("delta", {}).get("content", "")
        except (json.JSONDecodeError, KeyError, IndexError):
            continue
        if text:
            yield text


def _sse_event(payload: dict) -> str:
    return f"{_SSE_DATA_PREFIX}{json.dumps(payload)}\n\n"
