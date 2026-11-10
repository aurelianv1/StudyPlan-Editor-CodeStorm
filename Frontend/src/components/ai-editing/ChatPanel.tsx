"use client";

import { useEffect, useRef, useState } from "react";

import type { UiMessage } from "@/hooks/useAssistantChat";
import { formatAssistantText } from "@/lib/sectionEdits";

interface ChatPanelProps {
  messages: UiMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5" aria-label="Asistentul scrie">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export function ChatPanel({ messages, isLoading, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const canSend = Boolean(draft.trim()) && !isLoading;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    if (!canSend) return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <section className="w-96 flex flex-col rounded-2xl border border-white/10 bg-white/[.025] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/[.03]">
        <p className="text-white/60 text-xs">💬 Chat cu AI</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-white text-black rounded-tr-sm"
                    : "bg-white/5 border border-white/10 text-white/70 rounded-tl-sm"
                }`}
              >
                {message.content ? (
                  isUser ? message.content : formatAssistantText(message.content)
                ) : (
                  <TypingIndicator />
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-white/[.03]">
        <div className="relative">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Ex: Adaugă referințe la Machine Learning în bibliografie..."
            aria-label="Mesaj pentru asistent"
            disabled={isLoading}
            className="w-full rounded-xl border border-white/10 px-4 py-3 pr-12 text-sm text-white bg-white/5 placeholder:text-white/20 outline-none focus:ring-2 focus:ring-white/20 resize-none min-h-[72px] max-h-[160px] disabled:opacity-40"
          />
          <button
            onClick={submit}
            disabled={!canSend}
            aria-label="Trimite"
            className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all ${
              canSend
                ? "bg-white text-black hover:bg-white/90 active:scale-95"
                : "bg-white/10 text-white/20 cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-white/20 mt-2 text-center">
          Enter pentru a trimite · Shift+Enter pentru linie nouă
        </p>
      </div>
    </section>
  );
}
