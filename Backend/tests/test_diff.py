from app.schemas import Section
from app.services.diff import compare_sections


def section(title: str, content: str = "") -> Section:
    return Section(id="x", title=title, content=content)


def statuses(diff):
    return {item.title: item.status for item in diff}


def test_statuses():
    old = [
        section("Obiective", "Text vechi"),
        section("Evaluare", "Examen 60%"),
        section("Precondiții", "Algebră"),
    ]
    template = [
        section("Obiective", "Text vechi"),
        section("Evaluare", "Completați ponderile"),
        section("Rezultatele învățării"),
    ]

    diff = compare_sections(old, template)

    assert statuses(diff) == {
        "Obiective": "unchanged",
        "Evaluare": "modified",
        "Rezultatele învățării": "new",
        "Precondiții": "missing",
    }


def test_old_content_is_carried_into_the_template_section():
    diff = compare_sections(
        [section("Evaluare", "Examen 60%")], [section("Evaluare", "Completați")]
    )
    assert diff[0].content == "Examen 60%"
    assert diff[0].template_content == "Completați"


def test_empty_template_section_filled_from_the_old_sheet_is_not_a_conflict():
    diff = compare_sections(
        [section("Bibliografie", "Knuth")], [section("Bibliografie")]
    )
    assert (diff[0].status, diff[0].content) == ("unchanged", "Knuth")


def test_template_text_is_kept_when_the_old_section_is_empty():
    diff = compare_sections([section("Evaluare")], [section("Evaluare", "Ghid")])
    assert (diff[0].status, diff[0].content) == ("unchanged", "Ghid")


def test_renumbered_sections_still_match():
    diff = compare_sections(
        [section("7. Bibliografie", "Knuth")], [section("8. Bibliografie")]
    )
    assert [(d.title, d.status) for d in diff] == [("8. Bibliografie", "unchanged")]


def test_titles_match_across_diacritic_variants_and_small_rewordings():
    old = [
        section("Conţinutul disciplinei", "a"),
        section("Obiectivele disciplinei", "b"),
    ]
    template = [
        section("Conținutul disciplinei"),
        section("7. Obiectivele disciplinei (reieșind din grila competențelor)"),
    ]
    assert all(d.status == "unchanged" for d in compare_sections(old, template))


def test_an_old_section_is_matched_at_most_once():
    old = [section("Evaluare", "Examen 60%")]
    template = [section("Evaluare"), section("Evaluare finală")]
    diff = compare_sections(old, template)
    assert [d.status for d in diff] == ["unchanged", "new"]


def test_unrelated_short_titles_do_not_match():
    diff = compare_sections([section("Curs", "x")], [section("Cursuri opționale")])
    assert [d.status for d in diff] == ["new", "missing"]


def test_result_ids_are_unique():
    old = [
        Section(id="1", title="A", content="a"),
        Section(id="2", title="B", content="b"),
    ]
    template = [Section(id="1", title="C"), Section(id="2", title="A")]
    ids = [d.id for d in compare_sections(old, template)]
    assert ids == ["1", "2", "3"]
