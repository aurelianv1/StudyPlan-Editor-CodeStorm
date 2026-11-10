"""Canned scenarios used for the hackathon presentation.

They are only served when DEMO_MODE is enabled. A scenario is selected by a
keyword in the uploaded file name, so with the flag off (the default) every
upload is analysed for real, whatever it is called.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

_DEMO_DIR = Path(__file__).parent

_KEYWORDS: dict[str, tuple[str, ...]] = {
    "structuri_de_date": ("structuri",),
    "analiza_matematica": ("analiza", "matematica"),
    "sisteme_de_operare": ("sisteme", "operare"),
}

_MIGRATED_FILES: dict[str, str] = {
    "structuri_de_date": "structuri_de_date_migrated.docx",
}


@lru_cache
def _scenarios() -> dict:
    with open(_DEMO_DIR / "scenarios.json", encoding="utf-8") as handle:
        return json.load(handle)


def find_scenario(*filenames: str | None) -> str | None:
    """Return the key of the first scenario matching any of the file names."""
    for filename in filenames:
        lowered = (filename or "").lower()
        for key, keywords in _KEYWORDS.items():
            if any(keyword in lowered for keyword in keywords):
                return key
    return None


def get_response(scenario: str, endpoint: str) -> dict:
    return _scenarios()[scenario][endpoint]


def get_migrated_document(scenario: str) -> bytes | None:
    filename = _MIGRATED_FILES.get(scenario)
    if filename is None:
        return None
    return (_DEMO_DIR / "files" / filename).read_bytes()
