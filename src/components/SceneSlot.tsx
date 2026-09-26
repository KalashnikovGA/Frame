"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import type { SceneCtl } from "@/three/ctl";

const FrameScene = dynamic(() => import("@/three/FrameScene"), { ssr: false });

type Props = {
  ctl: SceneCtl;
  /** что показать без WebGL / при reduced motion */
  fallback: ReactNode;
  interactive?: boolean;
  /** грузить сразу (первый экран), а не при подлёте к секции */
  eager?: boolean;
  className?: string;
};

/* Один общий наблюдатель за прокруткой: работает и внутри чужих iframe, где IntersectionObserver игнорирует отступы. */
type Watch = { el: HTMLElement; cb: (near: boolean, visible: boolean) => void };
const watches = new Set<Watch>();
let raf = 0;
function check() {
  raf = 0;
  const vh = window.innerHeight;
  for (const w of watches) {
    const r = w.el.getBoundingClientRect();
    w.cb(r.bottom > -vh * 0.75 && r.top < vh * 1.75, r.bottom > 0 && r.top < vh);
  }
}
function schedule() {
  if (!raf) raf = requestAnimationFrame(check);
}
function watch(w: Watch) {
  if (!watches.size) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  watches.add(w);
  schedule();
  return () => {
    watches.delete(w);
    if (!watches.size) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    }
  };
}

/**
 * Место под 3D-сцену. Сцена создаётся при подлёте к экрану и удаляется, когда секция далеко, —
 * одновременно живут не больше двух-трёх WebGL-контекстов, что важно для телефонов.
 */
export function SceneSlot({ ctl, fallback, interactive, eager, className = "" }: Props) {
  const mode = useStore((s) => s.mode);
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(!eager);

  // первый экран: 3D после загрузки страницы, в свободное время главного потока
  useEffect(() => {
    if (!eager) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    let t = 0;
    const go = () => {
      t = w.requestIdleCallback ? w.requestIdleCallback(() => setAllowed(true), { timeout: 1200 }) : window.setTimeout(() => setAllowed(true), 200);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.clearTimeout(t);
  }, [eager]);

  useEffect(() => {
    if (!mode || mode === "static" || !ref.current || !allowed) return;
    let unmountTimer = 0;
    return watch({
      el: ref.current,
      cb: (near, visible) => {
        setActive(visible);
        if (near) {
          window.clearTimeout(unmountTimer);
          unmountTimer = 0;
          setMounted(true);
        } else if (!unmountTimer) {
          unmountTimer = window.setTimeout(() => {
            setMounted(false);
            setReady(false);
          }, 1200);
        }
      },
    });
  }, [mode, allowed]);

  if (mode === "static") return <div className={className}>{fallback}</div>;

  return (
    <div ref={ref} className={className}>
      <div className="scene-placeholder absolute inset-0" aria-hidden />
      {mode && mounted && (
        <div className="absolute inset-0 transition-opacity duration-700 ease-out" style={{ opacity: ready ? 1 : 0 }}>
          <FrameScene ctl={ctl} quality={mode === "full" ? "full" : "lite"} active={active} interactive={interactive} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
