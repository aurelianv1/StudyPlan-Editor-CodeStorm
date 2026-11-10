"""Check a discipline sheet against the study plan."""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.schemas import Conflict, EvaluationType, PlanData, PlanDiscipline, Section
from app.services.text import (
    detect_evaluation_type,
    normalize,
    parse_credits,
    parse_evaluation_type,
    split_cells,
)

_EVALUATION_LABELS = {
    "examen": "Examen",
    "colocviu": "Colocviu",
    "verificare": "Verificare",
}
_COMPETENCY_CODE = re.compile(r"^(C)\.?\s?([PT]?)\.?\s?(\d+)", re.IGNORECASE)
_LABEL_NUMBER = re.compile(r"^\d+(\.\d+)*\.?\s*")


@dataclass(frozen=True)
class SheetFacts:
    """The values of a discipline sheet that the study plan also defines."""

    discipline: str | None
    credits: int | None
    evaluation_type: EvaluationType | None


def extract_sheet_facts(sections: list[Section]) -> SheetFacts:
    text = "\n".join(f"{s.title}\n{s.content}" for s in sections)
    evaluation = _labelled_value(
        sections,
        (
            "tipul de evaluare",
            "tip evaluare",
            "forma de evaluare",
            "forma de verificare",
        ),
    )
    credits = _labelled_value(
        sections, ("numarul de credite", "numar de credite", "numar credite", "credite")
    )
    return SheetFacts(
        discipline=_labelled_value(sections, ("denumirea disciplinei",)),
        credits=(_first_int(credits) if credits else None) or parse_credits(text),
        evaluation_type=(parse_evaluation_type(evaluation) if evaluation else None)
        or detect_evaluation_type(text),
    )


def validate_sheet(sections: list[Section], plan: PlanData) -> list[Conflict]:
    facts = extract_sheet_facts(sections)
    conflicts: list[Conflict] = []

    plan_credits, plan_evaluation = plan.credits, plan.evaluation_type
    if plan.disciplines:
        # The plan covers a whole programme: only the row of this discipline
        # says anything about it, document-wide values would be noise.
        row = _find_discipline(facts.discipline, plan.disciplines)
        plan_credits = row.credits if row else None
        plan_evaluation = row.evaluation_type if row else None
        if row is None and facts.discipline:
            conflicts.append(
                Conflict(
                    type="discipline",
                    severity="warning",
                    message=(
                        f"Disciplina „{facts.discipline}” nu a fost găsită în "
                        "Planul de Învățământ."
                    ),
                )
            )

    if (
        plan_evaluation
        and facts.evaluation_type
        and (plan_evaluation != facts.evaluation_type)
    ):
        conflicts.append(
            Conflict(
                type="evaluation_type",
                severity="error",
                message=(
                    f"Planul prevede „{_EVALUATION_LABELS[plan_evaluation]}”, dar "
                    f"FD menționează „{_EVALUATION_LABELS[facts.evaluation_type]}”."
                ),
            )
        )

    if plan_credits and facts.credits and plan_credits != facts.credits:
        conflicts.append(
            Conflict(
                type="credits",
                severity="error",
                message=(
                    f"Planul prevede {plan_credits} credite, FD menționează "
                    f"{facts.credits} credite."
                ),
            )
        )

    sheet_text = normalize(" ".join(f"{s.title} {s.content}" for s in sections))
    for competency in plan.professional_competencies + plan.transversal_competencies:
        if not _mentions_competency(sheet_text, competency):
            conflicts.append(
                Conflict(
                    type="competencies",
                    severity="warning",
                    message=f"Competența din Plan lipsește din FD: {competency}",
                )
            )

    return conflicts


def _labelled_value(sections: list[Section], labels: tuple[str, ...]) -> str | None:
    """Value next to a label, as in "2.1 Denumirea disciplinei | Algebră".

    Sheets lay these out as table rows, sometimes several label/value pairs
    per row, and occasionally as "Label: value" in a single cell.
    """
    for section in sections:
        for line in section.content.splitlines():
            cells = split_cells(line)
            for index, cell in enumerate(cells):
                label = _LABEL_NUMBER.sub("", normalize(cell))
                for wanted in labels:
                    if label == wanted and index + 1 < len(cells):
                        return cells[index + 1]
                    if label.startswith(wanted + ":"):
                        value = cell.split(":", 1)[1].strip()
                        if value:
                            return value
    return None


def _first_int(value: str) -> int | None:
    match = re.search(r"\d{1,2}", value)
    return int(match.group()) if match else None


def _find_discipline(
    name: str | None, disciplines: list[PlanDiscipline]
) -> PlanDiscipline | None:
    if not name:
        return None
    wanted = normalize(name)
    for discipline in disciplines:
        if normalize(discipline.name) == wanted:
            return discipline
    for discipline in disciplines:
        candidate = normalize(discipline.name)
        shorter, longer = sorted((candidate, wanted), key=len)
        if len(shorter) >= 6 and shorter in longer:
            return discipline
    return None


def _mentions_competency(sheet_text: str, competency: str) -> bool:
    """Look for the competency code ("CP1"), or its full text if it has none."""
    code = _COMPETENCY_CODE.match(competency.strip())
    if code:
        letters, number = (code.group(1) + code.group(2)).lower(), code.group(3)
        spaced = r"\.?\s?".join(letters)
        return bool(re.search(rf"\b{spaced}\.?\s?{number}\b", sheet_text))
    return normalize(competency) in sheet_text
