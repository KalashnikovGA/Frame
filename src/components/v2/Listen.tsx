"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useStore } from "@/lib/store";
import { story } from "@/lib/story";
import { live } from "@/lib/live";
import { Heading } from "./Heading";

const LINE = "Бабушка, привет! Смотри, какое сегодня море…";
const PEOPLE = ["Маша", "Дима", "Лёва", "Все"];

/** «Коснулся — и слушаешь»: строка-плеер, как поисковая строка, с набором текста и живой волной голоса. */
export function Listen() {
  const status = useStore((s) => s.story);
  const caption = useStore((s) => s.caption);
  const playing = status === "playing";
  const [typed, setTyped] = useState("");
  const [who, setWho] = useState("Маша");
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);

  // печать подписи, когда блок появился на экране
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let i = 0;
    let timer = 0;
    let started = false;
    const type = () => {
      i++;
      setTyped(LINE.slice(0, i));
      if (i < LINE.length) timer = window.setTimeout(type, 38 + Math.random() * 40);
    };
    const check = () => {
      if (started) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.8) {
        started = true;
        timer = window.setTimeout(type, 400);
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => {
      window.removeEventListener("scroll", check);
      window.clearTimeout(timer);
    };
  }, []);

  // волна: настоящий голос, если он звучит; иначе — тихое дыхание
  useEffect(() => {
    const vals = new Array(48).fill(0.1);
    let t = 0;
    const tick = (_: number, dms: number) => {
      t += dms / 1000;
      vals.shift();
      vals.push(Math.max(0.08 + 0.06 * Math.sin(t * 2.2) * Math.sin(t * 0.7 + 1), live.voice));
      bars.current.forEach((b, i) => {
        if (b) b.style.transform = `scaleY(${Math.min(1, vals[i] * (0.75 + 0.25 * Math.sin(i * 1.7 + t * 3)) + 0.06)})`;
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <section className="px-4 py-20 md:py-32" aria-labelledby="listen-title">
      <Heading
        id="listen-title"
        title="Коснулся фото — и слушаешь"
        sub="Голосовые истории звучат прямо из рамки, а субтитры появляются на фото. Громче голос — ярче тёплый свет под рамкой."
        cta={
          <button type="button" className="pill pill-dark" onClick={() => story.toggle()}>
            {playing ? "Пауза" : "Послушать пример"}
          </button>
        }
      />
      <div ref={root} className="mx-auto mt-14 max-w-[720px] md:mt-20">
        <div className="flex h-16 items-center gap-3 rounded-full border border-[#cfcec7] bg-[#f6f5f1] pr-2 pl-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <span className="min-w-0 flex-1 truncate text-[16px] text-[#141311]/80">
            {playing && caption ? caption : typed}
            {!playing && typed.length < LINE.length && <span className="ml-0.5 inline-block h-5 w-px translate-y-1 animate-pulse bg-[#141311]" />}
          </span>
          <button type="button" onClick={() => story.toggle()} className="pill h-12 bg-[#e4e3dd] px-6 text-[15px] hover:bg-[#dcdbd4]">
            {playing ? "Пауза" : "Слушать"}
          </button>
        </div>
        <div className="mx-5 rounded-b-[16px] border border-t-0 border-[#d9d8d1] bg-white px-5 pt-4 pb-5">
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="text-[var(--muted-2)]">От кого:</span>
            {PEOPLE.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setWho(p)}
                className={`rounded-[6px] px-2.5 py-1 transition-colors ${who === p ? "bg-[#141311] text-white" : "bg-[#efeee9] hover:bg-[#e4e3dd]"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="mt-5 flex h-16 items-center gap-[3px]" aria-hidden>
            {Array.from({ length: 48 }).map((_, i) => (
              <span
                key={i}
                ref={(el) => {
                  bars.current[i] = el;
                }}
                className="h-full flex-1 origin-center rounded-full bg-[linear-gradient(180deg,#f0a24c,#e8627f)]"
                style={{ transform: "scaleY(0.1)" }}
              />
            ))}
          </div>
          <p className="mt-3 flex justify-between text-[13px] text-[var(--muted-2)]">
            <span>Голосовое · {who === "Все" ? "Маша" : who}</span>
            <span className="tabular-nums">0:25</span>
          </p>
        </div>
      </div>
    </section>
  );
}
