"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MEDIA } from "@/config/media";
import { SceneSlot } from "@/components/SceneSlot";
import { MiniFrame } from "@/components/ui/MiniFrame";
import { useStore } from "@/lib/store";
import { useLightEngine, type LightMode } from "@/lib/lightEngine";
import { createCtl } from "@/three/ctl";

const STATES: { mode: LightMode; title: string; sub: string; chat: { who: string; text: string; tone?: "warm" } }[] = [
  {
    mode: "listen",
    title: "Коснитесь фото — слушайте",
    sub: "Одно касание, и звучит голос. Свет под рамкой дышит в такт словам.",
    chat: { who: "Маша", text: "Прислала голосовое · 0:25" },
  },
  {
    mode: "record",
    title: "Держите палец — отвечайте",
    sub: "Пока палец на фото, идёт запись. Свет разгорается теплее — видно, что вас слышат.",
    chat: { who: "Бабушка", text: "Записывает ответ…", tone: "warm" },
  },
  {
    mode: "think",
    title: "Край рамки — «думаю о тебе»",
    sub: "Касание нижнего края, и у близкого вспыхивает свет под рамкой. Без слов и звонков.",
    chat: { who: "Мама", text: "Думает о тебе", tone: "warm" },
  },
  {
    mode: "night",
    title: "Ночью — тихий свет",
    sub: "Экран гаснет сам, а свет остаётся мягким ночником, чтобы было видно дорогу.",
    chat: { who: "Рамка", text: "23:40 · ночной режим" },
  },
];

const FAMILY = [
  { name: "Маша", role: "внучка", img: MEDIA.web.grandparents },
  { name: "Дима", role: "сын", img: MEDIA.web.grandpa },
  { name: "Лена", role: "дочь", img: MEDIA.web.mom },
  { name: "Катя", role: "внучка", img: MEDIA.web.couple },
];

export function Showcase() {
  const mode = useStore((s) => s.mode);
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const ctl = useMemo(
    () => createCtl({ species: "oak", rotY: -0.28, camX: 0.6, camY: 1.25, camZ: 6.6, tgtX: 0, tgtY: 0.78, tgtZ: 0.2, pointer: 0.5, drift: 0.6, minAspect: 1.3, photo: 0 }),
    [],
  );
  const light = useLightEngine(ctl);

  useEffect(() => {
    light.setMode(STATES[active].mode);
  }, [active, light]);

  useEffect(() => {
    if (!mode || !section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const titles = gsap.utils.toArray<HTMLElement>("[data-sc-title]");
      const chats = gsap.utils.toArray<HTMLElement>("[data-sc-chat]");
      gsap.set(titles.slice(1), { opacity: 0, y: 30, filter: "blur(8px)" });
      gsap.set(chats.slice(1), { opacity: 0, y: 16 });
      if (mode === "static") return;
      const tl = gsap.timeline();
      STATES.forEach((_, i) => {
        if (i === 0) return;
        const at = i - 0.35;
        tl.to(titles[i - 1], { opacity: 0, y: -30, filter: "blur(8px)", duration: 0.35, ease: "power2.in" }, at)
          .to(titles[i], { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "power2.out" }, at + 0.3)
          .to(chats[i - 1], { opacity: 0, y: -12, duration: 0.25 }, at)
          .to(chats[i], { opacity: 1, y: 0, duration: 0.3 }, at + 0.35);
      });
      tl.to({}, { duration: 0.35 }, STATES.length - 0.35);
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        animation: tl,
        onUpdate: (st) => setActive(Math.min(STATES.length - 1, Math.floor(st.progress * STATES.length))),
      });
    }, section);
    return () => ctx.revert();
  }, [mode]);

  const pinned = mode !== "static";

  return (
    <section ref={section} id="showcase" className={pinned ? "relative h-[380vh] md:h-[440vh]" : "py-20"} aria-label="Касание и свет">
      <div className={pinned ? "sticky top-0 flex h-[100svh] flex-col px-4 pt-[104px] pb-4 md:pt-[124px] md:pb-6" : "px-4"}>
        <div className="relative mx-auto h-[170px] w-full max-w-[1000px] text-center md:h-[210px]">
          {STATES.map((s, i) => (
            <div key={s.title} data-sc-title className="absolute inset-x-0 top-0 flex flex-col items-center gap-3 md:gap-5">
              <h2 className="v2-h2">{s.title}</h2>
              <p className="v2-sub max-w-[56ch]">{s.sub}</p>
              <span className="sr-only">{`Шаг ${i + 1} из ${STATES.length}`}</span>
            </div>
          ))}
        </div>

        <div className="mx-auto grid min-h-0 w-full max-w-[1180px] flex-1 grid-cols-1 gap-3 rounded-[18px] bg-[#e2e1db] p-3 md:grid-cols-[230px_1fr]">
          <aside className="hidden flex-col gap-2 rounded-[12px] bg-[#ecebe6] p-4 md:flex" aria-label="Семья">
            <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.08em] text-[var(--muted-2)]">Семья</p>
            {FAMILY.map((f, i) => (
              <div key={f.name} className={`flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors duration-500 ${i === active % FAMILY.length ? "bg-white" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.img} alt="" className="size-9 rounded-full object-cover" />
                <span className="min-w-0">
                  <span className="block text-[15px] leading-tight">{f.name}</span>
                  <span className="text-[12px] text-[var(--muted-2)]">{f.role}</span>
                </span>
              </div>
            ))}
            <div className="mt-auto flex items-center gap-2 rounded-[10px] bg-white px-3 py-2.5 text-[13px]">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#E8913A] opacity-60" />
                <span className="relative size-2 rounded-full bg-[#E8913A]" />
              </span>
              Рамка бабушки в сети
            </div>
          </aside>
          <div className="relative min-h-[300px] overflow-hidden rounded-[12px] bg-stage">
            <SceneSlot
              ctl={ctl}
              fallback={
                <div className="flex size-full items-center justify-center p-10">
                  <MiniFrame wood="#C49A6C" photo={0} glow={0.7} className="max-w-[420px]" />
                </div>
              }
              className="absolute inset-0"
            />
            <div className="pointer-events-none absolute bottom-4 left-4 h-[64px] w-[250px] md:bottom-6 md:left-6">
              {STATES.map((s) => (
                <div key={s.title} data-sc-chat className="absolute inset-0 flex items-center gap-3 rounded-[14px] bg-white/95 px-3 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full text-[14px] font-semibold ${s.chat.tone === "warm" ? "bg-[#ffe2c2] text-[#9a4c10]" : "bg-[#efeee9]"}`}>{s.chat.who[0]}</span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-medium">{s.chat.who}</span>
                    <span className="block truncate text-[13px] text-[var(--muted-2)]">{s.chat.text}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute top-4 right-4 flex gap-1.5">
              {STATES.map((s, i) => (
                <span key={s.title} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-[#FFB35C]" : "w-1.5 bg-white/40"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
