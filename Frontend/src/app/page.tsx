"use client";

import { useState } from "react";

import { ArrowLink } from "@/components/home/ArrowLink";
import { ChatPreview } from "@/components/home/ChatPreview";
import { DiffPreview } from "@/components/home/DiffPreview";
import { FeatureList } from "@/components/home/FeatureList";
import { Navbar } from "@/components/home/Navbar";
import { ScrollSection } from "@/components/home/ScrollSection";
import { UploadZone } from "@/components/home/UploadZone";
import { Divider } from "@/components/layout/Divider";
import { Footer } from "@/components/layout/Footer";
import { GridBackground } from "@/components/layout/GridBackground";
import { ChevronDownIcon } from "@/components/layout/icons";

const SUPPORT_TOPICS = [
  { icon: "🐛", label: "Bug reports" },
  { icon: "💡", label: "Feature requests" },
  { icon: "❓", label: "General questions" },
];

const EYEBROW = "text-xs tracking-[0.25em] uppercase text-white/25";

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <div className="bg-[#0a0a0a] text-white font-sans">
      <Navbar />

      <ScrollSection id="home" className="pt-14">
        <GridBackground />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,.04) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-4xl px-8 py-32 flex flex-col items-center text-center gap-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-xs text-white/40 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            University Studies Plan Management
          </span>

          <h1 className="font-display text-6xl sm:text-7xl font-bold tracking-[-0.03em] leading-[1.02]">
            Discipline sheets,
            <br />
            <span className="text-white/25 italic font-normal">finally</span> under control.
          </h1>

          <p className="text-white/40 text-base max-w-md leading-relaxed">
            Upload your institution&apos;s study plan. Then use AI or template-based
            comparison to keep every discipline sheet compliant — no manual
            cross-referencing required.
          </p>

          <div className="w-full mt-4">
            <p className="text-xs tracking-[0.2em] uppercase text-white/20 mb-5">
              Start by uploading your study plan
            </p>
            <UploadZone onFile={setUploadedFile} />
            {uploadedFile && (
              <p className="mt-4 text-xs text-white/25">
                Plan încărcat — <span className="text-white/60">{uploadedFile.name}</span> ·
                Scroll down to choose a tool.
              </p>
            )}
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
            <span className="text-[10px] tracking-widest uppercase">Scroll</span>
            <ChevronDownIcon className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </ScrollSection>

      <Divider />

      <ScrollSection id="ai-editing">
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
            <span className={EYEBROW}>01 — AI Editing</span>
            <h2 className="font-display text-5xl font-bold tracking-[-0.02em] leading-[1.05]">
              An AI that knows your rules.
            </h2>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm">
              Chat directly with an AI trained on your institution&apos;s study plan
              ruleset. Upload a discipline sheet, describe what needs to change,
              and the AI will propose compliant edits — flagging every violation
              before you apply a single line.
            </p>
            <FeatureList
              items={[
                "Live chat interface with document preview",
                "Validates every edit against the study plan",
                "Apply or reject AI suggestions individually",
              ]}
            />
            <ArrowLink href="/ai-editing" className="mt-4">
              Open AI Editor
            </ArrowLink>
          </div>
          <ChatPreview />
        </div>
      </ScrollSection>

      <Divider />

      <ScrollSection id="doc-editing">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 w-1/2 h-full"
          style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(255,255,255,.04) 0%, transparent 65%)" }}
        />

        <div className="relative mx-auto max-w-4xl px-8 py-28 grid md:grid-cols-2 gap-16 items-center">
          <DiffPreview />
          <div className="flex flex-col gap-6">
            <span className={EYEBROW}>02 — Doc Editing</span>
            <h2 className="font-display text-5xl font-bold tracking-[-0.02em] leading-[1.05]">
              See every change.
              <br />
              Miss nothing.
            </h2>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm">
              Load an old discipline sheet and a new template side-by-side.
              Every addition is highlighted green, every removal red — exactly
              like a Git diff. No more hunting for differences manually.
            </p>
            <FeatureList
              items={[
                "Side-by-side diff with red/green highlights",
                "Load template & document independently",
                "View template separately at any time",
              ]}
            />
            <ArrowLink href="/updating-docs" className="mt-4">
              Open Doc Editor
            </ArrowLink>
          </div>
        </div>
      </ScrollSection>

      <Divider />

      <ScrollSection id="support">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-8 py-28 flex flex-col items-center text-center gap-8">
          <span className={EYEBROW}>03 — Support</span>
          <h2 className="font-display text-5xl sm:text-6xl font-bold tracking-[-0.02em] leading-[1.05]">
            We&apos;re here if you
            <br />
            <span className="text-white/20 italic font-normal">need us.</span>
          </h2>
          <p className="text-white/40 text-sm max-w-md leading-relaxed">
            Found a bug? Have a question about how the platform works? Send us
            a message through the contact form and our team will get back to you
            as soon as possible.
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

          <ArrowLink href="/help" size="lg" className="mt-2">
            Open Contact Form
          </ArrowLink>
        </div>
      </ScrollSection>

      <Footer />
    </div>
  );
}
