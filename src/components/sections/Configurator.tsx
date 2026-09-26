"use client";
import { useEffect, useMemo } from "react";
import gsap from "gsap";
import { SIZES, SPECIES, PRICE_NOTE, formatPrice, getPrice, speciesName } from "@/config/pricing";
import { SceneSlot } from "@/components/SceneSlot";
import { MiniFrame } from "@/components/ui/MiniFrame";
import { ModelPicker } from "@/components/ui/ModelPicker";
import { ArrowIcon } from "@/components/ui/Icons";
import { useStore } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { track } from "@/lib/analytics";
import { createCtl } from "@/three/ctl";

const scaleFor = (size: number) => size / 10;

function StaticPreview() {
  const species = useStore((s) => s.species);
  const size = useStore((s) => s.size);
  const color = SPECIES.find((s) => s.id === species)!.color;
  return (
    <div className="relative flex size-full items-end justify-center gap-[4%] px-8 pb-16">
      <div className="mb-0 aspect-[0.45] w-[14%] rounded-t-[40%] rounded-b-[18%] bg-[#E7DED0]/90" aria-hidden />
      <div className="transition-[width] duration-700 ease-out" style={{ width: `${36 * scaleFor(size)}%` }}>
        <MiniFrame wood={color} glow={0.5} photo={0} alt={`Рамка ${size}″, ${speciesName(species).toLowerCase()}`} />
      </div>
      <div className="w-[26%]" aria-hidden>
        <div className="h-3 rounded-[3px] bg-[#EDE6DA]" />
        <div className="h-4 rounded-[3px] bg-[#56604B]" />
      </div>
    </div>
  );
}

export function Configurator() {
  const species = useStore((s) => s.species);
  const size = useStore((s) => s.size);
  const price = getPrice(size, species);
  const sizeInfo = SIZES.find((s) => s.id === size)!;

  const ctl = useMemo(
    () =>
      createCtl({
        species: useStore.getState().species,
        scale: scaleFor(useStore.getState().size),
        camY: 2.3,
        camZ: 12,
        tgtY: 1.1,
        glow: 0.35,
        breath: 1,
        pointer: 0.5,
        drift: 0.5,
        props: { vase: true, books: true },
        minAspect: 1.5,
      }),
    [],
  );

  useEffect(() => {
    ctl.species = species;
    ctl.ripple++;
  }, [species, ctl]);

  // на широком экране сцена левее панели выбора
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      ctl.shiftX = mq.matches ? -0.14 : 0;
      ctl.minAspect = mq.matches ? 1.9 : 1.4;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [ctl]);

  useEffect(() => {
    const t = gsap.to(ctl, { scale: scaleFor(size), duration: 1.1, ease: "expo.out" });
    return () => {
      t.kill();
    };
  }, [size, ctl]);

  return (
    <section id="models" data-theme="dark" className="relative bg-stage" aria-labelledby="models-title">
      <div className="relative flex flex-col md:block md:h-[100svh] md:min-h-[760px]">
        <SceneSlot ctl={ctl} fallback={<StaticPreview />} className="relative h-[62svh] min-h-[380px] md:absolute md:inset-0 md:h-auto" />
        <p className="t-caption pointer-events-none absolute bottom-6 left-[var(--gutter)] z-10 text-cream/55 max-md:top-[calc(62svh-40px)] max-md:bottom-auto">
          {sizeInfo.label} · экран {sizeInfo.screen} · рамка {sizeInfo.outer}
        </p>

        <div className="relative z-10 wrap pb-16 md:pointer-events-none md:absolute md:inset-0 md:flex md:items-center md:justify-end md:pb-0">
          <div className="md:pointer-events-auto md:w-[400px] md:rounded-[28px] md:border md:border-white/10 md:bg-[#1a1411]/75 md:p-8 md:backdrop-blur-xl">
            <p className="t-caption mb-4 text-cream/55">Материалы и размеры</p>
            <h2 id="models-title" className="t-h3">
              Выберите <span className="accent">свою</span>
            </h2>
            <p className="mt-3 text-[15px] leading-[1.55] text-cream/60">Цельный массив, покрытый маслом с воском. Ваза и книги рядом — чтобы было понятно, какого она размера.</p>
            <div className="mt-7">
              <ModelPicker tone="dark" source="configurator" />
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-[14px]">
              <div>
                <dt className="text-cream/55">Экран</dt>
                <dd className="mt-1">{sizeInfo.screen}</dd>
              </div>
              <div>
                <dt className="text-cream/55">Рамка</dt>
                <dd className="mt-1">{sizeInfo.outer}</dd>
              </div>
              <div>
                <dt className="text-cream/55">Вес</dt>
                <dd className="mt-1">{sizeInfo.weight}</dd>
              </div>
            </dl>
            <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[13px] text-cream/55">{PRICE_NOTE}</p>
                <p className="mt-1 text-[34px] font-semibold tracking-[-0.03em] tabular-nums" aria-live="polite">
                  {formatPrice(price)}
                </p>
              </div>
              <a
                href="#preorder"
                className="btn btn-cream"
                onClick={(e) => {
                  e.preventDefault();
                  track("preorder_open", { source: "configurator", size, species });
                  scrollToId("preorder");
                }}
              >
                Предзаказать <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
