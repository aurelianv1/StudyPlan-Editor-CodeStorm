import type { ReactNode } from "react";

import type { Section } from "@/lib/types";

interface DocumentPanelProps {
  sections: Section[];
  /** Name of the loaded file; the built-in example is shown when null. */
  fileName: string | null;
  /** Sections just rewritten by the assistant, highlighted for a moment. */
  highlightedIds: string[];
  onChange: (id: string, content: string) => void;
  /** Rendered above the sections (validation results). */
  children?: ReactNode;
}

export function DocumentPanel({
  sections,
  fileName,
  highlightedIds,
  onChange,
  children,
}: DocumentPanelProps) {
  return (
    <section className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-white/[.025] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/[.03] flex items-center justify-between gap-4">
        <p className="text-white/60 text-xs truncate">
          📄 Fișa Disciplinei — {fileName ?? "document exemplu"}
        </p>
        <span className="text-[10px] text-white/25 flex-shrink-0">
          Click pe secțiune pentru a edita manual
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {children}
        {sections.map((section) => {
          const highlighted = highlightedIds.includes(section.id);
          return (
            <div
              key={section.id}
              className={`rounded-xl border p-4 transition-all duration-500 ${
                highlighted
                  ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                  : "border-white/10 bg-white/[.02] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                  {section.title}
                </h3>
                {highlighted && (
                  <span className="text-[10px] text-emerald-400 animate-pulse">
                    ✨ Modificat de AI
                  </span>
                )}
              </div>
              <textarea
                value={section.content}
                onChange={(event) => onChange(section.id, event.target.value)}
                aria-label={section.title}
                className="w-full bg-transparent text-white/60 text-sm leading-relaxed resize-none outline-none min-h-[60px]"
                rows={Math.max(2, section.content.split("\n").length)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
