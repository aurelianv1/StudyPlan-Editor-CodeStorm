from typing import BinaryIO

from docx import Document

from services.docx_utils import extract_credits

# Ordinea contează: primul tip găsit în text este cel raportat.
EVALUATION_TYPES = ("examen", "colocviu", "verificare")

_SECTION_END_KEYWORDS = ("capitol", "sectiune", "anexa")


def extract_plan_data(file: BinaryIO) -> dict:
    doc = Document(file)
    full_text = "\n".join(p.text.strip() for p in doc.paragraphs if p.text.strip())

    return {
        "credite": extract_credits(full_text),
        "tip_evaluare": extract_evaluation_type(full_text),
        "competente_profesionale": extract_competences(full_text, "profesionale"),
        "competente_transversale": extract_competences(full_text, "transversale"),
        "raw_text": full_text,
    }


def extract_evaluation_type(text: str) -> str | None:
    text_lower = text.lower()
    return next((tip for tip in EVALUATION_TYPES if tip in text_lower), None)


def extract_competences(text: str, kind: str) -> list[str]:
    """
    Colectează liniile de tip „CPx. ...” / „CTx. ...” aflate sub titlul
    „Competențe <kind>”, până la următorul titlu de competențe sau de capitol.
    """
    competences = []
    in_section = False

    for line in text.split("\n"):
        stripped = line.strip()
        line_lower = stripped.lower()

        if "competen" in line_lower and _is_competence_heading(line_lower):
            in_section = kind in line_lower
            continue

        if not in_section:
            continue

        if any(keyword in line_lower for keyword in _SECTION_END_KEYWORDS):
            in_section = False
        elif stripped.startswith("C") and len(stripped) > 2:
            competences.append(stripped)

    return competences


def _is_competence_heading(line_lower: str) -> bool:
    return "profesionale" in line_lower or "transversale" in line_lower
