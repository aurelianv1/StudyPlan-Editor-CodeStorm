export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** O secțiune a Fișei Disciplinei, editabilă în AI Copilot. */
export interface DocumentSection {
  id: string;
  title: string;
  content: string;
}

export type DiffStatus = "unchanged" | "modified" | "new" | "missing";

/** O secțiune rezultată din compararea fișei vechi cu template-ul nou. */
export interface DiffSection extends DocumentSection {
  status: DiffStatus;
}

/** Datele extrase din Planul de Învățământ, folosite drept context pentru AI. */
export interface PlanData {
  credite?: number;
  tip_evaluare?: string;
  competente_profesionale?: string[];
}
