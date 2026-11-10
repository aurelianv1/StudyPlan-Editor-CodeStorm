import { WindowFrame } from "./WindowFrame";

type Row = { changed: boolean; text: string };

const OLD_ROWS: Row[] = [
  { changed: true, text: "Credits: 4" },
  { changed: false, text: "Category: C2" },
  { changed: true, text: "Sem: 1, Year: 2" },
  { changed: false, text: "Lecture: 28h" },
  { changed: false, text: "Lab: 14h" },
  { changed: true, text: "Exam: Written" },
];

const NEW_ROWS: Row[] = [
  { changed: true, text: "Credits: 5" },
  { changed: false, text: "Category: C2" },
  { changed: true, text: "Sem: 2, Year: 3" },
  { changed: false, text: "Lecture: 28h" },
  { changed: false, text: "Lab: 14h" },
  { changed: true, text: "Exam: Oral + Project" },
];

function Column({ label, rows, changedClass }: { label: string; rows: Row[]; changedClass: string }) {
  return (
    <div className="p-4 flex flex-col gap-1.5">
      <p className="text-white/20 mb-2 font-medium">{label}</p>
      {rows.map((row, index) => (
        <span
          key={index}
          className={`px-2 py-0.5 rounded text-[11px] font-mono ${
            row.changed ? changedClass : "text-white/30"
          }`}
        >
          {row.text}
        </span>
      ))}
    </div>
  );
}

/** Static illustration of an old sheet next to the new template. */
export function DiffPreview() {
  return (
    <WindowFrame title="old_sheet.docx → new_template.docx" className="order-first">
      <div className="grid grid-cols-2 divide-x divide-white/8">
        <Column label="OLD" rows={OLD_ROWS} changedClass="bg-red-500/15 text-red-400/80 line-through" />
        <Column label="NEW" rows={NEW_ROWS} changedClass="bg-emerald-500/15 text-emerald-400/80" />
      </div>
    </WindowFrame>
  );
}
