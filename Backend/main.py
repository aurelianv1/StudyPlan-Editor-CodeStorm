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


@app.post("/upload")
async def upload(old_doc: UploadFile = File(...), new_template: UploadFile = File(...)):
    old_bytes = io.BytesIO(await old_doc.read())
    new_bytes = io.BytesIO(await new_template.read())

    old_sections = extract_sections(old_bytes)
    new_sections = extract_sections(new_bytes)
    diff = compare_sections(old_sections, new_sections)

    return {"sections": diff}


@app.post("/validate")
async def validate(fd_doc: UploadFile = File(...), plan_doc: UploadFile = File(...)):
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
