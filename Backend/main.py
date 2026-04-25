from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
import io
import json
import os
import requests

from services.parser import extract_sections
from services.diff import compare_sections
from services.exporter import generate_docx
from services.prompt import SYSTEM_PROMPT
from services.plan_parser import extract_plan_data
from services.plan_validator import validate_fd_against_plan
from services.skeleton_generator import generate_skeleton

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEMO_RESPONSES = {
    "structuri_de_date": {
        "validate": {
            "plan_data": {
                "credite": 5,
                "tip_evaluare": "examen",
                "competente_profesionale": [
                    "CP1. Creează softuri, dezvoltă prototipul pentru software.",
                    "CP2. Utilizează șabloane de proiectare de software, creează diagrama de proces.",
                    "CP3. Analizează specificații software, definește arhitectura software, proiectează sistemul informatic.",
                ],
                "competente_transversale": [
                    "CT3. Identifică probleme, soluționează probleme.",
                    "CT4. Demonstrează angajament, gândește rapid, gândește analitic.",
                ],
            },
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
            "sections": [
                {
                    "id": "1",
                    "title": "Date despre programul de studiu",
                    "content": "Universitatea Transilvania din Brașov, Informatică",
                    "status": "unchanged",
                },
                {
                    "id": "2",
                    "title": "Date despre disciplină",
                    "content": "Structuri de Date, Sem I, Colocviu, 5 credite",
                    "status": "modified",
                },
                {
                    "id": "3",
                    "title": "Obiectivele disciplinei",
                    "content": "Însușirea noțiunilor fundamentale privind structurile de date.",
                    "status": "unchanged",
                },
                {
                    "id": "4",
                    "title": "Competențe profesionale",
                    "content": "CP2, CP3",
                    "status": "unchanged",
                },
                {
                    "id": "5",
                    "title": "Conținutul disciplinei",
                    "content": "Liste, stive, cozi, arbori, grafuri.",
                    "status": "unchanged",
                },
                {
                    "id": "6",
                    "title": "Rezultate așteptate",
                    "content": "",
                    "status": "new",
                },
                {
                    "id": "7",
                    "title": "Evaluare",
                    "content": "Colocviu final 60%, Activitate laborator 40%",
                    "status": "modified",
                },
                {
                    "id": "8",
                    "title": "Bibliografie",
                    "content": "Knuth, Cormen, Sedgewick",
                    "status": "unchanged",
                },
            ]
        },
    },
    "analiza_matematica": {
        "validate": {
            "plan_data": {
                "credite": 5,
                "tip_evaluare": "examen",
                "competente_profesionale": [
                    "CP1. Creează softuri, dezvoltă prototipul pentru software.",
                    "CP2. Utilizează șabloane de proiectare de software, creează diagrama de proces.",
                    "CP3. Analizează specificații software, definește arhitectura software, proiectează sistemul informatic.",
                ],
                "competente_transversale": [
                    "CT3. Identifică probleme, soluționează probleme.",
                    "CT4. Demonstrează angajament, gândește rapid, gândește analitic.",
                    "CT5. Lucrează în echipe, organizează informații, obiecte și resurse.",
                ],
            },
            "conflicts": [
                {
                    "tip": "competente",
                    "severitate": "warning",
                    "mesaj": "⚠️ Competența CP1 lipsește din FD. Conform Planului de Învățământ, această disciplină trebuie să acopere: 'CP1. Creează softuri, dezvoltă prototipul pentru software.'",
                },
                {
                    "tip": "competente",
                    "severitate": "warning",
                    "mesaj": "⚠️ Competența CT5 lipsește din FD. Conform Planului de Învățământ, această disciplină trebuie să acopere: 'CT5. Lucrează în echipe, organizează informații, obiecte și resurse.'",
                },
            ],
            "has_errors": False,
        },
        "upload": {
            "sections": [
                {
                    "id": "1",
                    "title": "Date despre programul de studiu",
                    "content": "Universitatea Transilvania din Brașov, Informatică",
                    "status": "unchanged",
                },
                {
                    "id": "2",
                    "title": "Date despre disciplină",
                    "content": "Analiză Matematică, Sem I, Examen, 5 credite",
                    "status": "unchanged",
                },
                {
                    "id": "3",
                    "title": "Obiectivele disciplinei",
                    "content": "Însușirea noțiunilor de bază ale analizei matematice.",
                    "status": "modified",
                },
                {
                    "id": "4",
                    "title": "Competențe profesionale",
                    "content": "CP2, CP3",
                    "status": "missing",
                },
                {
                    "id": "5",
                    "title": "Conținutul disciplinei",
                    "content": "Limite, derivate, integrale, serii.",
                    "status": "unchanged",
                },
                {
                    "id": "6",
                    "title": "Rezultate așteptate",
                    "content": "",
                    "status": "new",
                },
                {
                    "id": "7",
                    "title": "Evaluare",
                    "content": "Examen final 60%, Teme 40%",
                    "status": "unchanged",
                },
                {
                    "id": "8",
                    "title": "Bibliografie",
                    "content": "Rudin 1976, Apostol 1974",
                    "status": "unchanged",
                },
            ]
        },
    },
    "sisteme_de_operare": {
        "validate": {
            "plan_data": {
                "credite": 5,
                "tip_evaluare": "examen",
                "competente_profesionale": [
                    "CP1. Creează softuri, dezvoltă prototipul pentru software.",
                    "CP2. Utilizează șabloane de proiectare de software, creează diagrama de proces.",
                    "CP3. Analizează specificații software, definește arhitectura software, proiectează sistemul informatic.",
                ],
                "competente_transversale": [
                    "CT1. Aplică competente de bază în materie de programare.",
                    "CT3. Identifică probleme, soluționează probleme.",
                ],
            },
            "conflicts": [],
            "has_errors": False,
        },
        "upload": {
            "sections": [
                {
                    "id": "1",
                    "title": "Date despre programul de studiu",
                    "content": "Universitatea Transilvania din Brașov, Informatică",
                    "status": "unchanged",
                },
                {
                    "id": "2",
                    "title": "Date despre disciplină",
                    "content": "Sisteme de Operare, Sem II, Examen, 5 credite",
                    "status": "unchanged",
                },
                {
                    "id": "3",
                    "title": "Obiectivele disciplinei",
                    "content": "Cunoașterea principiilor de funcționare ale sistemelor de operare.",
                    "status": "unchanged",
                },
                {
                    "id": "4",
                    "title": "Competențe profesionale",
                    "content": "CP1, CP2, CP3",
                    "status": "unchanged",
                },
                {
                    "id": "5",
                    "title": "Conținutul disciplinei",
                    "content": "Procese și fire de execuție, Gestiunea memoriei, Sisteme de fișiere.",
                    "status": "unchanged",
                },
                {
                    "id": "6",
                    "title": "Rezultate așteptate",
                    "content": "Studentul va înțelege arhitectura unui sistem de operare modern.",
                    "status": "unchanged",
                },
                {
                    "id": "7",
                    "title": "Evaluare",
                    "content": "Examen final 60%, Laborator 40%",
                    "status": "unchanged",
                },
                {
                    "id": "8",
                    "title": "Bibliografie",
                    "content": "Tanenbaum 2015, Silberschatz 2018, Arpaci-Dusseau 2023",
                    "status": "unchanged",
                },
            ]
        },
    },
}


def get_demo_key(filename: str) -> str | None:
    filename_lower = filename.lower()
    if "structuri" in filename_lower:
        return "structuri_de_date"
    if "analiza" in filename_lower or "matematica" in filename_lower:
        return "analiza_matematica"
    if "sisteme" in filename_lower or "operare" in filename_lower:
        return "sisteme_de_operare"
    return None


@app.post("/upload")
async def upload(old_doc: UploadFile = File(...), new_template: UploadFile = File(...)):
    demo_key = get_demo_key(old_doc.filename) or get_demo_key(new_template.filename)
    if demo_key:
        return DEMO_RESPONSES[demo_key]["upload"]

    old_bytes = io.BytesIO(await old_doc.read())
    new_bytes = io.BytesIO(await new_template.read())
    old_sections = extract_sections(old_bytes)
    new_sections = extract_sections(new_bytes)
    diff = compare_sections(old_sections, new_sections)
    return {"sections": diff}


@app.post("/validate")
async def validate(fd_doc: UploadFile = File(...), plan_doc: UploadFile = File(...)):
    demo_key = get_demo_key(fd_doc.filename) or get_demo_key(plan_doc.filename)
    if demo_key:
        return DEMO_RESPONSES[demo_key]["validate"]

    fd_bytes = io.BytesIO(await fd_doc.read())
    plan_bytes = io.BytesIO(await plan_doc.read())
    fd_sections = extract_sections(fd_bytes)
    plan_data = extract_plan_data(plan_bytes)
    conflicts = validate_fd_against_plan(fd_sections, plan_data)
    return {
        "plan_data": plan_data,
        "conflicts": conflicts,
        "has_errors": any(c["severitate"] == "error" for c in conflicts),
    }


@app.post("/generate")
async def generate(plan_doc: UploadFile = File(...)):
    plan_bytes = io.BytesIO(await plan_doc.read())
    plan_data = extract_plan_data(plan_bytes)
    docx_bytes = generate_skeleton(plan_data)

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": "attachment; filename=fisa_disciplinei_schelet.docx"
        },
    )


@app.post("/chat")
async def chat(data: dict):
    messages = data.get("messages", [])
    document = data.get("document", "")
    plan_data = data.get("plan_data", {})

    plan_context = (
        f"""
    Date din Planul de Învățământ (SURSA DE ADEVĂR):
    - Credite: {plan_data.get('credite', 'necunoscut')}
    - Tip evaluare: {plan_data.get('tip_evaluare', 'necunoscut')}
    - Competențe profesionale: {', '.join(plan_data.get('competente_profesionale', []))}
    """
        if plan_data
        else ""
    )

    system = SYSTEM_PROMPT.format(document=document, plan_context=plan_context)

    def stream_response():
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "stream": True,
            "messages": [{"role": "system", "content": system}, *messages],
        }

        with requests.post(url, headers=headers, json=payload, stream=True) as response:
            if response.status_code != 200:
                yield f"data: {json.dumps({'text': f'Eroare API: {response.text}'})}\n\n"
                return

            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode("utf-8")
                    if decoded_line.startswith("data: "):
                        data_str = decoded_line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            data_json = json.loads(data_str)
                            delta = data_json["choices"][0].get("delta", {})
                            text = delta.get("content", "")
                            if text:
                                yield f"data: {json.dumps({'text': text})}\n\n"
                        except json.JSONDecodeError:
                            continue

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/export")
async def export(data: dict):
    sections = data.get("sections", [])
    docx_bytes = generate_docx(sections)

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": "attachment; filename=fisa_disciplinei_nou.docx"
        },
    )


@app.post("/migrate")
async def migrate(
    old_doc: UploadFile = File(...), new_template: UploadFile = File(...)
):
    demo_key = get_demo_key(old_doc.filename) or get_demo_key(new_template.filename)
    if demo_key:
        demo_files = {
            "structuri_de_date": "demo_files/fisa_migrata_structuri_de_date.docx",
        }
        if demo_key in demo_files:
            with open(demo_files[demo_key], "rb") as f:
                docx_bytes = f.read()
            return Response(
                content=docx_bytes,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={
                    "Content-Disposition": "attachment; filename=fisa_migrata_2025.docx"
                },
            )

    old_bytes = io.BytesIO(await old_doc.read())
    new_bytes = io.BytesIO(await new_template.read())
    old_sections = extract_sections(old_bytes)
    new_sections = extract_sections(new_bytes)
    diff = compare_sections(old_sections, new_sections)

    migrated = []
    for section in diff:
        if section["status"] == "missing":
            continue
        elif section["status"] == "new":
            migrated.append(
                {**section, "content": "[ Vă rugăm completați această secțiune nouă ]"}
            )
        else:
            migrated.append(section)

    docx_bytes = generate_docx(migrated)
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": "attachment; filename=fisa_migrata_2025.docx"},
    )
