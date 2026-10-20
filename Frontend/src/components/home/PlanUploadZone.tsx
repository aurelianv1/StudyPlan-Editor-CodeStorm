"use client";

import { useRef, useState } from "react";
import type { DragEvent, MouseEvent, ReactNode } from "react";
import { downloadBlob, generateSkeleton, getErrorMessage } from "@/lib/api";
import { CheckIcon, CloseIcon, UploadIcon } from "../icons";
import { Spinner } from "../layout";

type UploadState = "idle" | "dragover" | "uploading" | "success" | "error";

const SKELETON_FILENAME = "fisa_disciplinei_schelet.docx";

const ZONE_STYLES: Record<UploadState, string> = {
  idle: "border-white/10 hover:border-white/25 hover:bg-white/5 cursor-pointer",
  dragover: "border-white/60 bg-white/10 scale-[1.01] cursor-copy",
  uploading: "border-white/15 bg-white/[.03] cursor-wait",
  success: "border-white/30 bg-white/5 cursor-default",
  error: "border-red-500/30 bg-red-500/5 cursor-pointer",
};

/**
 * Zonă de upload pentru Planul de Învățământ. După încărcare, backend-ul
 * generează un schelet de Fișă a Disciplinei, care este descărcat automat.
 */
export function PlanUploadZone({ onUploaded }: { onUploaded: (file: File) => void }) {
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canSelectFile = state === "idle" || state === "dragover";

  const openFilePicker = () => {
    if (state === "idle") inputRef.current?.click();
  };

  const reset = (e?: MouseEvent) => {
    e?.stopPropagation();
    setState("idle");
    setFileName(null);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const upload = async (file: File) => {
    setFileName(file.name);
    setState("uploading");
    setErrorMsg(null);

    try {
      downloadBlob(await generateSkeleton(file), SKELETON_FILENAME);
      setState("success");
      onUploaded(file);
    } catch (err) {
      setState("error");
      setErrorMsg(getErrorMessage(err, "A apărut o eroare."));
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (state === "idle") setState("dragover");
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    if (state === "dragover") setState("idle");
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && canSelectFile) upload(file);
    else if (state === "dragover") setState("idle");
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && openFilePicker()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFilePicker}
      className={`relative w-full max-w-lg mx-auto rounded-xl border transition-all duration-300 select-none ${ZONE_STYLES[state]}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xlsx,.xls"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
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
            <p className="text-white/40 text-xs font-mono truncate max-w-xs">{fileName}</p>
            <ResetButton onClick={reset}>Remove &amp; upload another</ResetButton>
          </>
        )}

        {state === "uploading" && (
          <>
            <Spinner />
            <p className="text-white/60 text-sm font-medium">Se încarcă planul...</p>
            <p className="text-white/25 text-xs font-mono truncate max-w-xs">{fileName}</p>
          </>
        )}

        {state === "error" && (
          <>
            <span className="w-10 h-10 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mb-1">
              <CloseIcon className="w-5 h-5 text-red-400" />
            </span>
            <p className="text-red-400 text-sm font-semibold">Eroare</p>
            <p className="text-red-400/60 text-xs max-w-xs">{errorMsg}</p>
            <ResetButton onClick={reset}>Încearcă din nou</ResetButton>
          </>
        )}

        {canSelectFile && <IdleContent isDragOver={state === "dragover"} />}
      </div>
    </div>
  );
}

function IdleContent({ isDragOver }: { isDragOver: boolean }) {
  return (
    <>
      <div
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
          isDragOver ? "border-white bg-white" : "border-white/20 bg-transparent"
        }`}
      >
        <UploadIcon className={`w-4 h-4 transition-colors ${isDragOver ? "text-black" : "text-white/30"}`} />
      </div>
      <div>
        <p className="text-white/80 text-sm font-medium">
          {isDragOver ? "Drop to upload" : "Upload your university's studies plan"}
        </p>
        <p className="text-white/25 text-xs mt-1">PDF, DOC, DOCX, XLSX · drag &amp; drop or click</p>
      </div>
    </>
  );
}

function ResetButton({ onClick, children }: { onClick: (e: MouseEvent) => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-white/25 hover:text-white/60 transition-colors underline underline-offset-2 mt-1"
    >
      {children}
    </button>
  );
}
