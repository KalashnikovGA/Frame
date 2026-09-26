"use client";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Props = { title: ReactNode; sub?: ReactNode; cta?: ReactNode; id?: string; className?: string; tone?: "light" | "dark" };

/** Заголовок секции по центру: крупная антиква, подзаголовок и кнопка. Мягко всплывает при появлении. */
export function Heading({ title, sub, cta, id, className = "", tone = "light" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current || document.documentElement.classList.contains("no-motion")) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.current!.children,
        { y: 36, opacity: 0.15 },
        { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 85%", once: true } },
      );
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={root} className={`mx-auto flex max-w-[1000px] flex-col items-center gap-5 text-center md:gap-7 ${tone === "dark" ? "text-white" : ""} ${className}`}>
      <h2 id={id} className="v2-h2">
        {title}
      </h2>
      {sub && <p className={`v2-sub max-w-[62ch] ${tone === "dark" ? "!text-white" : ""}`}>{sub}</p>}
      {cta}
    </div>
  );
}
