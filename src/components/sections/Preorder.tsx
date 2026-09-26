"use client";
import { useState } from "react";
import { PRICE_NOTE, formatPrice, getPrice, modelLabel } from "@/config/pricing";
import { ModelPicker } from "@/components/ui/ModelPicker";
import { useStore } from "@/lib/store";
import { track } from "@/lib/analytics";
import { validatePreorder, type PreorderErrors } from "@/lib/preorder";

type Status = "idle" | "sending" | "done" | "error";

export function Preorder() {
  const species = useStore((s) => s.species);
  const size = useStore((s) => s.size);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<PreorderErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [done, setDone] = useState<{ name: string; model: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, contact, consent, species, size };
    const errs = validatePreorder(data);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`po-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/preorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        setStatus("error");
        return;
      }
      track("preorder_submit", { size, species });
      setDone({ name: name.trim(), model: modelLabel(size, species) });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const field =
    "w-full rounded-[18px] border border-white/12 bg-white/[0.04] px-5 py-4 text-[17px] text-cream placeholder:text-cream/30 transition-colors focus:border-glow/70 focus:outline-none aria-[invalid=true]:border-[#e38b6f]";

  return (
    <section id="preorder" data-theme="dark" className="relative overflow-hidden bg-stage py-24 md:py-36" aria-labelledby="preorder-title">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-[radial-gradient(50%_60%_at_50%_100%,rgba(255,179,92,0.10),transparent)]"
        aria-hidden
      />
      <div className="wrap relative grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <div>
          <p className="t-caption mb-6 text-cream/50">Предзаказ</p>
          <h2 id="preorder-title" className="t-h1 max-w-[12ch]">
            Будьте первыми, кто <span className="accent">услышит</span>
          </h2>
          <p className="t-body mt-6 text-cream/65">
            Предзаказ без оплаты. Сообщим, когда начнём производство, и только тогда предложим оплатить. Передумать можно в любой момент.
          </p>
          <ul className="mt-10 grid gap-4 border-t border-white/10 pt-8 text-[16px] text-cream/70">
            <li>Цена предзаказа сохраняется за вами</li>
            <li>Доставка по всей России</li>
            <li>14 дней на возврат после получения</li>
          </ul>
        </div>

        <div className="card bg-stage-2 p-6 sm:p-10">
          {status === "done" && done ? (
            <div className="flex min-h-[420px] flex-col justify-center" role="status">
              <span className="mb-8 block h-[3px] w-16 rounded-full bg-glow shadow-[0_0_18px_4px_rgba(255,179,92,0.55)]" />
              <p className="t-h3">Спасибо, {done.name}.</p>
              <p className="t-body mt-4 text-cream/65">
                Мы записали ваш предзаказ: {done.model}. Напишем, как только начнём производство. Платить сейчас ничего не нужно.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-7">
              <ModelPicker tone="dark" source="preorder" />
              <div className="flex items-baseline justify-between border-y border-white/10 py-5">
                <span className="text-[15px] text-cream/60">
                  {modelLabel(size, species)} · <span className="text-cream/55">{PRICE_NOTE.toLowerCase()}</span>
                </span>
                <span className="shrink-0 whitespace-nowrap pl-4 text-[22px] font-semibold tracking-[-0.02em] tabular-nums">{formatPrice(getPrice(size, species))}</span>
              </div>

              <div>
                <label htmlFor="po-name" className="mb-2 block text-[14px] text-cream/60">
                  Как к вам обращаться
                </label>
                <input
                  id="po-name"
                  name="name"
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "po-name-err" : undefined}
                  className={field}
                  placeholder="Имя"
                />
                {errors.name && (
                  <p id="po-name-err" className="mt-2 text-[14px] text-[#f0a58c]">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="po-contact" className="mb-2 block text-[14px] text-cream/60">
                  Телефон или почта
                </label>
                <input
                  id="po-contact"
                  name="contact"
                  autoComplete="tel"
                  inputMode="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  aria-invalid={!!errors.contact}
                  aria-describedby={errors.contact ? "po-contact-err" : "po-contact-hint"}
                  className={field}
                  placeholder="+7 900 000-00-00 или почта"
                />
                {errors.contact ? (
                  <p id="po-contact-err" className="mt-2 text-[14px] text-[#f0a58c]">
                    {errors.contact}
                  </p>
                ) : (
                  <p id="po-contact-hint" className="mt-2 text-[13px] text-cream/55">
                    Только чтобы сообщить о старте производства. Без рассылок.
                  </p>
                )}
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-[1.5] text-cream/65">
                  <input
                    id="po-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? "po-consent-err" : undefined}
                    className="mt-0.5 size-5 shrink-0 accent-[var(--oak)]"
                  />
                  <span>
                    Согласен на обработку персональных данных в соответствии с{" "}
                    <a href="/privacy" className="underline decoration-white/30 underline-offset-4 hover:decoration-cream">
                      политикой конфиденциальности
                    </a>
                  </span>
                </label>
                {errors.consent && (
                  <p id="po-consent-err" className="mt-2 text-[14px] text-[#f0a58c]">
                    {errors.consent}
                  </p>
                )}
              </div>

              <button type="submit" className="btn btn-cream w-full" disabled={status === "sending"}>
                {status === "sending" ? "Отправляем…" : "Оформить предзаказ"}
              </button>
              {status === "error" && (
                <p className="text-center text-[14px] text-[#f0a58c]" role="alert">
                  Не получилось отправить. Проверьте поля или попробуйте ещё раз через минуту.
                </p>
              )}
              <p className="text-center text-[13px] text-cream/55">Предзаказ без оплаты. Сообщим, когда начнём производство.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
