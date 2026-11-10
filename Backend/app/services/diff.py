"""Compare the sections of an existing sheet with those of a new template."""

from __future__ import annotations

from difflib import SequenceMatcher

from app.schemas import Section, SectionDiff
from app.services.text import normalize, strip_numbering

SIMILARITY_THRESHOLD = 0.85
MIN_CONTAINMENT_LENGTH = 6


def compare_sections(
    old_sections: list[Section], new_sections: list[Section]
) -> list[SectionDiff]:
    """Annotate every template section against the old sheet.

    - "unchanged": the old sheet has the section, with nothing to reconcile
    - "modified":  both have content for it and the content differs
    - "new":       only the template has it
    - "missing":   only the old sheet has it (listed last)

    The returned content is what a migrated sheet should hold: the old
    sheet's text when there is some, the template's text otherwise.
    """
    unmatched_old = list(old_sections)
    result: list[SectionDiff] = []

    for template in new_sections:
        match = _find_match(template.title, unmatched_old)
        if match is None:
            result.append(_diff(template.title, "", "new"))
            continue

        unmatched_old.remove(match)
        if not match.content.strip():
            result.append(_diff(template.title, template.content, "unchanged"))
        elif _same_text(match.content, template.content):
            result.append(_diff(template.title, match.content, "unchanged"))
        else:
            result.append(
                _diff(
                    template.title,
                    match.content,
                    "modified" if template.content.strip() else "unchanged",
                    template_content=template.content or None,
                )
            )

    result.extend(
        _diff(section.title, section.content, "missing") for section in unmatched_old
    )

    for index, section in enumerate(result, start=1):
        section.id = str(index)
    return result


def _diff(
    title: str, content: str, status: str, template_content: str | None = None
) -> SectionDiff:
    return SectionDiff(
        id="",
        title=title,
        content=content,
        status=status,
        template_content=template_content,
    )


def _same_text(first: str, second: str) -> bool:
    return normalize(first) == normalize(second)


def _find_match(title: str, candidates: list[Section]) -> Section | None:
    """Best candidate for a title: exact, then unnumbered, then fuzzy."""
    wanted = normalize(title)
    for candidate in candidates:
        if normalize(candidate.title) == wanted:
            return candidate

    wanted = normalize(strip_numbering(title))
    if not wanted:
        return None
    keyed = [(normalize(strip_numbering(c.title)), c) for c in candidates]

    for key, candidate in keyed:
        if key == wanted:
            return candidate

    for key, candidate in keyed:
        shorter, longer = sorted((key, wanted), key=len)
        if len(shorter) >= MIN_CONTAINMENT_LENGTH and shorter in longer:
            return candidate

    best_ratio, best = 0.0, None
    for key, candidate in keyed:
        ratio = SequenceMatcher(None, key, wanted).ratio()
        if ratio > best_ratio:
            best_ratio, best = ratio, candidate
    return best if best_ratio >= SIMILARITY_THRESHOLD else None
