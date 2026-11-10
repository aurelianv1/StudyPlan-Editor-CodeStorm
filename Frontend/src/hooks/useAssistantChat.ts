"use client";

import { useState } from "react";

import { errorMessage, streamChat } from "@/lib/api";
import type { ChatMessage, PlanData } from "@/lib/types";

/** A chat bubble. Greetings and errors are shown but never sent to the model. */
export interface UiMessage extends ChatMessage {
  kind?: "greeting" | "error";
}

const GREETING: UiMessage = {
  role: "assistant",
  kind: "greeting",
  content:
    "Bună! Sunt asistentul tău academic. Îți pot modifica orice secțiune din fișa de disciplină. Spune-mi ce vrei să schimbi!",
};

/** How many past messages accompany a question, to keep requests small. */
const HISTORY_LIMIT = 20;

interface ChatContext {
  document: string;
  planData: PlanData | null;
}

export function useAssistantChat() {
  const [messages, setMessages] = useState<UiMessage[]>([GREETING]);
  const [isLoading, setIsLoading] = useState(false);

  const replaceLast = (message: UiMessage) =>
    setMessages((previous) => [...previous.slice(0, -1), message]);

  /** Send a question; resolves with the full answer, or null if it failed. */
  const send = async (content: string, context: ChatContext): Promise<string | null> => {
    const history: ChatMessage[] = [
      ...messages.filter((message) => !message.kind && message.content),
      { role: "user" as const, content },
    ]
      .slice(-HISTORY_LIMIT)
      .map(({ role, content }) => ({ role, content }));

    // The empty assistant bubble renders as a typing indicator.
    setMessages((previous) => [
      ...previous,
      { role: "user", content },
      { role: "assistant", content: "" },
    ]);
    setIsLoading(true);

    let answer = "";
    try {
      await streamChat(
        { messages: history, document: context.document, plan_data: context.planData },
        (text) => {
          answer += text;
          replaceLast({ role: "assistant", content: answer });
        },
      );
      if (!answer) throw new Error("Asistentul nu a trimis niciun răspuns.");
      return answer;
    } catch (error) {
      replaceLast({
        role: "assistant",
        kind: "error",
        content: `❌ Eroare: ${errorMessage(error)}`,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => setMessages([GREETING]);

  return { messages, isLoading, send, reset };
}
