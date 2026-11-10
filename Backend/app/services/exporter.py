"""Write sections back to a .docx file."""

from __future__ import annotations

import io

from docx import Document
from docx.document import Document as DocxDocument

from app.schemas import Section
from app.services.text import CELL_SEPARATOR, split_cells

EMPTY_SECTION_PLACEHOLDER = "[ Completați această secțiune ]"


def generate_docx(sections: list[Section]) -> bytes:
    document = Document()
    for section in sections:
        document.add_heading(section.title, level=1)
        if section.content.strip():
            write_content(document, section.content)
        else:
            add_placeholder(document, EMPTY_SECTION_PLACEHOLDER)
    return to_bytes(document)


def write_content(document: DocxDocument, content: str) -> None:
    """Write text line by line, turning runs of "a | b" lines back into tables."""
    table_rows: list[list[str]] = []
    for line in content.splitlines():
        if CELL_SEPARATOR.strip() in line:
            table_rows.append(split_cells(line))
            continue
        _flush_table(document, table_rows)
        if line.strip():
            document.add_paragraph(line.strip())
    _flush_table(document, table_rows)


def add_placeholder(document: DocxDocument, text: str) -> None:
    document.add_paragraph().add_run(text).italic = True


def to_bytes(document: DocxDocument) -> bytes:
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def _flush_table(document: DocxDocument, rows: list[list[str]]) -> None:
    if not rows:
        return
    table = document.add_table(rows=len(rows), cols=max(len(row) for row in rows))
    table.style = "Table Grid"
    for row_index, cells in enumerate(rows):
        for col_index, text in enumerate(cells):
            table.cell(row_index, col_index).text = text
    rows.clear()
