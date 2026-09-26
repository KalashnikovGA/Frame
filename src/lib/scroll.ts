"use client";
import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  lenis = l;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: "smooth" });
}
