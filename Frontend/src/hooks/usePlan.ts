"use client";

import { useSyncExternalStore } from "react";

import { planStore, type StoredPlan } from "@/lib/planStore";

/** The uploaded study plan, shared by every page. */
export function usePlan() {
  const plan = useSyncExternalStore(
    planStore.subscribe,
    planStore.getSnapshot,
    planStore.getServerSnapshot,
  );
  return {
    plan,
    setPlan: (value: StoredPlan) => planStore.set(value),
    clearPlan: () => planStore.set(null),
  };
}
