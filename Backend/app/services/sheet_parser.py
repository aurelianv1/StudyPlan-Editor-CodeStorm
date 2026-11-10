"""Split a discipline sheet (.docx) into titled sections.

Real discipline sheets keep most of their data in tables, with headings such
as "2. Date despre disciplină" either as paragraphs between the tables or as a
merged row at the top of one. The parser therefore walks paragraphs and tables
in document order and attaches table rows to the section they belong to.
"""

from __future__ import annotations

import re
from typing import BinaryIO

from docx.text.paragraph import Paragraph

from app.schemas import Section
from app.services.docx_reader import iter_blocks, open_document, table_rows
from app.services.text import CELL_SEPARATOR

PREAMBLE_TITLE = "Introducere"
MAX_HEADING_LENGTH = 120

# "7. Bibliografie" but not "7.1 Curs" or "2024. Something".
_TOP_LEVEL_NUMBER = re.compile(r"^(\d{1,2})\.\s*(?!\d)\S")


def extract_sections(source: bytes | BinaryIO) -> list[Section]:
    document = open_document(source)
    builder = _SectionBuilder()

    for block in iter_blocks(document):
        if isinstance(block, Paragraph):
            text = block.text.strip()
            if not text:
                continue
            if builder.is_heading(block, text):
                builder.start(text)
            else:
                builder.add_line(text)
        else:
            for cells in table_rows(block):
                if len(cells) == 1 and builder.is_numbered_heading(cells[0]):
                    builder.start(cells[0])
                else:
                    builder.add_line(CELL_SEPARATOR.join(cells))

    return builder.finish()


class _SectionBuilder:
    def __init__(self) -> None:
        self._sections: list[tuple[str, list[str]]] = []
        self._last_number = 0

    def start(self, title: str) -> None:
        number = _top_level_number(title)
        if number is not None:
            self._last_number = number
        self._sections.append((title, []))

    def add_line(self, line: str) -> None:
        if not self._sections:
            self._sections.append((PREAMBLE_TITLE, []))
        self._sections[-1][1].append(line)

    def finish(self) -> list[Section]:
        return [
            Section(id=str(index), title=title, content="\n".join(lines))
            for index, (title, lines) in enumerate(self._sections, start=1)
        ]

    def is_heading(self, paragraph: Paragraph, text: str) -> bool:
        if len(text) > MAX_HEADING_LENGTH:
            return False
        if _has_heading_style(paragraph) or _is_fully_bold(paragraph):
            return True
        return self.is_numbered_heading(text)

    def is_numbered_heading(self, text: str) -> bool:
        """True for the next numbered heading in sequence.

        Requiring the sequence keeps numbered list items inside a section
        ("1. Liste liniare", "2. Stive") from being taken for headings.
        """
        if len(text) > MAX_HEADING_LENGTH:
            return False
        number = _top_level_number(text)
        return number is not None and number == self._last_number + 1


def _top_level_number(text: str) -> int | None:
    match = _TOP_LEVEL_NUMBER.match(text)
    return int(match.group(1)) if match else None


def _has_heading_style(paragraph: Paragraph) -> bool:
    name = (paragraph.style.name if paragraph.style is not None else "") or ""
    return name.startswith(("Heading", "Title"))


def _is_fully_bold(paragraph: Paragraph) -> bool:
    """True when every run that carries text is bold.

    A single bold word inside a sentence does not make the paragraph a
    heading, which is what the previous "any bold run" rule assumed.
    """
    runs = [run for run in paragraph.runs if run.text.strip()]
    if not runs:
        return False
    style_bold = bool(paragraph.style is not None and paragraph.style.font.bold)
    return all(run.bold or (run.bold is None and style_bold) for run in runs)
