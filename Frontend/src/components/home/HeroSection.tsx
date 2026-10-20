"use client";

import { useState } from "react";
import { ChevronDownIcon } from "../icons";
import { GridBackground } from "../layout";
import { PlanUploadZone } from "./PlanUploadZone";
import { RevealSection } from "./RevealSection";

export function HeroSection() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <RevealSection id="home" className="pt-14">
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
          Upload your institution&apos;s study plan. Then use AI or template-based comparison to keep
          every discipline sheet compliant — no manual cross-referencing required.
        </p>

        <div className="w-full mt-4">
          <p className="text-xs tracking-[0.2em] uppercase text-white/20 mb-5">Start by uploading your study plan</p>
          <PlanUploadZone onUploaded={setUploadedFile} />
          {uploadedFile && (
            <p className="mt-4 text-xs text-white/25">
              Plan încărcat — <span className="text-white/60">{uploadedFile.name}</span> · Scroll down to choose a
              tool.
            </p>
          )}
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDownIcon className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </RevealSection>
  );
}
