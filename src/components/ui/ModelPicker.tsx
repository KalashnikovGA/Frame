"use client";
import { SIZES, SPECIES, type Size, type Species } from "@/config/pricing";
import { useStore } from "@/lib/store";
import { track } from "@/lib/analytics";

type Tone = "dark" | "light";

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  tone,
  render,
}: {
  label: string;
  options: { id: T; text: string }[];
  value: T;
  onChange: (v: T) => void;
  tone: Tone;
  render?: (o: { id: T; text: string }, active: boolean) => React.ReactNode;
}) {
  const border = tone === "dark" ? "border-white/12" : "border-ink/10";
  const activeCls = tone === "dark" ? "bg-cream text-ink" : "bg-ink text-cream";
  const idle = tone === "dark" ? "text-cream/75 hover:text-cream" : "text-ink/70 hover:text-ink";
  return (
    <fieldset>
      <legend className={`t-caption mb-3 ${tone === "dark" ? "text-cream/50" : "text-muted"}`}>{label}</legend>
      <div className={`flex rounded-full border ${border} p-1`} role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={String(o.id)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.id)}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-3 text-[15px] font-medium transition-colors duration-300 ${active ? activeCls : idle}`}
            >
              {render ? render(o, active) : o.text}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Выбор породы и размера — общий стейт для конфигуратора и формы предзаказа. */
export function ModelPicker({ tone = "dark", source }: { tone?: Tone; source: string }) {
  const species = useStore((s) => s.species);
  const size = useStore((s) => s.size);
  const setSpecies = useStore((s) => s.setSpecies);
  const setSize = useStore((s) => s.setSize);

  return (
    <div className="grid gap-6">
      <Segmented<Species>
        label="Порода"
        tone={tone}
        value={species}
        options={SPECIES.map((s) => ({ id: s.id, text: s.name }))}
        onChange={(v) => {
          setSpecies(v);
          track("configurator", { species: v, source });
        }}
        render={(o) => (
          <>
            <span
              className="size-3.5 shrink-0 rounded-full ring-1 ring-black/10"
              style={{ background: SPECIES.find((s) => s.id === o.id)!.color }}
              aria-hidden
            />
            {o.text}
          </>
        )}
      />
      <Segmented<Size>
        label="Размер экрана"
        tone={tone}
        value={size}
        options={SIZES.map((s) => ({ id: s.id, text: s.label }))}
        onChange={(v) => {
          setSize(v);
          track("configurator", { size: v, source });
        }}
      />
    </div>
  );
}
