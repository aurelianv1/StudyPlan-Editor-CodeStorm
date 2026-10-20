from services.diff import compare_sections

NEW_SECTION_PLACEHOLDER = "[ Vă rugăm completați această secțiune nouă ]"


def migrate_sections(old_sections: list[dict], new_sections: list[dict]) -> list[dict]:
    """
    Mută conținutul documentului vechi pe structura template-ului nou:
    secțiunile care nu mai există în template sunt eliminate, iar cele
    noi primesc un text de completat.
    """
    migrated = []
    for section in compare_sections(old_sections, new_sections):
        if section["status"] == "missing":
            continue
        if section["status"] == "new":
            section = {**section, "content": NEW_SECTION_PLACEHOLDER}
        migrated.append(section)
    return migrated
