from docx import Document
import re


def extract_sections(file_bytes: bytes) -> list[dict]:
    """
    Citește un .docx și returnează lista de secțiuni
    detectate după headings sau linii bold.
    """
    doc = Document(file_bytes)
    sections = []
    current_section = None

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue

        is_heading = para.style.name.startswith("Heading") or is_bold(para)

        if is_heading:
            if current_section:
                sections.append(current_section)
            current_section = {
                "id": str(len(sections) + 1),
                "title": text,
                "content": "",
                "status": "unchanged",
            }
        else:
            if current_section:
                current_section["content"] += text + "\n"
            else:
                sections.append(
                    {
                        "id": "0",
                        "title": "Introducere",
                        "content": text + "\n",
                        "status": "unchanged",
                    }
                )

    if current_section:
        sections.append(current_section)

    return sections


def is_bold(para) -> bool:
    """Verifică dacă primul run din paragraf e bold — semn de titlu."""
    for run in para.runs:
        if run.bold:
            return True
    return False
