"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MEDIA } from "@/config/media";
import { MiniFrame } from "@/components/ui/MiniFrame";
import { Photo } from "@/components/ui/Photo";
import { useStore } from "@/lib/store";

const STEPS = [
  { title: "Подарите", text: "Рамка приходит готовой. Подключите её к домашнему интернету — и поставьте на комод." },
  { title: "Близкие присылают фото и голос", text: "С телефона, по ссылке-приглашению, без установки приложения. Фото сразу появляется на рамке, свет мягко пульсирует." },
  { title: "Касание — и ответ летит обратно", text: "Коснулась фото — слушает. Держит палец — записывает ответ голосом. Он приходит вам на телефон." },
];

function Wave({ bars = 16, color = "currentColor" }: { bars?: number; color?: string }) {
  return (
    <span className="flex h-4 flex-1 items-center gap-[2px]" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} className="w-[2px] rounded-full" style={{ height: `${30 + ((i * 37) % 70)}%`, background: color }} />
      ))}
    </span>
  );
}

/** Позиции элементов сцены (в % от сцены) для широкого экрана и телефона. */
const LAYOUT = {
  wide: {
    box: { left: 34, bottom: 16, width: 30 },
    frameIn: { left: 39, bottom: 20, width: 20 },
    frameUp: { left: 39, bottom: 46, width: 20 },
    frame: { left: 50, bottom: 16, width: 44 },
    phone: { left: 5, bottom: 12, width: 17 },
    flyFrom: { left: 9.5, top: 34, width: 7 },
    flyTo: { left: 60, top: 28, width: 24 },
  },
  narrow: {
    box: { left: 22, bottom: 14, width: 56 },
    frameIn: { left: 30, bottom: 18, width: 40 },
    frameUp: { left: 30, bottom: 44, width: 40 },
    frame: { left: 40, bottom: 12, width: 56 },
    phone: { left: 4, bottom: 34, width: 32 },
    flyFrom: { left: 10, top: 26, width: 14 },
    flyTo: { left: 52, top: 48, width: 30 },
  },
};

export function HowItWorks() {
  const mode = useStore((s) => s.mode);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const video = MEDIA.howVideo;

  useEffect(() => {
    if (!mode || video || !section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(stage);
    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 768px)", narrow: "(max-width: 767px)" }, (c) => {
      const L = c.conditions?.wide ? LAYOUT.wide : LAYOUT.narrow;
      const pct = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, `${v}%`]));
      const frame = q("[data-frame]")[0];
      const mini = frame.querySelector(".mini-frame") as HTMLElement;
      gsap.set(q("[data-box]"), { ...pct(L.box), opacity: 1, y: 0 });
      gsap.set(q("[data-lid]"), { y: 0, rotate: 0, opacity: 1 });
      gsap.set(frame, { ...pct(L.frameIn) });
      gsap.set(q("[data-phone]"), { ...pct(L.phone), xPercent: -130, opacity: 0 });
      gsap.set(q("[data-fly]"), { ...pct(L.flyFrom), opacity: 0, scale: 1 });
      gsap.set(q("[data-bubble]"), { opacity: 0, y: 12, scale: 0.9 });
      gsap.set(q("[data-photo-b], [data-touch], [data-rec]"), { opacity: 0 });
      gsap.set(q("[data-rec] circle"), { strokeDashoffset: 100 });
      gsap.set(q("[data-dot]"), { left: `${L.frame.left + L.frame.width * 0.45}%`, top: "52%", opacity: 0 });
      gsap.set(q("[data-final]"), { opacity: 0, y: 16 });
      gsap.set(mini, { "--glow-level": 0.15 });

      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      // 1. подарок: крышка, рамка поднимается и встаёт на стол
      tl.to(q("[data-lid]"), { y: "-160%", rotate: -14, opacity: 0, duration: 0.3 }, 0.05)
        .to(frame, { ...pct(L.frameUp), duration: 0.3 }, 0.25)
        .to(q("[data-box]"), { y: 60, opacity: 0, duration: 0.25 }, 0.55)
        .to(frame, { ...pct(L.frame), duration: 0.35 }, 0.6)
        .to(mini, { "--glow-level": 0.35, duration: 0.2 }, 0.8)
        // 2. телефон: фото и голосовое, фото летит на рамку
        .to(q("[data-phone]"), { xPercent: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, 1.05)
        .to(q("[data-bubble='photo']"), { opacity: 1, y: 0, scale: 1, duration: 0.15, ease: "back.out(2)" }, 1.3)
        .to(q("[data-bubble='voice']"), { opacity: 1, y: 0, scale: 1, duration: 0.15, ease: "back.out(2)" }, 1.45)
        .to(q("[data-fly]"), { opacity: 1, duration: 0.05 }, 1.6)
        .to(q("[data-fly]"), { left: `${L.flyTo.left}%`, width: `${L.flyTo.width}%`, duration: 0.4, ease: "power1.inOut" }, 1.62)
        .to(q("[data-fly]"), { keyframes: { top: [`${L.flyFrom.top}%`, `${Math.min(L.flyFrom.top, L.flyTo.top) - 18}%`, `${L.flyTo.top}%`] }, duration: 0.4, ease: "none" }, 1.62)
        .to(q("[data-photo-b]"), { opacity: 1, duration: 0.12 }, 1.98)
        .to(q("[data-fly]"), { opacity: 0, duration: 0.08 }, 2.0)
        .to(mini, { keyframes: { "--glow-level": [0.35, 1, 0.45, 0.9, 0.4] }, duration: 0.35, ease: "none" }, 2.0)
        // 3. касание: запись ответа — свет теплеет, ответ летит обратно
        .to(q("[data-touch]"), { opacity: 1, duration: 0.1 }, 2.45)
        .to(q("[data-rec]"), { opacity: 1, duration: 0.1 }, 2.5)
        .to(q("[data-rec] circle"), { strokeDashoffset: 0, duration: 0.45, ease: "none" }, 2.5)
        .to(mini, { "--glow-level": 1.25, duration: 0.45, ease: "none" }, 2.5)
        .to(frame, { "--glow-tint": 1, duration: 0.45, ease: "none" }, 2.5)
        .to(q("[data-touch], [data-rec]"), { opacity: 0, duration: 0.1 }, 2.98)
        .to(q("[data-dot]"), { opacity: 1, duration: 0.05, stagger: 0.04 }, 3.0)
        .to(q("[data-dot]"), { left: `${L.phone.left + L.phone.width * 0.5}%`, duration: 0.4, stagger: 0.04, ease: "power1.inOut" }, 3.0)
        .to(q("[data-dot]"), { keyframes: { top: ["52%", "26%", `${100 - L.phone.bottom - 18}%`] }, duration: 0.4, stagger: 0.04, ease: "none" }, 3.0)
        .to(q("[data-dot]"), { opacity: 0, duration: 0.06, stagger: 0.04 }, 3.4)
        .to(mini, { "--glow-level": 0.4, duration: 0.3 }, 3.1)
        .to(frame, { "--glow-tint": 0, duration: 0.3 }, 3.1)
        .to(q("[data-bubble='reply']"), { opacity: 1, y: 0, scale: 1, duration: 0.15, ease: "back.out(2)" }, 3.45)
        .to(q("[data-final]"), { opacity: 1, y: 0, duration: 0.2 }, 3.6)
        .to({}, { duration: 0.2 }, 3.8);

      const idx = (t: number) => (t < 1.0 ? 0 : t < 2.35 ? 1 : 2);
      let last = -1;
      tl.eventCallback("onUpdate", () => {
        const i = idx(tl.time());
        if (i !== last) setStep((last = i));
      });

      if (mode === "static") {
        tl.progress(1);
        return;
      }
      ScrollTrigger.create({ trigger: section.current, start: "top top", end: "bottom bottom", scrub: 0.8, animation: tl });
    });
    return () => mm.revert();
  }, [mode, video]);

  const pinned = mode !== "static" && !video;

  return (
    <section ref={section} id="how" data-theme="light" className={`relative bg-cream text-ink ${pinned ? "h-[360vh] md:h-[420vh]" : ""}`} aria-labelledby="how-title">
      <div className={pinned ? "sticky top-0 flex h-[100svh] flex-col overflow-hidden" : "py-24"}>
        <div className="wrap flex h-full flex-col gap-4 pt-20 pb-6 md:grid md:grid-cols-[0.8fr_1.6fr] md:items-center md:gap-10 md:py-0">
          <div>
            <p className="t-caption mb-4 text-muted md:mb-6">Как это работает</p>
            <h2 id="how-title" className="t-h2 max-md:!text-[30px]">
              Три шага. <span className="accent">Никаких</span> настроек для бабушки.
            </h2>
            <ol className="mt-5 grid gap-1 md:mt-10 md:gap-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className={`border-l-2 py-1 pl-4 transition-all duration-500 md:py-2 md:pl-5 ${i === step ? "border-glow" : "border-hairline"} ${i === step || !pinned ? "" : "max-md:hidden"}`}>
                  <p className={`text-[17px] font-semibold tracking-[-0.02em] transition-colors md:text-[20px] ${i === step ? "text-ink" : "text-ink/35"}`}>
                    <span className="mr-2 text-[13px] tabular-nums text-muted">0{i + 1}</span>
                    {s.title}
                  </p>
                  <p className={`mt-1 overflow-hidden text-[15px] leading-[1.5] text-ink/65 transition-all duration-500 ${i === step ? "max-h-40 opacity-100" : "max-h-0 opacity-0 md:max-h-0"}`}>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div ref={stage} className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] bg-[radial-gradient(80%_70%_at_60%_55%,#fffdf9,#efe7db)] md:h-[74svh] md:flex-none" aria-hidden>
            {video ? (
              <video src={video} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-x-0 bottom-0 h-[16%] bg-[linear-gradient(180deg,#e2d4c2,#d6c5b0)]" />
                {/* коробка */}
                <div data-box className="absolute z-20 aspect-[1.55]">
                  <div className="absolute inset-0 rounded-[10px] border border-[#e0d4c4] bg-[linear-gradient(180deg,#fffdf9,#efe6d9)] shadow-[0_20px_30px_-24px_rgba(34,26,21,0.5)]">
                    <div className="absolute inset-y-0 left-1/2 w-[13%] -translate-x-1/2 bg-oak/70" />
                    <p className="t-caption absolute bottom-[10%] left-[8%] !text-[10px] text-muted">Для мамы</p>
                  </div>
                  <div data-lid className="absolute -top-[14%] -left-[4%] h-[20%] w-[108%] origin-bottom-left rounded-[10px] border border-[#e0d4c4] bg-[linear-gradient(180deg,#fffdf9,#ece2d4)]">
                    <div className="absolute inset-y-0 left-1/2 w-[12%] -translate-x-1/2 bg-oak/70" />
                  </div>
                </div>
                {/* рамка */}
                <div data-frame className="absolute z-10" style={{ ["--glow-tint" as string]: 0 }}>
                  <MiniFrame
                    wood="#E6D3B3"
                    photo={0}
                    glow={0.15}
                    screen={
                      <>
                        <div data-photo-b className="absolute inset-0">
                          <Photo index={1} className="size-full object-cover" />
                        </div>
                        <div className="pointer-events-none">
                        <span data-touch className="absolute left-1/2 top-1/2 size-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 shadow-[0_0_0_6px_rgba(255,255,255,0.25)]" />
                        <svg data-rec viewBox="0 0 40 40" className="absolute left-1/2 top-1/2 w-[30%] -translate-x-1/2 -translate-y-1/2 -rotate-90">
                          <circle cx="20" cy="20" r="16" fill="none" stroke="#ff8a3c" strokeWidth="2.5" pathLength="100" strokeDasharray="100" strokeLinecap="round" />
                        </svg>
                        </div>
                      </>
                    }
                  />
                </div>
                {/* телефон */}
                <div data-phone className="absolute z-30 aspect-[9/19] rounded-[14%/7%] bg-ink p-[3%] shadow-[0_30px_50px_-30px_rgba(34,26,21,0.55)]">
                  <div className="flex size-full flex-col overflow-hidden rounded-[12%/6%] bg-paper text-[clamp(7px,0.75vw,11px)]">
                    <div className="mx-auto mt-[5%] h-[3.5%] w-[34%] rounded-full bg-ink" />
                    <div className="flex items-center gap-[6%] border-b border-hairline px-[7%] py-[6%]">
                      <span className="grid size-[1.9em] place-items-center rounded-full bg-oak/30 font-semibold">М</span>
                      <span className="font-semibold">Маме</span>
                    </div>
                    <div className="flex flex-1 flex-col justify-end gap-[4%] p-[7%]">
                      <div data-bubble="photo" className="ml-auto w-[80%] overflow-hidden rounded-[10px] rounded-br-[3px]">
                        <Photo index={1} className="aspect-[4/3] w-full object-cover" />
                      </div>
                      <div data-bubble="voice" className="ml-auto flex w-[86%] items-center gap-[6%] rounded-[10px] rounded-br-[3px] bg-ink px-[7%] py-[6%] text-cream">
                        <span className="size-0 border-y-[0.35em] border-l-[0.55em] border-y-transparent border-l-cream" />
                        <Wave />
                      </div>
                      <div data-bubble="reply" className="flex w-[92%] items-center gap-[6%] rounded-[10px] rounded-bl-[3px] border border-[#f0c89a] bg-white px-[7%] py-[6%]">
                        <span className="size-0 border-y-[0.35em] border-l-[0.55em] border-y-transparent border-l-ink" />
                        <Wave bars={12} color="#c77a3a" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* фото в полёте и ответ, летящий обратно */}
                <div data-fly className="absolute z-40 overflow-hidden rounded-[6px] shadow-[0_18px_30px_-12px_rgba(34,26,21,0.5)]">
                  <Photo index={1} className="aspect-[4/3] w-full object-cover" />
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} data-dot className="absolute z-40 size-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow shadow-[0_0_14px_4px_rgba(255,179,92,0.7)]" />
                ))}
                <p data-final className="absolute left-[5%] top-[6%] z-40 max-w-[60%] text-[15px] font-semibold tracking-[-0.01em] text-ink md:text-[18px]">
                  Без приложения для бабушки. <span className="text-muted">Без паролей и смартфона.</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
