import { WindowFrame } from "./WindowFrame";

const MESSAGES = [
  { role: "user", text: "Update the number of credit hours to 6." },
  {
    role: "ai",
    text: "⚠️ Rule violation: courses in category C3 are capped at 5 credits. I can set it to 5 — apply?",
  },
  { role: "user", text: "Yes, apply that." },
  { role: "ai", text: "✓ Applied. Sheet is now compliant with §4.2." },
];

/** Static illustration of a conversation with the AI editor. */
export function ChatPreview() {
  return (
    <WindowFrame title="AI Editing — discipline_sheet.docx">
      <div className="flex flex-col gap-3 p-4">
        {MESSAGES.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`px-3 py-1.5 rounded-lg max-w-[80%] leading-relaxed ${
                message.role === "user"
                  ? "bg-white/10 text-white/70"
                  : "bg-white/5 text-white/45 border border-white/8"
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <div className="mx-4 mb-4 flex gap-2">
        <div className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/20">
          Type a message…
        </div>
        <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-white/30">
          →
        </div>
      </div>
    </WindowFrame>
  );
}
