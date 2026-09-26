const POINTS = [
  { t: "Принадлежат семье", d: "Фото и голоса видят и слышат только те, кого вы пригласили. Ни рекламы, ни посторонних." },
  { t: "Удаляются в любой момент", d: "Одну историю или весь архив — одним нажатием. Удаляем по-настоящему, без копий «на всякий случай»." },
  { t: "Не обучаем модели", d: "Ваши фото и голоса никогда не используются для обучения нейросетей. Ни наших, ни чужих." },
  { t: "Хранятся в России", d: "Данные лежат на серверах в России и передаются в зашифрованном виде." },
];

export function Privacy() {
  return (
    <section id="privacy" data-theme="light" className="bg-paper py-24 text-ink md:py-36" aria-labelledby="privacy-title">
      <div className="wrap grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div>
          <p className="t-caption mb-6 text-muted">Приватность</p>
          <h2 id="privacy-title" className="t-h2 max-w-[14ch]">
            Воспоминания принадлежат <span className="accent">семье</span>
          </h2>
        </div>
        <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {POINTS.map((p) => (
            <div key={p.t} className="border-t border-hairline pt-6">
              <dt className="text-[20px] font-semibold tracking-[-0.02em]">{p.t}</dt>
              <dd className="mt-3 text-[16px] leading-[1.55] text-ink/65">{p.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
