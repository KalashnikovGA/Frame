"use client";
import { useEffect, useState } from "react";
import { BRAND_NAME } from "@/config/brand";
import { scrollToId } from "@/lib/scroll";
import { track } from "@/lib/analytics";

const LINKS = [
  { id: "arrive", text: "Как работает" },
  { id: "showcase", text: "Свет и касание" },
  { id: "variants", text: "Модели" },
  { id: "faq", text: "Вопросы" },
];

/** Плавающая стеклянная панель с объявлением сверху. Прячется при прокрутке вниз, возвращается при прокрутке вверх. */
export function TopBar() {
  const [announce, setAnnounce] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [onHero, setOnHero] = useState(true);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setHidden(y > 240 && y > last + 2);
        if (y < last - 2 || y < 240) setHidden(false);
        last = y;
        const hero = document.getElementById("top");
        setOnHero(!!hero && hero.getBoundingClientRect().bottom > 120);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] md:px-4 md:pt-4"
      style={{ transform: hidden ? "translateY(-110%)" : "none" }}
    >
      {announce && (
        <div className="mb-2 flex h-9 items-center justify-center gap-3 rounded-[10px] bg-[#141311] px-10 text-[13px] text-white md:text-[14px]">
          <a href="#preorder" onClick={go("preorder")} className="min-w-0 truncate hover:underline">
            Предзаказ открыт — без оплаты. Сообщим, когда начнём производство →
          </a>
          <button type="button" aria-label="Закрыть объявление" onClick={() => setAnnounce(false)} className="absolute right-6 text-white/70 hover:text-white md:right-8">
            ✕
          </button>
        </div>
      )}
      <nav
        className={`flex h-14 items-center justify-between gap-4 rounded-[12px] px-4 backdrop-blur-xl transition-colors duration-500 md:h-[72px] md:px-6 ${
          onHero ? "bg-white/70" : "bg-[#efeee9]/80"
        }`}
        aria-label="Основная навигация"
      >
        <div className="flex items-center gap-8">
          <a href="#top" onClick={go("top")} className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.02em] text-[#141311]">
            <svg width="26" height="22" viewBox="0 0 26 22" aria-hidden>
              <rect x="1" y="1" width="24" height="17" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <rect x="5" y="20" width="16" height="1.8" rx="0.9" fill="#E8913A" />
            </svg>
            {BRAND_NAME}
          </a>
          <ul className="hidden items-center gap-7 text-[15px] text-[#141311] lg:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={go(l.id)} className="opacity-80 transition-opacity hover:opacity-100">
                  {l.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <a href="#variants" onClick={go("variants")} className="hidden px-3 text-[15px] text-[#141311] opacity-80 hover:opacity-100 sm:block">
            Цены
          </a>
          <a
            href="#preorder"
            onClick={(e) => {
              go("preorder")(e);
              track("preorder_open", { source: "nav" });
            }}
            className="pill pill-dark !h-10 !px-4 !text-[14px]"
          >
            Предзаказ
          </a>
        </div>
      </nav>
    </header>
  );
}
