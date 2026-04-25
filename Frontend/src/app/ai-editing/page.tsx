"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

export default function AIEditingPage() {
    const { isPlanUploaded } = useAppContext();
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { role: "assistant", content: "Bună! Sunt asistentul tău academic. Cum te pot ajuta cu analiza planului de învățământ astăzi?" }
    ]);

    const handleSendMessage = () => {
        if (!message.trim()) return;

        const newUserMessage = { role: "user", content: message };
        setChatHistory((prev) => [...prev, newUserMessage]);
        setMessage("");

        setTimeout(() => {
            setChatHistory((prev) => [...prev, {
                role: "assistant",
                content: "Aceasta este o simulare a răspunsului AI. Când backend-ul va fi gata, aici va apărea analiza reală bazată pe documentele tale."
            }]);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans relative overflow-hidden">
            {/* Background decorations */}
            <div aria-hidden className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
                    backgroundSize: "80px 80px",
                }} />
            <div aria-hidden className="pointer-events-none absolute top-0 right-0 w-1/2 h-full"
                style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,.04) 0%, transparent 65%)" }} />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 grid grid-cols-2 gap-0.5">
                        <span className="bg-white rounded-[1px]" />
                        <span className="bg-white/40 rounded-[1px]" />
                        <span className="bg-white/40 rounded-[1px]" />
                        <span className="bg-white rounded-[1px]" />
                    </span>
                    <span className="text-white text-sm font-semibold tracking-tight">
                        StudyPlan <span className="text-white/30 font-normal">Editor</span>
                    </span>
                </div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-[10px] text-white/40 tracking-widest uppercase">
                    <span className={`w-1.5 h-1.5 rounded-full ${isPlanUploaded ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
                    {isPlanUploaded ? "Plan Loaded" : "No Plan"}
                </span>
            </header>

            <div className="relative mx-auto max-w-7xl px-8 pt-20 pb-10 h-screen flex gap-6">
                
                {/* ── Chat Panel ───────────────────────────────────────── */}
                <section className="w-96 flex flex-col rounded-2xl border border-white/10 bg-white/[.025] backdrop-blur-sm overflow-hidden">
                    {/* Chat Header */}
                    <div className="px-5 py-4 border-b border-white/10 bg-white/[.03] flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                        </span>
                        <div>
                            <p className="text-white text-sm font-semibold">AI Assistant</p>
                            <p className="text-white/30 text-[10px]">Trained on your study plan rules</p>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`flex gap-3 ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                                    chat.role === "user"
                                        ? "bg-white text-black rounded-tr-sm"
                                        : "bg-white/5 border border-white/10 text-white/70 rounded-tl-sm"
                                }`}>
                                    {chat.role === "assistant" && (
                                        <div className="flex items-center gap-1.5 mb-1.5 opacity-60">
                                            <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                </svg>
                                            </span>
                                            <span className="text-[9px] uppercase tracking-widest font-semibold">AI</span>
                                        </div>
                                    )}
                                    {chat.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-white/10 bg-white/[.03]">
                        <div className="relative">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Ask about compliance, credits, or structure..."
                                disabled={!isPlanUploaded}
                                className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm text-white bg-white/5 placeholder:text-white/20 outline-none transition-all focus:ring-2 focus:ring-white/20 focus:border-white/30 resize-none min-h-[72px] max-h-[160px] disabled:opacity-40 disabled:cursor-not-allowed ${
                                    "border-white/10"
                                }`}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!message.trim() || !isPlanUploaded}
                                className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all duration-200 ${
                                    !message.trim() || !isPlanUploaded
                                        ? "bg-white/10 text-white/20 cursor-not-allowed"
                                        : "bg-white text-black hover:bg-white/90 active:scale-95"
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                        {!isPlanUploaded && (
                            <p className="text-[10px] text-white/25 mt-2 text-center">
                                Upload a study plan first to enable AI assistance
                            </p>
                        )}
                    </div>
                </section>

                {/* ── Document Preview Panel ─────────────────────────── */}
                <section className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-white/[.025] backdrop-blur-sm overflow-hidden">
                    {/* Preview Header */}
                    <div className="px-5 py-4 border-b border-white/10 bg-white/[.03] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </span>
                            <div>
                                <p className="text-white text-sm font-semibold">Document Preview</p>
                                <p className="text-white/30 text-[10px]">Live view of your discipline sheet</p>
                            </div>
                        </div>
                        {isPlanUploaded && (
                            <span className="text-[10px] text-white/30 font-mono">discipline_sheet.docx</span>
                        )}
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 p-8 overflow-y-auto flex justify-center"
                        style={{
                            backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                        }}>
                        <div className="w-full max-w-3xl rounded-xl border border-white/10 bg-white/[.02] shadow-2xl">
                            {!isPlanUploaded ? (
                                <div className="flex flex-col items-center justify-center h-[600px] text-center gap-4">
                                    <span className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                                        <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </span>
                                    <div>
                                        <p className="text-white/60 text-sm font-medium">No document loaded</p>
                                        <p className="text-white/25 text-xs mt-1">Upload a study plan from the home page to preview discipline sheets here</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-10 space-y-6">
                                    {/* Skeleton preview of a discipline sheet */}
                                    <div className="space-y-4">
                                        <div className="h-7 w-3/4 bg-white/10 rounded animate-pulse" />
                                        <div className="h-4 w-full bg-white/5 rounded" />
                                        <div className="h-4 w-5/6 bg-white/5 rounded" />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        {[
                                            { label: "Credits", value: "5 ECTS" },
                                            { label: "Category", value: "C3 — Core" },
                                            { label: "Semester", value: "2" },
                                            { label: "Year", value: "3" },
                                        ].map((item) => (
                                            <div key={item.label} className="p-3 rounded-lg border border-white/10 bg-white/[.03]">
                                                <p className="text-[10px] uppercase tracking-widest text-white/25">{item.label}</p>
                                                <p className="text-white/70 text-sm font-medium mt-1">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <p className="text-white/25 text-xs uppercase tracking-widest">Learning Outcomes</p>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex gap-3">
                                                <span className="text-white/20 text-[10px] font-mono mt-0.5">{i}.</span>
                                                <div className="flex-1 space-y-1">
                                                    <div className="h-3 w-full bg-white/5 rounded" />
                                                    <div className="h-3 w-4/5 bg-white/5 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-white/10">
                                        <p className="text-white/25 text-xs uppercase tracking-widest mb-3">Assessment Methods</p>
                                        <div className="flex gap-6">
                                            {["Written Exam 40%", "Project 35%", "Participation 25%"].map((item) => (
                                                <span key={item} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer divider */}
            <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-[10px] text-white/15 tracking-wider bg-[#0a0a0a]/80 backdrop-blur-sm">
                StudyPlan Editor · AI Editing Module
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