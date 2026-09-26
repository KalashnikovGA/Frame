import { BRAND_NAME, CONTACTS, LEGAL, PRIVACY_URL } from "@/config/brand";

const COLS = [
  {
    title: "Рамка",
    links: [
      { href: "#arrive", text: "Как это работает" },
      { href: "#showcase", text: "Касание и свет" },
      { href: "#variants", text: "Модели и цены" },
      { href: "#specs", text: "Характеристики" },
      { href: "#preorder", text: "Предзаказ" },
    ],
  },
  {
    title: "Помощь",
    links: [
      { href: "#faq", text: "Вопросы и ответы" },
      { href: "#faq", text: "Доставка" },
      { href: "#faq", text: "Возврат" },
      { href: PRIVACY_URL, text: "Политика конфиденциальности" },
    ],
  },
  {
    title: "Связаться",
    links: [
      { href: `mailto:${CONTACTS.email}`, text: CONTACTS.email },
      { href: `tel:${CONTACTS.phoneHref}`, text: CONTACTS.phone },
      { href: CONTACTS.telegram, text: "Телеграм" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#141311] px-4 pt-16 pb-8 text-white md:px-9 md:pt-24">
      <div className="grid gap-12 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        <div>
          <svg width="52" height="44" viewBox="0 0 26 22" aria-hidden>
            <rect x="1" y="1" width="24" height="17" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <rect x="5" y="20" width="16" height="1.8" rx="0.9" fill="#E8913A" />
          </svg>
          <p className="f-serif mt-6 max-w-[16ch] text-[32px] leading-[1.1]">Выглядит как обычная рамка. Пока не заговорит</p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="mb-5 flex items-center gap-2 text-[14px] text-white/60">
              <span className="size-2 rounded-full bg-white/60" />
              {c.title}
            </p>
            <ul className="grid gap-2.5">
              {c.links.map((l) => (
                <li key={l.text}>
                  <a href={l.href} className="group inline-flex items-center gap-2 text-[17px] text-white/90 hover:text-white">
                    {l.text}
                    <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-[13px] text-white/55 md:flex-row">
        <p>
          {LEGAL.company} · ИНН {LEGAL.inn} · ОГРН {LEGAL.ogrn}
        </p>
        <p>
          © {new Date().getFullYear()} {BRAND_NAME} · Фото на сайте — временные, с Pexels
        </p>
      </div>
    </footer>
  );
}
