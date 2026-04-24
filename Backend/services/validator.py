def validate_uploaded_file(filename: str, file_size: int) -> tuple[bool, str]:
    allowed_extensions = ['.docx', '.pdf', '.txt']
    
    if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
        return False, f"Format neacceptat. Te rog încarcă: {', '.join(allowed_extensions)}"
    
    if file_size > 5 * 1024 * 1024:
        return False, "Fișierul este prea mare (limita este de 5MB)."
        
    return True, "Ok"

def validate_mandatory_sections(sections: dict) -> list[str]:
    if not sections:
        return ["Documentul pare să fie gol sau nu a putut fi parsat."]
    return []