"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { SceneCtl } from "@/three/ctl";

export type LightMode = "story" | "listen" | "record" | "think" | "night";

const LISTEN_LINES = ["Маша: Бабушка, привет!", "Маша: Смотри, какое сегодня море", "Маша: Я тебя очень люблю"];

/** Огибающая «речи»: слоги, паузы между фразами — чтобы свет дышал как под голос. */
function speech(t: number) {
  const syll = Math.pow(Math.max(0, Math.sin(t * 8.5 + Math.sin(t * 1.7) * 2.2)), 1.4);
  const phrase = (t * 0.3) % 1 < 0.78 ? 1 : 0;
  return syll * phrase * (0.55 + 0.45 * Math.sin(t * 2.3) ** 2);
}

export type LightState = {
  mode: LightMode;
  t: number;
  modeStart: number;
  holding: boolean;
  level: number;
  sent: number;
  flash: number;
  lastThink: number;
  /** в режиме записи палец «держится» сам: 0,8 с пауза → 4 с запись → отпускание */
  autoRecord: boolean;
};

/** Язык света: каждый кадр выставляет свет, экран и подписи сцены для выбранного режима. */
export function useLightEngine(ctl: SceneCtl, autoRecord = true) {
  const s = useRef<LightState>({ mode: "listen", t: 0, modeStart: 0, holding: false, level: 0, sent: -10, flash: 0, lastThink: -10, autoRecord });

  useEffect(() => {
    const tick = (_: number, deltaMs: number) => {
      const st = s.current;
      const dt = Math.min(deltaMs / 1000, 0.1);
      st.t += dt;
      const t = st.t;
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
          if (st.autoRecord) {
            const local = (t - st.modeStart) % 7;
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
          if (st.holding) st.level = Math.min(1, st.level + dt / 4);
          else st.level = Math.max(0, st.level - dt * 1.5);
          glow = 0.22 + st.level * 1.15;
          warmth = st.level;
          record = st.holding ? st.level : 0;
          caption = st.holding ? `● Запись ответа · 0:0${Math.floor(st.level * 4)}` : t - st.sent < 2.2 ? "Ответ отправлен" : "Держите палец на фото";
          if (!st.holding) pulse = 1;
          break;
        }
        case "think": {
          if (t - st.lastThink > 4.6) {
            st.lastThink = t;
            ctl.ripple++;
          }
          const p = t - st.lastThink;
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
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [ctl]);

  const setMode = (m: LightMode) => {
    const st = s.current;
    if (st.mode === m) return;
    st.mode = m;
    st.modeStart = st.t;
    st.holding = false;
    st.level = 0;
  };
  return { state: s, setMode };
}
