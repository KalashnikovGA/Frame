"use client";

export type Goal = "listen" | "configurator" | "preorder_open" | "preorder_submit" | "think_of_you";

declare global {
  interface Window {
    ym?: (id: number, action: string, goal?: string, params?: Record<string, unknown>) => void;
  }
}

const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID || 0);
const sent = new Set<string>();

/** Цель в Яндекс Метрике. once — отправить не больше одного раза за визит. */
export function track(goal: Goal, params?: Record<string, unknown>, once = false) {
  if (once) {
    if (sent.has(goal)) return;
    sent.add(goal);
  }
  if (!YM_ID || typeof window === "undefined" || !window.ym) return;
  window.ym(YM_ID, "reachGoal", goal, params);
}
