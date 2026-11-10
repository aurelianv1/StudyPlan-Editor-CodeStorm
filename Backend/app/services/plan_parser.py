from docx import Document
import io
import re


def extract_plan_data(file_bytes: bytes) -> dict:
    doc = Document(file_bytes)
    full_text = "\n".join([p.text.strip() for p in doc.paragraphs if p.text.strip()])

    return {
        "credite": extract_credite(full_text),
        "tip_evaluare": extract_tip_evaluare(full_text),
        "competente_profesionale": extract_competente(full_text, "profesionale"),
        "competente_transversale": extract_competente(full_text, "transversale"),
        "raw_text": full_text,
    }


def extract_credite(text: str) -> int | None:
    matches = re.findall(r"credite?[:\s]+(\d+)", text.lower())
    if matches:
        return int(matches[0])
    return None


def extract_tip_evaluare(text: str) -> str | None:
    text_lower = text.lower()
    if "examen" in text_lower:
        return "examen"
    elif "colocviu" in text_lower:
        return "colocviu"
    elif "verificare" in text_lower:
        return "verificare"
    return None


def extract_competente(text: str, tip: str) -> list[str]:
    competente = []
    lines = text.split("\n")
    in_section = False

    for line in lines:
        line_lower = line.lower()
        if tip in line_lower and "competen" in line_lower:
            in_section = True
            continue
        if in_section:
            if line.strip().startswith("C") and len(line.strip()) > 2:
                competente.append(line.strip())
            elif any(
                keyword in line_lower for keyword in ["capitol", "sectiune", "anexa"]
            ):
                in_section = False

    return competente
