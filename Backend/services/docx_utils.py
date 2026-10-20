import io
import re

from docx.document import Document as DocxDocument

_CREDITS_PATTERN = re.compile(r"credite?[:\s]+(\d+)")


def document_to_bytes(doc: DocxDocument) -> bytes:
    buffer = io.BytesIO()
    doc.save(buffer)
    return buffer.getvalue()


def add_placeholder(doc: DocxDocument, text: str) -> None:
    """Adaugă un paragraf italic, folosit pentru câmpurile de completat."""
    doc.add_paragraph().add_run(text).italic = True


def extract_credits(text: str) -> int | None:
    """Caută primul „credite: N” / „credit N” din text."""
    match = _CREDITS_PATTERN.search(text.lower())
    return int(match.group(1)) if match else None
