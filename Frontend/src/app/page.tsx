"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadState = "idle" | "dragover" | "success";

// ─── Navbar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Home", id: "home" },
  { label: "AI Editing", id: "ai-editing" },
  { label: "Doc Editing", id: "doc-editing" },
  { label: "Support", id: "support" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setActive("home");
    const ids = ["home", "ai-editing", "doc-editing", "support"];
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(id); },
        { threshold: 0.5 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  const navItemClass = (id: string) =>
    isMounted && active === id
      ? "text-white bg-white/10"
      : "text-white/40 hover:text-white/80 hover:bg-white/5";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      {/* Logo */}
      <button onClick={() => scrollTo("home")} className="flex items-center gap-2.5 group">
        <span className="w-5 h-5 grid grid-cols-2 gap-0.5">
          <span className="bg-white rounded-[1px]" />
          <span className="bg-white/40 rounded-[1px]" />
          <span className="bg-white/40 rounded-[1px]" />
          <span className="bg-white rounded-[1px]" />
        </span>
        <span className="text-white text-sm font-semibold tracking-tight">
          StudyPlan <span className="text-white/30 font-normal">Editor</span>
        </span>
      </button>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide transition-all duration-200 ${navItemClass(item.id)}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden text-white/60 hover:text-white transition-colors p-1"
        aria-label="Menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h10"} />
        </svg>
      </button>

      {open && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-[#0a0a0a] border-b border-white/10 py-3 px-6 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-left px-3 py-2 rounded-md text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const [state, setState] = useState<UploadState>("idle");
  const [name, setName] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const accept = (file: File) => { setName(file.name); setState("success"); onFile(file); };
  const reset = (e: React.MouseEvent) => { e.stopPropagation(); setState("idle"); setName(null); if (ref.current) ref.current.value = ""; };

  return (
    <div
      role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && state !== "success" && ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setState("dragover"); }}
      onDragLeave={(e) => { e.preventDefault(); setState("idle"); }}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) accept(f); else setState("idle"); }}
      onClick={() => state !== "success" && ref.current?.click()}
      className={`relative w-full max-w-lg mx-auto rounded-xl border transition-all duration-300 cursor-pointer select-none
        ${state === "success"
          ? "border-white/30 bg-white/5 cursor-default"
          : state === "dragover"
          ? "border-white/60 bg-white/10 scale-[1.01]"
          : "border-white/10 hover:border-white/25 hover:bg-white/5"
        }`}
    >
      <input ref={ref} type="file" accept=".pdf,.doc,.docx,.xlsx,.xls" onChange={(e) => { const f = e.target.files?.[0]; if (f) accept(f); }} className="hidden" aria-hidden />

      <div className="flex flex-col items-center gap-3 py-10 px-8 text-center">
        {state === "success" ? (
          <>
            <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1"
              style={{ animation: "popIn .35s cubic-bezier(.34,1.56,.64,1) both" }}>
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p className="text-white text-sm font-semibold">Fișier încărcat cu succes</p>
            <p className="text-white/40 text-xs font-mono truncate max-w-xs">{name}</p>
            <button onClick={reset} className="text-xs text-white/25 hover:text-white/60 transition-colors underline underline-offset-2 mt-1">
              Remove &amp; upload another
            </button>
          </>
        ) : (
          <>
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              state === "dragover" ? "border-white bg-white" : "border-white/20 bg-transparent"
            }`}>
              <svg className={`w-4 h-4 transition-colors ${state === "dragover" ? "text-black" : "text-white/30"}`}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">
                {state === "dragover" ? "Drop to upload" : "Upload your university's studies plan"}
              </p>
              <p className="text-white/25 text-xs mt-1">PDF, DOC, DOCX, XLSX · drag & drop or click</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Section wrapper with scroll-reveal ──────────────────────────────────────

function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    // Trigger animation after mount
    requestAnimationFrame(() => {
      setVisible(true);
    });
    
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const animClass = visible 
    ? "opacity-100 translate-y-0" 
    : "opacity-0 translate-y-8";

  return (
    <section
      ref={ref} 
      id={id}
      className={`min-h-screen flex flex-col justify-center relative overflow-hidden transition-all duration-700 ease-out ${animClass} ${className}`}
    >
      {children}
    </section>
  );
}

// ─── Divider line ─────────────────────────────────────────────────────────────

function Divider() {
  return <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <div className="bg-[#0a0a0a] text-white font-sans">
      <Navbar />

      {/* ── Section 1: Home ─────────────────────────────── */}
      <Section id="home" className="pt-14">
        {/* Background: large faint grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }} />
        {/* Radial glow */}
        <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,.04) 0%, transparent 70%)" }} />

        <div className="relative mx-auto max-w-4xl px-8 py-32 flex flex-col items-center text-center gap-8">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-xs text-white/40 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            University Studies Plan Management
          </span>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl font-bold tracking-[-0.03em] leading-[1.02]"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            Discipline sheets,
            <br />
            <span className="text-white/25 italic font-normal">finally</span>{" "}
            under control.
          </h1>

          <p className="text-white/40 text-base max-w-md leading-relaxed">
            Upload your institution's study plan. Then use AI or template-based
            comparison to keep every discipline sheet compliant — no manual
            cross-referencing required.
          </p>

          {/* Upload */}
          <div className="w-full mt-4">
            <p className="text-xs tracking-[0.2em] uppercase text-white/20 mb-5">
              Start by uploading your study plan
            </p>
            <UploadZone onFile={(f) => setUploadedFile(f)} />
            {uploadedFile && (
              <p className="mt-4 text-xs text-white/25">
                Plan loaded — <span className="text-white/60">{uploadedFile.name}</span>. Scroll down to choose a tool.
              </p>
            )}
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
            <span className="text-[10px] tracking-widest uppercase">Scroll</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ── Section 2: AI Editing ────────────────────────── */}
      <Section id="ai-editing">
        {/* Faint diagonal lines background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
            backgroundSize: "30px 30px",
          }} />
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 w-1/2 h-full"
          style={{ background: "radial-gradient(ellipse at 80% 40%, rgba(255,255,255,.04) 0%, transparent 65%)" }} />

        <div className="relative mx-auto max-w-4xl px-8 py-28 grid md:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <div className="flex flex-col gap-6">
            <span className="text-xs tracking-[0.25em] uppercase text-white/25">01 — AI Editing</span>
            <h2 className="text-5xl font-bold tracking-[-0.02em] leading-[1.05]"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              An AI that knows your rules.
            </h2>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm">
              Chat directly with an AI trained on your institution's study plan
              ruleset. Upload a discipline sheet, describe what needs to change,
              and the AI will propose compliant edits — flagging every violation
              before you apply a single line.
            </p>
            <ul className="flex flex-col gap-2 mt-2">
              {[
                "Live chat interface with document preview",
                "Validates every edit against the study plan",
                "Apply or reject AI suggestions individually",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-white/35">
                  <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full border border-white/15 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/ai-editing" className="mt-4 w-fit">
              <button className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold
                hover:bg-white/90 transition-all duration-200 active:scale-95">
                Open AI Editor
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>
          </div>

          {/* Visual side — mock chat UI */}
          <div className="hidden md:flex flex-col rounded-xl border border-white/8 bg-white/[.03] overflow-hidden text-xs">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8">
              <span className="w-2 h-2 rounded-full bg-white/15" />
              <span className="w-2 h-2 rounded-full bg-white/15" />
              <span className="w-2 h-2 rounded-full bg-white/15" />
              <span className="ml-2 text-white/20">AI Editing — discipline_sheet.docx</span>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {[
                { role: "user", text: "Update the number of credit hours to 6." },
                { role: "ai",   text: "⚠️ Rule violation: courses in category C3 are capped at 5 credits. I can set it to 5 — apply?" },
                { role: "user", text: "Yes, apply that." },
                { role: "ai",   text: "✓ Applied. Sheet is now compliant with §4.2." },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <span className={`px-3 py-1.5 rounded-lg max-w-[80%] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-white/10 text-white/70"
                      : "bg-white/5 text-white/45 border border-white/8"
                  }`}>
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
          </div>
        </div>
      </Section>

      <Divider />

      {/* ── Section 3: Doc Editing ───────────────────────── */}
      <Section id="doc-editing">
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 w-1/2 h-full"
          style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(255,255,255,.04) 0%, transparent 65%)" }} />

        <div className="relative mx-auto max-w-4xl px-8 py-28 grid md:grid-cols-2 gap-16 items-center">
          {/* Visual side — mock diff UI */}
          <div className="hidden md:flex flex-col rounded-xl border border-white/8 bg-white/[.03] overflow-hidden text-xs order-first">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8">
              <span className="w-2 h-2 rounded-full bg-white/15" />
              <span className="w-2 h-2 rounded-full bg-white/15" />
              <span className="w-2 h-2 rounded-full bg-white/15" />
              <span className="ml-2 text-white/20">old_sheet.docx → new_template.docx</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-white/8">
              {/* Old */}
              <div className="p-4 flex flex-col gap-1.5">
                <p className="text-white/20 mb-2 font-medium">OLD</p>
                {[
                  { color: "red",    text: "Credits: 4" },
                  { color: "neutral",text: "Category: C2" },
                  { color: "red",    text: "Sem: 1, Year: 2" },
                  { color: "neutral",text: "Lecture: 28h" },
                  { color: "neutral",text: "Lab: 14h" },
                  { color: "red",    text: "Exam: Written" },
                ].map((row, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    row.color === "red"
                      ? "bg-red-500/15 text-red-400/80 line-through"
                      : "text-white/30"
                  }`}>{row.text}</span>
                ))}
              </div>
              {/* New */}
              <div className="p-4 flex flex-col gap-1.5">
                <p className="text-white/20 mb-2 font-medium">NEW</p>
                {[
                  { color: "green",  text: "Credits: 5" },
                  { color: "neutral",text: "Category: C2" },
                  { color: "green",  text: "Sem: 2, Year: 3" },
                  { color: "neutral",text: "Lecture: 28h" },
                  { color: "neutral",text: "Lab: 14h" },
                  { color: "green",  text: "Exam: Oral + Project" },
                ].map((row, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    row.color === "green"
                      ? "bg-emerald-500/15 text-emerald-400/80"
                      : "text-white/30"
                  }`}>{row.text}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="flex flex-col gap-6">
            <span className="text-xs tracking-[0.25em] uppercase text-white/25">02 — Doc Editing</span>
            <h2 className="text-5xl font-bold tracking-[-0.02em] leading-[1.05]"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              See every change.
              <br />
              Miss nothing.
            </h2>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm">
              Load an old discipline sheet and a new template side-by-side.
              Every addition is highlighted green, every removal red — exactly
              like a Git diff. No more hunting for differences manually.
            </p>
            <ul className="flex flex-col gap-2 mt-2">
              {[
                "Side-by-side diff with red/green highlights",
                "Load template & document independently",
                "View template separately at any time",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-white/35">
                  <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full border border-white/15 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/updating-docs" className="mt-4 w-fit">
              <button className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold
                hover:bg-white/90 transition-all duration-200 active:scale-95">
                Open Doc Editor
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ── Section 4: Support ───────────────────────────── */}
      <Section id="support">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />

        <div className="relative mx-auto max-w-4xl px-8 py-28 flex flex-col items-center text-center gap-8">
          <span className="text-xs tracking-[0.25em] uppercase text-white/25">03 — Support</span>
          <h2 className="text-5xl sm:text-6xl font-bold tracking-[-0.02em] leading-[1.05]"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            We're here if you
            <br />
            <span className="text-white/20 italic font-normal">need us.</span>
          </h2>
          <p className="text-white/40 text-sm max-w-md leading-relaxed">
            Found a bug? Have a question about how the platform works? Send us
            a message through the contact form and our team will get back to you
            as soon as possible.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 w-full max-w-xl mt-4">
            {[
              { icon: "🐛", label: "Bug reports" },
              { icon: "💡", label: "Feature requests" },
              { icon: "❓", label: "General questions" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 rounded-xl border border-white/8 bg-white/[.025] py-6 px-4">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-white/40 text-xs">{item.label}</span>
              </div>
            ))}
          </div>

          <Link href="/help" className="mt-2">
            <button className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black text-sm font-semibold
              hover:bg-white/90 transition-all duration-200 active:scale-95">
              Open Contact Form
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </Link>
        </div>
      </Section>

      {/* Footer */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <footer className="py-8 text-center text-xs text-white/15 tracking-wider">
        StudyPlan Editor · Built for universities
      </footer>

      <style>{`
        @keyframes popIn {
          0%   { transform: scale(.4); opacity: 0; }
          70%  { transform: scale(1.12); }
          100% { transform: scale(1);  opacity: 1; }
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}