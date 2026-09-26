"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "@/lib/store";
import { story } from "@/lib/story";
import { live } from "@/lib/live";
import { SoundIcon } from "@/components/ui/Icons";

const CLAIMS = [
  { a: "Голоса настоящих людей,", b: "а\u00a0не робота." },
  { a: "Каждая история сохраняется —", b: "семейный архив её голосом." },
  { a: "Без камеры.", b: "Микрофон отключается переключателем." },
];

const ARCHIVE = [
  { who: "Бабушка", what: "Как мы с дедом познакомились", when: "12 марта", len: "4:18" },
  { who: "Маша", what: "Первое слово Лёвы", when: "3 марта", len: "0:21" },
  { who: "Бабушка", what: "Рецепт пирога с капустой", when: "24 февраля", len: "2:46" },
  { who: "Дима", what: "С днём рождения, мама!", when: "9 февраля", len: "1:05" },
  { who: "Бабушка", what: "Про войну и прадеда Ивана", when: "1 января", len: "7:32" },
];

/** Живая волна голоса: играет настоящую историю, в покое — тихо дышит. */
function VoiceWave() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const status = useStore((s) => s.story);
  const caption = useStore((s) => s.caption);
  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const N = 64;
    const vals = new Array(N).fill(0);
    let t = 0;
    const draw = (_: number, dms: number) => {
      t += dms / 1000;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== w * dpr) {
        c.width = w * dpr;
        c.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      vals.shift();
      const idle = 0.08 + 0.06 * Math.sin(t * 2.1) * Math.sin(t * 0.7);
      vals.push(Math.max(idle, live.voice));
      const bw = w / N;
      for (let i = 0; i < N; i++) {
        const v = vals[i] * (0.7 + 0.3 * Math.sin(i * 1.7 + t * 3));
        const bh = Math.max(3, v * h * 0.9);
        const g = ctx.createLinearGradient(0, h / 2 - bh / 2, 0, h / 2 + bh / 2);
        g.addColorStop(0, "rgba(255,179,92,0.95)");
        g.addColorStop(1, "rgba(255,138,60,0.75)");
        ctx.fillStyle = g;
        const x = i * bw + bw * 0.2;
        ctx.beginPath();
        ctx.roundRect(x, h / 2 - bh / 2, bw * 0.6, bh, bw * 0.3);
        ctx.fill();
      }
    };
    gsap.ticker.add(draw);
    return () => gsap.ticker.remove(draw);
  }, []);
  const playing = status === "playing";
  return (
    <div className="card flex h-full min-w-0 flex-col justify-between overflow-hidden bg-stage-2 p-7 md:p-9">
      <div className="flex items-center justify-between">
        <p className="t-caption text-cream/55">Голосовое от бабушки</p>
        <p className="text-[13px] tabular-nums text-cream/55">0:25</p>
      </div>
      <canvas ref={canvas} className="my-6 block h-[140px] w-full min-w-0 max-w-full md:h-[180px]" aria-hidden />
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => story.toggle()} className="grid size-14 place-items-center rounded-full bg-cream text-ink transition-transform active:scale-95" aria-label={playing ? "Пауза" : "Послушать голос"}>
          <SoundIcon playing={playing} />
        </button>
        <p className="min-h-[3em] flex-1 font-serif text-[20px] leading-[1.25] text-cream/85">{caption ?? "Нажмите — это настоящий голос, а не синтез"}</p>
      </div>
    </div>
  );
}

function Archive({ active }: { active: boolean }) {
  return (
    <div className="card flex h-full min-w-0 flex-col overflow-hidden bg-stage-2 p-7 md:p-9">
      <p className="t-caption text-cream/55">Семейный архив</p>
      <ul className="mt-6 grid min-w-0 grid-cols-1 gap-2">
        {ARCHIVE.map((a, i) => (
          <li
            key={a.what}
            className="flex items-center gap-4 rounded-[16px] bg-white/[0.04] px-4 py-3 transition-all duration-700"
            style={{ opacity: active ? 1 : 0.25, transform: active ? "none" : `translateY(${12 + i * 6}px)`, transitionDelay: `${i * 90}ms` }}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-oak/25 text-[13px] font-semibold text-cream">{a.who[0]}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] text-cream/90">{a.what}</span>
              <span className="text-[13px] text-cream/50">
                {a.who} · {a.when}
              </span>
            </span>
            <span className="text-[13px] tabular-nums text-cream/55">{a.len}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MicSwitch({ active }: { active: boolean }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!active) return setOn(true);
    const t = window.setTimeout(() => setOn(false), 700);
    return () => window.clearTimeout(t);
  }, [active]);
  return (
    <div className="card flex h-full min-w-0 flex-col items-center justify-center gap-8 overflow-hidden bg-stage-2 p-7 text-center md:p-9">
      <p className="t-caption text-cream/55">Задняя стенка рамки</p>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Микрофон"
        onClick={() => setOn(!on)}
        className="relative h-[64px] w-[120px] rounded-full border border-white/15 bg-black/40 transition-colors duration-500"
        style={{ boxShadow: on ? "inset 0 0 20px rgba(255,179,92,0.25)" : "none" }}
      >
        <span
          className="absolute top-[7px] size-[48px] rounded-full transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ left: on ? 64 : 7, background: on ? "var(--glow)" : "#5b514a", boxShadow: on ? "0 0 18px 4px rgba(255,179,92,0.5)" : "none" }}
        />
      </button>
      <p className="text-[22px] font-semibold tracking-[-0.02em]">{on ? "Микрофон включён" : "Микрофон выключен"}</p>
      <p className="max-w-[30ch] text-[15px] text-cream/55">Физический переключатель разрывает цепь — программно его не обойти. Камеры в рамке нет вовсе.</p>
    </div>
  );
}

export function Voice() {
  const mode = useStore((s) => s.mode);
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!mode || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-claim]").forEach((el, i) => {
        ScrollTrigger.create({ trigger: el, start: "top 60%", end: "bottom 60%", onToggle: (st) => st.isActive && setActive(i) });
        if (mode !== "static")
          gsap.fromTo(el.querySelector("p"), { opacity: 0.2, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", end: "top 55%", scrub: 0.6 } });
      });
    }, root);
    return () => ctx.revert();
  }, [mode]);

  const visuals = [<VoiceWave key="w" />, <Archive key="a" active={active === 1} />, <MicSwitch key="m" active={active === 2} />];

  return (
    <section ref={root} id="voice" data-theme="dark" className="bg-stage py-24 md:py-36" aria-labelledby="voice-title">
      <div className="wrap">
        <p id="voice-title" className="t-caption mb-10 text-cream/55 md:mb-16">
          Голос, а не ИИ
        </p>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <ul className="min-w-0">
            {CLAIMS.map((c, i) => (
              <li key={c.a} data-claim className="border-t border-white/10 py-8 md:flex md:min-h-[62svh] md:items-center md:py-12">
                <div className="w-full">
                  <p className="t-h1 max-w-[16ch]">
                    {c.a} <span className="text-cream/45">{c.b}</span>
                  </p>
                  <div className="mt-8 h-[400px] md:hidden">{visuals[i]}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden md:block">
            <div className="sticky top-[18svh] h-[64svh]">
              {visuals.map((v, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
                  style={{ opacity: active === i ? 1 : 0, transform: active === i ? "none" : `translateY(${i < active ? -30 : 30}px) scale(0.97)`, pointerEvents: active === i ? "auto" : "none" }}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
