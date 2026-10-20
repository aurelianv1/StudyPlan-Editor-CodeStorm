import type { ChatMessage, DiffSection, DocumentSection, PlanData } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const SSE_DATA_PREFIX = "data: ";
const SSE_DONE = "[DONE]";

async function request(path: string, init: RequestInit, fallbackError: string): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || fallbackError);
  }
  return response;
}

function postForm(path: string, fields: Record<string, Blob>, fallbackError: string) {
  const body = new FormData();
  Object.entries(fields).forEach(([name, value]) => body.append(name, value));
  return request(path, { method: "POST", body }, fallbackError);
}

function postJson(path: string, payload: unknown, fallbackError: string) {
  return request(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    fallbackError
  );
}

export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/** Declanșează descărcarea unui fișier primit de la server. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export async function generateSkeleton(planDoc: File): Promise<Blob> {
  const response = await postForm("/generate", { plan_doc: planDoc }, "Eroare la procesare.");
  return response.blob();
}

export async function compareDocuments(oldDoc: File, newTemplate: File): Promise<DiffSection[]> {
  const response = await postForm(
    "/upload",
    { old_doc: oldDoc, new_template: newTemplate },
    "Backend-ul nu a putut procesa documentele."
  );
  const data: { sections: DiffSection[] } = await response.json();
  return data.sections;
}

export async function migrateDocument(oldDoc: File, newTemplate: File): Promise<Blob> {
  const response = await postForm(
    "/migrate",
    { old_doc: oldDoc, new_template: newTemplate },
    "Migrare eșuată."
  );
  return response.blob();
}

export async function exportDocument(sections: DocumentSection[]): Promise<Blob> {
  const response = await postJson("/export", { sections }, "Export eșuat.");
  return response.blob();
}

interface ChatRequest {
  messages: ChatMessage[];
  document: string;
  plan_data: PlanData;
}

/**
 * Trimite conversația la backend și citește răspunsul în stream (SSE).
 * `onText` primește de fiecare dată textul acumulat până în acel moment.
 */
export async function streamChat(
  payload: ChatRequest,
  onText: (fullText: string) => void
): Promise<string> {
  const response = await postJson("/chat", payload, "Eroare de la server.");
  if (!response.body) throw new Error("Serverul nu a trimis niciun răspuns.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Un chunk se poate termina în mijlocul unei linii sau al unui caracter
    // UTF-8 (ex. diacritice), așa că păstrăm restul pentru iterația următoare.
    pending += decoder.decode(value, { stream: true });
    const lines = pending.split("\n");
    pending = lines.pop() ?? "";

    for (const line of lines) {
      const text = parseSseText(line);
      if (text) {
        fullText += text;
        onText(fullText);
      }
    }
  }

  return fullText;
}

function parseSseText(line: string): string | null {
  if (!line.startsWith(SSE_DATA_PREFIX)) return null;

  const data = line.slice(SSE_DATA_PREFIX.length);
  if (data === SSE_DONE) return null;

  try {
    return JSON.parse(data).text || null;
  } catch {
    return null;
  }
}
