"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "@/lib/store";

const CLAIMS = [
  { a: "Голоса настоящих людей,", b: "а не робота." },
  { a: "Каждая история сохраняется —", b: "семейный архив её голосом." },
  { a: "Без камеры.", b: "Микрофон отключается переключателем." },
];

export function Voice() {
  const mode = useStore((s) => s.mode);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mode || mode === "static" || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-claim]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0.12, y: 30 },
          { opacity: 1, y: 0, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", end: "top 55%", scrub: 0.6 } },
        );
      });
    }, root);
    return () => ctx.revert();
  }, [mode]);

  return (
    <section ref={root} id="voice" data-theme="light" className="bg-cream py-24 text-ink md:py-40" aria-labelledby="voice-title">
      <div className="wrap">
        <p id="voice-title" className="t-caption mb-10 text-muted md:mb-16">
          Голос, а не ИИ
        </p>
        <ul>
          {CLAIMS.map((c) => (
            <li key={c.a} data-claim className="border-t border-hairline py-8 md:py-12">
              <p className="t-h1 max-w-[20ch]">
                {c.a} <span className="text-muted">{c.b}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
