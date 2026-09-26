"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MEDIA } from "@/config/media";
import { SIZES, SPECIES, PRICE_NOTE, formatPrice, getPrice, type Size } from "@/config/pricing";
import { MiniFrame } from "@/components/ui/MiniFrame";
import { useStore } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { track } from "@/lib/analytics";
import { Heading } from "./Heading";

const PHOTOS = [MEDIA.web.grandparents, MEDIA.web.couple, MEDIA.web.mom, MEDIA.web.beach];

/** Три рамки разных размеров на полке и панель «Параметры» — как редактор шаблонов. */
export function Variants() {
  const species = useStore((s) => s.species);
  const size = useStore((s) => s.size);
  const setSpecies = useStore((s) => s.setSpecies);
  const setSize = useStore((s) => s.setSize);
  const [photo, setPhoto] = useState(0);
  const price = getPrice(size, species);
  const priceEl = useRef<HTMLSpanElement>(null);
  const shown = useRef({ v: price });
  const root = useRef<HTMLElement>(null);
  const color = SPECIES.find((s) => s.id === species)!.color;

  // цена «досчитывается» до новой
  useEffect(() => {
    const t = gsap.to(shown.current, {
      v: price,
      duration: 0.8,
      ease: "power3.out",
      onUpdate: () => {
        if (priceEl.current) priceEl.current.textContent = formatPrice(Math.round(shown.current.v / 100) * 100);
      },
    });
    return () => {
      t.kill();
    };
  }, [price]);

  useEffect(() => {
    if (!root.current || document.documentElement.classList.contains("no-motion")) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-var-frame]", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: "[data-var-stage]", start: "top 75%", once: true } });
      gsap.fromTo("[data-var-panel]", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", delay: 0.3, scrollTrigger: { trigger: "[data-var-stage]", start: "top 75%", once: true } });
    }, root);
    return () => ctx.revert();
  }, []);

  const pick = (s: Size) => {
    setSize(s);
    track("configurator", { size: s, source: "variants" });
  };

  return (
    <section ref={root} id="variants" className="px-4 py-20 md:py-32" aria-labelledby="variants-title">
      <Heading
        id="variants-title"
        title="Выберите свою"
        sub="Три породы дерева и три размера. Цельный массив, масло с воском — на ощупь тёплая, как мебель."
        cta={
          <a
            href="#preorder"
            className="pill pill-dark"
            onClick={(e) => {
              e.preventDefault();
              track("preorder_open", { source: "variants", size, species });
              scrollToId("preorder");
            }}
          >
            Предзаказать
          </a>
        }
      />
      <div data-var-stage className="relative mx-auto mt-14 grid max-w-[1180px] grid-cols-1 gap-6 md:mt-20 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div className="relative flex min-h-[300px] items-end justify-center gap-[3%] overflow-hidden rounded-[14px] bg-[#e7e6e0] px-[4%] pt-20 pb-[64px] md:min-h-[480px]">
          <div className="absolute inset-x-0 bottom-[56px] border-t border-dashed border-[#b9b8b1]" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 h-[56px] bg-[#dcdbd4]" aria-hidden />
          {SIZES.map((s) => {
            const sel = s.id === size;
            return (
              <button
                key={s.id}
                type="button"
                data-var-frame
                onClick={() => pick(s.id)}
                aria-pressed={sel}
                aria-label={`Рамка ${s.label}`}
                className="group relative shrink-0 transition-[width,opacity] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
                style={{ width: `${s.id * 2.75}%`, opacity: sel ? 1 : 0.62 }}
              >
                <MiniFrame wood={color} glow={sel ? 0.95 : 0.25} screen={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={PHOTOS[photo]} alt="" className="absolute inset-0 size-full object-cover" />
                } />
                <span className={`absolute -top-9 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[13px] whitespace-nowrap transition-all duration-500 ${sel ? "bg-[#141311] text-white" : "bg-white/70 text-[#141311]"}`}>
                  {s.label} · {s.outer}
                </span>
                {sel && (
                  <svg className="pointer-events-none absolute -inset-3 size-[calc(100%+24px)] overflow-visible" aria-hidden>
                    <rect x="0.5" y="0.5" width="99%" height="99%" rx="12" fill="none" stroke="#141311" strokeWidth="1" strokeDasharray="4 4" style={{ animation: "marching 1.2s linear infinite" }} />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <div data-var-panel className="min-w-0 rounded-[16px] bg-white p-5 shadow-[0_20px_60px_-30px_rgba(20,19,17,0.35)] md:p-6">
          <p className="text-[15px] font-medium">Параметры</p>
          <div className="mt-5 grid gap-5">
            <div>
              <p className="mb-2 text-[13px] text-[var(--muted-2)]">Порода</p>
              <div className="grid gap-2">
                {SPECIES.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => {
                      setSpecies(sp.id);
                      track("configurator", { species: sp.id, source: "variants" });
                    }}
                    aria-pressed={sp.id === species}
                    className={`flex items-center justify-between rounded-[10px] border px-3 py-2.5 text-[14px] transition-colors ${sp.id === species ? "border-[#141311]" : "border-[#e4e3dd] hover:border-[#bdbcb5]"}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="size-4 rounded-full ring-1 ring-black/10" style={{ background: sp.color }} />
                      {sp.name}
                    </span>
                    <span className="h-3 w-12 shrink rounded-full" style={{ background: sp.color }} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] text-[var(--muted-2)]">Размер экрана</p>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((s) => (
                  <button key={s.id} type="button" onClick={() => pick(s.id)} aria-pressed={s.id === size} className={`rounded-[10px] border py-2 text-[14px] transition-colors ${s.id === size ? "border-[#141311] bg-[#141311] text-white" : "border-[#e4e3dd] hover:border-[#bdbcb5]"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] text-[var(--muted-2)]">Фото на рамке</p>
              <div className="grid grid-cols-4 gap-2">
                {PHOTOS.map((p, i) => (
                  <button key={p} type="button" onClick={() => setPhoto(i)} aria-label={`Фото ${i + 1}`} aria-pressed={i === photo} className={`aspect-square overflow-hidden rounded-[8px] ring-offset-2 transition ${i === photo ? "ring-2 ring-[#141311]" : "opacity-70 hover:opacity-100"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end justify-between border-t border-[#ecebe6] pt-4">
              <span className="text-[13px] text-[var(--muted-2)]">{PRICE_NOTE}</span>
              <span ref={priceEl} className="text-[26px] font-semibold tracking-[-0.02em] tabular-nums">
                {formatPrice(price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
