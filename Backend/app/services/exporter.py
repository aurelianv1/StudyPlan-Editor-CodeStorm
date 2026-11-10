from docx import Document
import io


def generate_docx(sections: list[dict]) -> bytes:
    """
    Primește lista de secțiuni și generează un fișier .docx
    """
    doc = Document()

    for section in sections:
        doc.add_heading(section.get("title", ""), level=1)

        content = section.get("content", "")
        if content:
            doc.add_paragraph(content)
        else:
            placeholder = doc.add_paragraph("[ Completați această secțiune ]")
            placeholder.runs[0].italic = True

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()
