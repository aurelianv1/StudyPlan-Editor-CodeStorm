// Shapes of the backend's JSON payloads (see Backend/app/schemas.py).

export type SectionStatus = "unchanged" | "modified" | "new" | "missing";
export type EvaluationType = "examen" | "colocviu" | "verificare";

export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface SectionDiff extends Section {
  status: SectionStatus;
  template_content?: string | null;
}

export interface PlanDiscipline {
  name: string;
  credits: number | null;
  evaluation_type: EvaluationType | null;
}

export interface PlanData {
  credits: number | null;
  evaluation_type: EvaluationType | null;
  professional_competencies: string[];
  transversal_competencies: string[];
  disciplines: PlanDiscipline[];
}

export interface Conflict {
  type: "evaluation_type" | "credits" | "competencies" | "discipline";
  severity: "error" | "warning";
  message: string;
}

export interface ValidationResult {
  conflicts: Conflict[];
  has_errors: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
