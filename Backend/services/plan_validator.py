from services.docx_utils import extract_credits

MAX_LISTED_MISSING_COMPETENCES = 3

# Perechi (tip prevăzut în plan, tip care intră în conflict cu el).
_CONFLICTING_EVALUATIONS = {
    "examen": "colocviu",
    "colocviu": "examen",
}


def validate_fd_against_plan(sections: list[dict], plan_data: dict) -> list[dict]:
    """Compară Fișa Disciplinei cu datele din Planul de Învățământ."""
    full_text = " ".join(s.get("content", "") for s in sections).lower()

    checks = (
        _check_evaluation_type(full_text, plan_data.get("tip_evaluare")),
        _check_credits(full_text, plan_data.get("credite")),
        _check_competences(full_text, plan_data.get("competente_profesionale", [])),
    )
    return [conflict for conflict in checks if conflict]


def has_errors(conflicts: list[dict]) -> bool:
    return any(c["severitate"] == "error" for c in conflicts)


def _conflict(kind: str, severity: str, message: str) -> dict:
    return {"tip": kind, "severitate": severity, "mesaj": message}


def _check_evaluation_type(fd_text: str, plan_type: str | None) -> dict | None:
    conflicting_type = _CONFLICTING_EVALUATIONS.get(plan_type or "")
    if conflicting_type and conflicting_type in fd_text and plan_type not in fd_text:
        return _conflict(
            "tip_evaluare",
            "error",
            f"Planul prevede '{plan_type.capitalize()}', "
            f"dar FD menționează '{conflicting_type.capitalize()}'.",
        )
    return None


def _check_credits(fd_text: str, plan_credits: int | None) -> dict | None:
    fd_credits = extract_credits(fd_text)
    if plan_credits and fd_credits and fd_credits != plan_credits:
        return _conflict(
            "credite",
            "error",
            f"Planul prevede {plan_credits} credite, FD menționează {fd_credits} credite.",
        )
    return None


def _check_competences(fd_text: str, plan_competences: list[str]) -> dict | None:
    missing = [c for c in plan_competences if c.lower() not in fd_text]
    if missing:
        listed = ", ".join(missing[:MAX_LISTED_MISSING_COMPETENCES])
        return _conflict(
            "competente",
            "warning",
            f"Competențele următoare din Plan lipsesc din FD: {listed}",
        )
    return None
