import type { SectionDiff, SectionStatus } from "@/lib/types";

const STATUS: Record<SectionStatus, { card: string; badge: string; label: string }> = {
  new: {
    card: "bg-emerald-500/10 border-l-2 border-emerald-500/60",
    badge: "text-emerald-400",
    label: "🟢 Nou",
  },
  missing: {
    card: "bg-red-500/10 border-l-2 border-red-500/60",
    badge: "text-red-400",
    label: "🔴 Lipsă",
  },
  modified: {
    card: "bg-amber-500/10 border-l-2 border-amber-500/60",
    badge: "text-amber-400",
    label: "🟡 Modificat",
  },
  unchanged: {
    card: "border-l-2 border-white/10",
    badge: "text-white/30",
    label: "⚪ Neschimbat",
  },
};

const LEGEND = [
  { swatch: "bg-emerald-500/20 border-emerald-500/30", label: "Secțiuni noi" },
  { swatch: "bg-red-500/20 border-red-500/30", label: "Secțiuni lipsă" },
  { swatch: "bg-amber-500/20 border-amber-500/30", label: "Secțiuni modificate" },
];

/** Sections of the new template, coloured by how they relate to the old sheet. */
export function DiffList({ sections }: { sections: SectionDiff[] }) {
  return (
    <>
      <div className="flex flex-col gap-3">
        {sections.map((section) => {
          const style = STATUS[section.status];
          return (
            <div key={section.id} className={`rounded-xl p-5 ${style.card}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-sm">{section.title}</h3>
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${style.badge}`}>
                  {style.label}
                </span>
              </div>
              {section.content ? (
                <p className="text-white/40 text-xs leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              ) : (
                <p className="text-white/20 text-xs italic">[ Secțiune goală ]</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-8 text-[10px] text-white/30">
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 border rounded-sm ${item.swatch}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
