import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME, CONTACTS, LEGAL } from "@/config/brand";

export const metadata: Metadata = {
  title: `Политика конфиденциальности — ${BRAND_NAME}`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main data-theme="light" className="min-h-screen bg-cream py-20 text-ink md:py-28">
      <article className="wrap max-w-[820px]">
        <Link href="/" className="text-[15px] text-muted hover:text-ink">
          ← {BRAND_NAME}
        </Link>
        <h1 className="t-h2 mt-10">Политика конфиденциальности</h1>
        <p className="mt-4 text-[14px] text-muted">Черновик. Финальный текст будет согласован с юристом до начала продаж.</p>
        <div className="mt-12 grid gap-8 text-[17px] leading-[1.65] text-ink/80">
          <section>
            <h2 className="mb-3 text-[22px] font-semibold text-ink">Какие данные мы собираем</h2>
            <p>
              При оформлении предзаказа — имя, телефон или адрес почты и выбранную модель рамки. Эти данные нужны только для того, чтобы сообщить вам о начале производства
              и согласовать доставку.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-[22px] font-semibold text-ink">Фото и голосовые истории</h2>
            <p>
              Фото и записи принадлежат вашей семье. Их видят и слышат только приглашённые участники. Любую запись или весь архив можно удалить в любой момент. Мы не
              используем фото и голоса для обучения нейросетей.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-[22px] font-semibold text-ink">Где хранятся данные</h2>
            <p>Данные хранятся на серверах в Российской Федерации в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».</p>
          </section>
          <section>
            <h2 className="mb-3 text-[22px] font-semibold text-ink">Как отозвать согласие</h2>
            <p>
              Напишите нам на <a href={`mailto:${CONTACTS.email}`} className="underline underline-offset-4">{CONTACTS.email}</a> — удалим ваши данные в течение 10 рабочих дней.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-[22px] font-semibold text-ink">Оператор данных</h2>
            <p>
              {LEGAL.company}, ИНН {LEGAL.inn}, ОГРН {LEGAL.ogrn}. {LEGAL.address}.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
