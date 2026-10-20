def compare_sections(old_sections: list[dict], new_sections: list[dict]) -> list[dict]:
    """
    Compară secțiunile din documentul vechi cu template-ul nou și setează
    status-ul fiecărei secțiuni:
      - new:       există doar în template (conținut gol)
      - modified:  există în ambele, dar conținutul diferă (se păstrează cel vechi)
      - unchanged: există în ambele cu același conținut
      - missing:   există doar în documentul vechi
    """
    old_by_title = _index_by_title(old_sections)
    new_by_title = _index_by_title(new_sections)

    result = []

    for new_sec in new_sections:
        match = find_best_match(new_sec["title"].lower(), old_by_title)

        if match is None:
            result.append({**new_sec, "status": "new", "content": ""})
            continue

        old_content = old_by_title[match]["content"]
        if old_content != new_sec["content"]:
            result.append(
                {
                    **new_sec,
                    "status": "modified",
                    "content": old_content,
                    "old_content": old_content,
                }
            )
        else:
            result.append({**new_sec, "status": "unchanged"})

    for old_sec in old_sections:
        if find_best_match(old_sec["title"].lower(), new_by_title) is None:
            result.append({**old_sec, "status": "missing"})

    return result


def find_best_match(title: str, candidates: dict) -> str | None:
    """
    Caută cel mai bun match pentru un titlu.
    Încearcă match exact, apoi match parțial (un titlu îl conține pe celălalt).
    """
    if title in candidates:
        return title

    return next(
        (candidate for candidate in candidates if title in candidate or candidate in title),
        None,
    )


def _index_by_title(sections: list[dict]) -> dict[str, dict]:
    return {s["title"].lower(): s for s in sections}
