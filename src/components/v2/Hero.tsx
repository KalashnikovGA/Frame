"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MEDIA } from "@/config/media";
import { useStore } from "@/lib/store";
import { story } from "@/lib/story";
import { live } from "@/lib/live";
import { scrollToId } from "@/lib/scroll";
import { track } from "@/lib/analytics";

/** Область лиц на фото (в пикселях исходника 2000×1334) — вокруг неё рисуется пунктирная рамка. */
const FOCUS = { x: 850, y: 420, w: 440, h: 450, iw: 2000, ih: 1334, posX: 0.5, posY: 0.28 };

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const rect = useRef<SVGRectElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const status = useStore((s) => s.story);
  const caption = useStore((s) => s.caption);
  const playing = status === "playing";

  // рамка фокуса следует за лицами при любом размере экрана (object-fit: cover)
  useEffect(() => {
    const place = () => {
      const el = photo.current;
      const b = box.current;
      if (!el || !b) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const s = Math.max(w / FOCUS.iw, h / FOCUS.ih);
      const dx = (w - FOCUS.iw * s) * FOCUS.posX;
      const dy = (h - FOCUS.ih * s) * FOCUS.posY;
      b.style.left = `${dx + FOCUS.x * s}px`;
      b.style.top = `${dy + FOCUS.y * s}px`;
      b.style.width = `${FOCUS.w * s}px`;
      b.style.height = `${FOCUS.h * s}px`;
    };
    place();
    const ro = new ResizeObserver(place);
    if (photo.current) ro.observe(photo.current);
    return () => ro.disconnect();
  }, []);

  // появление и параллакс при прокрутке
  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduce = document.documentElement.classList.contains("no-motion");
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.fromTo("[data-hero-line] > span", { yPercent: 110 }, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.1 });
        gsap.fromTo("[data-hero-rest]", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.4 });
        gsap.fromTo(photo.current!.querySelector("img"), { scale: 1.12 }, { scale: 1, duration: 2.4, ease: "expo.out" });
        gsap.fromTo(rect.current, { strokeDashoffset: 400, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, duration: 1.4, delay: 0.9, ease: "power2.out" });
        gsap.fromTo("[data-hero-chip]", { y: 10, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: 1.5, ease: "back.out(2)" });
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
        tl.to(photo.current!.querySelector("img"), { scale: 1.1, yPercent: 6, ease: "none" }, 0).to(copy.current, { y: -80, opacity: 0, ease: "none" }, 0);
      } else gsap.set("[data-hero-rest]", { opacity: 1 });
    }, root);
    return () => ctx.revert();
  }, []);

  // рамка фокуса «слушает»: светится в такт голосу
  useEffect(() => {
    const tick = () => {
      const b = box.current;
      if (!b) return;
      const v = live.voice;
      b.style.boxShadow = v > 0.02 ? `0 0 ${20 + v * 60}px ${v * 12}px rgba(255,179,92,${0.15 + v * 0.45})` : "none";
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <section ref={root} id="top" className="relative h-[112svh] min-h-[760px] overflow-hidden bg-[#1c1612]" aria-label="Первый экран">
      <div ref={photo} className="absolute inset-x-0 bottom-0 top-[56svh] md:top-[48svh]">
        {MEDIA.web.hero && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={MEDIA.web.hero}
            alt="Внучка обнимает бабушку дома"
            className="absolute inset-0 size-full object-cover will-change-transform"
            style={{ objectPosition: `${FOCUS.posX * 100}% ${FOCUS.posY * 100}%` }}
            fetchPriority="high"
          />
        )}
        <div className="absolute inset-x-0 top-0 h-[38%] bg-[linear-gradient(180deg,#1c1612,rgba(28,22,18,0))]" />
        {/* пунктирная рамка фокуса */}
        <div ref={box} className="pointer-events-none absolute rounded-[10px] transition-shadow duration-150" aria-hidden>
          <svg className="absolute inset-0 size-full overflow-visible">
            <rect
              ref={rect}
              x="0.5"
              y="0.5"
              width="100%"
              height="100%"
              rx="10"
              fill="none"
              stroke={playing ? "#FFB35C" : "rgba(255,255,255,0.9)"}
              strokeWidth="1.2"
              strokeDasharray="4 4"
              style={{ animation: "marching 1.2s linear infinite", transition: "stroke .4s" }}
            />
          </svg>
          {[
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
          ].map(([x, y]) => (
            <span key={`${x}${y}`} className="absolute size-2 rounded-[2px] bg-white" style={{ left: `calc(${x * 100}% - 4px)`, top: `calc(${y * 100}% - 4px)` }} />
          ))}
          <div data-hero-chip className="absolute -top-4 left-4 flex items-center gap-2 rounded-full bg-white/90 py-1.5 pr-3 pl-2 text-[12px] font-medium text-[#141311] shadow-lg backdrop-blur md:text-[13px]">
            <span className="flex h-3.5 items-end gap-[2px]">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="w-[2px] origin-bottom rounded-full bg-[#E8913A]" style={{ height: "100%", animation: `eq ${0.7 + i * 0.15}s ease-in-out ${i * 0.1}s infinite`, animationPlayState: playing ? "running" : "paused", transform: playing ? undefined : "scaleY(0.4)" }} />
              ))}
            </span>
            {playing && caption ? caption.replace(/^[^:]+:\s*/, "") : "Голос бабушки · 0:25"}
          </div>
        </div>
      </div>

      <div ref={copy} className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-5 pt-[128px] text-center text-white md:pt-[160px]">
        <h1 className="v2-h1 !text-[clamp(40px,5.4vw,88px)]">
          <span data-hero-line className="block overflow-hidden pb-[0.08em]">
            <span className="inline-block">Выглядит как обычная рамка.</span>
          </span>
          <span data-hero-line className="block overflow-hidden pb-[0.08em]">
            <span className="inline-block">
              Пока не <em className="italic">заговорит</em>
            </span>
          </span>
        </h1>
        <p data-hero-rest className="v2-sub mt-5 max-w-[46ch] !text-white md:mt-6">
          Близкие присылают фото и голос с телефона. Мама, бабушка или любимый человек слушает и отвечает одним касанием.
        </p>
        <div data-hero-rest className="mt-7 flex flex-wrap items-center justify-center gap-2 md:mt-8">
          <a
            href="#preorder"
            className="pill bg-white text-[#141311] hover:bg-[#f2f0ea]"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("preorder");
              track("preorder_open", { source: "hero" });
            }}
          >
            Оформить предзаказ
          </a>
          <button type="button" className="pill pill-line text-white" onClick={() => story.toggle()} aria-pressed={playing}>
            {playing ? "Пауза" : status === "ended" ? "Послушать ещё раз" : "Послушать голос"}
            {playing ? (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <rect x="2" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" />
                <rect x="7.4" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path d="M3 1.8 L10 6 L3 10.2 Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {caption ?? ""}
        </p>
      </div>
    </section>
  );
}
