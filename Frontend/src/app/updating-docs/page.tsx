"use client";

import { useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { GridBackground, PageFooter, Spinner } from "@/components/layout";
import { DiffView } from "@/components/updating-docs/DiffView";
import { DocUploadCard } from "@/components/updating-docs/DocUploadCard";
import { compareDocuments, downloadBlob, getErrorMessage, migrateDocument } from "@/lib/api";
import type { DiffSection } from "@/lib/types";

const MIGRATED_FILENAME = "fisa_migrata_2025.docx";

/** Un fișier .docx selectat printr-un input ascuns. */
function useDocxInput(onChange: () => void) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const select = (next: File | null) => {
    setFile(next);
    // Golim input-ul ca același fișier să poată fi selectat din nou după „Remove”.
    if (!next && inputRef.current) inputRef.current.value = "";
    onChange();
  };

  return { file, inputRef, select, browse: () => inputRef.current?.click() };
}

export default function DocEditingPage() {
  const [diffData, setDiffData] = useState<DiffSection[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearResults = () => {
    setDiffData(null);
    setError(null);
  };

  const oldDoc = useDocxInput(clearResults);
  const template = useDocxInput(clearResults);
  const canProcess = Boolean(oldDoc.file && template.file) && !isLoading;

  /** Rulează o acțiune pe cele două documente, gestionând loading și erori. */
  const runWithDocuments = async (action: (oldFile: File, templateFile: File) => Promise<void>) => {
    if (!oldDoc.file || !template.file) return;
    setIsLoading(true);
    setError(null);

    try {
      await action(oldDoc.file, template.file);
    } catch (err) {
      setError(getErrorMessage(err, "A apărut o eroare necunoscută."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = () =>
    runWithDocuments(async (oldFile, templateFile) => {
      setDiffData(null);
      setDiffData(await compareDocuments(oldFile, templateFile));
    });

  const handleMigrate = () =>
    runWithDocuments(async (oldFile, templateFile) => {
      downloadBlob(await migrateDocument(oldFile, templateFile), MIGRATED_FILENAME);
    });

  const resetAll = () => {
    oldDoc.select(null);
    template.select(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
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
          <ToolbarButton onClick={oldDoc.browse}>📄 Document Vechi</ToolbarButton>
          <ToolbarButton onClick={template.browse}>📐 Template Nou</ToolbarButton>
          <ActionButton onClick={handleCompare} disabled={!canProcess} isLoading={isLoading} activeClassName="bg-white text-black hover:bg-white/90">
            ⚖️ Compară Diferențe
          </ActionButton>
          <ActionButton onClick={handleMigrate} disabled={!canProcess} isLoading={isLoading} activeClassName="bg-emerald-500 text-white hover:bg-emerald-400">
            🔄 Migrează Automat
          </ActionButton>
          <div className="flex-grow" />
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-lg text-xs text-white/30 hover:text-white/60 transition-colors border border-white/10 hover:border-white/20"
          >
            ↺ Reset
          </button>
        </div>

        <HiddenDocxInput inputRef={oldDoc.inputRef} onSelect={oldDoc.select} />
        <HiddenDocxInput inputRef={template.inputRef} onSelect={template.select} />

        {!diffData && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <DocUploadCard
              label="Document Vechi"
              file={oldDoc.file}
              onBrowse={oldDoc.browse}
              onRemove={() => oldDoc.select(null)}
            />
            <DocUploadCard
              label="Template Nou"
              file={template.file}
              onBrowse={template.browse}
              onRemove={() => template.select(null)}
            />
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-56 gap-4">
            <Spinner className="w-9 h-9" />
            <p className="text-white/40 text-sm font-medium">Se procesează documentele...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-red-300/80 text-sm text-center mb-6">
            ❌ {error}
          </div>
        )}

        {diffData && <DiffView sections={diffData} />}
      </div>

      <PageFooter />
    </div>
  );
}

function HiddenDocxInput({
  inputRef,
  onSelect,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: (file: File) => void;
}) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept=".docx"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onSelect(file);
      }}
    />
  );
}

function ToolbarButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 border text-white/60 border-white/10 hover:text-white hover:border-white/25 hover:bg-white/5"
    >
      {children}
    </button>
  );
}

function ActionButton({
  onClick,
  disabled,
  isLoading,
  activeClassName,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  activeClassName: string;
  children: ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
        disabled ? "bg-white/10 text-white/20 cursor-not-allowed" : `${activeClassName} active:scale-95`
      }`}
    >
      {isLoading ? "⏳ Procesare..." : children}
    </button>
  );
}
