"use client";

import { useState, useCallback } from "react";

// Tipul exact pe care backend-ul trebuie să îl returneze
export type DiffLine = {
  type: "added" | "removed" | "unchanged";
  oldLine: string | null;
  newLine: string | null;
};

export default function DocEditingPage() {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [diffData, setDiffData] = useState<DiffLine[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((type: "old" | "template", file: File) => {
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
      formData.append("oldDocument", oldFile);
      formData.append("template", templateFile);

      const response = await fetch("/api/generate-diff", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Backend-ul nu a putut procesa documentele.");
      }

      const data: DiffLine[] = await response.json();
      setDiffData(data);
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Background decorations */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
      <div aria-hidden className="pointer-events-none absolute top-0 right-0 w-1/2 h-full"
        style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,.04) 0%, transparent 65%)" }} />

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
            Încarcă documentul vechi și template-ul nou. Backend-ul va genera diferențele linie cu linie — exact ca un Git diff.
          </p>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
          <button
            disabled={!oldFile}
            onClick={() => document.getElementById("dz-old")?.click()}
            className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 border ${
              oldFile
                ? "text-white/60 border-white/10 hover:text-white hover:border-white/25 hover:bg-white/5"
                : "text-white/20 border-white/5 cursor-not-allowed"
            }`}
          >
            📄 Document Vechi
          </button>
          <button
            disabled={!templateFile}
            onClick={() => document.getElementById("dz-new")?.click()}
            className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 border ${
              templateFile
                ? "text-white/60 border-white/10 hover:text-white hover:border-white/25 hover:bg-white/5"
                : "text-white/20 border-white/5 cursor-not-allowed"
            }`}
          >
            📐 Template Nou
          </button>
          <button
            disabled={!oldFile || !templateFile || isLoading}
            onClick={fetchDiff}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
              !oldFile || !templateFile || isLoading
                ? "bg-white/10 text-white/20 cursor-not-allowed"
                : "bg-white text-black hover:bg-white/90 active:scale-95"
            }`}
          >
            {isLoading ? "⏳ Procesare..." : "⚖️ Generează Diferențe"}
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
        <input id="dz-old" type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect("old", e.target.files[0])} />
        <input id="dz-new" type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect("template", e.target.files[0])} />

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
                className={`relative rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                  file
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
                        onClick={(e) => { e.stopPropagation(); handleFileSelect(type, null as any); }}
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
                        <p className="text-white/25 text-[10px] mt-0.5">PDF, DOCX · click to upload</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-56 gap-4">
            <div className="w-9 h-9 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            <p className="text-white/40 text-sm font-medium">Se procesează documentele...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-red-300/80 text-sm text-center mb-6">
            ❌ {error}
          </div>
        )}

        {/* Side-by-Side Diff View */}
        {diffData && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* LEFT: Old Document */}
              <div className="rounded-xl border border-white/10 bg-white/[.025] overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-white/10 bg-white/[.03] flex justify-between items-center">
                  <span className="font-medium text-white/70 text-sm">Document Vechi</span>
                  <span className="text-[10px] text-white/30 font-mono truncate max-w-[140px]">{oldFile?.name}</span>
                </div>
                <div className="flex-1 h-[55vh] overflow-y-auto font-mono text-[11px]">
                  {diffData.map((line, i) => (
                    <div key={`old-${i}`} className={`flex gap-2 px-4 py-1.5 border-b border-white/5 last:border-0 ${line.type === "removed" ? "bg-red-500/10" : ""}`}>
                      <span className="text-white/20 select-none w-7 text-right">{line.oldLine ? i + 1 : ""}</span>
                      <span className={`flex-1 ${line.type === "removed" ? "text-red-300/80 line-through" : "text-white/40"}`}>
                        {line.type === "removed" && <span className="mr-2 font-bold text-red-400/90">−</span>}
                        {line.oldLine || <span className="text-white/15 italic">—</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: New Document */}
              <div className="rounded-xl border border-white/10 bg-white/[.025] overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-white/10 bg-white/[.03] flex justify-between items-center">
                  <span className="font-medium text-white/70 text-sm">Document Nou</span>
                  <span className="text-[10px] text-white/30 font-mono truncate max-w-[140px]">{templateFile?.name}</span>
                </div>
                <div className="flex-1 h-[55vh] overflow-y-auto font-mono text-[11px]">
                  {diffData.map((line, i) => (
                    <div key={`new-${i}`} className={`flex gap-2 px-4 py-1.5 border-b border-white/5 last:border-0 ${line.type === "added" ? "bg-emerald-500/10" : ""}`}>
                      <span className="text-white/20 select-none w-7 text-right">{line.newLine ? i + 1 : ""}</span>
                      <span className={`flex-1 ${line.type === "added" ? "text-emerald-300/90 font-medium" : "text-white/40"}`}>
                        {line.type === "added" && <span className="mr-2 font-bold text-emerald-400">+</span>}
                        {line.newLine || <span className="text-white/15 italic">—</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex justify-center gap-8 text-[10px] text-white/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500/20 border border-red-500/30 rounded-sm"></span>
                <span>Linii șterse</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-sm"></span>
                <span>Linii adăugate</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <footer className="py-6 text-center text-[10px] text-white/15 tracking-wider">
        StudyPlan Editor · Built for universities
      </footer>
    </div>
  );
}