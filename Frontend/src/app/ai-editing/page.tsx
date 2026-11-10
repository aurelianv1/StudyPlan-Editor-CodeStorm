"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { ChatPanel } from "@/components/ai-editing/ChatPanel";
import { DocumentPanel } from "@/components/ai-editing/DocumentPanel";
import { ValidationPanel } from "@/components/ai-editing/ValidationPanel";
import { GridBackground } from "@/components/layout/GridBackground";
import { useAssistantChat } from "@/hooks/useAssistantChat";
import { usePlan } from "@/hooks/usePlan";
import { errorMessage, exportSections, parseSheet, validateSections } from "@/lib/api";
import { downloadBlob } from "@/lib/download";
import { SAMPLE_SECTIONS } from "@/lib/sampleSheet";
import { applySectionEdits, parseSectionEdits, sectionsToText } from "@/lib/sectionEdits";
import type { Section, ValidationResult } from "@/lib/types";

const HIGHLIGHT_MS = 3000;
const TOOLBAR_BUTTON =
  "px-4 py-2 rounded-lg text-xs font-semibold transition-all border border-white/10 text-white/70 hover:text-white hover:border-white/25 hover:bg-white/5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100";

export default function AIEditingPage() {
  const { plan } = usePlan();
  const chat = useAssistantChat();
  const [sections, setSections] = useState<Section[]>(SAMPLE_SECTIONS);
  const [fileName, setFileName] = useState<string | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Run a toolbar action, showing its error (if any) under the header. */
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const updateSections = (next: Section[]) => {
    setSections(next);
    setValidation(null); // results describe the previous text
  };

  const loadSheet = (file: File) =>
    run(async () => {
      const parsed = await parseSheet(file);
      if (parsed.length === 0) {
        throw new Error("Nu am găsit nicio secțiune în document.");
      }
      updateSections(parsed);
      setFileName(file.name);
      chat.reset();
    });

  const validate = () =>
    run(async () => {
      if (plan) setValidation(await validateSections(sections, plan.data));
    });

  const exportDocument = () =>
    run(async () => {
      downloadBlob(await exportSections(sections), "fisa_disciplinei_final.docx");
    });

  const sendMessage = async (message: string) => {
    const answer = await chat.send(message, {
      document: sectionsToText(sections),
      planData: plan?.data ?? null,
    });
    if (!answer) return;

    const edits = parseSectionEdits(answer);
    if (edits.length === 0) return;

    const applied = applySectionEdits(sections, edits);
    updateSections(applied.sections);
    setHighlightedIds(applied.changedIds);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightedIds([]), HIGHLIGHT_MS);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans relative overflow-hidden">
      <GridBackground />

      <div className="relative mx-auto max-w-7xl px-8 pt-8 pb-10 h-screen flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-semibold text-lg">AI Copilot</h1>
            <p className="text-white/30 text-xs">
              {plan ? (
                <>Plan de învățământ: <span className="text-white/60">{plan.fileName}</span></>
              ) : (
                <>
                  Niciun plan de învățământ încărcat —{" "}
                  <Link href="/" className="underline underline-offset-2 hover:text-white/60">
                    încarcă-l pe pagina principală
                  </Link>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              accept=".docx"
              className="hidden"
              aria-label="Fișa disciplinei (.docx)"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) loadSheet(file);
              }}
            />
            <button onClick={() => fileInput.current?.click()} disabled={busy} className={TOOLBAR_BUTTON}>
              📂 Încarcă fișă (.docx)
            </button>
            <button
              onClick={validate}
              disabled={busy || !plan}
              title={plan ? undefined : "Încarcă mai întâi planul de învățământ"}
              className={TOOLBAR_BUTTON}
            >
              ✔ Validează cu planul
            </button>
            <button
              onClick={exportDocument}
              disabled={busy}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-40"
            >
              📥 Export .docx
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="px-4 py-2 rounded-lg border border-red-500/20 bg-red-500/5 text-red-300/80 text-sm">
            ❌ {error}
          </div>
        )}

        <div className="flex-1 flex gap-6 overflow-hidden">
          <ChatPanel messages={chat.messages} isLoading={chat.isLoading} onSend={sendMessage} />
          <DocumentPanel
            sections={sections}
            fileName={fileName}
            highlightedIds={highlightedIds}
            onChange={(id, content) =>
              updateSections(
                sections.map((section) => (section.id === id ? { ...section, content } : section)),
              )
            }
          >
            {validation && <ValidationPanel result={validation} />}
          </DocumentPanel>
        </div>
      </div>
    </div>
  );
}
