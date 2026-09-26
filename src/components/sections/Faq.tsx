"use client";
import { useId, useState } from "react";
import { FAQ } from "@/config/content";

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <li className="border-t border-hairline">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-[20px] font-medium tracking-[-0.02em] md:py-7 md:text-[24px]"
        >
          {q}
          <span className="relative size-5 shrink-0" aria-hidden>
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink" />
            <span className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink transition-transform duration-500 ${open ? "scale-y-0" : ""}`} />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden" inert={!open}>
          <p className="max-w-[60ch] pb-7 text-[17px] leading-[1.6] text-ink/65">{a}</p>
        </div>
      </div>
    </li>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" data-theme="light" className="bg-[var(--paper-2)] py-24 text-ink md:py-36" aria-labelledby="faq-title">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div>
          <p className="t-caption mb-6 text-muted">Вопросы и ответы</p>
          <h2 id="faq-title" className="v2-h2 max-w-[12ch]">
            Что обычно <em className="italic">спрашивают</em>
          </h2>
        </div>
        <ul className="border-b border-hairline">
          {FAQ.map((f, i) => (
            <Item key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </ul>
      </div>
    </section>
  );
}
