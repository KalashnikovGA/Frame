"use client";
import { MEDIA } from "@/config/media";
import { live } from "./live";
import { useStore } from "./store";
import { parseVTT, type Cue } from "./vtt";
import { track } from "./analytics";

/**
 * Аудиоистория: проигрывание, субтитры и громкость через AnalyserNode.
 * Громкость пишется в live.voice — от неё дышит свет под рамкой.
 */
class StoryPlayer {
  private audio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private buf: Float32Array<ArrayBuffer> | null = null;
  private cues: Cue[] = [];
  private raf = 0;
  private level = 0;

  private async setup() {
    if (this.audio) return;
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = MEDIA.story.audio;
    this.audio = audio;

    try {
      const res = await fetch(MEDIA.story.captions);
      if (res.ok) this.cues = parseVTT(await res.text());
    } catch {
      /* без субтитров история всё равно играет */
    }

    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.2;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      this.ctx = ctx;
      this.analyser = analyser;
      this.buf = new Float32Array(analyser.fftSize);
    } catch {
      /* без Web Audio звук есть, свет дышит спокойнее */
    }

    audio.addEventListener("ended", () => {
      useStore.setState({ story: "ended", progress: 1 });
      window.setTimeout(() => {
        if (useStore.getState().story === "ended") useStore.setState({ caption: null });
      }, 900);
    });
    audio.addEventListener("error", () => useStore.setState({ story: "error", caption: null }));
  }

  private tick = () => {
    const a = this.audio;
    if (!a) return;
    let target = 0;
    if (!a.paused) {
      if (this.analyser && this.buf) {
        this.analyser.getFloatTimeDomainData(this.buf);
        let sum = 0;
        for (let i = 0; i < this.buf.length; i++) sum += this.buf[i] * this.buf[i];
        const rms = Math.sqrt(sum / this.buf.length);
        target = Math.min(1, Math.max(0, (rms - 0.01) * 6.5));
      } else {
        target = 0.45 + 0.25 * Math.sin(performance.now() / 180);
      }
    }
    // быстрая атака, медленное затухание — свет не мерцает, а дышит
    this.level += (target - this.level) * (target > this.level ? 0.45 : 0.08);
    live.voice = this.level;

    const t = a.currentTime;
    const cue = this.cues.find((c) => t >= c.start && t <= c.end);
    const st = useStore.getState();
    const caption = cue?.text ?? (st.story === "ended" ? st.caption : null);
    const progress = a.duration ? t / a.duration : 0;
    if (caption !== st.caption || Math.abs(progress - st.progress) > 0.004) useStore.setState({ caption, progress });

    if (!a.paused || this.level > 0.002) this.raf = requestAnimationFrame(this.tick);
    else live.voice = 0;
  };

  async toggle() {
    const st = useStore.getState().story;
    if (st === "playing") return this.pause();
    return this.play();
  }

  async play() {
    useStore.setState({ story: "loading" });
    await this.setup();
    const a = this.audio!;
    if (this.ctx?.state === "suspended") await this.ctx.resume();
    if (a.ended || useStore.getState().progress >= 1) a.currentTime = 0;
    try {
      await a.play();
      useStore.setState({ story: "playing" });
      track("listen", undefined, true);
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(this.tick);
    } catch {
      useStore.setState({ story: "error" });
    }
  }

  pause() {
    this.audio?.pause();
    useStore.setState({ story: "paused" });
  }
}

export const story = new StoryPlayer();
