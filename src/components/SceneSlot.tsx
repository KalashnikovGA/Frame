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

/**
 * Место под 3D-сцену: ленивая загрузка при приближении к экрану,
 * пауза рендера вне экрана, постер вместо сцены на слабых устройствах.
 */
export function SceneSlot({ ctl, fallback, interactive, eager, className = "" }: Props) {
  const mode = useStore((s) => s.mode);
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mode || mode === "static" || !ref.current) return;
    const el = ref.current;
    let idle = 0;
    if (eager) {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      idle = w.requestIdleCallback ? w.requestIdleCallback(() => setMounted(true), { timeout: 600 }) : window.setTimeout(() => setMounted(true), 120);
    }
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: "120% 0px" });
    const vis = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "10% 0px" });
    near.observe(el);
    vis.observe(el);
    return () => {
      near.disconnect();
      vis.disconnect();
      window.clearTimeout(idle);
    };
  }, [mode, eager]);

  if (mode === "static") return <div className={className}>{fallback}</div>;

  return (
    <div ref={ref} className={className}>
      <div className="scene-placeholder absolute inset-0" aria-hidden />
      {mode && mounted && (
        <div className="absolute inset-0 transition-opacity duration-[1600ms] ease-out" style={{ opacity: ready ? 1 : 0 }}>
          <FrameScene ctl={ctl} quality={mode === "full" ? "full" : "lite"} active={active} interactive={interactive} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
