/**
 * Быстро меняющиеся значения, которые читаются каждый кадр (громкость голоса, указатель).
 * Живут вне React, чтобы не вызывать перерисовок.
 */
export const live = {
  /** Громкость голоса истории, 0…1, уже сглаженная. */
  voice: 0,
  /** Указатель мыши или наклон телефона, −1…1. */
  px: 0,
  py: 0,
};

let pointerBound = false;

export function bindPointer() {
  if (pointerBound || typeof window === "undefined") return;
  pointerBound = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      live.px = (e.clientX / window.innerWidth) * 2 - 1;
      live.py = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );
}

let tiltBound = false;

/** Наклон телефона. На iOS требует разрешения — вызывать из обработчика касания. */
export async function bindTilt() {
  if (tiltBound || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
  if (typeof DOE.requestPermission === "function") {
    try {
      if ((await DOE.requestPermission()) !== "granted") return;
    } catch {
      return;
    }
  }
  tiltBound = true;
  let base: number | null = null;
  window.addEventListener(
    "deviceorientation",
    (e) => {
      if (e.gamma == null || e.beta == null) return;
      if (base == null) base = e.beta;
      live.px = Math.max(-1, Math.min(1, e.gamma / 25));
      live.py = Math.max(-1, Math.min(1, (e.beta - base) / 25));
    },
    { passive: true },
  );
}
