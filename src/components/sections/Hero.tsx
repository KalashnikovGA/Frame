"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { MEDIA } from "@/config/media";
import { formatPrice, minPrice } from "@/config/pricing";
import { SceneSlot } from "@/components/SceneSlot";
import { SoundIcon, ArrowIcon } from "@/components/ui/Icons";
import { useStore } from "@/lib/store";
import { story } from "@/lib/story";
import { bindTilt } from "@/lib/live";
import { scrollToId } from "@/lib/scroll";
import { track } from "@/lib/analytics";
import { createCtl } from "@/three/ctl";

function Fallback() {
  const caption = useStore((s) => s.caption);
  return (
    <div className="absolute inset-0">
      {MEDIA.heroLoop ? (
        <video src={MEDIA.heroLoop} poster={MEDIA.heroPoster ?? undefined} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />
      ) : MEDIA.heroPoster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={MEDIA.heroPoster}
          alt="Деревянная фоторамка на комоде, под ней мягко светится стол"
          className="absolute inset-0 size-full object-cover object-[65%_50%]"
          fetchPriority="high"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,16,13,0.92)_0%,rgba(20,16,13,0.7)_38%,rgba(20,16,13,0.05)_70%)] max-md:bg-[linear-gradient(180deg,rgba(20,16,13,0.94)_0%,rgba(20,16,13,0.75)_45%,rgba(20,16,13,0.1)_75%)]" />
      {caption && (
        <p className="absolute inset-x-0 bottom-8 px-6 text-center font-serif text-[26px] font-semibold text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]">
          {caption}
        </p>
      )}
    </div>
  );
}

export function Hero() {
  const status = useStore((s) => s.story);
  const progress = useStore((s) => s.progress);
  const caption = useStore((s) => s.caption);
  const root = useRef<HTMLElement>(null);
  const [replyHint, setReplyHint] = useState(false);

  const ctl = useMemo(
    () =>
      createCtl({
        species: "birch",
        camX: -0.55,
        camY: 1.5,
        camZ: 9.8,
        tgtX: -0.55,
        tgtY: 0.95,
        tgtZ: -0.5,
        glow: 0.24,
        breath: 1,
        voice: 1,
        pointer: 1,
        drift: 1,
        minAspect: 1.05,
        photo: 0,
        // вторая рамка на столе — с любимым человеком: рамка не только для бабушек
        companions: [
          {
            ctl: createCtl({ species: "oak", scale: 0.82, photo: 1, glow: 0.2, breath: 1 }),
            position: [-1.8, 0, -1.75],
            rotY: 0.3,
          },
        ],
      }),
    [],
  );

  // композиция кадра: на широком экране рамка справа от текста, на телефоне — под текстом
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      if (mq.matches) {
        ctl.shiftX = 0.25;
        ctl.shiftY = 0.03;
        ctl.minAspect = 1.05;
      } else {
        ctl.shiftX = 0;
        ctl.shiftY = -0.02;
        ctl.minAspect = 1.3;
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [ctl]);

  // стейт истории → сцена
  useEffect(
    () =>
      useStore.subscribe((s) => {
        ctl.caption = s.caption;
        ctl.pulse = s.story === "ended" ? 1 : 0;
        ctl.glow = s.story === "playing" ? 0.12 : 0.24;
        ctl.breath = s.story === "playing" ? 0 : 1;
      }),
    [ctl],
  );

  useEffect(() => {
    ctl.onScreenTap = () => {
      const st = useStore.getState().story;
      if (st === "ended") setReplyHint(true);
      else story.toggle();
    };
  }, [ctl]);

  // построчное появление заголовка — сразу после гидрации, не дожидаясь 3D
  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      const rest = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (document.documentElement.classList.contains("no-motion")) {
        gsap.set(rest, { opacity: 1 });
        gsap.set(".line > span", { yPercent: 0, y: 0 });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo(".line > span", { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.3, stagger: 0.12 })
        .fromTo(rest, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "power3.out" }, 0.45);
    }, root);
    return () => ctx.revert();
  }, []);

  const onListen = () => {
    bindTilt();
    setReplyHint(false);
    story.toggle();
  };

  const playing = status === "playing";
  const label = playing ? "Пауза" : status === "loading" ? "Загружаем…" : status === "ended" ? "Послушать ещё раз" : status === "paused" ? "Продолжить" : "Послушать";

  return (
    <section
      ref={root}
      id="top"
      data-theme="dark"
      className="relative flex flex-col overflow-hidden bg-stage md:block md:h-[100svh] md:min-h-[680px]"
      aria-label="Первый экран"
    >
      <SceneSlot ctl={ctl} eager interactive fallback={<Fallback />} className="relative order-2 -mt-20 h-[min(60svh,500px)] [mask-image:linear-gradient(to_bottom,transparent,black_22%)] md:absolute md:inset-0 md:mt-0 md:h-auto md:[mask-image:none]" />

      <div className="pointer-events-none relative z-10 wrap order-1 flex flex-col pt-24 md:h-full md:justify-center md:pt-16 md:pb-16">
        <div className="max-w-[640px] md:max-w-[52%]">
          <p data-reveal className="t-caption mb-7 hidden text-cream/55 md:block">
            Фоторамка из цельного дерева
          </p>
          <h1 className="t-display">
            <span className="line">
              <span>Выглядит как</span>
            </span>
            <span className="line">
              <span>обычная рамка.</span>
            </span>
            <span className="line">
              <span>
                Пока не <em className="accent">заговорит</em>
              </span>
            </span>
          </h1>
          <p data-reveal className="t-body mt-4 max-w-[31ch] !text-[16px] text-cream/70 md:mt-7 md:!text-[19px]">
            Близкие присылают фото и голос. Мама, бабушка или любимый человек слушает и отвечает одним касанием.
          </p>
          <div data-reveal className="pointer-events-auto mt-6 flex items-center gap-x-3 md:mt-10 md:gap-x-6">
            <a
              href="#preorder"
              className="btn btn-cream max-md:!px-5 max-md:!text-[15px]"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("preorder");
                track("preorder_open", { source: "hero" });
              }}
            >
              Оформить предзаказ
            </a>
            <button type="button" className="btn btn-quiet max-md:!text-[15px]" onClick={onListen} aria-pressed={playing}>
              <span className="btn-quiet__icon">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44" aria-hidden>
                  <circle
                    cx="22"
                    cy="22"
                    r="21.5"
                    fill="none"
                    stroke="var(--glow)"
                    strokeWidth="1"
                    strokeDasharray={135.1}
                    strokeDashoffset={135.1 * (1 - progress)}
                    style={{ opacity: status === "idle" ? 0 : 1, transition: "opacity .4s" }}
                  />
                </svg>
                <SoundIcon playing={playing} />
              </span>
              {label}
            </button>
          </div>
          <p data-reveal className="mt-4 hidden text-[14px] text-cream/55 md:block">
            Предзаказ без оплаты · от {formatPrice(minPrice())}
          </p>
        </div>

        {/* субтитры для экранных чтецов и подсказка после истории */}
        <p className="sr-only" aria-live="polite">
          {caption ?? ""}
        </p>
        <div
          className="pointer-events-none absolute inset-x-0 top-full z-10 mt-[calc(min(60svh,500px)-140px)] flex justify-center md:top-auto md:bottom-10 md:left-[40%] md:mt-0"
          aria-live="polite"
          style={{ opacity: status === "ended" ? 1 : 0, transition: "opacity 1s ease" }}
        >
          <p className="flex items-center gap-3 rounded-full bg-black/35 px-5 py-2.5 text-[15px] text-cream/90 backdrop-blur-md">
            <span className="relative flex size-2.5">
              <span className="absolute inset-0 rounded-full bg-glow" style={{ animation: "pulse-dot 1.6s ease-out infinite" }} />
              <span className="relative size-2.5 rounded-full bg-glow" />
            </span>
            {status === "ended" ? (replyHint ? "В рамке — держите палец на фото и говорите" : "Коснитесь фото, чтобы ответить") : ""}
          </p>
        </div>

        <a
          href="#anatomy"
          onClick={(e) => {
            e.preventDefault();
            scrollToId("anatomy");
          }}
          className="pointer-events-auto absolute bottom-10 left-[var(--gutter)] hidden items-center gap-2 text-[13px] text-cream/55 transition-colors hover:text-cream md:flex"
          style={{ opacity: status === "ended" ? 0 : 1 }}
        >
          <span className="rotate-90">
            <ArrowIcon />
          </span>
          Как она устроена
        </a>
      </div>
    </section>
  );
}
