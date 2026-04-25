"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanMetadata {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  institution?: string;
  academicYear?: string;
  faculty?: string;
  specialization?: string;
  [key: string]: unknown;
}

export interface AppState {
  isPlanUploaded: boolean;
  setPlanUploaded: (status: boolean) => void;
  planId: string | null;
  setPlanId: (id: string | null) => void;
  planMetadata: PlanMetadata | null;
  setPlanMetadata: (data: PlanMetadata | null) => void;
  resetPlan: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppState | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [isPlanUploaded, setPlanUploaded] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planMetadata, setPlanMetadata] = useState<PlanMetadata | null>(null);

  // Load state from localStorage on mount (optional persistence)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const stored = localStorage.getItem("studyplan_state");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isPlanUploaded) setPlanUploaded(parsed.isPlanUploaded);
        if (parsed.planId) setPlanId(parsed.planId);
        if (parsed.planMetadata) setPlanMetadata(parsed.planMetadata);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save state to localStorage on change (optional persistence)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem("studyplan_state", JSON.stringify({
        isPlanUploaded,
        planId,
        planMetadata,
      }));
    } catch {
      // Ignore quota errors
    }
  }, [isPlanUploaded, planId, planMetadata]);

  const resetPlan = () => {
    setPlanUploaded(false);
    setPlanId(null);
    setPlanMetadata(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("studyplan_state");
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AppState>(() => ({
    isPlanUploaded,
    setPlanUploaded,
    planId,
    setPlanId,
    planMetadata,
    setPlanMetadata,
    resetPlan,
  }), [isPlanUploaded, planId, planMetadata]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      
      {/* ── Debug Panel (Development Only) ───────────────────────────── */}
      {process.env.NODE_ENV === "development" && <DebugPanel />}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// ─── Debug Panel (Styled to Match App Aesthetic) ──────────────────────────────

function DebugPanel() {
  const { isPlanUploaded, planId, planMetadata, resetPlan } = useAppContext();
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 px-3 py-1.5 rounded-lg 
          border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md text-[10px] text-white/40 
          hover:text-white/70 hover:border-white/25 hover:bg-[#0a0a0a] transition-all"
        aria-label="Toggle debug panel"
      >
        <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="uppercase tracking-widest">Debug</span>
      </button>

      {/* Expanded Panel */}
      {expanded && (
        <div className="fixed bottom-14 right-4 z-[100] w-80 rounded-xl border border-white/10 
          bg-[#0a0a0a]/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 bg-white/[.03] flex items-center justify-between">
            <span className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">App State</span>
            <button
              onClick={() => setExpanded(false)}
              className="text-white/30 hover:text-white/60 transition-colors p-0.5"
              aria-label="Close debug panel"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 text-[10px] max-h-64 overflow-y-auto">
            {/* Plan Status */}
            <div>
              <p className="text-white/25 mb-1.5 uppercase tracking-wider">Plan Status</p>
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border ${
                isPlanUploaded 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-white/5 text-white/30 border-white/10"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPlanUploaded ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
                {isPlanUploaded ? "Uploaded" : "Not Uploaded"}
              </div>
            </div>

            {/* Plan ID */}
            <div>
              <p className="text-white/25 mb-1.5 uppercase tracking-wider">Plan ID</p>
              <p className={`font-mono truncate ${planId ? "text-white/60" : "text-white/20 italic"}`}>
                {planId || "null"}
              </p>
            </div>

            {/* Metadata */}
            <div>
              <p className="text-white/25 mb-1.5 uppercase tracking-wider">Metadata</p>
              {planMetadata ? (
                <div className="space-y-1.5">
                  {Object.entries(planMetadata).slice(0, 5).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-3">
                      <span className="text-white/30">{key}:</span>
                      <span className="text-white/60 font-mono text-right truncate max-w-[140px]">
                        {typeof value === "string" && value.length > 18 ? `${value.slice(0, 18)}…` : String(value)}
                      </span>
                    </div>
                  ))}
                  {Object.keys(planMetadata).length > 5 && (
                    <p className="text-white/20 italic">+{Object.keys(planMetadata).length - 5} more</p>
                  )}
                </div>
              ) : (
                <p className="text-white/20 italic">No metadata loaded</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 border-t border-white/10 bg-white/[.03] flex gap-2">
            <button
              onClick={() => {
                console.log("📋 AppContext State:", { isPlanUploaded, planId, planMetadata });
              }}
              className="flex-1 px-3 py-1.5 rounded border border-white/10 text-[10px] text-white/40 
                hover:text-white/70 hover:border-white/25 hover:bg-white/5 transition-all"
            >
              Log
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(JSON.stringify({ isPlanUploaded, planId, planMetadata }, null, 2));
              }}
              className="flex-1 px-3 py-1.5 rounded border border-white/10 text-[10px] text-white/40 
                hover:text-white/70 hover:border-white/25 hover:bg-white/5 transition-all"
            >
              Copy
            </button>
            <button
              onClick={resetPlan}
              className="flex-1 px-3 py-1.5 rounded border border-red-500/20 text-[10px] text-red-400/80 
                hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/5 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </>
  );
}