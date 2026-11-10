"""Text helpers shared by the parsers and the validator."""

from __future__ import annotations

import re
import unicodedata

from app.schemas import EvaluationType

CELL_SEPARATOR = " | "

_NUMBERING_PREFIX = re.compile(r"^\s*\d+(\.\d+)*\.?\s+")

_EVALUATION_ALIASES: dict[str, EvaluationType] = {
    "e": "examen",
    "ex": "examen",
    "examen": "examen",
    "c": "colocviu",
    "colocviu": "colocviu",
    "v": "verificare",
    "vp": "verificare",
    "verificare": "verificare",
    "verificare pe parcurs": "verificare",
}


def normalize(text: str) -> str:
    """Lower-case, strip diacritics and collapse whitespace.

    Romanian documents mix the comma-below (ș, ț) and cedilla (ş, ţ) letter
    variants, so two titles that look identical often differ byte-wise.
    """
    decomposed = unicodedata.normalize("NFKD", text)
    without_marks = "".join(c for c in decomposed if not unicodedata.combining(c))
    return " ".join(without_marks.lower().split())


def strip_numbering(title: str) -> str:
    """Drop a leading "7." / "5.1" prefix from a heading."""
    return _NUMBERING_PREFIX.sub("", title, count=1).strip()


def split_cells(line: str) -> list[str]:
    """Split a flattened table row back into its cells."""
    return [cell.strip() for cell in line.split(CELL_SEPARATOR.strip()) if cell.strip()]


def parse_evaluation_type(value: str) -> EvaluationType | None:
    """Map "E", "Examen", "colocviu", "VP"... to a canonical value."""
    cleaned = normalize(value).strip(" .:;()")
    if cleaned in _EVALUATION_ALIASES:
        return _EVALUATION_ALIASES[cleaned]
    return detect_evaluation_type(cleaned)


def detect_evaluation_type(text: str) -> EvaluationType | None:
    """Find the evaluation type named in free text, if exactly one is."""
    normalized = normalize(text)
    found = [
        kind
        for kind in ("examen", "colocviu", "verificare")
        if re.search(rf"\b{kind}", normalized)
    ]
    return found[0] if len(found) == 1 else None


def parse_credits(text: str) -> int | None:
    """Find a credit count such as "Credite: 5", "5 credite" or "6 ECTS"."""
    normalized = normalize(text)
    patterns = (
        r"credite?\s*(?:ects)?\s*[:=\-|]?\s*(\d{1,2})\b",
        r"\b(\d{1,2})\s*(?:credite?|ects)\b",
    )
    for pattern in patterns:
        match = re.search(pattern, normalized)
        if match:
            return int(match.group(1))
    return None
