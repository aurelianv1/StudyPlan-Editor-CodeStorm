"""Generate an empty discipline sheet pre-filled from the study plan."""

from __future__ import annotations

from datetime import date

from docx import Document

from app.schemas import PlanData
from app.services.exporter import add_placeholder, to_bytes

FILL_IN = "[ Completați ]"
FINAL_EVALUATION_WEIGHT = "60%"
ACTIVITY_WEIGHT = "40%"


def academic_year(today: date | None = None) -> str:
    """The academic year in progress; a new one starts in September."""
    today = today or date.today()
    start = today.year if today.month >= 9 else today.year - 1
    return f"{start}-{start + 1}"


def generate_skeleton(plan: PlanData) -> bytes:
    document = Document()
    evaluation = plan.evaluation_type.capitalize() if plan.evaluation_type else None

    document.add_heading("FIȘA DISCIPLINEI", level=0)

    document.add_heading("1. Date despre programul de studiu", level=1)
    _add_table(
        document,
        [
            ("Tip evaluare", evaluation or FILL_IN),
            ("Număr credite", str(plan.credits) if plan.credits else FILL_IN),
            ("Anul universitar", academic_year()),
        ],
    )

    document.add_heading("2. Obiectivele disciplinei", level=1)
    add_placeholder(document, "[ Completați obiectivele disciplinei ]")

    document.add_heading("3. Competențe profesionale", level=1)
    _add_list(
        document,
        plan.professional_competencies,
        "[ Completați competențele profesionale ]",
    )

    document.add_heading("4. Competențe transversale", level=1)
    _add_list(
        document,
        plan.transversal_competencies,
        "[ Completați competențele transversale ]",
    )

    document.add_heading("5. Conținutul disciplinei", level=1)
    document.add_heading("5.1 Curs", level=2)
    add_placeholder(document, "[ Completați tematica cursului ]")
    document.add_heading("5.2 Seminar/Laborator", level=2)
    add_placeholder(document, "[ Completați tematica seminarului/laboratorului ]")

    document.add_heading("6. Evaluare", level=1)
    _add_table(
        document,
        [
            ("Tip activitate", "Pondere"),
            (evaluation or "Examen", FINAL_EVALUATION_WEIGHT),
            ("Activitate laborator/seminar", ACTIVITY_WEIGHT),
        ],
    )

    document.add_heading("7. Bibliografie", level=1)
    add_placeholder(
        document,
        "[ Adăugați minim 3 surse bibliografice, dintre care una din ultimii 5 ani ]",
    )

    return to_bytes(document)


def _add_table(document, rows: list[tuple[str, str]]) -> None:
    table = document.add_table(rows=len(rows), cols=2)
    table.style = "Table Grid"
    for index, (label, value) in enumerate(rows):
        table.cell(index, 0).text = label
        table.cell(index, 1).text = value
    document.add_paragraph()


def _add_list(document, items: list[str], placeholder: str) -> None:
    if items:
        for item in items:
            document.add_paragraph(item, style="List Bullet")
    else:
        add_placeholder(document, placeholder)
    document.add_paragraph()
