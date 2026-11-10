from app.schemas import PlanData, PlanDiscipline, Section
from app.services.plan_parser import extract_plan_data
from app.services.sheet_parser import extract_sections
from app.services.validator import extract_sheet_facts, validate_sheet
from tests.builders import discipline_sheet, study_plan, study_plan_with_table


def conflict_types(conflicts):
    return [conflict.type for conflict in conflicts]


# --- plan parser -----------------------------------------------------------


def test_single_discipline_plan():
    plan = extract_plan_data(study_plan(credits="6", evaluation="Colocviu"))
    assert plan.credits == 6
    assert plan.evaluation_type == "colocviu"


def test_competencies_are_split_by_their_code():
    plan = extract_plan_data(study_plan())
    assert plan.professional_competencies == [
        "CP1. Creează softuri.",
        "CP2. Utilizează șabloane de proiectare.",
    ]
    # the "Competențe transversale" heading itself is not a competency
    assert plan.transversal_competencies == ["CT3. Identifică probleme."]


def test_labelled_evaluation_type_wins_over_other_mentions():
    plan = extract_plan_data(
        study_plan(evaluation="Examen", extra_lines=("Colocviu doar la restanță.",))
    )
    assert plan.evaluation_type == "examen"


def test_disciplines_are_read_from_the_plan_table():
    plan = extract_plan_data(study_plan_with_table())
    assert plan.disciplines == [
        PlanDiscipline(name="Analiză matematică", credits=6, evaluation_type="examen"),
        PlanDiscipline(name="Structuri de date", credits=5, evaluation_type="examen"),
        PlanDiscipline(name="Limba engleză", credits=2, evaluation_type="colocviu"),
    ]


# --- sheet facts -------------------------------------------------------------


def test_facts_are_read_from_label_value_cells():
    sections = extract_sections(
        discipline_sheet(name="Algebră", evaluation="C", credits="4")
    )
    facts = extract_sheet_facts(sections)
    assert (facts.discipline, facts.credits, facts.evaluation_type) == (
        "Algebră",
        4,
        "colocviu",
    )


def test_facts_fall_back_to_free_text():
    sections = [Section(id="1", title="Date", content="Colocviu, 3 credite")]
    facts = extract_sheet_facts(sections)
    assert (facts.credits, facts.evaluation_type) == (3, "colocviu")


# --- validation --------------------------------------------------------------


def test_matching_sheet_has_no_conflicts():
    sections = extract_sections(
        discipline_sheet(competencies=("CP1. x", "CP2. y", "CT3. z"))
    )
    assert validate_sheet(sections, extract_plan_data(study_plan())) == []


def test_evaluation_and_credit_mismatches_are_errors():
    sections = extract_sections(
        discipline_sheet(
            evaluation="C", credits="4", competencies=("CP1", "CP2", "CT3")
        )
    )
    conflicts = validate_sheet(sections, extract_plan_data(study_plan()))
    assert conflict_types(conflicts) == ["evaluation_type", "credits"]
    assert {c.severity for c in conflicts} == {"error"}
    assert "Examen" in conflicts[0].message and "Colocviu" in conflicts[0].message


def test_each_missing_competency_is_a_warning():
    sections = extract_sections(discipline_sheet(competencies=("CP1. x",)))
    conflicts = validate_sheet(sections, extract_plan_data(study_plan()))
    assert conflict_types(conflicts) == ["competencies", "competencies"]
    assert {c.severity for c in conflicts} == {"warning"}
    assert "CP2" in conflicts[0].message and "CT3" in conflicts[1].message


def test_competency_codes_are_matched_as_whole_codes():
    plan = PlanData(professional_competencies=["CP1. Creează softuri."])
    only_cp10 = [Section(id="1", title="Competențe", content="CP10. Altceva")]
    spaced = [Section(id="1", title="Competențe", content="C.P. 1 Creează softuri")]
    assert conflict_types(validate_sheet(only_cp10, plan)) == ["competencies"]
    assert validate_sheet(spaced, plan) == []


def test_plan_table_row_is_used_for_the_sheet_discipline():
    plan = extract_plan_data(study_plan_with_table())
    sections = extract_sections(
        discipline_sheet(name="Limba engleză", evaluation="E", credits="2")
    )
    conflicts = validate_sheet(sections, plan)
    assert conflict_types(conflicts) == ["evaluation_type"]


def test_discipline_missing_from_the_plan_table_is_reported():
    plan = extract_plan_data(study_plan_with_table())
    sections = extract_sections(discipline_sheet(name="Astronomie"))
    conflicts = validate_sheet(sections, plan)
    assert conflict_types(conflicts) == ["discipline"]
    assert conflicts[0].severity == "warning"
