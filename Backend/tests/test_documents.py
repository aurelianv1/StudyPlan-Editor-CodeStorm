from datetime import date

from app.schemas import PlanData, Section
from app.services.docx_reader import open_document
from app.services.exporter import EMPTY_SECTION_PLACEHOLDER, generate_docx
from app.services.sheet_parser import extract_sections
from app.services.skeleton_generator import academic_year, generate_skeleton


def test_exported_document_parses_back_to_the_same_sections():
    sections = [
        Section(
            id="1",
            title="1. Date despre disciplină",
            content="Denumirea disciplinei | Algebră\nCredite | 5",
        ),
        Section(id="2", title="2. Obiective", content="Prima linie\nA doua linie"),
    ]

    parsed = extract_sections(generate_docx(sections))

    assert [(s.title, s.content) for s in parsed] == [
        (s.title, s.content) for s in sections
    ]


def test_table_like_lines_are_exported_as_a_table():
    section = Section(id="1", title="Evaluare", content="Examen | 60%\nLaborator | 40%")
    document = open_document(generate_docx([section]))
    assert len(document.tables) == 1
    assert [cell.text for cell in document.tables[0].rows[1].cells] == [
        "Laborator",
        "40%",
    ]


def test_empty_sections_get_an_italic_placeholder():
    document = open_document(generate_docx([Section(id="1", title="Bibliografie")]))
    placeholder = document.paragraphs[-1]
    assert placeholder.text == EMPTY_SECTION_PLACEHOLDER
    assert placeholder.runs[0].italic is True


def test_skeleton_is_generated_for_a_plan_with_no_data():
    titles = [s.title for s in extract_sections(generate_skeleton(PlanData()))]
    assert "6. Evaluare" in titles and "7. Bibliografie" in titles


def test_skeleton_is_prefilled_from_the_plan():
    plan = PlanData(
        credits=5,
        evaluation_type="colocviu",
        professional_competencies=["CP1. Creează softuri."],
    )
    sections = {s.title: s.content for s in extract_sections(generate_skeleton(plan))}
    assert "Număr credite | 5" in sections["1. Date despre programul de studiu"]
    assert "Colocviu | 60%" in sections["6. Evaluare"]
    assert "CP1. Creează softuri." in sections["3. Competențe profesionale"]


def test_academic_year_starts_in_september():
    assert academic_year(date(2026, 8, 31)) == "2025-2026"
    assert academic_year(date(2026, 9, 1)) == "2026-2027"
