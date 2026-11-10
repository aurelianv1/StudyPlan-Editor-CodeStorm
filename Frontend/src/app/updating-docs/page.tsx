"use client";

import { useRef, useState, type Ref } from "react";

import { DiffList } from "@/components/doc-editing/DiffList";
import { FileCard } from "@/components/doc-editing/FileCard";
import { Footer } from "@/components/layout/Footer";
import { GridBackground } from "@/components/layout/GridBackground";
import { compareDocuments, errorMessage, migrateDocuments } from "@/lib/api";
import { downloadBlob } from "@/lib/download";
import type { SectionDiff } from "@/lib/types";

type Side = "old" | "template";

const ACTION_BUTTON =
  "px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200";
const DISABLED_BUTTON = "bg-white/10 text-white/20 cursor-not-allowed";

interface DocxInputProps {
  ref: Ref<HTMLInputElement>;
  label: string;
  onFile: (file: File) => void;
}

/** Hidden file input, opened by the toolbar buttons and the file cards. */
function DocxInput({ ref, label, onFile }: DocxInputProps) {
  return (
    <input
      ref={ref}
      type="file"
      accept=".docx"
      className="hidden"
      aria-label={label}
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) onFile(file);
      }}
    />
  );
}

export default function DocEditingPage() {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [diff, setDiff] = useState<SectionDiff[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const oldInput = useRef<HTMLInputElement>(null);
  const templateInput = useRef<HTMLInputElement>(null);

  const ready = Boolean(oldFile && templateFile) && !isLoading;

  const inputFor = (side: Side) => (side === "old" ? oldInput : templateInput).current;

  const openPicker = (side: Side) => inputFor(side)?.click();

  const selectFile = (side: Side, file: File | null) => {
    // Clear the input when removing, or picking the same file again fires no event.
    const input = inputFor(side);
    if (!file && input) input.value = "";
    (side === "old" ? setOldFile : setTemplateFile)(file);
    setDiff(null);
    setError(null);
  };

  /** Run a backend action on the two files, handling loading and errors. */
  const run = async (action: (oldDoc: File, template: File) => Promise<void>) => {
    if (!oldFile || !templateFile) return;
    setIsLoading(true);
    setError(null);
    try {
      await action(oldFile, templateFile);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const compare = () =>
    run(async (oldDoc, template) => {
      setDiff(null);
      setDiff(await compareDocuments(oldDoc, template));
    });

  const migrate = () =>
    run(async (oldDoc, template) => {
      downloadBlob(await migrateDocuments(oldDoc, template), "fisa_migrata.docx");
    });

  const resetAll = () => {
    selectFile("old", null);
    selectFile("template", null);
  };

  const sides: { side: Side; label: string; icon: string; file: File | null }[] = [
    { side: "old", label: "Document Vechi", icon: "📄", file: oldFile },
    { side: "template", label: "Template Nou", icon: "📐", file: templateFile },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white font-sans">
      <GridBackground />

      <div className="relative mx-auto max-w-6xl px-8 py-20">
        <header className="mb-10 text-center">
          <span className="inline-block mb-3 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/25 border border-white/10 rounded-full">
            02 — Doc Editing
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-[-0.02em] leading-[1.05] mb-4">
            See every change.
            <br />
            <span className="text-white/25 italic font-normal">Miss nothing.</span>
          </h1>
          <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
            Încarcă documentul vechi și template-ul nou. Compară diferențele sau migrează automat conținutul.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
          {sides.map(({ side, label, icon }) => (
            <button
              key={side}
              onClick={() => openPicker(side)}
              className="px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 border text-white/60 border-white/10 hover:text-white hover:border-white/25 hover:bg-white/5"
            >
              {icon} {label}
            </button>
          ))}

          <button
            disabled={!ready}
            onClick={compare}
            className={`${ACTION_BUTTON} ${
              ready ? "bg-white text-black hover:bg-white/90 active:scale-95" : DISABLED_BUTTON
            }`}
          >
            {isLoading ? "⏳ Procesare..." : "⚖️ Compară Diferențe"}
          </button>
          <button
            disabled={!ready}
            onClick={migrate}
            className={`${ACTION_BUTTON} ${
              ready ? "bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95" : DISABLED_BUTTON
            }`}
          >
            {isLoading ? "⏳ Procesare..." : "🔄 Migrează Automat"}
          </button>

          <div className="flex-grow" />
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-lg text-xs text-white/30 hover:text-white/60 transition-colors border border-white/10 hover:border-white/20"
          >
            ↺ Reset
          </button>
        </div>

        <DocxInput ref={oldInput} label="Document Vechi" onFile={(file) => selectFile("old", file)} />
        <DocxInput ref={templateInput} label="Template Nou" onFile={(file) => selectFile("template", file)} />

        {!diff && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {sides.map(({ side, label, file }) => (
              <FileCard
                key={side}
                label={label}
                file={file}
                onPick={() => openPicker(side)}
                onRemove={() => selectFile(side, null)}
              />
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-56 gap-4">
            <div className="w-9 h-9 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            <p className="text-white/40 text-sm font-medium">Se procesează documentele...</p>
          </div>
        )}

        {error && (
          <div role="alert" className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-red-300/80 text-sm text-center mb-6">
            ❌ {error}
          </div>
        )}

        {diff && <DiffList sections={diff} />}
      </div>

      <Footer compact />
    </div>
  );
}
