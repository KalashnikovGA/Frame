"use client";
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MEDIA } from "@/config/media";
import { SceneSlot } from "@/components/SceneSlot";
import { MiniFrame } from "@/components/ui/MiniFrame";
import { useStore } from "@/lib/store";
import { createCtl, type AnchorName, type SceneCtl } from "@/three/ctl";

type Step = {
  title: string;
  text: string;
  anchor: AnchorName;
  label: string;
  /** направление выноски от якоря, px */
  dir: [number, number];
  scene: Partial<SceneCtl>;
};

const FRONT = { rotY: 0, rotX: 0, camX: 0, camY: 1.2, camZ: 6.4, tgtX: 0, tgtY: 0.92, tgtZ: 0, glow: 0.22, pulse: 0 };

const STEPS: Step[] = [
  {
    title: "Экран на всю рамку.",
    text: "Фото как напечатанное.",
    anchor: "screen",
    label: "Матовое стекло заподлицо",
    dir: [-70, -90],
    scene: FRONT,
  },
  {
    title: "Стоит сама.",
    text: "Без ножек и подставок.",
    anchor: "wedge",
    label: "Клин: 38 мм снизу, 15 мм сверху",
    dir: [70, 80],
    scene: { rotY: -1.42, camX: 0, camY: 1.05, camZ: 6.2, tgtX: 0, tgtY: 0.85, tgtZ: 0, glow: 0.22 },
  },
  {
    title: "Свет под рамкой —",
    text: "когда звучит голос.",
    anchor: "base",
    label: "Янтарный свет на поверхность стола",
    dir: [60, 70],
    scene: { rotY: -0.38, camX: 1.2, camY: 0.9, camZ: 5.7, tgtX: 0, tgtY: 0.5, tgtZ: 0.3, glow: 1 },
  },
  {
    title: "Цельный дуб.",
    text: "Каждая рамка — со своим рисунком.",
    anchor: "grain",
    label: "Массив, масло с воском",
    dir: [-60, 70],
    scene: { rotY: 0.34, camX: -1.25, camY: 2.2, camZ: 1.95, tgtX: -0.8, tgtY: 1.55, tgtZ: 0.25, glow: 0.3 },
  },
  {
    title: "Ни одной кнопки.",
    text: "Только касание.",
    anchor: "touch",
    label: "Касание нижнего края — «думаю о тебе»",
    dir: [-90, 50],
    scene: { ...FRONT, glow: 0.4, pulse: 1 },
  },
];

function StaticAnatomy() {
  return (
    <div className="wrap py-24 md:py-36">
      <p className="t-caption mb-6 text-cream/50">Как она устроена</p>
      <div className="grid items-center gap-14 md:grid-cols-2">
        <div className="card overflow-hidden bg-stage-2 p-10 md:p-16">
          {MEDIA.posters.front ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={MEDIA.posters.front} alt="Рамка анфас" className="w-full" />
          ) : (
            <MiniFrame wood="#C49A6C" glow={0.6} photo={0} alt="Рамка анфас" />
          )}
        </div>
        <ol className="grid gap-8">
          {STEPS.map((s, i) => (
            <li key={s.anchor} className="border-t border-white/10 pt-6">
              <span className="t-caption text-cream/55">0{i + 1}</span>
              <p className="t-h3 mt-2">
                {s.title} <span className="text-cream/55">{s.text}</span>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** Выноски: точка на детали, тонкая линия и подпись. Координаты берутся из сцены каждый кадр. */
function Callouts({ ctl, groups }: { ctl: SceneCtl; groups: React.RefObject<(SVGGElement | null)[]> }) {
  const lines = useRef<(SVGLineElement | null)[]>([]);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const texts = useRef<(SVGTextElement | null)[]>([]);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const widths: number[] = [];
    const update = () => {
      const k = mobile.matches ? 0.55 : 1;
      STEPS.forEach((s, i) => {
        const p = ctl.projected[s.anchor];
        if (!p) return;
        const [dx, dy] = s.dir;
        const x2 = p.x + dx * k;
        const y2 = p.y + dy * k;
        lines.current[i]?.setAttribute("x1", String(p.x));
        lines.current[i]?.setAttribute("y1", String(p.y));
        lines.current[i]?.setAttribute("x2", String(x2));
        lines.current[i]?.setAttribute("y2", String(y2));
        dots.current[i]?.setAttribute("cx", String(p.x));
        dots.current[i]?.setAttribute("cy", String(p.y));
        dots.current[i + 10]?.setAttribute("cx", String(p.x));
        dots.current[i + 10]?.setAttribute("cy", String(p.y));
        const t = texts.current[i];
        if (t) {
          const w = widths[i] || (widths[i] = t.getComputedTextLength());
          const vw = t.ownerSVGElement?.clientWidth ?? window.innerWidth;
          let x = dx >= 0 ? x2 + 8 : x2 - 8 - w;
          x = Math.max(16, Math.min(vw - 16 - w, x));
          t.setAttribute("x", String(x));
          t.setAttribute("y", String(y2 + (dy < 0 ? -8 : 16)));
        }
      });
    };
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [ctl]);

  return (
    <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
      {STEPS.map((s, i) => (
        <g
          key={s.anchor}
          ref={(el) => {
            groups.current[i] = el;
          }}
          style={{ opacity: 0 }}
        >
          <line ref={(el) => void (lines.current[i] = el)} stroke="rgba(244,239,231,0.55)" strokeWidth="1" />
          <circle ref={(el) => void (dots.current[i] = el)} r="4" fill="var(--cream)" />
          <circle r="10" fill="none" stroke="rgba(244,239,231,0.35)" ref={(el) => void (dots.current[i + 10] = el)} />
          <text ref={(el) => void (texts.current[i] = el)} fill="rgba(244,239,231,0.8)" fontSize="12" letterSpacing="0.08em" style={{ textTransform: "uppercase" }}>
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Anatomy() {
  const mode = useStore((s) => s.mode);
  const section = useRef<HTMLElement>(null);
  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const groups = useRef<(SVGGElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);

  const ctl = useMemo(() => createCtl({ ...STEPS[0].scene, species: "oak", minAspect: 1.2, anchors: STEPS.map((s) => s.anchor), photo: 0 }), []);

  useEffect(() => {
    if (!mode || mode === "static" || !section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    ctl.shiftX = mobile ? 0 : 0.17;
    ctl.shiftY = mobile ? -0.13 : 0;
    ctl.minAspect = mobile ? 0.9 : 1.2;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      const T = STEPS.length;
      gsap.set(texts.current, { autoAlpha: 0, y: 24 });
      gsap.set(texts.current[0], { autoAlpha: 1, y: 0 });
      gsap.set(groups.current[0], { opacity: 1 });

      STEPS.forEach((s, i) => {
        if (i === 0) return;
        const at = i - 0.3;
        tl.to(ctl, { ...s.scene, duration: 0.6 } as gsap.TweenVars, at);
        tl.to(texts.current[i - 1], { autoAlpha: 0, y: -24, duration: 0.22, ease: "power2.in" }, at);
        tl.to(groups.current[i - 1], { opacity: 0, duration: 0.18 }, at);
        tl.fromTo(texts.current[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, at + 0.32);
        tl.to(groups.current[i], { opacity: 1, duration: 0.25 }, at + 0.45);
      });
      tl.to({}, { duration: 0.3 }, T - 0.3);
      tl.to(bar.current, { scaleX: 1, ease: "none", duration: T }, 0);

      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        animation: tl,
      });
    }, section);
    return () => ctx.revert();
  }, [mode, ctl]);

  if (mode === "static")
    return (
      <section id="anatomy" data-theme="dark" className="bg-stage">
        <StaticAnatomy />
      </section>
    );

  return (
    <section ref={section} id="anatomy" data-theme="dark" className="relative h-[330vh] bg-stage md:h-[420vh]" aria-label="Как она устроена">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <SceneSlot ctl={ctl} fallback={null} className="absolute inset-0" />
        <Callouts ctl={ctl} groups={groups} />

        <div className="pointer-events-none relative z-10 wrap flex h-full flex-col justify-end pb-12 md:justify-center md:pb-0">
          <p className="t-caption mb-5 text-cream/50 md:mb-8">Как она устроена</p>
          <div className="relative h-[150px] md:h-[250px] md:max-w-[36%]">
            {STEPS.map((s, i) => (
              <div
                key={s.anchor}
                ref={(el) => {
                  texts.current[i] = el;
                }}
                className="absolute inset-x-0 top-0"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <span className="t-caption text-glow/80">0{i + 1} / 05</span>
                <p className="t-h2 mt-3">
                  {s.title} <span className="text-cream/55">{s.text}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 h-px w-full max-w-[220px] bg-white/10 md:mt-8">
            <div ref={bar} className="h-full origin-left scale-x-0 bg-cream/70" />
          </div>
        </div>
      </div>
    </section>
  );
}
