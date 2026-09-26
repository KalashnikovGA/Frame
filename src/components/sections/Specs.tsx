"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SPECS } from "@/config/content";
import { useStore } from "@/lib/store";

const S = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Маленькие живые схемы к каждой характеристике. */
function Art({ id }: { id: string }) {
  switch (id) {
    case "wifi":
      return (
        <svg viewBox="0 0 80 60" className="h-full">
          <circle cx="40" cy="48" r="3.5" fill="var(--glow)" />
          {[14, 24, 34].map((r, i) => (
            <path key={r} d={`M${40 - r} ${48 - r * 0.62} A ${r} ${r} 0 0 1 ${40 + r} ${48 - r * 0.62}`} {...S} style={{ animation: `spec-wifi 2.4s ease-in-out ${i * 0.25}s infinite` }} />
          ))}
        </svg>
      );
    case "bt":
      return (
        <svg viewBox="0 0 80 60" className="h-full">
          <path d="M32 18 L48 34 L40 42 L40 10 L48 18 L32 34" {...S} opacity="0.55" />
          <path d="M22 50 L58 8" {...S} stroke="var(--glow)" strokeDasharray="56" style={{ animation: "spec-strike 3.2s ease-in-out infinite" }} />
        </svg>
      );
    case "screen":
      return (
        <svg viewBox="0 0 80 60" className="h-full">
          <defs>
            <linearGradient id="spec-photo" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f2c27b" />
              <stop offset="1" stopColor="#8a5a44" />
            </linearGradient>
            <clipPath id="spec-clip">
              <rect x="16" y="12" width="48" height="36" rx="2" />
            </clipPath>
          </defs>
          <rect x="12" y="8" width="56" height="44" rx="5" {...S} />
          <rect x="16" y="12" width="48" height="36" rx="2" fill="url(#spec-photo)" />
          <rect x="0" y="12" width="14" height="36" fill="#fff" opacity="0.35" clipPath="url(#spec-clip)" style={{ animation: "spec-shine 3.6s ease-in-out infinite" }} />
          <text x="40" y="34" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600">4:3</text>
        </svg>
      );
    case "speaker":
      return (
        <svg viewBox="0 0 80 60" className="h-full">
          <path d="M18 24 H26 L36 16 V44 L26 36 H18 Z" {...S} />
          {[0, 1, 2].map((i) => (
            <path key={i} d="M44 20 Q52 30 44 40" {...S} stroke="var(--glow)" style={{ transformOrigin: "36px 30px", animation: `spec-wave 1.8s ease-out ${i * 0.6}s infinite` }} />
          ))}
        </svg>
      );
    case "mic":
      return (
        <svg viewBox="0 0 80 60" className="h-full">
          <rect x="18" y="20" width="44" height="22" rx="11" {...S} />
          <circle cx="29" cy="31" r="7" fill="currentColor" style={{ animation: "spec-toggle 4s ease-in-out infinite" }} />
          <text x="40" y="54" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.6" letterSpacing="1">ВКЛ · ВЫКЛ</text>
        </svg>
      );
    case "camera":
      return (
        <svg viewBox="0 0 80 60" className="h-full">
          <circle cx="40" cy="30" r="14" {...S} opacity="0.55" />
          <circle cx="40" cy="30" r="5" {...S} opacity="0.55" />
          <path d="M22 50 L58 10" {...S} stroke="var(--glow)" strokeDasharray="56" style={{ animation: "spec-strike 3.2s ease-in-out 0.6s infinite" }} />
        </svg>
      );
    case "light":
      return (
        <svg viewBox="0 0 80 60" className="h-full">
          <rect x="14" y="14" width="52" height="28" rx="4" {...S} opacity="0.55" />
          <ellipse cx="40" cy="47" rx="30" ry="6" fill="var(--glow)" style={{ filter: "blur(4px)", animation: "spec-glow 2.6s ease-in-out infinite" }} />
          <rect x="20" y="42" width="40" height="3" rx="1.5" fill="#ffd9a6" />
        </svg>
      );
    case "sensor":
      return (
        <svg viewBox="0 0 80 60" className="h-full">
          <g style={{ animation: "spec-day 6s ease-in-out infinite" }}>
            <circle cx="40" cy="30" r="9" {...S} />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <path key={i} d={`M${40 + Math.cos(a) * 14} ${30 + Math.sin(a) * 14} L${40 + Math.cos(a) * 18} ${30 + Math.sin(a) * 18}`} {...S} />;
            })}
          </g>
          <path d="M46 18 A13 13 0 1 0 50 40 A10 10 0 1 1 46 18 Z" {...S} stroke="var(--glow)" style={{ animation: "spec-night 6s ease-in-out infinite" }} />
        </svg>
      );
    case "power":
      return (
        <svg viewBox="0 0 80 60" className="h-full">
          <rect x="50" y="22" width="18" height="16" rx="4" {...S} opacity="0.55" />
          <g style={{ animation: "spec-plug 3s ease-in-out infinite" }}>
            <path d="M8 30 H24" {...S} />
            <rect x="24" y="24" width="20" height="12" rx="3" {...S} />
            <rect x="44" y="27" width="8" height="6" rx="2" fill="currentColor" />
          </g>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 80 60" className="h-full">
          {[0, 1, 2].map((i) => (
            <rect key={i} x={24 + i * 4} y={16 - i * 3} width="30" height="24" rx="2" fill={["#8a5a44", "#c99c78", "#f2c27b"][i]} style={{ transformOrigin: "40px 50px", animation: `spec-fan 3.4s ease-in-out ${i * 0.15}s infinite` }} />
          ))}
        </svg>
      );
  }
}

export function Specs() {
  const mode = useStore((s) => s.mode);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mode || mode === "static" || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from("[data-spec]", {
        y: 40,
        opacity: 0.2,
        duration: 0.9,
        ease: "power3.out",
        stagger: { each: 0.07, grid: "auto", from: "start" },
        scrollTrigger: { trigger: "[data-spec-grid]", start: "top 80%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [mode]);

  return (
    <section ref={root} id="specs" data-theme="light" className="bg-cream py-24 text-ink md:py-36" aria-labelledby="specs-title">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p className="t-caption mb-6 text-muted">Характеристики</p>
            <h2 id="specs-title" className="t-h2 max-w-[16ch]">
              Всё, что нужно. <span className="accent">Ничего</span> лишнего.
            </h2>
          </div>
          <p className="t-body text-ink/65">Только Wi‑Fi — без Bluetooth, пультов и приложений для бабушки. Без камеры. Микрофоны выключаются настоящим переключателем.</p>
        </div>

        <ul data-spec-grid className="mt-14 grid grid-cols-1 overflow-hidden rounded-[28px] border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-5" style={{ gap: 1 }}>
          {SPECS.map((s) => (
            <li key={s.id} data-spec className="flex flex-col bg-paper p-6 md:p-7">
              <div className="h-14 text-ink/80" aria-hidden>
                <Art id={s.id} />
              </div>
              <p className="t-caption mt-6 text-muted">{s.key}</p>
              <p className="mt-2 text-[26px] font-semibold leading-[1.1] tracking-[-0.03em]">{s.value}</p>
              <p className="mt-3 text-[15px] leading-[1.5] text-ink/65">{s.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[13px] text-muted">Характеристики предварительные и могут уточниться к началу производства.</p>
      </div>
    </section>
  );
}
