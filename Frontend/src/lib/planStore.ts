import type { PlanData } from "./types";

/** The study plan uploaded on the home page, kept across pages and reloads. */
export interface StoredPlan {
  fileName: string;
  uploadedAt: string;
  data: PlanData;
}

const STORAGE_KEY = "studyplan.plan.v1";
const listeners = new Set<() => void>();

// useSyncExternalStore needs getSnapshot to return the same object until the
// stored value changes, so the parsed plan is cached by its raw string.
let cachedRaw: string | null = null;
let cachedPlan: StoredPlan | null = null;

function parse(raw: string | null): StoredPlan | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value.fileName === "string" && value.data ? value : null;
  } catch {
    return null;
  }
}

function read(): StoredPlan | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // storage unavailable (private mode, blocked cookies): behave as empty
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedPlan = parse(raw);
  }
  return cachedPlan;
}

export const planStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  },

  getSnapshot: read,

  /** Nothing is known while rendering on the server. */
  getServerSnapshot: (): StoredPlan | null => null,

  set(plan: StoredPlan | null): void {
    try {
      if (plan) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // keep the value in memory for this tab if it cannot be persisted
      cachedRaw = plan ? JSON.stringify(plan) : null;
      cachedPlan = plan;
    }
    listeners.forEach((listener) => listener());
  },
};
