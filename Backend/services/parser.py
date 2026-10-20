from typing import BinaryIO

from docx import Document
from docx.text.paragraph import Paragraph

INTRO_TITLE = "Introducere"


def extract_sections(file: BinaryIO) -> list[dict]:
    """
    Împarte un .docx în secțiuni. Un paragraf este considerat titlu dacă
    are stil de tip „Heading” sau conține text îngroșat. Textul aflat
    înaintea primului titlu este grupat într-o singură secțiune „Introducere”.
    """
    sections: list[dict] = []
    current_section: dict | None = None

    for para in Document(file).paragraphs:
        text = para.text.strip()
        if not text:
            continue

        if _is_heading(para):
            if current_section:
                sections.append(current_section)
            current_section = _new_section(str(len(sections) + 1), text)
        else:
            if current_section is None:
                current_section = _new_section("0", INTRO_TITLE)
            current_section["content"] += text + "\n"

    if current_section:
        sections.append(current_section)

    return sections


def _new_section(section_id: str, title: str) -> dict:
    return {"id": section_id, "title": title, "content": "", "status": "unchanged"}


def _is_heading(para: Paragraph) -> bool:
    style_name = (para.style.name if para.style else None) or ""
    return style_name.startswith("Heading") or any(run.bold for run in para.runs)
