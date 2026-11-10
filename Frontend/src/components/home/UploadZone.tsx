"use client";

import { useRef, useState, type MouseEvent } from "react";

import { CheckIcon, CloseIcon, UploadIcon } from "@/components/layout/icons";
import { errorMessage, generateSkeleton } from "@/lib/api";
import { downloadBlob } from "@/lib/download";

type UploadState = "idle" | "dragover" | "uploading" | "success" | "error";

const ZONE_STYLES: Record<UploadState, string> = {
  idle: "border-white/10 hover:border-white/25 hover:bg-white/5 cursor-pointer",
  dragover: "border-white/60 bg-white/10 scale-[1.01] cursor-copy",
  uploading: "border-white/15 bg-white/[.03] cursor-wait",
  success: "border-white/30 bg-white/5 cursor-default",
  error: "border-red-500/30 bg-red-500/5 cursor-pointer",
};

const RESET_LINK =
  "text-xs text-white/25 hover:text-white/60 transition-colors underline underline-offset-2 mt-1";

/**
 * Drop zone for the study plan. Uploading a plan downloads a discipline
 * sheet skeleton pre-filled from it.
 */
export function UploadZone({ onFile }: { onFile: (file: File) => void }) {
  const [state, setState] = useState<UploadState>("idle");
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = (event?: MouseEvent) => {
    event?.stopPropagation();
    setState("idle");
    setName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const accept = async (file: File) => {
    setName(file.name);
    setState("uploading");
    setError(null);
    try {
      downloadBlob(await generateSkeleton(file), "fisa_disciplinei_schelet.docx");
      setState("success");
      onFile(file);
    } catch (err) {
      setState("error");
      setError(errorMessage(err));
    }
  };

  const openPicker = () => {
    if (state === "idle") inputRef.current?.click();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === "Enter" && openPicker()}
      onDragOver={(event) => {
        event.preventDefault();
        if (state === "idle") setState("dragover");
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (state === "dragover") setState("idle");
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (state !== "dragover") return;
        const file = event.dataTransfer.files?.[0];
        if (file) accept(file);
        else setState("idle");
      }}
      onClick={openPicker}
      className={`relative w-full max-w-lg mx-auto rounded-xl border transition-all duration-300 select-none ${ZONE_STYLES[state]}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) accept(file);
        }}
        className="hidden"
        aria-hidden
      />

      <div className="flex flex-col items-center gap-3 py-10 px-8 text-center">
        {state === "success" && (
          <>
            <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1 animate-pop-in">
              <CheckIcon className="w-5 h-5 text-black" />
            </span>
            <p className="text-white text-sm font-semibold">Plan încărcat și validat</p>
            <p className="text-white/40 text-xs font-mono truncate max-w-xs">{name}</p>
            <button onClick={reset} className={RESET_LINK}>
              Remove &amp; upload another
            </button>
          </>
        )}

        {state === "uploading" && (
          <>
            <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            <p className="text-white/60 text-sm font-medium">Se încarcă planul...</p>
            <p className="text-white/25 text-xs font-mono truncate max-w-xs">{name}</p>
          </>
        )}

        {state === "error" && (
          <>
            <span className="w-10 h-10 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mb-1">
              <CloseIcon className="w-5 h-5 text-red-400" />
            </span>
            <p className="text-red-400 text-sm font-semibold">Eroare</p>
            <p className="text-red-400/60 text-xs max-w-xs">{error}</p>
            <button onClick={reset} className={RESET_LINK}>
              Încearcă din nou
            </button>
          </>
        )}

        {(state === "idle" || state === "dragover") && (
          <>
            <div
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                state === "dragover" ? "border-white bg-white" : "border-white/20 bg-transparent"
              }`}
            >
              <UploadIcon
                className={`w-4 h-4 transition-colors ${
                  state === "dragover" ? "text-black" : "text-white/30"
                }`}
              />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">
                {state === "dragover" ? "Drop to upload" : "Upload your university's studies plan"}
              </p>
              <p className="text-white/25 text-xs mt-1">DOCX · drag &amp; drop or click</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
