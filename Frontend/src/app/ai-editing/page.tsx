"use client";

import { useState, useRef, useEffect } from "react";

const BASE_URL = "http://localhost:8000";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Section = {
  id: string;
  title: string;
  content: string;
};

const DEFAULT_SECTIONS: Section[] = [
  { id: "1", title: "Date despre disciplină", content: "Structuri de Date, Conf. dr. Ion Popescu, Anul I, Semestrul 2, Examen, 5 credite" },
  { id: "2", title: "Obiectivele disciplinei", content: "Însușirea noțiunilor fundamentale privind structurile de date utilizate în informatică și a algoritmilor asociați acestora." },
  { id: "3", title: "Competențe profesionale", content: "CP2. Utilizează șabloane de proiectare de software, creează diagrama de proces.\nCP3. Analizează specificații software, definește arhitectura software." },
  { id: "4", title: "Conținutul disciplinei", content: "Liste liniare, Stive și cozi, Arbori binari și arbori de căutare, Grafuri și algoritmi de parcurgere, Algoritmi de sortare." },
  { id: "5", title: "Evaluare", content: "Examen final 60%, Activitate laborator 30%, Activitate de autoinstruire 10%" },
  { id: "6", title: "Bibliografie", content: "Knuth, D. E. (2011). The Art of Computer Programming.\nCormen, T. H. et al. (2009). Introduction to Algorithms.\nSedgewick, R. (2001). Algorithms in C." },
];

export default function AIEditingPage() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Bună! Sunt asistentul tău academic. Îți pot modifica orice secțiune din fișa de disciplină. Spune-mi ce vrei să schimbi!",
    },
  ]);
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: message };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    // Documentul curent ca string
    const documentText = sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");

    // Adaugă mesaj gol pentru assistant
    setChatHistory((prev) => [...prev, { role: "assistant", content: "" }]);

    let fullResponse = "";

    try {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
          document: documentText,
          plan_data: {
            credite: 5,
            tip_evaluare: "examen",
            competente_profesionale: [
              "CP1. Creează softuri, dezvoltă prototipul pentru software.",
              "CP2. Utilizează șabloane de proiectare de software.",
              "CP3. Analizează specificații software.",
            ],
          },
        }),
      });

      if (!response.ok) throw new Error("Eroare de la server.");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              if (data.text) {
                fullResponse += data.text;
                setChatHistory((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: fullResponse,
                  };
                  return updated;
                });
              }
            } catch {
              // ignore
            }
          }
        }
      }

      // După ce AI-ul a răspuns, actualizăm secțiunile din document
      updateDocumentFromResponse(fullResponse, message);

    } catch (err) {
      setChatHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `❌ Eroare: ${err instanceof Error ? err.message : "Eroare necunoscută"}`,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocumentFromResponse = (response: string, userPrompt: string) => {
    // Detectăm ce secțiune trebuie modificată bazat pe prompt-ul userului
    const promptLower = userPrompt.toLowerCase();
    const responseLower = response.toLowerCase();

    setSections((prev) => prev.map((section) => {
      const titleLower = section.title.toLowerCase();

      // Verificăm dacă prompt-ul sau răspunsul menționează această secțiune
      const isTargeted =
        promptLower.includes(titleLower) ||
        promptLower.includes("bibliograf") && titleLower.includes("bibliograf") ||
        promptLower.includes("obiectiv") && titleLower.includes("obiectiv") ||
        promptLower.includes("competent") && titleLower.includes("competent") ||
        promptLower.includes("evaluare") && titleLower.includes("evaluare") ||
        promptLower.includes("continut") && titleLower.includes("continut") ||
        promptLower.includes("conținut") && titleLower.includes("conținut");

      if (!isTargeted) return section;

      // Extragem conținutul relevant din răspunsul AI-ului
      // Căutăm după titlul secțiunii în răspuns
      const sectionPattern = new RegExp(
        `(?:${section.title}|##[^#]+)([\\s\\S]*?)(?=##|$)`,
        "i"
      );
      const match = response.match(sectionPattern);

      if (match && match[1]?.trim()) {
        setActiveSection(section.id);
        setTimeout(() => setActiveSection(null), 3000);
        return { ...section, content: match[1].trim() };
      }

      // Dacă nu găsim pattern specific, folosim tot răspunsul pentru secțiunea țintă
      setActiveSection(section.id);
      setTimeout(() => setActiveSection(null), 3000);
      return { ...section, content: response.replace(/^(Iată|Am modificat|Am actualizat)[^:]*:/i, "").trim() };
    }));
  };

  const exportDocument = async () => {
    try {
      const response = await fetch(`${BASE_URL}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });

      if (!response.ok) throw new Error("Export eșuat.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fisa_disciplinei_final.docx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }} />

      <div className="relative mx-auto max-w-7xl px-8 pt-8 pb-10 h-screen flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg">AI Copilot</h1>
            <p className="text-white/30 text-xs">Asistent academic inteligent</p>
          </div>
          <button
            onClick={exportDocument}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-400 transition-all active:scale-95"
          >
            📥 Export .docx
          </button>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">

          {/* Chat Panel */}
          <section className="w-96 flex flex-col rounded-2xl border border-white/10 bg-white/[.025] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-white/[.03]">
              <p className="text-white/60 text-xs">💬 Chat cu AI</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatHistory.map((chat, index) => (
                <div key={index} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${chat.role === "user"
                      ? "bg-white text-black rounded-tr-sm"
                      : "bg-white/5 border border-white/10 text-white/70 rounded-tl-sm"
                    }`}>
                    {chat.content || (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

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
                  placeholder="Ex: Adaugă referințe la Machine Learning în bibliografie..."
                  disabled={isLoading}
                  className="w-full rounded-xl border border-white/10 px-4 py-3 pr-12 text-sm text-white bg-white/5 placeholder:text-white/20 outline-none focus:ring-2 focus:ring-white/20 resize-none min-h-[72px] max-h-[160px] disabled:opacity-40"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all ${!message.trim() || isLoading
                      ? "bg-white/10 text-white/20 cursor-not-allowed"
                      : "bg-white text-black hover:bg-white/90 active:scale-95"
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-white/20 mt-2 text-center">Enter pentru a trimite · Shift+Enter pentru linie nouă</p>
            </div>
          </section>

          {/* Document Panel */}
          <section className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-white/[.025] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-white/[.03] flex items-center justify-between">
              <p className="text-white/60 text-xs">📄 Fișa Disciplinei — editată live de AI</p>
              <span className="text-[10px] text-white/25">Click pe secțiune pentru a edita manual</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`rounded-xl border p-4 transition-all duration-500 ${activeSection === section.id
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                      : "border-white/10 bg-white/[.02] hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                      {section.title}
                    </h3>
                    {activeSection === section.id && (
                      <span className="text-[10px] text-emerald-400 animate-pulse">✨ Modificat de AI</span>
                    )}
                  </div>
                  <textarea
                    value={section.content}
                    onChange={(e) => setSections((prev) =>
                      prev.map((s) => s.id === section.id ? { ...s, content: e.target.value } : s)
                    )}
                    className="w-full bg-transparent text-white/60 text-sm leading-relaxed resize-none outline-none min-h-[60px]"
                    rows={Math.max(2, section.content.split("\n").length)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}