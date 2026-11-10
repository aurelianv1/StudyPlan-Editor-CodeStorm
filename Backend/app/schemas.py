"""Data shapes shared by the services and the HTTP API."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

SectionStatus = Literal["unchanged", "modified", "new", "missing"]
EvaluationType = Literal["examen", "colocviu", "verificare"]
Severity = Literal["error", "warning"]


class Section(BaseModel):
    """One titled block of a discipline sheet."""

    id: str
    title: str
    content: str = ""


class SectionDiff(Section):
    """A section of the new template, annotated against the old sheet."""

    status: SectionStatus = "unchanged"
    # What the template itself holds for this section, when it differs from
    # the content carried over from the old sheet.
    template_content: str | None = None


class PlanDiscipline(BaseModel):
    """One row of a study plan table."""

    name: str
    credits: int | None = None
    evaluation_type: EvaluationType | None = None


class PlanData(BaseModel):
    """What the validator needs to know from a study plan."""

    credits: int | None = None
    evaluation_type: EvaluationType | None = None
    professional_competencies: list[str] = Field(default_factory=list)
    transversal_competencies: list[str] = Field(default_factory=list)
    disciplines: list[PlanDiscipline] = Field(default_factory=list)


class Conflict(BaseModel):
    """A mismatch between a discipline sheet and the study plan."""

    type: Literal["evaluation_type", "credits", "competencies", "discipline"]
    severity: Severity
    message: str


# --- Request / response bodies -------------------------------------------


class SectionsResponse(BaseModel):
    sections: list[Section]


class DiffResponse(BaseModel):
    sections: list[SectionDiff]


class ValidationResult(BaseModel):
    conflicts: list[Conflict]
    has_errors: bool


class ValidationResponse(ValidationResult):
    plan_data: PlanData


class ValidateSectionsRequest(BaseModel):
    sections: list[Section]
    plan_data: PlanData


class ExportRequest(BaseModel):
    sections: list[Section]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1)
    document: str = ""
    plan_data: PlanData | None = None
