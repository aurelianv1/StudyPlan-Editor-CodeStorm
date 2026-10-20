"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import { SendIcon } from "../icons";

interface ChatPanelProps {
  messages: ChatMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatPanel({ messages, draft, onDraftChange, onSend, isLoading }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canSend = draft.trim().length > 0 && !isLoading;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="w-96 flex flex-col rounded-2xl border border-white/10 bg-white/[.025] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/[.03]">
        <p className="text-white/60 text-xs">💬 Chat cu AI</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-white/[.03]">
        <div className="relative">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Ex: Adaugă referințe la Machine Learning în bibliografie..."
            disabled={isLoading}
            className="w-full rounded-xl border border-white/10 px-4 py-3 pr-12 text-sm text-white bg-white/5 placeholder:text-white/20 outline-none focus:ring-2 focus:ring-white/20 resize-none min-h-[72px] max-h-[160px] disabled:opacity-40"
          />
          <button
            onClick={onSend}
            disabled={!canSend}
            aria-label="Trimite mesajul"
            className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all ${
              canSend
                ? "bg-white text-black hover:bg-white/90 active:scale-95"
                : "bg-white/10 text-white/20 cursor-not-allowed"
            }`}
          >
            <SendIcon />
          </button>
        </div>
        <p className="text-[10px] text-white/20 mt-2 text-center">Enter pentru a trimite · Shift+Enter pentru linie nouă</p>
      </div>
    </section>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? "bg-white text-black rounded-tr-sm" : "bg-white/5 border border-white/10 text-white/70 rounded-tl-sm"
        }`}
      >
        {message.content || <TypingIndicator />}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5">
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
