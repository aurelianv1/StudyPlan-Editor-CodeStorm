"""Endpoints that read, compare, validate and produce .docx files."""

from __future__ import annotations

import io

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import Response

from app import demo
from app.config import Settings, get_settings
from app.services.diff import compare_sections
from app.services.exporter import generate_docx
from app.services.parser import extract_sections
from app.services.plan_parser import extract_plan_data
from app.services.plan_validator import validate_fd_against_plan
from app.services.skeleton_generator import generate_skeleton

router = APIRouter()

DOCX_MEDIA_TYPE = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)
NEW_SECTION_PLACEHOLDER = "[ Vă rugăm completați această secțiune nouă ]"


def docx_response(content: bytes, filename: str) -> Response:
    return Response(
        content=content,
        media_type=DOCX_MEDIA_TYPE,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


async def _read(upload: UploadFile) -> io.BytesIO:
    return io.BytesIO(await upload.read())


def _demo_scenario(settings: Settings, *uploads: UploadFile) -> str | None:
    if not settings.demo_mode:
        return None
    return demo.find_scenario(*(upload.filename for upload in uploads))


@router.post("/upload")
async def upload(
    old_doc: UploadFile = File(...),
    new_template: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
):
    """Compare an existing sheet with a new template, section by section."""
    scenario = _demo_scenario(settings, old_doc, new_template)
    if scenario:
        return demo.get_response(scenario, "upload")

    old_sections = extract_sections(await _read(old_doc))
    new_sections = extract_sections(await _read(new_template))
    return {"sections": compare_sections(old_sections, new_sections)}


@router.post("/validate")
async def validate(
    fd_doc: UploadFile = File(...),
    plan_doc: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
):
    """Check a discipline sheet against the study plan."""
    scenario = _demo_scenario(settings, fd_doc, plan_doc)
    if scenario:
        return demo.get_response(scenario, "validate")

    fd_sections = extract_sections(await _read(fd_doc))
    plan_data = extract_plan_data(await _read(plan_doc))
    conflicts = validate_fd_against_plan(fd_sections, plan_data)
    return {
        "plan_data": plan_data,
        "conflicts": conflicts,
        "has_errors": any(c["severitate"] == "error" for c in conflicts),
    }


@router.post("/generate")
async def generate(plan_doc: UploadFile = File(...)):
    """Build a pre-filled discipline sheet skeleton from the study plan."""
    plan_data = extract_plan_data(await _read(plan_doc))
    return docx_response(generate_skeleton(plan_data), "fisa_disciplinei_schelet.docx")


@router.post("/export")
async def export(data: dict):
    """Turn the edited sections back into a .docx file."""
    return docx_response(
        generate_docx(data.get("sections", [])), "fisa_disciplinei_nou.docx"
    )


@router.post("/migrate")
async def migrate(
    old_doc: UploadFile = File(...),
    new_template: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
):
    """Carry the content of an existing sheet over to a new template."""
    scenario = _demo_scenario(settings, old_doc, new_template)
    if scenario:
        canned = demo.get_migrated_document(scenario)
        if canned is not None:
            return docx_response(canned, "fisa_migrata_2025.docx")

    old_sections = extract_sections(await _read(old_doc))
    new_sections = extract_sections(await _read(new_template))

    migrated = []
    for section in compare_sections(old_sections, new_sections):
        if section["status"] == "missing":
            continue
        if section["status"] == "new":
            section = {**section, "content": NEW_SECTION_PLACEHOLDER}
        migrated.append(section)

    return docx_response(generate_docx(migrated), "fisa_migrata_2025.docx")
