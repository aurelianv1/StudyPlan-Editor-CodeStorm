from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from anthropic import Anthropic
import io
import json
from services.parser import extract_sections
from services.diff import compare_sections
from services.exporter import generate_docx
from services.prompt import SYSTEM_PROMPT

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Anthropic()


@app.post("/upload")
async def upload(old_doc: UploadFile = File(...), new_template: UploadFile = File(...)):
    old_bytes = io.BytesIO(await old_doc.read())
    new_bytes = io.BytesIO(await new_template.read())

    old_sections = extract_sections(old_bytes)
    new_sections = extract_sections(new_bytes)
    diff = compare_sections(old_sections, new_sections)

    return {"sections": diff}


@app.post("/chat")
async def chat(data: dict):
    messages = data.get("messages", [])
    document = data.get("document", "")

    system = SYSTEM_PROMPT.format(document=document)

    def stream_response():
        with client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            system=system,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
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
