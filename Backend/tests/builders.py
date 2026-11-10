"""Build small .docx files in memory for the tests.

The discipline sheet mirrors the layout used by Romanian universities: numbered
headings, with nearly all the data in tables.
"""

from __future__ import annotations

import io

from docx import Document


def to_bytes(document) -> bytes:
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def add_bold(document, text: str) -> None:
    document.add_paragraph().add_run(text).bold = True


def add_table(document, rows: list[list[str]]) -> None:
    table = document.add_table(rows=len(rows), cols=max(len(row) for row in rows))
    for row_index, cells in enumerate(rows):
        for col_index, text in enumerate(cells):
            table.cell(row_index, col_index).text = text


def discipline_sheet(
    *,
    name: str = "Structuri de date",
    evaluation: str = "E",
    credits: str = "5",
    competencies: tuple[str, ...] = (
        "CP1. Creează softuri.",
        "CT3. Identifică probleme.",
    ),
) -> bytes:
    document = Document()
    add_bold(document, "FIȘA DISCIPLINEI")

    add_bold(document, "1. Date despre program")
    add_table(
        document,
        [
            ["1.1 Instituția de învățământ superior", "Universitatea Transilvania"],
            ["1.2 Facultatea", "Matematică și Informatică"],
        ],
    )

    add_bold(document, "2. Date despre disciplină")
    add_table(
        document,
        [
            ["2.1 Denumirea disciplinei", name],
            # several label/value pairs on one row, as in the official template
            [
                "2.4 Anul de studiu",
                "I",
                "2.5 Semestrul",
                "2",
                "2.6 Tipul de evaluare",
                evaluation,
                "2.7 Regimul disciplinei",
                "DS",
            ],
        ],
    )

    # this heading is not bold: it must be recognised by its number alone
    document.add_paragraph("3. Timpul total estimat")
    add_table(
        document,
        [
            ["3.4 Total ore din planul de învățământ", "56"],
            ["3.9 Numărul de credite", credits],
        ],
    )

    add_bold(document, "4. Competențe specifice acumulate")
    for competency in competencies:
        document.add_paragraph(competency)

    add_bold(document, "5. Conținuturi")
    document.add_paragraph("1. Liste liniare")
    document.add_paragraph("2. Stive și cozi")
    paragraph = document.add_paragraph("Evaluarea ține cont de ")
    paragraph.add_run("prezență").bold = True
    paragraph.add_run(" la laborator.")

    add_bold(document, "6. Bibliografie")
    document.add_paragraph("1. Knuth, D. E. (2011). The Art of Computer Programming.")

    return to_bytes(document)


def study_plan(
    *,
    credits: str = "5",
    evaluation: str = "Examen",
    extra_lines: tuple[str, ...] = (),
) -> bytes:
    """A plan excerpt that describes a single discipline."""
    document = Document()
    document.add_heading("Plan de învățământ", level=1)
    document.add_paragraph(f"Credite: {credits}")
    document.add_paragraph(f"Tip evaluare: {evaluation}")
    document.add_paragraph("Competențe profesionale")
    document.add_paragraph("CP1. Creează softuri.")
    document.add_paragraph("CP2. Utilizează șabloane de proiectare.")
    document.add_paragraph("Competențe transversale")
    document.add_paragraph("CT3. Identifică probleme.")
    for line in extra_lines:
        document.add_paragraph(line)
    return to_bytes(document)


def study_plan_with_table() -> bytes:
    """A plan that lists every discipline of a programme in a table."""
    document = Document()
    document.add_heading("Plan de învățământ — Informatică", level=1)
    add_table(
        document,
        [
            ["Nr.", "Disciplina", "Credite", "Forma de evaluare"],
            ["1", "Analiză matematică", "6", "E"],
            ["2", "Structuri de date", "5", "E"],
            ["3", "Limba engleză", "2", "C"],
        ],
    )
    return to_bytes(document)
