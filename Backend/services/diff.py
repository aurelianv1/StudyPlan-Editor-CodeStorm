def compare_sections(old_sections: list[dict], new_sections: list[dict]) -> list[dict]:
    """
    Compară secțiunile din documentul vechi cu template-ul nou
    și setează status-ul fiecărei secțiuni.
    """
    old_titles = {s["title"].lower(): s for s in old_sections}
    new_titles = {s["title"].lower(): s for s in new_sections}

    result = []

    for new_sec in new_sections:
        key = new_sec["title"].lower()
        match = find_best_match(key, old_titles)

        if match is None:
            result.append({**new_sec, "status": "new", "content": ""})
        elif old_titles[match]["content"] != new_sec["content"]:
            result.append(
                {
                    **new_sec,
                    "status": "modified",
                    "content": old_titles[match]["content"],
                    "old_content": old_titles[match]["content"],
                }
            )
        else:
            result.append({**new_sec, "status": "unchanged"})

    for old_sec in old_sections:
        key = old_sec["title"].lower()
        if find_best_match(key, new_titles) is None:
            result.append({**old_sec, "status": "missing"})

    return result


def find_best_match(title: str, candidates: dict) -> str | None:
    """
    Caută cel mai bun match pentru un titlu.
    Încearcă match exact, apoi match parțial.
    """
    if title in candidates:
        return title

    for candidate in candidates:
        if title in candidate or candidate in title:
            return candidate

    return None
