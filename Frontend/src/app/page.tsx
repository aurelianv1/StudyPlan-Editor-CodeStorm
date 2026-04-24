"use client";

import { useState, useRef } from "react";
import { Upload, FileCheck, AlertCircle, Loader2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";

export default function Home() {
  const { setPlanUploaded, setPlanId, setPlanMetadata } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      toast.error("Te rugăm să încarci un fișier PDF sau o imagine.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-plan`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setPlanUploaded(true);
      setPlanId(data.id);
      setPlanMetadata(data.metadata);

      toast.success("Planul de învățământ a fost procesat cu succes!");
    } catch (error) {
      setPlanUploaded(true);
      setPlanId("plan_test_2026");
      toast.info("Mod Simulare: Planul a fost acceptat de frontend.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
          ACADEMIC AI
        </h1>
        <p className="text-zinc-500 text-lg max-w-md mx-auto">
          Sistem inteligent pentru analiza și managementul planurilor de învățământ.
        </p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`w-full max-w-2xl h-80 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center space-y-6 cursor-pointer transition-all duration-300 ${isUploading
          ? "border-purple-500 bg-purple-500/5 animate-pulse"
          : "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/40"
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,image/*"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <p className="text-zinc-400 font-medium">Analizăm documentul...</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-800 shadow-2xl">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">Încarcă Planul</p>
              <p className="text-sm text-zinc-500 mt-2">Trage fișierul aici sau dă click</p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-8 pt-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-600">
          <FileCheck size={16} className="text-emerald-500" />
          OCR Engine v3
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-600">
          <AlertCircle size={16} className="text-purple-500" />
          LLM Analysis
        </div>
      </div>
    </div>
  );
}