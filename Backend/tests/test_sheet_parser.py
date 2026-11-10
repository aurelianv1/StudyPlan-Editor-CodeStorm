import pytest
from docx import Document

from app.services.docx_reader import InvalidDocumentError
from app.services.sheet_parser import PREAMBLE_TITLE, extract_sections
from tests.builders import add_bold, add_table, discipline_sheet, to_bytes


def by_title(sections):
    return {section.title: section for section in sections}


def test_sections_follow_the_numbered_headings():
    titles = [section.title for section in extract_sections(discipline_sheet())]
    assert titles == [
        "FIȘA DISCIPLINEI",
        "1. Date despre program",
        "2. Date despre disciplină",
        "3. Timpul total estimat",
        "4. Competențe specifice acumulate",
        "5. Conținuturi",
        "6. Bibliografie",
    ]


def test_table_rows_are_part_of_the_section_content():
    sections = by_title(extract_sections(discipline_sheet(name="Algebră")))
    content = sections["2. Date despre disciplină"].content
    assert "2.1 Denumirea disciplinei | Algebră" in content.splitlines()
    assert "2.6 Tipul de evaluare | E" in content


def test_numbered_list_items_are_not_headings():
    sections = by_title(extract_sections(discipline_sheet()))
    assert "1. Liste liniare" in sections["5. Conținuturi"].content
    assert sections["6. Bibliografie"].content.startswith("1. Knuth")


def test_a_bold_word_inside_a_sentence_is_not_a_heading():
    sections = by_title(extract_sections(discipline_sheet()))
    assert "Evaluarea ține cont de prezență la laborator." in (
        sections["5. Conținuturi"].content
    )


def test_heading_stored_as_a_merged_table_row():
    document = Document()
    table = document.add_table(rows=3, cols=2)
    table.cell(0, 0).merge(table.cell(0, 1)).text = "1. Date despre program"
    table.cell(1, 0).text = "1.1 Facultatea"
    table.cell(1, 1).text = "Matematică și Informatică"
    table.cell(2, 0).merge(table.cell(2, 1)).text = "2. Date despre disciplină"

    sections = extract_sections(to_bytes(document))

    assert [s.title for s in sections] == [
        "1. Date despre program",
        "2. Date despre disciplină",
    ]
    # the merged heading cell is reported once, not once per spanned column
    assert sections[0].content == "1.1 Facultatea | Matematică și Informatică"


def test_text_before_the_first_heading_becomes_one_preamble_section():
    document = Document()
    document.add_paragraph("Universitatea Transilvania")
    document.add_paragraph("Anul universitar 2025-2026")
    add_bold(document, "1. Date despre program")

    sections = extract_sections(to_bytes(document))

    assert [s.title for s in sections] == [PREAMBLE_TITLE, "1. Date despre program"]
    assert sections[0].content.splitlines() == [
        "Universitatea Transilvania",
        "Anul universitar 2025-2026",
    ]


def test_section_ids_are_unique():
    document = Document()
    document.add_paragraph("intro")
    add_bold(document, "A")
    add_table(document, [["x", "y"]])
    add_bold(document, "B")
    ids = [section.id for section in extract_sections(to_bytes(document))]
    assert len(ids) == len(set(ids)) == 3


def test_word_heading_styles_are_recognised():
    document = Document()
    document.add_heading("Obiective", level=1)
    document.add_paragraph("Text.")
    assert [s.title for s in extract_sections(to_bytes(document))] == ["Obiective"]


@pytest.mark.parametrize("payload", [b"", b"plain text", b"PK\x03\x04 truncated"])
def test_unreadable_files_raise_a_clear_error(payload):
    with pytest.raises(InvalidDocumentError):
        extract_sections(payload)
