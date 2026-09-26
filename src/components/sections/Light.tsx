"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { SceneSlot } from "@/components/SceneSlot";
import { MiniFrame } from "@/components/ui/MiniFrame";
import { createCtl, type SceneCtl } from "@/three/ctl";

type ModeId = "story" | "listen" | "record" | "think" | "night";

const MODES: { id: ModeId; title: string; text: string; hold?: boolean; duration: number }[] = [
  { id: "story", title: "Пришла новая история", text: "Свет мягко пульсирует, пока историю не прослушали.", duration: 6 },
  { id: "listen", title: "Звучит голос", text: "Свет дышит в такт словам: громче голос — ярче свет.", duration: 7 },
  { id: "record", title: "Записывается ответ", text: "Держите палец на фото — свет разгорается теплее, пока идёт запись.", hold: true, duration: 7 },
  { id: "think", title: "О вас подумали", text: "Кто-то коснулся своей рамки — ваша вспыхивает и медленно гаснет.", duration: 6 },
  { id: "night", title: "Ночник", text: "Ночью экран гаснет, а тёплый свет остаётся до утра.", duration: 6 },
];

const LISTEN_LINES = ["Маша: Бабушка, привет!", "Маша: Смотри, какое сегодня море", "Маша: Я тебя очень люблю"];

/** Огибающая «речи»: слоги, паузы между фразами — чтобы свет дышал как под голос. */
function speech(t: number) {
  const syll = Math.pow(Math.max(0, Math.sin(t * 8.5 + Math.sin(t * 1.7) * 2.2)), 1.4);
  const phrase = (t * 0.3) % 1 < 0.78 ? 1 : 0;
  return syll * phrase * (0.55 + 0.45 * Math.sin(t * 2.3) ** 2);
}

/** Движок режимов: каждый кадр выставляет параметры света сцены. */
function useLightEngine(ctl: SceneCtl) {
  const s = useRef({ mode: "story" as ModeId, t: 0, holding: false, level: 0, sent: 0, flash: 0, lastThink: -10, onTick: (() => {}) as (p: number) => void });

  useEffect(() => {
    const tick = (_: number, deltaMs: number) => {
      const st = s.current;
      const dt = Math.min(deltaMs / 1000, 0.1);
      st.t += dt;
      const t = st.t;
      // по умолчанию — вечерний свет
      let glow = 0.22;
      let warmth = 0;
      let night = 0;
      let screen = 1;
      let caption: string | null = null;
      let pulse = 0;
      let rippleEvery = 0;
      let record = 0;
      st.flash = Math.max(0, st.flash - dt * 0.9);

      switch (st.mode) {
        case "story":
          glow = 0.16 + 0.5 * Math.pow(0.5 + 0.5 * Math.sin(t * 2.2), 2);
          rippleEvery = 2.85;
          pulse = 1;
          caption = "Новая история от Маши";
          break;
        case "listen":
          glow = 0.1 + speech(t) * 1.05;
          caption = LISTEN_LINES[Math.floor(t / 2.6) % LISTEN_LINES.length];
          break;
        case "record": {
          if (st.holding) st.level = Math.min(1, st.level + dt / 4);
          else st.level = Math.max(0, st.level - dt * 1.5);
          glow = 0.22 + st.level * 1.15;
          warmth = st.level;
          record = st.holding ? st.level : 0;
          const secs = Math.floor(st.level * 4);
          caption = st.holding ? `● Запись ответа · 0:0${secs}` : st.sent > 0 && t - st.sent < 2.2 ? "Ответ отправлен" : "Держите палец на фото";
          if (!st.holding) pulse = 1;
          break;
        }
        case "think": {
          const since = t - st.lastThink;
          if (since > 4.6) {
            st.lastThink = t;
            ctl.ripple++;
          }
          const p = t - st.lastThink;
          // две вспышки подряд, потом медленное затухание
          const f1 = Math.exp(-Math.pow((p - 0.05) * 7, 2));
          const f2 = Math.exp(-Math.pow((p - 0.55) * 7, 2));
          glow = 0.25 + (f1 + f2) * 1.05 + Math.max(0, 0.7 * Math.exp(-p * 0.9) - 0.05);
          if (Math.abs(p - 0.55) < dt) ctl.ripple++;
          caption = "Мама думает о тебе";
          break;
        }
        case "night":
          night = 0.85;
          screen = 0.14;
          glow = 0.58 + 0.04 * Math.sin(t * 0.8);
          warmth = 0.3;
          break;
      }

      ctl.glow = glow + st.flash;
      ctl.warmth += (warmth - ctl.warmth) * Math.min(1, dt * 4);
      ctl.night += (night - ctl.night) * Math.min(1, dt * 2.2);
      ctl.screen += (screen - ctl.screen) * Math.min(1, dt * 2.2);
      ctl.caption = caption;
      ctl.pulse = pulse;
      ctl.rippleEvery = rippleEvery;
      ctl.record = record;
      st.onTick(t);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [ctl]);

  return s;
}

function StaticLight({ mode }: { mode: ModeId }) {
  const glow = { story: 0.6, listen: 0.8, record: 1, think: 1, night: 0.7 }[mode];
  return (
    <div className="flex size-full items-center justify-center p-10">
      <MiniFrame wood="#E6D3B3" photo={0} glow={glow} dim={mode === "night" ? 0.2 : 1} className="max-w-[420px]" />
    </div>
  );
}

export function Light() {
  const ctl = useMemo(
    () =>
      createCtl({
        species: "birch",
        rotY: -0.32,
        camX: 0.6,
        camY: 1.3,
        camZ: 7.4,
        tgtX: 0,
        tgtY: 0.62,
        tgtZ: 0.3,
        pointer: 0.6,
        drift: 0.6,
        minAspect: 1.15,
        photo: 0,
      }),
    [],
  );
  const engine = useLightEngine(ctl);

  // композиция: на широком экране рамка справа и выше карточек режимов
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      ctl.shiftX = mq.matches ? 0.2 : 0;
      ctl.shiftY = mq.matches ? -0.1 : 0;
      ctl.minAspect = mq.matches ? 1.15 : 1.05;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [ctl]);
  const [mode, setMode] = useState<ModeId>("story");
  const [holding, setHolding] = useState(false);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const auto = useRef({ on: true, start: 0, resumeAt: 0, demoHold: false });

  const select = useCallback(
    (id: ModeId, byUser: boolean) => {
      const st = engine.current;
      st.mode = id;
      st.level = 0;
      st.holding = false;
      setHolding(false);
      setMode(id);
      auto.current.start = st.t;
      auto.current.demoHold = false;
      if (byUser) {
        auto.current.on = false;
        auto.current.resumeAt = st.t + 14;
      }
    },
    [engine],
  );

  // автопоказ режимов по кругу, пока посетитель ничего не нажимает
  useEffect(() => {
    engine.current.onTick = (t) => {
      const a = auto.current;
      const st = engine.current;
      const m = MODES.find((x) => x.id === st.mode)!;
      if (!a.on && !st.holding && t > a.resumeAt) {
        a.on = true;
        a.start = t;
      }
      const p = a.on ? Math.min(1, (t - a.start) / m.duration) : 0;
      MODES.forEach((x, i) => {
        const el = bars.current[i];
        if (el) el.style.transform = `scaleX(${x.id === st.mode ? p : 0})`;
      });
      if (!a.on) return;
      // в автопоказе «запись» держится сама
      if (st.mode === "record") {
        const local = t - a.start;
        const hold = local > 0.8 && local < 4.8;
        if (hold !== st.holding) {
          st.holding = hold;
          if (!hold && st.level > 0.1) {
            st.sent = t;
            st.flash = 0.9;
            ctl.ripple++;
          }
        }
      }
      if (p >= 1) {
        const i = MODES.findIndex((x) => x.id === st.mode);
        select(MODES[(i + 1) % MODES.length].id, false);
      }
    };
  }, [engine, select, ctl]);

  const startHold = () => {
    if (engine.current.mode !== "record") select("record", true);
    auto.current.on = false;
    engine.current.holding = true;
    setHolding(true);
  };
  const endHold = () => {
    const st = engine.current;
    if (!st.holding) return;
    st.holding = false;
    setHolding(false);
    auto.current.resumeAt = st.t + 14;
    if (st.level > 0.08) {
      st.sent = st.t;
      st.flash = 0.9;
      ctl.ripple++;
    }
  };

  return (
    <section id="light" data-theme="dark" className="relative overflow-hidden bg-stage" aria-labelledby="light-title">
      <div className="relative flex flex-col md:block md:h-[100svh] md:min-h-[720px]">
        <SceneSlot ctl={ctl} fallback={<StaticLight mode={mode} />} className="relative order-2 h-[56svh] min-h-[340px] md:absolute md:inset-0 md:h-auto" />
        <div className="pointer-events-none relative z-10 wrap order-1 flex flex-col pt-24 pb-4 md:h-full md:justify-center md:py-0">
          <div className="md:max-w-[38%] md:-translate-y-16">
            <p className="t-caption mb-5 text-cream/55">Свет</p>
            <h2 id="light-title" className="t-h2">
              Свет, который <span className="accent">разговаривает</span>
            </h2>
            <p className="t-body mt-5 text-[16px] text-cream/65 md:text-[18px]">
              Это не подсветка экрана. Янтарный свет под рамкой — отдельный язык: он отвечает на голос, на касание и на мысли близких.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 wrap pb-20 md:absolute md:inset-x-0 md:bottom-0 md:pb-12">
        <ul className="grid gap-2 md:grid-cols-5 md:gap-3" role="radiogroup" aria-label="Режимы света">
          {MODES.map((m, i) => {
            const active = m.id === mode;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => !m.hold && select(m.id, true)}
                  onPointerDown={
                    m.hold
                      ? (e) => {
                          e.preventDefault();
                          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                          startHold();
                        }
                      : undefined
                  }
                  onPointerUp={m.hold ? endHold : undefined}
                  onPointerCancel={m.hold ? endHold : undefined}
                  onContextMenu={(e) => m.hold && e.preventDefault()}
                  onKeyDown={(e) => {
                    if (m.hold && (e.key === " " || e.key === "Enter") && !e.repeat) {
                      e.preventDefault();
                      startHold();
                    }
                  }}
                  onKeyUp={(e) => m.hold && (e.key === " " || e.key === "Enter") && endHold()}
                  className={`relative w-full select-none overflow-hidden rounded-[20px] border p-4 backdrop-blur-md text-left transition-colors duration-500 md:min-h-[150px] md:p-5 ${
                    active ? "border-glow/40 bg-[#2a2019]/90" : "border-white/10 bg-[#1a1411]/85 hover:bg-[#221a15]/90"
                  } ${m.hold ? "touch-none" : ""}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="size-2 shrink-0 rounded-full transition-all duration-500"
                      style={{ background: active ? "var(--glow)" : "rgba(244,239,231,0.25)", boxShadow: active ? "0 0 12px 2px rgba(255,179,92,0.7)" : "none" }}
                    />
                    <span className="text-[16px] font-medium tracking-[-0.01em]">{m.title}</span>
                  </span>
                  <span className={`mt-2 block text-[14px] leading-[1.45] ${active ? "text-cream/70" : "text-cream/50"}`}>{m.text}</span>
                  {m.hold && (
                    <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-[13px] ${holding ? "bg-glow text-ink" : "bg-white/10 text-cream/80"}`}>
                      {holding ? "Идёт запись…" : "Удерживайте, чтобы записать"}
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-white/5">
                    <span
                      ref={(el) => {
                        bars.current[i] = el;
                      }}
                      className="block h-full origin-left scale-x-0 bg-glow/80"
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
