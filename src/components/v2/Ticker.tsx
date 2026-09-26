"use client";
import { useEffect, useState } from "react";

const PHRASES = ["Голос внука", "Фото с дачи", "«Бабушка, я сдал!»", "Первое слово", "Колыбельную", "Рецепт пирога", "«Мам, я дома»", "Снимок УЗИ", "Песню под гитару", "Просто «люблю»"];

/** Строка «что присылают близким»: крупная фраза плавно сменяется каждые пару секунд. */
export function Ticker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (document.documentElement.classList.contains("no-motion")) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % PHRASES.length), 2200);
    return () => window.clearInterval(t);
  }, []);
  return (
    <section className="py-20 md:py-28" aria-label="Что присылают близким">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-5 text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-[var(--muted-2)]">Что присылают близким</p>
        <div className="relative h-[1.25em] w-full text-[clamp(34px,4.4vw,64px)]">
          {PHRASES.map((p, k) => (
            <span
              key={p}
              className="f-serif absolute inset-x-0 top-0 transition-all duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)]"
              style={{ opacity: k === i ? 1 : 0, filter: k === i ? "blur(0)" : "blur(12px)", transform: k === i ? "none" : `translateY(${k === (i + PHRASES.length - 1) % PHRASES.length ? "-30%" : "30%"})` }}
              aria-hidden={k !== i}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
