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
        camY: 2.1,
        camZ: 11.5,
        tgtY: 1.05,
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
  }, [species, ctl]);

  useEffect(() => {
    const t = gsap.to(ctl, { scale: scaleFor(size), duration: 1.1, ease: "expo.out" });
    return () => {
      t.kill();
    };
  }, [size, ctl]);

  return (
    <section id="models" data-theme="dark" className="relative bg-stage py-20 md:py-28" aria-labelledby="models-title">
      <div className="wrap grid items-center gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-16">
        <div className="card relative h-[58svh] min-h-[340px] overflow-hidden bg-stage-2 lg:h-[76svh]">
          <SceneSlot ctl={ctl} fallback={<StaticPreview />} className="absolute inset-0" />
          <p className="t-caption pointer-events-none absolute bottom-5 left-6 text-cream/55">
            {sizeInfo.label} · экран {sizeInfo.screen}
          </p>
        </div>

        <div>
          <p className="t-caption mb-6 text-cream/50">Материалы и размеры</p>
          <h2 id="models-title" className="t-h2">
            Выберите <span className="accent">свою</span>
          </h2>
          <p className="t-body mt-5 text-cream/60">
            Три породы дерева и три размера. Каждая рамка вырезана из цельного массива и покрыта маслом с воском — на ощупь тёплая, как мебель.
          </p>
          <div className="mt-10">
            <ModelPicker tone="dark" source="configurator" />
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-[14px]">
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
          <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[13px] text-cream/55">{PRICE_NOTE}</p>
              <p className="mt-1 text-[40px] font-semibold tracking-[-0.03em] tabular-nums" aria-live="polite">
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
              Предзаказать эту <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
