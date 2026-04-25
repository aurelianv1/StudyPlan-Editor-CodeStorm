def validate_fd_against_plan(sections: list[dict], plan_data: dict) -> list[dict]:
    conflicts = []
    full_text = " ".join([s.get("content", "") for s in sections]).lower()

    tip_plan = plan_data.get("tip_evaluare")
    if tip_plan:
        if (
            tip_plan == "examen"
            and "colocviu" in full_text
            and "examen" not in full_text
        ):
            conflicts.append(
                {
                    "tip": "tip_evaluare",
                    "severitate": "error",
                    "mesaj": f"Planul prevede 'Examen', dar FD menționează 'Colocviu'.",
                }
            )
        elif (
            tip_plan == "colocviu"
            and "examen" in full_text
            and "colocviu" not in full_text
        ):
            conflicts.append(
                {
                    "tip": "tip_evaluare",
                    "severitate": "error",
                    "mesaj": f"Planul prevede 'Colocviu', dar FD menționează 'Examen'.",
                }
            )

    credite_plan = plan_data.get("credite")
    if credite_plan:
        credite_fd = extract_credite_din_fd(full_text)
        if credite_fd and credite_fd != credite_plan:
            conflicts.append(
                {
                    "tip": "credite",
                    "severitate": "error",
                    "mesaj": f"Planul prevede {credite_plan} credite, FD menționează {credite_fd} credite.",
                }
            )

    competente_plan = plan_data.get("competente_profesionale", [])
    if competente_plan:
        competente_lipsa = [c for c in competente_plan if c.lower() not in full_text]
        if competente_lipsa:
            conflicts.append(
                {
                    "tip": "competente",
                    "severitate": "warning",
                    "mesaj": f"Competențele următoare din Plan lipsesc din FD: {', '.join(competente_lipsa[:3])}",
                }
            )

    return conflicts


def extract_credite_din_fd(text: str) -> int | None:
    import re

    matches = re.findall(r"credite?[:\s]+(\d+)", text)
    if matches:
        return int(matches[0])
    return None
