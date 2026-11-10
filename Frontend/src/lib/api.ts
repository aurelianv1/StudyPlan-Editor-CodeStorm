import { API_BASE_URL } from "./config";
import { createSseParser, SSE_DONE } from "./sse";
import type {
  ChatMessage,
  PlanData,
  Section,
  SectionDiff,
  ValidationResult,
} from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status, or 0 when the server could not be reached. */
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Human-readable message for anything thrown by the functions below. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "A apărut o eroare necunoscută.";
}

/** FastAPI reports errors as `{"detail": "..."}` or a list of field errors. */
export async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const { detail } = JSON.parse(text);
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg ?? String(item)).join("; ");
    }
  } catch {
    // not JSON: fall through to the raw text
  }
  return text || `Serverul a răspuns cu eroarea ${response.status}.`;
}

async function request(path: string, init: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      "Serverul nu a putut fi contactat. Verificați că backend-ul rulează.",
      0,
    );
  }
  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }
  return response;
}

function postFiles(path: string, files: Record<string, File>): Promise<Response> {
  const body = new FormData();
  for (const [field, file] of Object.entries(files)) body.append(field, file);
  return request(path, { method: "POST", body });
}

function postJson(path: string, payload: unknown): Promise<Response> {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Split a discipline sheet into sections. */
export async function parseSheet(sheet: File): Promise<Section[]> {
  const response = await postFiles("/parse", { fd_doc: sheet });
  return (await response.json()).sections;
}

/** Extract credits, evaluation type and competencies from a study plan. */
export async function parsePlan(plan: File): Promise<PlanData> {
  return (await postFiles("/plan", { plan_doc: plan })).json();
}

/** Compare an existing sheet with a new template. */
export async function compareDocuments(
  oldDoc: File,
  newTemplate: File,
): Promise<SectionDiff[]> {
  const response = await postFiles("/upload", {
    old_doc: oldDoc,
    new_template: newTemplate,
  });
  return (await response.json()).sections;
}

/** Move the content of an existing sheet into a new template (.docx). */
export async function migrateDocuments(oldDoc: File, newTemplate: File): Promise<Blob> {
  return (
    await postFiles("/migrate", { old_doc: oldDoc, new_template: newTemplate })
  ).blob();
}

/** Generate a sheet skeleton pre-filled from the study plan (.docx). */
export async function generateSkeleton(plan: File): Promise<Blob> {
  return (await postFiles("/generate", { plan_doc: plan })).blob();
}

/** Turn edited sections into a .docx file. */
export async function exportSections(sections: Section[]): Promise<Blob> {
  return (await postJson("/export", { sections })).blob();
}

/** Check the sections being edited against the study plan. */
export async function validateSections(
  sections: Section[],
  planData: PlanData,
): Promise<ValidationResult> {
  return (
    await postJson("/validate/sections", { sections, plan_data: planData })
  ).json();
}

export interface ChatRequest {
  messages: ChatMessage[];
  document: string;
  plan_data?: PlanData | null;
}

/**
 * Ask the assistant and receive its answer as it is generated.
 * Resolves with the complete answer once the stream ends.
 */
export async function streamChat(
  payload: ChatRequest,
  onText: (text: string) => void,
): Promise<string> {
  const response = await postJson("/chat", payload);
  if (!response.body) throw new ApiError("Serverul nu a trimis niciun răspuns.", 0);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parser = createSseParser();
  let answer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const data of parser.push(decoder.decode(value, { stream: true }))) {
      if (data === SSE_DONE) return answer;
      const event = parseEvent(data);
      if (event.error) throw new ApiError(event.error, 502);
      if (event.text) {
        answer += event.text;
        onText(event.text);
      }
    }
  }
  return answer;
}

/** One event of the chat stream: a piece of the answer, or a failure. */
function parseEvent(data: string): { text?: string; error?: string } {
  try {
    const { text, error } = JSON.parse(data);
    return {
      text: typeof text === "string" ? text : undefined,
      error: typeof error === "string" ? error : undefined,
    };
  } catch {
    return {}; // keep-alive or malformed line
  }
}
