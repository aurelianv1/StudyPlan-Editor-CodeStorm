"""
Răspunsuri predefinite pentru demo-ul de la prezentare.

Când numele unui fișier încărcat conține cuvinte-cheie cunoscute
(ex. „structuri”, „analiza”, „sisteme”), endpoint-urile returnează
aceste date în loc să parseze documentul.
"""

from pathlib import Path

DEMO_FILES_DIR = Path(__file__).resolve().parent.parent / "demo_files"

_COMPETENTE_PROFESIONALE = [
    "CP1. Creează softuri, dezvoltă prototipul pentru software.",
    "CP2. Utilizează șabloane de proiectare de software, creează diagrama de proces.",
    "CP3. Analizează specificații software, definește arhitectura software, proiectează sistemul informatic.",
]

_CT1 = "CT1. Aplică competente de bază în materie de programare."
_CT3 = "CT3. Identifică probleme, soluționează probleme."
_CT4 = "CT4. Demonstrează angajament, gândește rapid, gândește analitic."
_CT5 = "CT5. Lucrează în echipe, organizează informații, obiecte și resurse."

_PROGRAM_STUDIU = "Universitatea Transilvania din Brașov, Informatică"


def _plan_data(competente_transversale: list[str]) -> dict:
    return {
        "credite": 5,
        "tip_evaluare": "examen",
        "competente_profesionale": _COMPETENTE_PROFESIONALE,
        "competente_transversale": competente_transversale,
    }


def _sections(*rows: tuple[str, str, str]) -> list[dict]:
    """Construiește lista de secțiuni din tupluri (titlu, conținut, status)."""
    return [
        {"id": str(index), "title": title, "content": content, "status": status}
        for index, (title, content, status) in enumerate(rows, start=1)
    ]


def _missing_competence_warning(code: str, description: str) -> dict:
    return {
        "tip": "competente",
        "severitate": "warning",
        "mesaj": (
            f"⚠️ Competența {code} lipsește din FD. Conform Planului de Învățământ, "
            f"această disciplină trebuie să acopere: '{description}'"
        ),
    }


DEMO_RESPONSES = {
    "structuri_de_date": {
        "validate": {
            "plan_data": _plan_data([_CT3, _CT4]),
            "conflicts": [
                {
                    "tip": "tip_evaluare",
                    "severitate": "error",
                    "mesaj": "⛔ Planul prevede 'Examen', dar FD menționează 'Colocviu'. Vă rugăm să corectați forma de evaluare.",
                }
            ],
            "has_errors": True,
        },
        "upload": {
            "sections": _sections(
                ("Date despre programul de studiu", _PROGRAM_STUDIU, "unchanged"),
                ("Date despre disciplină", "Structuri de Date, Sem I, Colocviu, 5 credite", "modified"),
                ("Obiectivele disciplinei", "Însușirea noțiunilor fundamentale privind structurile de date.", "unchanged"),
                ("Competențe profesionale", "CP2, CP3", "unchanged"),
                ("Conținutul disciplinei", "Liste, stive, cozi, arbori, grafuri.", "unchanged"),
                ("Rezultate așteptate", "", "new"),
                ("Evaluare", "Colocviu final 60%, Activitate laborator 40%", "modified"),
                ("Bibliografie", "Knuth, Cormen, Sedgewick", "unchanged"),
            )
        },
        "migrate_file": DEMO_FILES_DIR / "fisa_migrata_structuri_de_date.docx",
    },
    "analiza_matematica": {
        "validate": {
            "plan_data": _plan_data([_CT3, _CT4, _CT5]),
            "conflicts": [
                _missing_competence_warning("CP1", _COMPETENTE_PROFESIONALE[0]),
                _missing_competence_warning("CT5", _CT5),
            ],
            "has_errors": False,
        },
        "upload": {
            "sections": _sections(
                ("Date despre programul de studiu", _PROGRAM_STUDIU, "unchanged"),
                ("Date despre disciplină", "Analiză Matematică, Sem I, Examen, 5 credite", "unchanged"),
                ("Obiectivele disciplinei", "Însușirea noțiunilor de bază ale analizei matematice.", "modified"),
                ("Competențe profesionale", "CP2, CP3", "missing"),
                ("Conținutul disciplinei", "Limite, derivate, integrale, serii.", "unchanged"),
                ("Rezultate așteptate", "", "new"),
                ("Evaluare", "Examen final 60%, Teme 40%", "unchanged"),
                ("Bibliografie", "Rudin 1976, Apostol 1974", "unchanged"),
            )
        },
    },
    "sisteme_de_operare": {
        "validate": {
            "plan_data": _plan_data([_CT1, _CT3]),
            "conflicts": [],
            "has_errors": False,
        },
        "upload": {
            "sections": _sections(
                ("Date despre programul de studiu", _PROGRAM_STUDIU, "unchanged"),
                ("Date despre disciplină", "Sisteme de Operare, Sem II, Examen, 5 credite", "unchanged"),
                ("Obiectivele disciplinei", "Cunoașterea principiilor de funcționare ale sistemelor de operare.", "unchanged"),
                ("Competențe profesionale", "CP1, CP2, CP3", "unchanged"),
                ("Conținutul disciplinei", "Procese și fire de execuție, Gestiunea memoriei, Sisteme de fișiere.", "unchanged"),
                ("Rezultate așteptate", "Studentul va înțelege arhitectura unui sistem de operare modern.", "unchanged"),
                ("Evaluare", "Examen final 60%, Laborator 40%", "unchanged"),
                ("Bibliografie", "Tanenbaum 2015, Silberschatz 2018, Arpaci-Dusseau 2023", "unchanged"),
            )
        },
    },
}

# Ordinea contează: primul scenariu ale cărui cuvinte-cheie apar în numele fișierului câștigă.
_DEMO_KEYWORDS = {
    "structuri_de_date": ("structuri",),
    "analiza_matematica": ("analiza", "matematica"),
    "sisteme_de_operare": ("sisteme", "operare"),
}


def get_demo_key(*filenames: str | None) -> str | None:
    """Returnează cheia scenariului demo potrivit pentru primul fișier recunoscut."""
    for filename in filenames:
        name = (filename or "").lower()
        for demo_key, keywords in _DEMO_KEYWORDS.items():
            if any(keyword in name for keyword in keywords):
                return demo_key
    return None
