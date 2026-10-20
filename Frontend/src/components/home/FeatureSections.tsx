import type { ReactNode } from "react";
import { Eyebrow, PrimaryLink } from "../layout";
import { RevealSection } from "./RevealSection";

// ─── Building blocks ──────────────────────────────────────────────────────────

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 mt-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-white/35">
          <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full border border-white/15 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Fereastră decorativă care imită o aplicație (folosită pentru previzualizări). */
function WindowMockup({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`hidden md:flex flex-col rounded-xl border border-white/8 bg-white/[.03] overflow-hidden text-xs ${className}`}>
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8">
        <span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="ml-2 text-white/20">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ─── AI Editing ───────────────────────────────────────────────────────────────

const AI_PREVIEW_MESSAGES = [
  { role: "user", text: "Update the number of credit hours to 6." },
  { role: "ai", text: "⚠️ Rule violation: courses in category C3 are capped at 5 credits. I can set it to 5 — apply?" },
  { role: "user", text: "Yes, apply that." },
  { role: "ai", text: "✓ Applied. Sheet is now compliant with §4.2." },
];

export function AiEditingSection() {
  return (
    <RevealSection id="ai-editing">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
          backgroundSize: "30px 30px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 w-1/2 h-full"
        style={{ background: "radial-gradient(ellipse at 80% 40%, rgba(255,255,255,.04) 0%, transparent 65%)" }}
      />

      <div className="relative mx-auto max-w-4xl px-8 py-28 grid md:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-6">
          <Eyebrow>01 — AI Editing</Eyebrow>
          <h2 className="font-display text-5xl font-bold tracking-[-0.02em] leading-[1.05]">
            An AI that knows your rules.
          </h2>
          <p className="text-white/45 text-sm leading-relaxed max-w-sm">
            Chat directly with an AI trained on your institution&apos;s study plan ruleset. Upload a discipline sheet,
            describe what needs to change, and the AI will propose compliant edits — flagging every violation before
            you apply a single line.
          </p>
          <FeatureList
            items={[
              "Live chat interface with document preview",
              "Validates every edit against the study plan",
              "Apply or reject AI suggestions individually",
            ]}
          />
          <PrimaryLink href="/ai-editing" className="mt-4">
            Open AI Editor
          </PrimaryLink>
        </div>

        <WindowMockup title="AI Editing — discipline_sheet.docx">
          <div className="flex flex-col gap-3 p-4">
            {AI_PREVIEW_MESSAGES.map((msg) => (
              <div key={msg.text} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <span
                  className={`px-3 py-1.5 rounded-lg max-w-[80%] leading-relaxed ${
                    msg.role === "user" ? "bg-white/10 text-white/70" : "bg-white/5 text-white/45 border border-white/8"
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="mx-4 mb-4 flex gap-2">
            <div className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/20">
              Type a message…
            </div>
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-white/30">→</div>
          </div>
        </WindowMockup>
      </div>
    </RevealSection>
  );
}

// ─── Doc Editing ──────────────────────────────────────────────────────────────

const DIFF_PREVIEW_ROWS = [
  { old: "Credits: 4", new: "Credits: 5", changed: true },
  { old: "Category: C2", new: "Category: C2", changed: false },
  { old: "Sem: 1, Year: 2", new: "Sem: 2, Year: 3", changed: true },
  { old: "Lecture: 28h", new: "Lecture: 28h", changed: false },
  { old: "Lab: 14h", new: "Lab: 14h", changed: false },
  { old: "Exam: Written", new: "Exam: Oral + Project", changed: true },
];

function DiffPreviewColumn({ side }: { side: "old" | "new" }) {
  const changedStyle =
    side === "old" ? "bg-red-500/15 text-red-400/80 line-through" : "bg-emerald-500/15 text-emerald-400/80";

  return (
    <div className="p-4 flex flex-col gap-1.5">
      <p className="text-white/20 mb-2 font-medium">{side.toUpperCase()}</p>
      {DIFF_PREVIEW_ROWS.map((row) => (
        <span
          key={row[side]}
          className={`px-2 py-0.5 rounded text-[11px] font-mono ${row.changed ? changedStyle : "text-white/30"}`}
        >
          {row[side]}
        </span>
      ))}
    </div>
  );
}

export function DocEditingSection() {
  return (
    <RevealSection id="doc-editing">
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 w-1/2 h-full"
        style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(255,255,255,.04) 0%, transparent 65%)" }}
      />

      <div className="relative mx-auto max-w-4xl px-8 py-28 grid md:grid-cols-2 gap-16 items-center">
        <WindowMockup title="old_sheet.docx → new_template.docx" className="order-first">
          <div className="grid grid-cols-2 divide-x divide-white/8">
            <DiffPreviewColumn side="old" />
            <DiffPreviewColumn side="new" />
          </div>
        </WindowMockup>

        <div className="flex flex-col gap-6">
          <Eyebrow>02 — Doc Editing</Eyebrow>
          <h2 className="font-display text-5xl font-bold tracking-[-0.02em] leading-[1.05]">
            See every change.
            <br />
            Miss nothing.
          </h2>
          <p className="text-white/45 text-sm leading-relaxed max-w-sm">
            Load an old discipline sheet and a new template side-by-side. Every addition is highlighted green, every
            removal red — exactly like a Git diff. No more hunting for differences manually.
          </p>
          <FeatureList
            items={[
              "Side-by-side diff with red/green highlights",
              "Load template & document independently",
              "View template separately at any time",
            ]}
          />
          <PrimaryLink href="/updating-docs" className="mt-4">
            Open Doc Editor
          </PrimaryLink>
        </div>
      </div>
    </RevealSection>
  );
}

// ─── Support ──────────────────────────────────────────────────────────────────

const SUPPORT_TOPICS = [
  { icon: "🐛", label: "Bug reports" },
  { icon: "💡", label: "Feature requests" },
  { icon: "❓", label: "General questions" },
];

export function SupportSection() {
  return (
    <RevealSection id="support">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-8 py-28 flex flex-col items-center text-center gap-8">
        <Eyebrow>03 — Support</Eyebrow>
        <h2 className="font-display text-5xl sm:text-6xl font-bold tracking-[-0.02em] leading-[1.05]">
          We&apos;re here if you
          <br />
          <span className="text-white/20 italic font-normal">need us.</span>
        </h2>
        <p className="text-white/40 text-sm max-w-md leading-relaxed">
          Found a bug? Have a question about how the platform works? Send us a message through the contact form and
          our team will get back to you as soon as possible.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 w-full max-w-xl mt-4">
          {SUPPORT_TOPICS.map((topic) => (
            <div
              key={topic.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/8 bg-white/[.025] py-6 px-4"
            >
              <span className="text-2xl">{topic.icon}</span>
              <span className="text-white/40 text-xs">{topic.label}</span>
            </div>
          ))}
        </div>

        <PrimaryLink href="/help" size="lg" className="mt-2">
          Open Contact Form
        </PrimaryLink>
      </div>
    </RevealSection>
  );
}
