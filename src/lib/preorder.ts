import { PRICES, type Size, type Species } from "@/config/pricing";

export type PreorderInput = {
  name: string;
  contact: string;
  consent: boolean;
  species: Species;
  size: Size;
};

export type PreorderErrors = Partial<Record<"name" | "contact" | "consent" | "model", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function contactKind(contact: string): "email" | "phone" | null {
  const c = contact.trim();
  if (EMAIL.test(c)) return "email";
  const digits = c.replace(/[^\d]/g, "");
  if (/^[+\d\s()-]+$/.test(c) && digits.length >= 10 && digits.length <= 15) return "phone";
  return null;
}

/** Общая проверка — и в браузере, и на сервере. */
export function validatePreorder(d: Partial<PreorderInput>): PreorderErrors {
  const e: PreorderErrors = {};
  const name = (d.name ?? "").trim();
  if (name.length < 2) e.name = "Напишите, как к вам обращаться";
  else if (name.length > 80) e.name = "Слишком длинное имя";
  if (!contactKind(d.contact ?? "")) e.contact = "Укажите телефон (от 10 цифр) или почту";
  if (d.consent !== true) e.consent = "Нужно согласие, чтобы мы могли с вами связаться";
  if (!d.size || !d.species || !PRICES[d.size]?.[d.species]) e.model = "Выберите модель";
  return e;
}
