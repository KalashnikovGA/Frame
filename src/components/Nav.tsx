"use client";
import { useEffect, useState } from "react";
import { BRAND_NAME } from "@/config/brand";
import { scrollToId } from "@/lib/scroll";
import { track } from "@/lib/analytics";

const LINKS = [
  { id: "anatomy", text: "Устройство" },
  { id: "how", text: "Как работает" },
  { id: "models", text: "Модели" },
  { id: "faq", text: "Вопросы" },
];

/** Верхняя панель: подстраивает цвет под секцию, над которой находится. */
export function Nav() {
  const [light, setLight] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setScrolled(window.scrollY > 40);
      const sections = document.querySelectorAll<HTMLElement>("[data-theme]");
      let theme = "dark";
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= 32 && r.bottom > 32) theme = s.dataset.theme!;
      }
      setLight(theme === "light");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${light ? "text-ink" : "text-cream"}`}
      style={{
        background: scrolled ? (light ? "rgba(244,239,231,0.72)" : "rgba(20,16,13,0.55)") : "transparent",
        backdropFilter: scrolled ? "blur(18px) saturate(1.4)" : undefined,
        WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.4)" : undefined,
      }}
    >
      <nav className="wrap flex h-16 items-center justify-between gap-6" aria-label="Основная навигация">
        <a href="#top" onClick={go("top")} className="text-[19px] font-semibold tracking-[-0.03em]">
          {BRAND_NAME}
        </a>
        <ul className="hidden items-center gap-8 text-[14px] md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={go(l.id)} className="opacity-70 transition-opacity hover:opacity-100">
                {l.text}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#preorder"
          onClick={(e) => {
            go("preorder")(e);
            track("preorder_open", { source: "nav" });
          }}
          className={`btn !min-h-10 !px-5 !text-[14px] ${light ? "btn-ink" : "btn-cream"}`}
        >
          Предзаказ
        </a>
      </nav>
    </header>
  );
}
