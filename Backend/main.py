import io

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel, Field

from config import CORS_ORIGINS, DOCX_MEDIA_TYPE
from services.demo_data import DEMO_RESPONSES, get_demo_key
from services.diff import compare_sections
from services.exporter import generate_docx
from services.llm import build_system_prompt, stream_chat_events
from services.migration import migrate_sections
from services.parser import extract_sections
from services.plan_parser import extract_plan_data
from services.plan_validator import has_errors, validate_fd_against_plan
from services.skeleton_generator import generate_skeleton

app = FastAPI(title="StudyPlan Editor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(default_factory=list)
    document: str = ""
    plan_data: dict = Field(default_factory=dict)


class ExportRequest(BaseModel):
    sections: list[dict] = Field(default_factory=list)


async def read_upload(upload: UploadFile) -> io.BytesIO:
    return io.BytesIO(await upload.read())


def docx_response(content: bytes, filename: str) -> Response:
    return Response(
        content=content,
        media_type=DOCX_MEDIA_TYPE,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@app.post("/upload")
async def upload(old_doc: UploadFile = File(...), new_template: UploadFile = File(...)):
    """Compară o Fișă a Disciplinei veche cu un template nou."""
    demo_key = get_demo_key(old_doc.filename, new_template.filename)
    if demo_key:
        return DEMO_RESPONSES[demo_key]["upload"]

    old_sections = extract_sections(await read_upload(old_doc))
    new_sections = extract_sections(await read_upload(new_template))
    return {"sections": compare_sections(old_sections, new_sections)}


@app.post("/validate")
async def validate(fd_doc: UploadFile = File(...), plan_doc: UploadFile = File(...)):
    """Verifică o Fișă a Disciplinei față de Planul de Învățământ."""
    demo_key = get_demo_key(fd_doc.filename, plan_doc.filename)
    if demo_key:
        return DEMO_RESPONSES[demo_key]["validate"]

    fd_sections = extract_sections(await read_upload(fd_doc))
    plan_data = extract_plan_data(await read_upload(plan_doc))
    conflicts = validate_fd_against_plan(fd_sections, plan_data)
    return {
        "plan_data": plan_data,
        "conflicts": conflicts,
        "has_errors": has_errors(conflicts),
    }


@app.post("/generate")
async def generate(plan_doc: UploadFile = File(...)):
    """Generează un schelet de Fișă a Disciplinei din Planul de Învățământ."""
    plan_data = extract_plan_data(await read_upload(plan_doc))
    return docx_response(generate_skeleton(plan_data), "fisa_disciplinei_schelet.docx")


@app.post("/chat")
async def chat(request: ChatRequest):
    """Trimite conversația către LLM și returnează răspunsul ca stream SSE."""
    system_prompt = build_system_prompt(request.document, request.plan_data)
    messages = [message.model_dump() for message in request.messages]

    return StreamingResponse(
        stream_chat_events(system_prompt, messages),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/export")
async def export(request: ExportRequest):
    """Exportă secțiunile editate într-un fișier .docx."""
    return docx_response(generate_docx(request.sections), "fisa_disciplinei_nou.docx")


@app.post("/migrate")
async def migrate(old_doc: UploadFile = File(...), new_template: UploadFile = File(...)):
    """Mută conținutul unei fișe vechi pe structura template-ului nou."""
    filename = "fisa_migrata_2025.docx"

    demo_key = get_demo_key(old_doc.filename, new_template.filename)
    demo_file = DEMO_RESPONSES[demo_key].get("migrate_file") if demo_key else None
    if demo_file:
        return docx_response(demo_file.read_bytes(), filename)

    old_sections = extract_sections(await read_upload(old_doc))
    new_sections = extract_sections(await read_upload(new_template))
    migrated = migrate_sections(old_sections, new_sections)
    return docx_response(generate_docx(migrated), filename)
