"use client";

import { useState, useCallback } from "react";
import { Button, FileDropzone } from "@/components/ui";

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
    
    // Resetăm rezultatele anterioare când se schimbă fișierele
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

      // ⚠️ Înlocuiește cu ruta reală a endpoint-ului tău Node.js
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
    <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-black">Document Updater</h1>
        <p className="text-neutral-600 mt-2">
          Încarcă documentul vechi și template-ul nou. Backend-ul va genera diferențele linie cu linie.
        </p>
      </header>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button variant="secondary" disabled={!oldFile} onClick={() => document.getElementById("dz-old")?.click()}>
          📄 Încarcă Document Vechi
        </Button>
        <Button variant="secondary" disabled={!templateFile} onClick={() => document.getElementById("dz-new")?.click()}>
          📐 Încarcă Template Nou
        </Button>
        <Button 
          variant="primary" 
          disabled={!oldFile || !templateFile || isLoading} 
          onClick={fetchDiff}
        >
          {isLoading ? "⏳ Procesare..." : "⚖️ Generează Diferențe"}
        </Button>
        <div className="flex-grow" />
        <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={resetAll}>
          ↺ Reset
        </Button>
      </div>

      {/* Upload Area (dispare când avem rezultate) */}
      {!diffData && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-black mb-3">Document Vechi</h3>
            <FileDropzone id="dz-old" label="Trage documentul existent aici (.pdf, .docx)" onFileSelect={(f) => handleFileSelect("old", f)} accept=".pdf,.docx" className="h-64" />
          </div>
          <div>
            <h3 className="font-medium text-black mb-3">Template Nou</h3>
            <FileDropzone id="dz-new" label="Trage noul template aici (.pdf, .docx)" onFileSelect={(f) => handleFileSelect("template", f)} accept=".pdf,.docx" className="h-64" />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-10 h-10 border-4 border-neutral-200 border-t-black rounded-full animate-spin" />
          <p className="text-neutral-600 font-medium">Backend-ul procesează documentele și calculează diferențele...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Side-by-Side Diff View */}
      {diffData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT: Old Document */}
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
                <span className="font-medium text-neutral-800">Document Vechi</span>
                <span className="text-xs text-neutral-500">{oldFile?.name}</span>
              </div>
              <div className="flex-1 h-[65vh] overflow-y-auto font-mono text-sm">
                {diffData.map((line, i) => (
                  <div key={i} className={`flex gap-2 px-4 py-1.5 border-b border-neutral-100 last:border-0 ${line.type === "removed" ? "bg-red-50" : ""}`}>
                    <span className="text-neutral-400 select-none w-8 text-right">{line.oldLine ? i + 1 : ""}</span>
                    <span className={`flex-1 ${line.type === "removed" ? "text-red-700 line-through" : "text-neutral-700"}`}>
                      {line.type === "removed" && <span className="mr-2 font-bold text-red-600">−</span>}
                      {line.oldLine || <span className="text-neutral-300 italic">gol</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: New Document (Processed) */}
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
                <span className="font-medium text-neutral-800">Document Nou (Modificat)</span>
                <span className="text-xs text-neutral-500">{templateFile?.name}</span>
              </div>
              <div className="flex-1 h-[65vh] overflow-y-auto font-mono text-sm">
                {diffData.map((line, i) => (
                  <div key={i} className={`flex gap-2 px-4 py-1.5 border-b border-neutral-100 last:border-0 ${line.type === "added" ? "bg-green-50" : ""}`}>
                    <span className="text-neutral-400 select-none w-8 text-right">{line.newLine ? i + 1 : ""}</span>
                    <span className={`flex-1 ${line.type === "added" ? "text-green-700 font-medium" : "text-neutral-700"}`}>
                      {line.type === "added" && <span className="mr-2 font-bold text-green-600">+</span>}
                      {line.newLine || <span className="text-neutral-300 italic">gol</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex gap-6 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-50 border border-red-200 rounded"></span>
              <span>Linii șterse din vechi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-50 border border-green-200 rounded"></span>
              <span>Linii adăugate în nou</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}