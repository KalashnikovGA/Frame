"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MEDIA } from "@/config/media";
import { Heading } from "./Heading";

const TILES = [
  { src: MEDIA.web.grandparents, name: "лёва-и-бабушка.jpg", who: "Маша" },
  { src: MEDIA.web.beach, name: "море-сочи.jpg", who: "Дима" },
  { src: MEDIA.web.mom, name: "мама-в-саду.jpg", who: "Лена" },
  { src: MEDIA.web.hike, name: "поход-с-дедом.jpg", who: "Саша" },
  { src: MEDIA.web.sofa, name: "новый-год.jpg", who: "Маша" },
  { src: MEDIA.web.couple, name: "мы-с-артёмом.jpg", who: "Катя" },
  { src: MEDIA.web.grandpa, name: "первый-зуб.jpg", who: "Дима" },
  { src: MEDIA.web.sunset, name: "закат.jpg", who: "Катя" },
];

/** «Фото приходят на рамку»: плитки сначала мерцают-заглушки, потом по одной проявляются фото. */
export function Arrive() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduce = document.documentElement.classList.contains("no-motion");
    const ctx = gsap.context(() => {
      const imgs = gsap.utils.toArray<HTMLElement>("[data-tile-img]");
      const metas = gsap.utils.toArray<HTMLElement>("[data-tile-meta]");
      if (reduce) return;
      gsap.set(imgs, { opacity: 0, scale: 1.08 });
      gsap.set(metas, { opacity: 0, y: 6 });
      gsap.set("[data-upload]", { opacity: 1 });
      gsap.set("[data-album]", { opacity: 0, y: 10 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-panel]", start: "top 70%", once: true } });
      tl.to("[data-upload]", { opacity: 0, y: -10, duration: 0.5 }, 0.6)
        .to(imgs, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", stagger: 0.18 }, 0.7)
        .to(metas, { opacity: 1, y: 0, duration: 0.4, stagger: 0.18 }, 0.9)
        .to("[data-album]", { opacity: 1, y: 0, duration: 0.6 }, 1.2);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="arrive" className="px-4 py-20 md:py-32" aria-labelledby="arrive-title">
      <Heading
        id="arrive-title"
        title="Присылайте фото — рамка покажет"
        sub="Фото и голосовые приходят с телефона по ссылке-приглашению. На рамке сразу видно, кто и когда прислал. Никаких приложений у бабушки."
      />
      <div data-panel className="relative mx-auto mt-14 max-w-[980px] rounded-[14px] border border-dashed border-[#b9b8b1] bg-[#e9e8e2] p-3 md:mt-20 md:p-5">
        <div className="mb-3 flex items-center gap-2 px-1 text-[14px] text-[var(--muted-2)] md:mb-4">
          <svg width="18" height="15" viewBox="0 0 26 22" aria-hidden>
            <rect x="1" y="1" width="24" height="17" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Семья Ивановых <span aria-hidden>›</span> Рамка бабушки <span aria-hidden>›</span> <span className="text-[#141311]">Альбом</span>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {TILES.map((t) => (
            <li key={t.name}>
              <div className="skeleton relative aspect-[4/3] overflow-hidden rounded-[8px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img data-tile-img src={t.src ?? ""} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 rounded-[6px] bg-[#f3f2ee] px-2.5 py-1.5 text-[12px] md:text-[13px]">
                <span className="truncate">{t.name}</span>
                <span data-tile-meta className="shrink-0 text-[var(--muted-2)]">
                  {t.who}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p data-upload className="f-serif pointer-events-none absolute inset-x-0 top-[46%] text-center text-[clamp(26px,3vw,40px)] opacity-0">
          Новые фото
        </p>
      </div>
      <p data-album className="f-serif mt-8 flex items-center justify-center gap-3 text-[clamp(26px,3vw,40px)]" style={{ opacity: 1 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2 L13.6 9 L20 10.5 L13.6 12 L12 19 L10.4 12 L4 10.5 L10.4 9 Z" fill="#141311" />
          <path d="M19 3 L19.6 5.4 L22 6 L19.6 6.6 L19 9 L18.4 6.6 L16 6 L18.4 5.4 Z" fill="#141311" />
        </svg>
        Альбом <span className="grad-text">для бабушки</span>
        <span className="text-[var(--muted-2)]">
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ animation: `dots 1.4s ${i * 0.2}s infinite` }}>
              .
            </span>
          ))}
        </span>
      </p>
    </section>
  );
}
