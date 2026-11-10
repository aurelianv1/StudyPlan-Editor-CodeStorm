from docx import Document
import io


def generate_skeleton(plan_data: dict) -> bytes:
    """
    Generează un schelet de FD pre-completat din datele Planului de Învățământ.
    """
    doc = Document()

    doc.add_heading("FIȘA DISCIPLINEI", level=0)

    doc.add_heading("1. Date despre programul de studiu", level=1)
    table1 = doc.add_table(rows=3, cols=2)
    table1.style = "Table Grid"
    table1.cell(0, 0).text = "Tip evaluare"
    table1.cell(0, 1).text = (
        plan_data.get("tip_evaluare", "").capitalize()
        if plan_data.get("tip_evaluare")
        else "[ Completați ]"
    )
    table1.cell(1, 0).text = "Număr credite"
    table1.cell(1, 1).text = (
        str(plan_data.get("credite")) if plan_data.get("credite") else "[ Completați ]"
    )
    table1.cell(2, 0).text = "Anul universitar"
    table1.cell(2, 1).text = "2025-2026"

    doc.add_paragraph()

    doc.add_heading("2. Obiectivele disciplinei", level=1)
    doc.add_paragraph("[ Completați obiectivele disciplinei ]").italic = True

    doc.add_paragraph()

    doc.add_heading("3. Competențe profesionale", level=1)
    competente = plan_data.get("competente_profesionale", [])
    if competente:
        for cp in competente[:5]:
            if cp.startswith("CP") or cp.startswith("CPI"):
                doc.add_paragraph(cp, style="List Bullet")
    else:
        doc.add_paragraph("[ Completați competențele profesionale ]").italic = True

    doc.add_paragraph()

    doc.add_heading("4. Competențe transversale", level=1)
    transversale = plan_data.get("competente_transversale", [])
    if transversale:
        for ct in transversale[:3]:
            if ct.startswith("CT"):
                doc.add_paragraph(ct, style="List Bullet")
    else:
        doc.add_paragraph("[ Completați competențele transversale ]").italic = True

    doc.add_paragraph()

    doc.add_heading("5. Conținutul disciplinei", level=1)
    doc.add_heading("5.1 Curs", level=2)
    doc.add_paragraph("[ Completați tematica cursului ]").italic = True
    doc.add_heading("5.2 Seminar/Laborator", level=2)
    doc.add_paragraph("[ Completați tematica seminarului/laboratorului ]").italic = True

    doc.add_paragraph()

    doc.add_heading("6. Evaluare", level=1)
    table2 = doc.add_table(rows=3, cols=2)
    table2.style = "Table Grid"
    table2.cell(0, 0).text = "Tip activitate"
    table2.cell(0, 1).text = "Pondere"
    table2.cell(1, 0).text = plan_data.get("tip_evaluare", "Examen").capitalize()
    table2.cell(1, 1).text = "60%"
    table2.cell(2, 0).text = "Activitate laborator/seminar"
    table2.cell(2, 1).text = "40%"

    doc.add_paragraph()

    doc.add_heading("7. Bibliografie", level=1)
    doc.add_paragraph(
        "[ Adăugați minim 3 surse bibliografice, dintre care una din ultimii 5 ani ]"
    ).italic = True

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()
