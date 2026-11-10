import type { ValidationResult } from "@/lib/types";

const SEVERITY = {
  error: { icon: "⛔", style: "border-red-500/30 bg-red-500/10 text-red-300/90" },
  warning: { icon: "⚠️", style: "border-amber-500/30 bg-amber-500/10 text-amber-200/90" },
};

/** Conflicts between the sheet being edited and the study plan. */
export function ValidationPanel({ result }: { result: ValidationResult }) {
  if (result.conflicts.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300/90">
        ✓ Fișa este în acord cu Planul de Învățământ.
      </div>
    );
  }
  return (
    <ul className="space-y-2" aria-label="Conflicte cu Planul de Învățământ">
      {result.conflicts.map((conflict, index) => {
        const { icon, style } = SEVERITY[conflict.severity];
        return (
          <li key={index} className={`rounded-xl border px-4 py-3 text-sm ${style}`}>
            {icon} {conflict.message}
          </li>
        );
      })}
    </ul>
  );
}
