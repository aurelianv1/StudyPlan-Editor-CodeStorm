"""Low-level access to .docx files: opening them and flattening tables."""

from __future__ import annotations

import io
import zipfile
from collections.abc import Iterator
from typing import BinaryIO

from docx import Document
from docx.document import Document as DocxDocument
from docx.opc.exceptions import PackageNotFoundError
from docx.table import Table, _Cell
from docx.text.paragraph import Paragraph

from app.services.text import CELL_SEPARATOR


class InvalidDocumentError(ValueError):
    """Raised when the uploaded bytes are not a readable .docx file."""


def open_document(source: bytes | BinaryIO) -> DocxDocument:
    stream = io.BytesIO(source) if isinstance(source, bytes) else source
    try:
        return Document(stream)
    except (PackageNotFoundError, zipfile.BadZipFile, KeyError, ValueError) as error:
        raise InvalidDocumentError("not a valid .docx file") from error


def iter_blocks(document: DocxDocument) -> Iterator[Paragraph | Table]:
    """Yield paragraphs and tables in the order they appear in the body."""
    yield from document.iter_inner_content()


def cell_text(cell: _Cell) -> str:
    """Text of a cell, including any table nested inside it."""
    parts: list[str] = []
    for block in cell.iter_inner_content():
        if isinstance(block, Paragraph):
            text = block.text.strip()
            if text:
                parts.append(text)
        else:
            parts.extend(table_lines(block))
    return " ".join(" ".join(parts).split())


def table_rows(table: Table) -> list[list[str]]:
    """Return the non-empty cell texts of every row.

    Rows are read from the underlying XML cells so that a horizontally merged
    cell is reported once instead of once per column it spans.
    """
    rows: list[list[str]] = []
    for row in table.rows:
        cells = [cell_text(_Cell(tc, table)) for tc in row._tr.tc_lst]
        cells = [text for text in cells if text]
        if cells:
            rows.append(cells)
    return rows


def table_lines(table: Table) -> list[str]:
    """Flatten a table to one "cell | cell" line per row."""
    return [CELL_SEPARATOR.join(cells) for cells in table_rows(table)]


def document_lines(document: DocxDocument) -> list[str]:
    """All non-empty text lines of a document, tables included, in order."""
    lines: list[str] = []
    for block in iter_blocks(document):
        if isinstance(block, Paragraph):
            text = block.text.strip()
            if text:
                lines.append(text)
        else:
            lines.extend(table_lines(block))
    return lines
