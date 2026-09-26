"use client";
import { useStore, type Mode } from "./store";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Определяет, что умеет устройство, и выбирает режим сцены. Вызывается один раз на клиенте. */
export function detectCapabilities() {
  const q = new URLSearchParams(window.location.search);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowEnd = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 3;

  let mode: Mode = !hasWebGL() || reducedMotion ? "static" : mobile || lowEnd ? "lite" : "full";
  const forced = q.get("mode");
  if (forced === "static" || forced === "lite" || forced === "full") mode = forced;

  document.documentElement.dataset.mode = mode;
  useStore.setState({ mode, reducedMotion: reducedMotion || mode === "static", mobile });
  return mode;
}
