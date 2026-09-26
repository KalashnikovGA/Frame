"use client";
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MEDIA } from "@/config/media";
import { SceneSlot } from "@/components/SceneSlot";
import { MiniFrame } from "@/components/ui/MiniFrame";
import { useStore } from "@/lib/store";
import { createCtl } from "@/three/ctl";

function StaticNight() {
  return (
    <div className="wrap grid items-center gap-12 py-24 md:grid-cols-2 md:py-36">
      <Copy />
      <div className="card bg-[#0b0a0c] p-12 md:p-16">
        {MEDIA.posters.night ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={MEDIA.posters.night} alt="Рамка ночью как ночник" className="w-full" />
        ) : (
          <MiniFrame wood="#E6D3B3" glow={0.75} dim={0.25} photo={0} alt="Рамка ночью: экран приглушён, под ней мягкий свет" />
        )}
      </div>
    </div>
  );
}

function Copy() {
  return (
    <div>
      <p className="t-caption mb-6 text-cream/55">Ночью</p>
      <h2 className="t-h1 max-w-[13ch]">
        Тихий <span className="accent">свет,</span> чтобы было видно дорогу
      </h2>
      <p className="t-body mt-6 max-w-[40ch] text-cream/60">
        Когда темнеет, рамка сама приглушает экран, а свет под ней становится мягким ночником на тумбочке. Ничего не нужно включать.
      </p>
    </div>
  );
}

export function Night() {
  const mode = useStore((s) => s.mode);
  const section = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);

  const ctl = useMemo(
    () =>
      createCtl({
        species: "birch",
        camX: 0.9,
        camY: 1.6,
        camZ: 7.2,
        tgtX: 0.4,
        tgtY: 0.8,
        glow: 0.25,
        breath: 0.4,
        props: { vase: false, books: false },
        minAspect: 1.3,
        drift: 0.6,
      }),
    [],
  );

  useEffect(() => {
    if (!mode || mode === "static" || !section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    ctl.shiftX = mobile ? 0 : -0.16;
    ctl.shiftY = mobile ? 0.14 : 0;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      tl.to(ctl, { night: 1, screen: 0.22, glow: 0.62, breath: 0.15, camZ: 6.3, camY: 1.3, tgtY: 0.7, duration: 1 }, 0)
        .to(shade.current, { opacity: 1, duration: 1 }, 0)
        .fromTo(copy.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.4);
      ScrollTrigger.create({ trigger: section.current, start: "top top", end: "bottom bottom", scrub: 1, animation: tl });
    }, section);
    return () => ctx.revert();
  }, [mode, ctl]);

  if (mode === "static")
    return (
      <section id="night" data-theme="dark" className="bg-[#0b0a0c]">
        <StaticNight />
      </section>
    );

  return (
    <section ref={section} id="night" data-theme="dark" className="relative h-[240vh] bg-stage" aria-label="Рамка-ночник">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <SceneSlot ctl={ctl} fallback={null} className="absolute inset-0" />
        <div ref={shade} className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,transparent_40%,rgba(7,7,10,0.5))] opacity-0" />
        <div className="pointer-events-none relative z-10 wrap flex h-full items-start pt-24 md:items-center md:justify-end md:pt-0">
          <div ref={copy} className="md:w-[42%]">
            <Copy />
          </div>
        </div>
      </div>
    </section>
  );
}
