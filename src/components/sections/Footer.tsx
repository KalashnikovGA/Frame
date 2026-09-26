import Link from "next/link";
import { BRAND_NAME, CONTACTS, LEGAL } from "@/config/brand";

export function Footer() {
  return (
    <footer data-theme="dark" className="bg-stage pt-20 pb-10 text-cream">
      <div className="wrap">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-[28px] font-semibold tracking-[-0.03em]">{BRAND_NAME}</p>
            <p className="mt-3 max-w-[32ch] text-[15px] text-cream/50">Выглядит как обычная рамка. Пока не заговорит.</p>
          </div>
          <div className="grid content-start gap-3 text-[15px]">
            <p className="t-caption mb-2 text-cream/55">Связаться</p>
            <a href={`mailto:${CONTACTS.email}`} className="text-cream/75 hover:text-cream">
              {CONTACTS.email}
            </a>
            <a href={`tel:${CONTACTS.phoneHref}`} className="text-cream/75 hover:text-cream">
              {CONTACTS.phone}
            </a>
            <a href={CONTACTS.telegram} className="text-cream/75 hover:text-cream" rel="noopener">
              Телеграм
            </a>
          </div>
          <div className="grid content-start gap-3 text-[15px]">
            <p className="t-caption mb-2 text-cream/55">Документы</p>
            <Link href="/privacy" className="text-cream/75 hover:text-cream">
              Политика конфиденциальности
            </Link>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 pt-8 text-[13px] text-cream/35 md:flex-row">
          <p>
            {LEGAL.company} · ИНН {LEGAL.inn} · ОГРН {LEGAL.ogrn} · {LEGAL.address}
          </p>
          <p>© {new Date().getFullYear()} {BRAND_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
