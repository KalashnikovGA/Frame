"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MiniFrame } from "@/components/ui/MiniFrame";
import { useStore } from "@/lib/store";
import { track } from "@/lib/analytics";

const HOLD_MS = 900;

/**
 * Две рамки в разных городах. Держите нижний край левой —
 * дуга тёплого света летит через экран, и под правой рамкой загорается свет.
 */
export function ThinkOfYou() {
  const reduced = useStore((s) => s.reducedMotion);
  const stage = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const halo = useRef<SVGCircleElement>(null);
  const hold = useRef<gsap.core.Tween | null>(null);
  const glow = useRef({ left: 0.25, right: 0.12, charge: 0 });
  const [charge, setCharge] = useState(0);
  const [sent, setSent] = useState(0);
  const busy = useRef(false);

  const paint = useCallback(() => {
    left.current?.querySelector<HTMLElement>(".mini-frame")?.style.setProperty("--glow-level", String(glow.current.left));
    right.current?.querySelector<HTMLElement>(".mini-frame")?.style.setProperty("--glow-level", String(glow.current.right));
  }, []);

  // дуга между нижними краями рамок
  const layout = useCallback(() => {
    const s = stage.current?.getBoundingClientRect();
    const a = left.current?.getBoundingClientRect();
    const b = right.current?.getBoundingClientRect();
    if (!s || !a || !b || !path.current || !trail.current) return;
    const x1 = a.left + a.width / 2 - s.left;
    const y1 = a.bottom - s.top + 6;
    const x2 = b.left + b.width / 2 - s.left;
    const y2 = b.bottom - s.top + 6;
    const vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
    const d = vertical
      ? `M ${x1} ${y1} C ${x1 + s.width * 0.55} ${y1 + 40}, ${x2 + s.width * 0.55} ${y2 - 120}, ${x2} ${y2}`
      : `M ${x1} ${y1} C ${x1 + 60} ${y1 - s.height * 0.75}, ${x2 - 60} ${y2 - s.height * 0.75}, ${x2} ${y2}`;
    path.current.setAttribute("d", d);
    trail.current.setAttribute("d", d);
  }, []);

  useEffect(() => {
    layout();
    paint();
    const ro = new ResizeObserver(layout);
    if (stage.current) ro.observe(stage.current);
    return () => ro.disconnect();
  }, [layout, paint]);

  const fire = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    track("think_of_you");
    const p = path.current!;
    const len = p.getTotalLength();
    const pos = { t: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false;
      },
    });
    gsap.set(trail.current, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len, opacity: 1 });
    gsap.set([dot.current, halo.current], { opacity: 1 });
    tl.to(glow.current, { left: 1, duration: 0.25, onUpdate: paint })
      .to(
        pos,
        {
          t: 1,
          duration: reduced ? 0.01 : 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            const pt = p.getPointAtLength(pos.t * len);
            dot.current?.setAttribute("cx", String(pt.x));
            dot.current?.setAttribute("cy", String(pt.y));
            halo.current?.setAttribute("cx", String(pt.x));
            halo.current?.setAttribute("cy", String(pt.y));
            if (trail.current) trail.current.style.strokeDashoffset = String(len * (1 - pos.t));
          },
        },
        0.1,
      )
      .to(glow.current, { left: 0.25, duration: 1.2, onUpdate: paint }, 0.4)
      .to([dot.current, halo.current], { opacity: 0, duration: 0.3 }, ">-0.1")
      .to(glow.current, { right: 1.25, duration: 0.35, ease: "power2.out", onUpdate: paint, onStart: () => setSent((n) => n + 1) }, "<")
      .to(trail.current, { opacity: 0, duration: 1.2 }, "<")
      .to(glow.current, { right: 0.55, duration: 3.5, ease: "power2.out", onUpdate: paint });
  }, [paint, reduced]);

  const start = () => {
    if (busy.current) return;
    hold.current?.kill();
    const c = glow.current;
    hold.current = gsap.to(c, {
      charge: 1,
      duration: (HOLD_MS / 1000) * (1 - c.charge),
      ease: "none",
      onUpdate: () => setCharge(c.charge),
      onComplete: () => {
        c.charge = 0;
        setCharge(0);
        fire();
      },
    });
  };

  const stop = () => {
    const c = glow.current;
    if (c.charge <= 0) return;
    hold.current?.kill();
    hold.current = gsap.to(c, { charge: 0, duration: 0.35, ease: "power2.out", onUpdate: () => setCharge(c.charge) });
  };

  return (
    <section id="think" data-theme="dark" className="relative overflow-hidden bg-stage-2 py-24 md:py-36" aria-labelledby="think-title">
      <div className="wrap">
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div>
            <p className="t-caption mb-6 text-cream/50">Думаю о тебе</p>
            <h2 id="think-title" className="t-h1 max-w-[14ch]">
              Коснитесь — и у мамы <span className="accent">загорится</span> свет
            </h2>
          </div>
          <p className="t-body text-cream/65 md:pb-3">
            Без слов и звонков — просто знак, что о ней подумали. Касание нижнего края рамки, и за тысячу километров под её рамкой мягко вспыхивает свет.
          </p>
        </div>

        <div ref={stage} className="relative mt-14 grid gap-4 md:mt-20 md:grid-cols-2 md:gap-5">
          {[
            { city: "Москва", who: "Вы", ref: left, photo: 1, wood: "#C49A6C", interactive: true },
            { city: "Екатеринбург", who: "Мама", ref: right, photo: 0, wood: "#E6D3B3", interactive: false },
          ].map((r) => (
            <div
              key={r.city}
              className="card relative flex min-h-[380px] flex-col justify-between overflow-hidden bg-[radial-gradient(90%_60%_at_50%_100%,rgba(255,179,92,0.07),transparent),linear-gradient(180deg,#241c17,#1a1411)] p-6 md:min-h-[520px] md:p-8"
            >
              <div className="flex items-baseline justify-between">
                <p className="t-caption text-cream/70">{r.city}</p>
                <p className="text-[13px] text-cream/55">{r.who}</p>
              </div>
              <div className="relative mx-auto w-[62%] max-w-[300px] pb-10">
                <div ref={r.ref}>
                  <MiniFrame wood={r.wood} photo={r.photo} glow={r.interactive ? 0.25 : 0.12} dim={r.interactive ? 1 : 0.92} />
                </div>
                {r.interactive && (
                  <button
                    type="button"
                    className="absolute inset-x-[4%] bottom-[calc(2.5rem-14px)] z-10 h-[46px] cursor-pointer touch-none select-none rounded-[14px]"
                    style={{ WebkitTouchCallout: "none" }}
                    aria-label="Удерживайте, чтобы сказать «думаю о тебе»"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                      start();
                    }}
                    onPointerUp={stop}
                    onPointerCancel={stop}
                    onLostPointerCapture={stop}
                    onContextMenu={(e) => e.preventDefault()}
                    onKeyDown={(e) => {
                      if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                        e.preventDefault();
                        start();
                      }
                    }}
                    onKeyUp={(e) => {
                      if (e.key === " " || e.key === "Enter") stop();
                    }}
                  >
                    <span className="absolute inset-x-[20%] top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full origin-left rounded-full bg-glow" style={{ transform: `scaleX(${charge})`, boxShadow: "0 0 12px var(--glow)" }} />
                    </span>
                  </button>
                )}
              </div>
              <p className="text-center text-[14px] text-cream/50" aria-live="polite">
                {r.interactive
                  ? charge > 0
                    ? "Держите…"
                    : "Удерживайте нижний край рамки"
                  : sent > 0
                    ? "Мама видит: о ней подумали"
                    : "Ждёт весточки"}
              </p>
            </div>
          ))}

          <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
            <defs>
              <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <path ref={path} fill="none" stroke="none" />
            <path ref={trail} fill="none" stroke="var(--glow)" strokeWidth="2" strokeLinecap="round" opacity="0" style={{ filter: "drop-shadow(0 0 6px var(--glow))" }} />
            <circle ref={halo} r="18" fill="var(--glow)" opacity="0" filter="url(#soft)" />
            <circle ref={dot} r="5" fill="#fff3e0" opacity="0" />
          </svg>
        </div>
      </div>
    </section>
  );
}
