import type { DiffSection, DiffStatus } from "@/lib/types";

const STATUS_STYLES: Record<DiffStatus, { card: string; badge: string; label: string; legend?: string; swatch?: string }> = {
  new: {
    card: "bg-emerald-500/10 border-l-2 border-emerald-500/60",
    badge: "text-emerald-400",
    label: "🟢 Nou",
    legend: "Secțiuni noi",
    swatch: "bg-emerald-500/20 border-emerald-500/30",
  },
  missing: {
    card: "bg-red-500/10 border-l-2 border-red-500/60",
    badge: "text-red-400",
    label: "🔴 Lipsă",
    legend: "Secțiuni lipsă",
    swatch: "bg-red-500/20 border-red-500/30",
  },
  modified: {
    card: "bg-amber-500/10 border-l-2 border-amber-500/60",
    badge: "text-amber-400",
    label: "🟡 Modificat",
    legend: "Secțiuni modificate",
    swatch: "bg-amber-500/20 border-amber-500/30",
  },
  unchanged: {
    card: "border-l-2 border-white/10",
    badge: "text-white/30",
    label: "⚪ Neschimbat",
  },
};

export function DiffView({ sections }: { sections: DiffSection[] }) {
  return (
    <>
      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          // Secțiunile „missing” vin din documentul vechi, restul din template,
          // așa că id-ul singur se poate repeta.
          <DiffSectionCard key={`${section.status}-${section.id}`} section={section} />
        ))}
      </div>
      <DiffLegend />
    </>
  );
}

function DiffSectionCard({ section }: { section: DiffSection }) {
  const styles = STATUS_STYLES[section.status];

  return (
    <div className={`rounded-xl p-5 ${styles.card}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold text-sm">{section.title}</h3>
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${styles.badge}`}>{styles.label}</span>
      </div>
      {section.content ? (
        <p className="text-white/40 text-xs leading-relaxed">{section.content}</p>
      ) : (
        <p className="text-white/20 text-xs italic">[ Secțiune goală ]</p>
      )}
    </div>
  );
}

function DiffLegend() {
  const entries = Object.values(STATUS_STYLES).filter((style) => style.legend);

  return (
    <div className="mt-6 flex justify-center gap-8 text-[10px] text-white/30">
      {entries.map((style) => (
        <div key={style.legend} className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 border rounded-sm ${style.swatch}`} />
          <span>{style.legend}</span>
        </div>
      ))}
    </div>
  );
}
