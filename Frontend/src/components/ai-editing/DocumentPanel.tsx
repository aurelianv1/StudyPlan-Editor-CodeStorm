import type { DocumentSection } from "@/lib/types";

interface DocumentPanelProps {
  sections: DocumentSection[];
  highlightedId: string | null;
  onSectionChange: (id: string, content: string) => void;
}

export function DocumentPanel({ sections, highlightedId, onSectionChange }: DocumentPanelProps) {
  return (
    <section className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-white/[.025] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/[.03] flex items-center justify-between">
        <p className="text-white/60 text-xs">📄 Fișa Disciplinei — editată live de AI</p>
        <span className="text-[10px] text-white/25">Click pe secțiune pentru a edita manual</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {sections.map((section) => (
          <SectionEditor
            key={section.id}
            section={section}
            isHighlighted={highlightedId === section.id}
            onChange={(content) => onSectionChange(section.id, content)}
          />
        ))}
      </div>
    </section>
  );
}

function SectionEditor({
  section,
  isHighlighted,
  onChange,
}: {
  section: DocumentSection;
  isHighlighted: boolean;
  onChange: (content: string) => void;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-500 ${
        isHighlighted
          ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
          : "border-white/10 bg-white/[.02] hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/80 text-xs font-semibold uppercase tracking-widest">{section.title}</h3>
        {isHighlighted && <span className="text-[10px] text-emerald-400 animate-pulse">✨ Modificat de AI</span>}
      </div>
      <textarea
        value={section.content}
        onChange={(e) => onChange(e.target.value)}
        aria-label={section.title}
        className="w-full bg-transparent text-white/60 text-sm leading-relaxed resize-none outline-none min-h-[60px]"
        rows={Math.max(2, section.content.split("\n").length)}
      />
    </div>
  );
}
