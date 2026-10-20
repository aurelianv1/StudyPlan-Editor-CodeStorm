import type { DocumentSection } from "./types";

/** Cuvinte-cheie care leagă cererea utilizatorului de o secțiune a fișei. */
const SECTION_KEYWORDS = ["bibliograf", "obiectiv", "competent", "evaluare", "continut", "conținut"];

const AI_PREAMBLE = /^(Iată|Am modificat|Am actualizat)[^:]*:/i;

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isTargeted(section: DocumentSection, prompt: string): boolean {
  const title = section.title.toLowerCase();
  const promptLower = prompt.toLowerCase();

  return (
    promptLower.includes(title) ||
    SECTION_KEYWORDS.some((keyword) => promptLower.includes(keyword) && title.includes(keyword))
  );
}

/**
 * Caută conținutul secțiunii în răspunsul AI-ului (după titlu sau după un
 * header Markdown `##`). Dacă nu îl găsește, folosește tot răspunsul,
 * fără fraza introductivă de tipul „Iată varianta modificată:”.
 */
function extractSectionContent(response: string, title: string): string {
  const pattern = new RegExp(`(?:${escapeRegExp(title)}|##[^#]+)([\\s\\S]*?)(?=##|$)`, "i");
  const extracted = response.match(pattern)?.[1]?.trim();
  return extracted || response.replace(AI_PREAMBLE, "").trim();
}

/** Aplică răspunsul AI-ului pe secțiunile vizate de cererea utilizatorului. */
export function applyAiResponse(sections: DocumentSection[], response: string, prompt: string): DocumentSection[] {
  return sections.map((section) =>
    isTargeted(section, prompt) ? { ...section, content: extractSectionContent(response, section.title) } : section
  );
}

export function sectionsToMarkdown(sections: DocumentSection[]): string {
  return sections.map((s) => `## ${s.title}\n${s.content}`).join("\n\n");
}
