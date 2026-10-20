"use client";

import { useEffect, useRef, useState } from "react";
import { ChatPanel } from "@/components/ai-editing/ChatPanel";
import { DocumentPanel } from "@/components/ai-editing/DocumentPanel";
import { GridBackground } from "@/components/layout";
import { downloadBlob, exportDocument, getErrorMessage, streamChat } from "@/lib/api";
import { applyAiResponse, isTargeted, sectionsToMarkdown } from "@/lib/applyAiResponse";
import { ASSISTANT_GREETING, DEMO_PLAN_DATA, DEMO_SECTIONS } from "@/lib/demoDocument";
import type { ChatMessage, DocumentSection } from "@/lib/types";

const HIGHLIGHT_DURATION_MS = 3000;
const EXPORT_FILENAME = "fisa_disciplinei_final.docx";

/** Evidențiază temporar o secțiune modificată de AI. */
function useTemporaryHighlight(durationMs: number) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(timeoutRef.current ?? undefined), []);

  const highlight = (id: string) => {
    clearTimeout(timeoutRef.current ?? undefined);
    setHighlightedId(id);
    timeoutRef.current = setTimeout(() => setHighlightedId(null), durationMs);
  };

  return { highlightedId, highlight };
}

export default function AIEditingPage() {
  const [draft, setDraft] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([ASSISTANT_GREETING]);
  const [sections, setSections] = useState<DocumentSection[]>(DEMO_SECTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const { highlightedId, highlight } = useTemporaryHighlight(HIGHLIGHT_DURATION_MS);

  const replaceLastAssistantMessage = (content: string) =>
    setChatHistory((prev) => [...prev.slice(0, -1), { role: "assistant", content }]);

  const handleSend = async () => {
    const prompt = draft;
    if (!prompt.trim() || isLoading) return;

    // Mesajul utilizatorului + un mesaj gol al asistentului, completat pe măsură ce sosește stream-ul.
    setChatHistory((prev) => [...prev, { role: "user", content: prompt }, { role: "assistant", content: "" }]);
    setDraft("");
    setIsLoading(true);

    try {
      const response = await streamChat(
        {
          messages: [{ role: "user", content: prompt }],
          document: sectionsToMarkdown(sections),
          plan_data: DEMO_PLAN_DATA,
        },
        replaceLastAssistantMessage
      );

      // Updater funcțional, ca să nu pierdem editările manuale făcute în timpul stream-ului.
      setSections((prev) => applyAiResponse(prev, response, prompt));
      const lastTargeted = sections.findLast((section) => isTargeted(section, prompt));
      if (lastTargeted) highlight(lastTargeted.id);
    } catch (err) {
      replaceLastAssistantMessage(`❌ Eroare: ${getErrorMessage(err, "Eroare necunoscută")}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (id: string, content: string) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, content } : s)));

  const handleExport = async () => {
    try {
      downloadBlob(await exportDocument(sections), EXPORT_FILENAME);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans relative overflow-hidden">
      <GridBackground />

      <div className="relative mx-auto max-w-7xl px-8 pt-8 pb-10 h-screen flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg">AI Copilot</h1>
            <p className="text-white/30 text-xs">Asistent academic inteligent</p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-400 transition-all active:scale-95"
          >
            📥 Export .docx
          </button>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
          <ChatPanel
            messages={chatHistory}
            draft={draft}
            onDraftChange={setDraft}
            onSend={handleSend}
            isLoading={isLoading}
          />
          <DocumentPanel sections={sections} highlightedId={highlightedId} onSectionChange={handleSectionChange} />
        </div>
      </div>
    </div>
  );
}
