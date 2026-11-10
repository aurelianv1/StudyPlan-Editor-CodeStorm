"""Endpoints that read, compare, validate and produce .docx files."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import Response

from app import demo
from app.api.deps import read_docx
from app.config import Settings, get_settings
from app.schemas import (
    DiffResponse,
    ExportRequest,
    PlanData,
    SectionsResponse,
    ValidateSectionsRequest,
    ValidationResponse,
    ValidationResult,
)
from app.services.diff import compare_sections
from app.services.exporter import generate_docx
from app.services.plan_parser import extract_plan_data
from app.services.sheet_parser import extract_sections
from app.services.skeleton_generator import generate_skeleton
from app.services.validator import validate_sheet

router = APIRouter()

DOCX_MEDIA_TYPE = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)
NEW_SECTION_PLACEHOLDER = "[ Vă rugăm completați această secțiune nouă ]"


def docx_response(content: bytes, filename: str) -> Response:
    return Response(
        content=content,
        media_type=DOCX_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _demo_scenario(settings: Settings, *uploads: UploadFile) -> str | None:
    if not settings.demo_mode:
        return None
    return demo.find_scenario(*(upload.filename for upload in uploads))


@router.post("/parse", response_model=SectionsResponse)
async def parse(
    fd_doc: UploadFile = File(...), settings: Settings = Depends(get_settings)
):
    """Split a discipline sheet into its sections."""
    return {"sections": extract_sections(await read_docx(fd_doc, settings))}


@router.post("/plan", response_model=PlanData)
async def plan(
    plan_doc: UploadFile = File(...), settings: Settings = Depends(get_settings)
):
    """Extract credits, evaluation type and competencies from a study plan."""
    return extract_plan_data(await read_docx(plan_doc, settings))


@router.post("/upload", response_model=DiffResponse)
async def upload(
    old_doc: UploadFile = File(...),
    new_template: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
):
    """Compare an existing sheet with a new template, section by section."""
    scenario = _demo_scenario(settings, old_doc, new_template)
    if scenario:
        return demo.get_response(scenario, "upload")

    old_sections = extract_sections(await read_docx(old_doc, settings))
    new_sections = extract_sections(await read_docx(new_template, settings))
    return {"sections": compare_sections(old_sections, new_sections)}


@router.post("/validate", response_model=ValidationResponse)
async def validate(
    fd_doc: UploadFile = File(...),
    plan_doc: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
):
    """Check an uploaded discipline sheet against an uploaded study plan."""
    scenario = _demo_scenario(settings, fd_doc, plan_doc)
    if scenario:
        return demo.get_response(scenario, "validate")

    sections = extract_sections(await read_docx(fd_doc, settings))
    plan_data = extract_plan_data(await read_docx(plan_doc, settings))
    return {"plan_data": plan_data, **_validation(sections, plan_data)}


@router.post("/validate/sections", response_model=ValidationResult)
async def validate_sections(request: ValidateSectionsRequest):
    """Check sections being edited in the browser against known plan data."""
    return _validation(request.sections, request.plan_data)


def _validation(sections, plan_data) -> dict:
    conflicts = validate_sheet(sections, plan_data)
    return {
        "conflicts": conflicts,
        "has_errors": any(conflict.severity == "error" for conflict in conflicts),
    }


@router.post("/generate")
async def generate(
    plan_doc: UploadFile = File(...), settings: Settings = Depends(get_settings)
):
    """Build a pre-filled discipline sheet skeleton from the study plan."""
    plan_data = extract_plan_data(await read_docx(plan_doc, settings))
    return docx_response(generate_skeleton(plan_data), "fisa_disciplinei_schelet.docx")


@router.post("/export")
async def export(request: ExportRequest):
    """Turn the edited sections back into a .docx file."""
    return docx_response(generate_docx(request.sections), "fisa_disciplinei.docx")


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
            return docx_response(canned, "fisa_migrata.docx")

    old_sections = extract_sections(await read_docx(old_doc, settings))
    new_sections = extract_sections(await read_docx(new_template, settings))

    migrated = []
    for section in compare_sections(old_sections, new_sections):
        if section.status == "missing":
            continue  # the new template no longer has this section
        if section.status == "new":
            section.content = NEW_SECTION_PLACEHOLDER
        migrated.append(section)

    return docx_response(generate_docx(migrated), "fisa_migrata.docx")
