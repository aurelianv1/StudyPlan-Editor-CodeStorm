import type { Section } from "./types";

/** A rewritten section proposed by the assistant. */
export interface SectionEdit {
  title: string;
  content: string;
}

// The assistant is asked (Backend/app/services/prompt.py) to wrap rewritten
// sections like this:
//
//   [[SECTIUNE: Bibliografie]]
//   new content
//   [[/SECTIUNE]]
const OPEN_TAG = /\[\[\s*SEC[TȚ]IUNE\s*:\s*([^\]\n]+?)\s*\]\]/gi;
const CLOSE_TAG = /\[\[\s*\/\s*SEC[TȚ]IUNE\s*\]\]/gi;
const EDIT_BLOCK =
  /\[\[\s*SEC[TȚ]IUNE\s*:\s*([^\]\n]+?)\s*\]\]([\s\S]*?)\[\[\s*\/\s*SEC[TȚ]IUNE\s*\]\]/gi;

/** Lower-case, strip diacritics and a leading "7." so titles compare loosely. */
export function normalizeTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^\s*\d+(\.\d+)*\.?\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract the complete edit blocks from an assistant answer. */
export function parseSectionEdits(answer: string): SectionEdit[] {
  return Array.from(answer.matchAll(EDIT_BLOCK), ([, title, content]) => ({
    title: title.trim(),
    content: content.trim(),
  }));
}

/**
 * Apply edits to the document. An edit replaces the section with the same
 * title; an edit for a title the document does not have adds a section.
 */
export function applySectionEdits(
  sections: Section[],
  edits: SectionEdit[],
): { sections: Section[]; changedIds: string[] } {
  const result = sections.map((section) => ({ ...section }));
  const changedIds: string[] = [];

  for (const edit of edits) {
    const wanted = normalizeTitle(edit.title);
    let target = result.find((section) => normalizeTitle(section.title) === wanted);
    if (!target) {
      target = { id: nextId(result), title: edit.title, content: "" };
      result.push(target);
    }
    target.content = edit.content;
    changedIds.push(target.id);
  }
  return { sections: result, changedIds };
}

function nextId(sections: Section[]): string {
  const ids = new Set(sections.map((section) => section.id));
  let candidate = sections.length + 1;
  while (ids.has(String(candidate))) candidate += 1;
  return String(candidate);
}

/** Make an answer readable in the chat: markers become a small heading. */
export function formatAssistantText(answer: string): string {
  return answer
    .replace(OPEN_TAG, "✏️ $1")
    .replace(CLOSE_TAG, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The document as text, in the form the assistant reads it. */
export function sectionsToText(sections: Section[]): string {
  return sections.map((section) => `## ${section.title}\n${section.content}`).join("\n\n");
}
