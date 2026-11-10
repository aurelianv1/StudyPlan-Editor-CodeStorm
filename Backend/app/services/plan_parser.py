"""Extract the data the validator needs from a study plan (.docx)."""

from __future__ import annotations

import re
from typing import BinaryIO

from docx.table import Table

from app.schemas import PlanData, PlanDiscipline
from app.services.docx_reader import (
    document_lines,
    iter_blocks,
    open_document,
    table_rows,
)
from app.services.text import (
    CELL_SEPARATOR,
    detect_evaluation_type,
    normalize,
    parse_credits,
    parse_evaluation_type,
)

# "CP1.", "C.P. 2", "C3" -> professional; "CT1", "C.T. 2" -> transversal.
_TRANSVERSAL_CODE = re.compile(r"^C\.?\s?T\.?\s?\d+", re.IGNORECASE)
_PROFESSIONAL_CODE = re.compile(r"^C\.?\s?P?\.?\s?\d+", re.IGNORECASE)
_EVALUATION_LABEL = re.compile(
    r"(?:tip(?:ul)?|forma)\s+(?:de\s+)?(?:evaluare|verificare)\s*[:=\-|]?\s*([^|\n]+)"
)

# How many leading rows of a table may hold its column headers.
_HEADER_ROWS = 3


def extract_plan_data(source: bytes | BinaryIO) -> PlanData:
    document = open_document(source)
    lines = document_lines(document)
    text = "\n".join(lines)

    tables = [block for block in iter_blocks(document) if isinstance(block, Table)]
    disciplines = [row for table in tables for row in _disciplines_in(table)]

    return PlanData(
        credits=parse_credits(text),
        evaluation_type=_document_evaluation_type(text),
        professional_competencies=_competencies(lines, transversal=False),
        transversal_competencies=_competencies(lines, transversal=True),
        disciplines=disciplines,
    )


def _document_evaluation_type(text: str):
    """Evaluation type of a plan that describes a single discipline."""
    labelled = _EVALUATION_LABEL.search(normalize(text.replace("\n", " | ")))
    if labelled:
        parsed = parse_evaluation_type(labelled.group(1))
        if parsed:
            return parsed
    return detect_evaluation_type(text)


def _competencies(lines: list[str], *, transversal: bool) -> list[str]:
    """Collect lines that start with a competency code, without duplicates."""
    found: list[str] = []
    for line in lines:
        candidate = line.replace(CELL_SEPARATOR, " ").strip()
        is_transversal = bool(_TRANSVERSAL_CODE.match(candidate))
        is_professional = not is_transversal and bool(
            _PROFESSIONAL_CODE.match(candidate)
        )
        if (is_transversal if transversal else is_professional) and (
            candidate not in found
        ):
            found.append(candidate)
    return found


def _disciplines_in(table: Table) -> list[PlanDiscipline]:
    """Read "discipline / credits / evaluation" rows from a plan table.

    Columns are located by their header text, so the table is skipped when no
    header names a discipline column.
    """
    rows = table_rows(table)
    for header_index, header in enumerate(rows[:_HEADER_ROWS]):
        columns = _locate_columns(header)
        if columns is None:
            continue
        name_col, credits_col, evaluation_col = columns
        disciplines = []
        for row in rows[header_index + 1 :]:
            if len(row) != len(header):
                continue  # merged "Semestrul 1" / "Total" rows
            name = row[name_col]
            if not name or name.replace(".", "").isdigit():
                continue
            disciplines.append(
                PlanDiscipline(
                    name=name,
                    credits=_to_int(row[credits_col])
                    if credits_col is not None
                    else None,
                    evaluation_type=(
                        parse_evaluation_type(row[evaluation_col])
                        if evaluation_col is not None
                        else None
                    ),
                )
            )
        return disciplines
    return []


def _locate_columns(header: list[str]) -> tuple[int, int | None, int | None] | None:
    name_col = credits_col = evaluation_col = None
    for index, cell in enumerate(header):
        label = normalize(cell)
        if name_col is None and "disciplin" in label:
            name_col = index
        elif credits_col is None and (
            "credit" in label or label in {"cr", "cr.", "ects", "ects/sem"}
        ):
            credits_col = index
        elif evaluation_col is None and (
            any(word in label for word in ("evaluare", "verificare", "examinare"))
            or label in {"fe", "fv", "e/c/v", "e/c"}
        ):
            evaluation_col = index
    if name_col is None or (credits_col is None and evaluation_col is None):
        return None
    return name_col, credits_col, evaluation_col


def _to_int(value: str) -> int | None:
    match = re.fullmatch(r"\s*(\d{1,2})\s*", value)
    return int(match.group(1)) if match else None
