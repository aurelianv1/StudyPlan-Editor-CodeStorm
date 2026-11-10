import { describe, expect, it } from "vitest";

import {
  applySectionEdits,
  formatAssistantText,
  parseSectionEdits,
  sectionsToText,
} from "./sectionEdits";
import type { Section } from "./types";

const SECTIONS: Section[] = [
  { id: "1", title: "7. Obiectivele disciplinei", content: "vechi" },
  { id: "2", title: "Bibliografie", content: "Knuth" },
];

const ANSWER = `Am actualizat bibliografia.

[[SECTIUNE: Bibliografie]]
Knuth
Goodfellow (2023)
[[/SECTIUNE]]

Mai dorești ceva?`;

describe("parseSectionEdits", () => {
  it("extracts the title and content of each block", () => {
    expect(parseSectionEdits(ANSWER)).toEqual([
      { title: "Bibliografie", content: "Knuth\nGoodfellow (2023)" },
    ]);
  });

  it("finds several blocks and accepts the diacritic spelling of the marker", () => {
    const answer = "[[SECȚIUNE: A]]\n1\n[[/SECȚIUNE]]\n[[SECTIUNE: B]]2[[/SECTIUNE]]";
    expect(parseSectionEdits(answer).map((edit) => edit.title)).toEqual(["A", "B"]);
  });

  it("returns nothing for a plain answer or an unfinished block", () => {
    expect(parseSectionEdits("Ponderea examenului este 60%.")).toEqual([]);
    expect(parseSectionEdits("[[SECTIUNE: Bibliografie]]\nKnuth")).toEqual([]);
  });
});

describe("applySectionEdits", () => {
  it("replaces only the targeted section and reports it as changed", () => {
    const { sections, changedIds } = applySectionEdits(SECTIONS, parseSectionEdits(ANSWER));
    expect(sections[0]).toEqual(SECTIONS[0]);
    expect(sections[1].content).toBe("Knuth\nGoodfellow (2023)");
    expect(changedIds).toEqual(["2"]);
  });

  it("matches titles ignoring case, diacritics and numbering", () => {
    const { sections } = applySectionEdits(SECTIONS, [
      { title: "obiectivele disciplinei", content: "nou" },
    ]);
    expect(sections[0].content).toBe("nou");
  });

  it("adds a section the document does not have yet", () => {
    const { sections, changedIds } = applySectionEdits(SECTIONS, [
      { title: "Resurse online", content: "link" },
    ]);
    expect(sections).toHaveLength(3);
    expect(sections[2]).toEqual({ id: "3", title: "Resurse online", content: "link" });
    expect(changedIds).toEqual(["3"]);
  });

  it("does not mutate its input", () => {
    applySectionEdits(SECTIONS, parseSectionEdits(ANSWER));
    expect(SECTIONS[1].content).toBe("Knuth");
  });
});

describe("formatAssistantText", () => {
  it("replaces the markers with a readable heading", () => {
    expect(formatAssistantText(ANSWER)).toBe(
      "Am actualizat bibliografia.\n\n✏️ Bibliografie\nKnuth\nGoodfellow (2023)\n\nMai dorești ceva?",
    );
  });

  it("also formats a block that is still being streamed", () => {
    expect(formatAssistantText("[[SECTIUNE: Evaluare]]\nExamen 60%")).toBe(
      "✏️ Evaluare\nExamen 60%",
    );
  });
});

describe("sectionsToText", () => {
  it("renders the document the way the assistant reads it", () => {
    expect(sectionsToText(SECTIONS)).toBe(
      "## 7. Obiectivele disciplinei\nvechi\n\n## Bibliografie\nKnuth",
    );
  });
});
