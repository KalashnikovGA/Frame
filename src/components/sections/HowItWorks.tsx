"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MiniFrame } from "@/components/ui/MiniFrame";
import { Photo } from "@/components/ui/Photo";
import { useStore } from "@/lib/store";

/** Телефон, нарисованный в коде. */
function Phone({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative aspect-[9/19] rounded-[34px] bg-ink p-[7px] shadow-[0_30px_60px_-30px_rgba(34,26,21,0.45)] ${className}`}>
      <div className="relative flex size-full flex-col overflow-hidden rounded-[28px] bg-paper">
        <div className="mx-auto mt-2 h-[18px] w-[34%] rounded-full bg-ink" />
        {children}
      </div>
    </div>
  );
}

function Wave({ bars = 18, color = "var(--ink)", animated = true }: { bars?: number; color?: string; animated?: boolean }) {
  return (
    <div className="flex h-5 items-center gap-[2px]" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-[2.5px] rounded-full"
          style={{
            height: `${30 + ((i * 37) % 70)}%`,
            background: color,
            animation: animated ? `bars ${0.9 + (i % 5) * 0.13}s ease-in-out ${i * 0.05}s infinite` : undefined,
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

function GiftVisual() {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-[380px] items-end justify-center pb-6">
      <div className="relative w-[78%]">
        {/* рамка выглядывает из коробки */}
        <div className="absolute inset-x-[10%] -top-[46%]">
          <MiniFrame wood="#E6D3B3" glow={0.5} photo={0} />
        </div>
        {/* коробка */}
        <div className="relative z-10 aspect-[1.55] rounded-[14px] border border-hairline bg-[linear-gradient(180deg,#fffdf9,#f1e9dd)]">
          <div className="absolute inset-y-0 left-1/2 w-[14%] -translate-x-1/2 bg-oak/70" />
          <p className="t-caption absolute bottom-4 left-5 text-[10px] text-muted">Для мамы</p>
        </div>
        {/* крышка */}
        <div
          className="absolute -top-[40%] left-[-4%] z-20 h-[22%] w-[108%] rounded-[12px] border border-hairline bg-[linear-gradient(180deg,#fffdf9,#efe6d9)]"
          style={{ animation: "lid 4.5s ease-in-out infinite" }}
        >
          <div className="absolute inset-y-0 left-1/2 w-[13%] -translate-x-1/2 bg-oak/70" />
        </div>
      </div>
    </div>
  );
}

function SendVisual() {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-[420px] items-center justify-between gap-4 px-2">
      <Phone className="w-[44%] shrink-0">
        <div className="flex items-center gap-2 border-b border-hairline px-3 py-2.5">
          <span className="grid size-6 place-items-center rounded-full bg-oak/30 text-[10px] font-semibold text-ink">М</span>
          <span className="text-[11px] font-semibold text-ink">Маме</span>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-2 p-2.5">
          <div className="ml-auto w-[80%] overflow-hidden rounded-[12px] rounded-br-[4px]">
            <Photo index={0} className="aspect-[4/3] w-full object-cover" />
          </div>
          <div className="ml-auto flex w-[86%] items-center gap-2 rounded-[12px] rounded-br-[4px] bg-ink px-2.5 py-2">
            <span className="size-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-cream" />
            <Wave bars={14} color="var(--cream)" />
          </div>
        </div>
      </Phone>
      {/* карточка летит к рамке */}
      <div
        className="absolute left-[18%] top-[48%] w-[22%] overflow-hidden rounded-[8px] shadow-lg"
        style={{ ["--fx" as string]: "170%", ["--fy" as string]: "-10%", animation: "fly 4s cubic-bezier(.5,0,.2,1) infinite" }}
        aria-hidden
      >
        <Photo index={0} className="aspect-[4/3] w-full object-cover" />
      </div>
      <div className="w-[48%]" style={{ animation: "land 4s linear infinite" }}>
        <MiniFrame wood="#C49A6C" photo={0} glow={0.2} style={{ opacity: 1 }} />
      </div>
    </div>
  );
}

function ReplyVisual() {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-[420px] items-center justify-between gap-4 px-2">
      <div className="w-[48%]" style={{ animation: "breathe 2.4s ease-in-out infinite" }}>
        <MiniFrame wood="#5C3B28" photo={0} />
        <p className="t-caption mt-9 text-center text-[10px] text-muted">Палец на фото</p>
      </div>
      <svg className="absolute left-[30%] top-[18%] h-[40%] w-[42%]" viewBox="0 0 200 100" fill="none" aria-hidden>
        <path
          d="M5 80 C 50 -10, 150 -10, 195 60"
          stroke="var(--glow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 8"
          style={{ strokeDashoffset: 400, animation: "wave 3.2s ease-in-out infinite" }}
        />
      </svg>
      <Phone className="w-[40%] shrink-0">
        <div className="flex flex-1 flex-col justify-end gap-2 p-2.5">
          <p className="text-center text-[9px] text-muted">сейчас</p>
          <div className="flex w-[92%] items-center gap-2 rounded-[12px] rounded-bl-[4px] border border-hairline bg-white px-2.5 py-2" style={{ animation: "ping 3.2s ease-in-out infinite" }}>
            <span className="size-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-ink" />
            <Wave bars={11} />
          </div>
          <p className="px-1 text-[9px] font-medium text-ink">Мама ответила голосом</p>
        </div>
      </Phone>
    </div>
  );
}

const CARDS = [
  {
    n: "01",
    title: "Подарите",
    text: "Рамка приходит готовой. Подключите её к домашнему интернету — и поставьте на комод.",
    Visual: GiftVisual,
  },
  {
    n: "02",
    title: "Семья присылает фото и голос с телефона",
    text: "По ссылке-приглашению, без установки приложения. Дети, внуки — все сразу.",
    Visual: SendVisual,
  },
  {
    n: "03",
    title: "Бабушка слушает и отвечает касанием",
    text: "Коснулась фото — слушает. Держит палец — записывает ответ. Он приходит вам на телефон.",
    Visual: ReplyVisual,
  },
];

export function HowItWorks() {
  const mode = useStore((s) => s.mode);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mode || mode === "static" || !section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const el = track.current!;
      gsap.to(el, {
        x: () => -(el.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
    });
    mm.add("(max-width: 1023px)", () => {
      gsap.utils.toArray<HTMLElement>("[data-card]").forEach((c) =>
        gsap.from(c, { opacity: 0, y: 40, duration: 1, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 85%" } }),
      );
    });
    return () => mm.revert();
  }, [mode]);

  const horizontal = mode !== "static";

  return (
    <section
      ref={section}
      id="how"
      data-theme="light"
      className={`relative bg-cream text-ink ${horizontal ? "lg:h-[320vh]" : ""}`}
      aria-labelledby="how-title"
    >
      <div className={horizontal ? "lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center lg:overflow-hidden" : ""}>
        <div
          ref={track}
          className={
            horizontal
              ? "flex flex-col gap-6 px-[var(--gutter)] py-24 lg:flex-row lg:items-stretch lg:gap-8 lg:py-0 lg:pr-[12vw] lg:will-change-transform"
              : "wrap grid gap-6 py-24 md:py-36 lg:grid-cols-3"
          }
        >
          <div className={horizontal ? "flex shrink-0 flex-col justify-center lg:w-[34vw] lg:pr-10" : "mb-8 lg:col-span-3"}>
            <p className="t-caption mb-6 text-muted">Как это работает</p>
            <h2 id="how-title" className="t-h1">
              Три шага. <span className="accent">Никаких</span> настроек для бабушки.
            </h2>
            <p className="t-body mt-6 text-ink/70">Рамку настраиваете вы. Бабушке остаётся самое приятное — смотреть, слушать и отвечать.</p>
          </div>
          {CARDS.map(({ n, title, text, Visual }) => (
            <article key={n} data-card className={`card flex shrink-0 flex-col overflow-hidden bg-paper ${horizontal ? "lg:h-[76svh] lg:w-[40vw] lg:max-w-[620px]" : ""}`}>
              <div className={`relative h-[300px] flex-1 overflow-hidden bg-[radial-gradient(80%_70%_at_50%_60%,#fff,rgba(255,255,255,0))] px-6 pt-10 ${horizontal ? "lg:h-auto" : ""}`}>
                <Visual />
              </div>
              <div className="border-t border-hairline p-7 lg:p-9">
                <span className="t-caption text-muted">{n}</span>
                <h3 className="t-h3 mt-2 max-w-[18ch]">{title}</h3>
                <p className="mt-3 max-w-[44ch] text-[16px] leading-[1.55] text-ink/65">{text}</p>
              </div>
            </article>
          ))}
          <div className={horizontal ? "flex shrink-0 items-center lg:w-[30vw]" : "mt-6 lg:col-span-3"}>
            <p className={`t-h3 text-ink ${horizontal ? "max-w-[16ch] lg:pl-6" : ""}`}>
              Без приложения для бабушки. <span className="text-muted">Без паролей и смартфона.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
