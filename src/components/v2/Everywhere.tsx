"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SPECS } from "@/config/content";
import { Heading } from "./Heading";

const TILES = [
  { k: "Wi‑Fi", d: "2,4 и 5 ГГц" },
  { k: "Bluetooth", d: "нет" },
  { k: "Камера", d: "нет" },
  { k: "USB‑C", d: "от сети" },
  { k: "4:3", d: "матовый экран" },
  { k: "2 микр.", d: "с переключателем" },
  { k: "3 Вт", d: "динамик" },
  { k: "2200 K", d: "янтарный свет" },
];
const FOR = ["Бабушке", "Дедушке", "Маме", "Папе", "Любимой", "Любимому", "Крёстной", "Другу в другом городе", "Себе"];

/** «Всё продумано»: плитки характеристик и бесконечные ленты. */
export function Everywhere() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!root.current || document.documentElement.classList.contains("no-motion")) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-tile]", { y: 40, opacity: 0, rotate: (i) => (i % 2 ? 4 : -4) }, { y: 0, opacity: 1, rotate: 0, duration: 0.9, ease: "back.out(1.6)", stagger: 0.06, scrollTrigger: { trigger: "[data-tiles]", start: "top 80%", once: true } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="specs" className="overflow-hidden py-20 md:py-32" aria-labelledby="specs-title">
      <div className="px-4">
        <Heading id="specs-title" title="Всё продумано. Ничего лишнего" sub="Только Wi‑Fi — без Bluetooth, пультов и приложений для бабушки. Без камеры. Микрофоны выключаются настоящим переключателем." />
      </div>
      <ul data-tiles className="mx-auto mt-14 grid max-w-[1120px] grid-cols-4 gap-3 px-4 md:mt-20 md:grid-cols-8 md:gap-4">
        {TILES.map((t) => (
          <li key={t.k} data-tile className="group relative flex aspect-[3/4] flex-col items-center justify-center rounded-[10px] bg-[#e2e1db] text-center transition-colors duration-300 hover:bg-[#141311] hover:text-white">
            <span className="text-[clamp(15px,1.6vw,22px)] font-medium tracking-[-0.02em]">{t.k}</span>
            <span className="mt-1 px-1 text-[11px] leading-tight text-[var(--muted-2)] transition-colors group-hover:text-white/70 md:text-[12px]">{t.d}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-3 md:mt-14 md:gap-4" aria-label="Кому подарить">
        {[FOR, [...SPECS.map((s) => `${s.key}: ${s.value}`)]].map((row, r) => (
          <div key={r} className="flex w-max gap-3 md:gap-4" style={{ animation: `marquee ${r ? 60 : 46}s linear infinite`, animationDirection: r ? "reverse" : "normal" }}>
            {[...row, ...row].map((x, i) => (
              <span key={i} className="flex h-[92px] w-[220px] shrink-0 flex-col justify-between rounded-[10px] bg-[#e2e1db] p-4 md:h-[120px] md:w-[260px]" aria-hidden={i >= row.length}>
                <span className="grid size-6 place-items-center rounded-full bg-[#d2d1ca] text-[14px]">{r ? "·" : "+"}</span>
                <span className="text-[16px] md:text-[18px]">{x}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-6 px-4 text-center text-[13px] text-[var(--muted-2)]">Характеристики предварительные и могут уточниться к началу производства.</p>
    </section>
  );
}
