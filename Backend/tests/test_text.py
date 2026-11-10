import pytest

from app.services.text import (
    detect_evaluation_type,
    normalize,
    parse_credits,
    parse_evaluation_type,
    strip_numbering,
)


def test_normalize_treats_cedilla_and_comma_letters_alike():
    # "ş"/"ţ" (cedilla) and "ș"/"ț" (comma below) look the same in Word
    assert normalize("Conţinutul  disciplinei") == normalize("conținutul disciplinei")
    assert normalize("FIŞA") == "fisa"


@pytest.mark.parametrize(
    ("title", "expected"),
    [
        ("7. Bibliografie", "Bibliografie"),
        ("5.1 Curs", "Curs"),
        ("Evaluare", "Evaluare"),
    ],
)
def test_strip_numbering(title, expected):
    assert strip_numbering(title) == expected


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("Credite: 5", 5),
        ("Număr de credite | 6", 6),
        ("Examen, 4 credite", 4),
        ("6 ECTS", 6),
        ("Anul 2024", None),
        ("fără nimic relevant", None),
    ],
)
def test_parse_credits(text, expected):
    assert parse_credits(text) == expected


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("E", "examen"),
        ("Examen", "examen"),
        ("C", "colocviu"),
        ("colocviu", "colocviu"),
        ("VP", "verificare"),
        ("Verificare pe parcurs", "verificare"),
        ("DS", None),
    ],
)
def test_parse_evaluation_type(value, expected):
    assert parse_evaluation_type(value) == expected


def test_detect_evaluation_type_needs_a_single_candidate():
    assert detect_evaluation_type("Colocviu final 60%") == "colocviu"
    assert detect_evaluation_type("Examen sau colocviu") is None
    assert detect_evaluation_type("Proiect") is None
