"use client";

import { useState, useCallback } from "react";

const BASE_URL = "http://localhost:8000";

export type Section = {
  id: string;
  title: string;
  content: string;
  status: "unchanged" | "modified" | "new" | "missing";
};

export default function DocEditingPage() {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [diffData, setDiffData] = useState<Section[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((type: "old" | "template", file: File | null) => {
    if (type === "old") setOldFile(file);
    else setTemplateFile(file);
    setDiffData(null);
    setError(null);
  }, []);

  const fetchDiff = async () => {
    if (!oldFile || !templateFile) return;
    setIsLoading(true);
    setError(null);
    setDiffData(null);

    try {
      const formData = new FormData();
      formData.append("old_doc", oldFile);
      formData.append("new_template", templateFile);

      const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Backend-ul nu a putut procesa documentele.");
      }

      const data = await response.json();
      setDiffData(data.sections);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare necunoscută.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMigrate = async () => {
    if (!oldFile || !templateFile) return;
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("old_doc", oldFile);
      formData.append("new_template", templateFile);

      const response = await fetch(`${BASE_URL}/migrate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Migrare eșuată.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fisa_migrata_2025.docx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare necunoscută.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setOldFile(null);
    setTemplateFile(null);
    setDiffData(null);
    setError(null);
  };

  const statusColor = (status: Section["status"]) => {
    switch (status) {
      case "new": return "bg-emerald-500/10 border-l-2 border-emerald-500/60";
      case "missing": return "bg-red-500/10 border-l-2 border-red-500/60";
      case "modified": return "bg-amber-500/10 border-l-2 border-amber-500/60";
      default: return "border-l-2 border-white/10";
    }
  };

  const statusLabel = (status: Section["status"]) => {
    switch (status) {
      case "new": return <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">🟢 Nou</span>;
      case "missing": return <span className="text-[10px] text-red-400 font-semibold uppercase tracking-widest">🔴 Lipsă</span>;
      case "modified": return <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest">🟡 Modificat</span>;
      default: return <span className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">⚪ Neschimbat</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }} />

      <div className="relative mx-auto max-w-6xl px-8 py-20">
        {/* Header */}
        <header className="mb-10 text-center">
          <span className="inline-block mb-3 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/25 border border-white/10 rounded-full">
            02 — Doc Editing
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-[-0.02em] leading-[1.05] mb-4"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            See every change.
            <br />
            <span className="text-white/25 italic font-normal">Miss nothing.</span>
          </h1>
          <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
            Încarcă documentul vechi și template-ul nou. Compară diferențele sau migrează automat conținutul.
          </p>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
          <button
            onClick={() => document.getElementById("dz-old")?.click()}
            className="px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 border text-white/60 border-white/10 hover:text-white hover:border-white/25 hover:bg-white/5"
          >
            📄 Document Vechi
          </button>
          <button
            onClick={() => document.getElementById("dz-new")?.click()}
            className="px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 border text-white/60 border-white/10 hover:text-white hover:border-white/25 hover:bg-white/5"
          >
            📐 Template Nou
          </button>

          <button
            disabled={!oldFile || !templateFile || isLoading}
            onClick={fetchDiff}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${!oldFile || !templateFile || isLoading
                ? "bg-white/10 text-white/20 cursor-not-allowed"
                : "bg-white text-black hover:bg-white/90 active:scale-95"
              }`}
          >
            {isLoading ? "⏳ Procesare..." : "⚖️ Compară Diferențe"}
          </button>

          <button
            disabled={!oldFile || !templateFile || isLoading}
            onClick={fetchMigrate}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${!oldFile || !templateFile || isLoading
                ? "bg-white/10 text-white/20 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95"
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

        {/* Hidden file inputs */}
        <input id="dz-old" type="file" accept=".docx" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect("old", e.target.files[0])} />
        <input id="dz-new" type="file" accept=".docx" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect("template", e.target.files[0])} />

        {/* Upload Area */}
        {!diffData && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[
              { id: "dz-old", label: "Document Vechi", file: oldFile, type: "old" as const },
              { id: "dz-new", label: "Template Nou", file: templateFile, type: "template" as const },
            ].map(({ id, label, file, type }) => (
              <div
                key={id}
                onClick={() => !file && document.getElementById(id)?.click()}
                className={`relative rounded-xl border transition-all duration-300 cursor-pointer select-none ${file
                    ? "border-white/30 bg-white/5 cursor-default"
                    : "border-white/10 hover:border-white/25 hover:bg-white/5"
                  }`}
              >
                <div className="flex flex-col items-center gap-3 py-8 px-6 text-center">
                  {file ? (
                    <>
                      <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <p className="text-white text-sm font-semibold">Încărcat</p>
                      <p className="text-white/40 text-xs font-mono truncate max-w-[180px]">{file.name}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFileSelect(type, null); }}
                        className="text-[10px] text-white/25 hover:text-white/60 transition-colors underline underline-offset-2"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm font-medium">{label}</p>
                        <p className="text-white/25 text-[10px] mt-0.5">DOCX · click to upload</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-56 gap-4">
            <div className="w-9 h-9 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            <p className="text-white/40 text-sm font-medium">Se procesează documentele...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-red-300/80 text-sm text-center mb-6">
            ❌ {error}
          </div>
        )}

        {/* Diff View */}
        {diffData && (
          <>
            <div className="flex flex-col gap-3">
              {diffData.map((section) => (
                <div key={section.id} className={`rounded-xl p-5 ${statusColor(section.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm">{section.title}</h3>
                    {statusLabel(section.status)}
                  </div>
                  {section.content ? (
                    <p className="text-white/40 text-xs leading-relaxed">{section.content}</p>
                  ) : (
                    <p className="text-white/20 text-xs italic">[ Secțiune goală ]</p>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex justify-center gap-8 text-[10px] text-white/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-sm" />
                <span>Secțiuni noi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500/20 border border-red-500/30 rounded-sm" />
                <span>Secțiuni lipsă</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-500/20 border border-amber-500/30 rounded-sm" />
                <span>Secțiuni modificate</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <footer className="py-6 text-center text-[10px] text-white/15 tracking-wider">
        StudyPlan Editor · Built for universities
      </footer>
    </div>
  );
}