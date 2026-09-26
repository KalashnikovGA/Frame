"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MEDIA } from "@/config/media";
import { scrollToId } from "@/lib/scroll";
import { Heading } from "./Heading";

const CARDS = [
  { img: MEDIA.web.grandparents, title: "Бабушке и дедушке", text: "Внуки растут у них на глазах — даже за тысячу километров" },
  { img: MEDIA.web.mom, title: "Маме", text: "Ваш голос каждое утро вместо «как дела?» в мессенджере" },
  { img: MEDIA.web.couple, title: "Любимому человеку", text: "Когда вы в разных городах, свет под рамкой говорит «я рядом»" },
  { img: MEDIA.web.grandpa, title: "Папе", text: "Истории, которые он никогда не напишет, но с радостью расскажет" },
];

/** «Для тех, кого любят»: большие карточки с фото, как галерея людей. */
export function GiftFor() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!root.current || document.documentElement.classList.contains("no-motion")) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-gift]", { y: 60, opacity: 0.2 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: "[data-gifts]", start: "top 80%", once: true } });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} id="gift" className="py-20 md:py-32" aria-labelledby="gift-title">
      <div className="px-4">
        <Heading
          id="gift-title"
          title="Для тех, кого любят"
          sub="Подарок, который продолжает дарить: каждый день новые фото и голоса."
          cta={
            <a href="#variants" className="pill pill-dark" onClick={(e) => { e.preventDefault(); scrollToId("variants"); }}>
              Выбрать модель
            </a>
          }
        />
      </div>
      <ul data-gifts className="mt-14 flex snap-x snap-mandatory gap-1 overflow-x-auto px-4 pb-2 md:mt-20 md:grid md:grid-cols-4 md:overflow-visible md:px-6">
        {CARDS.map((c) => (
          <li key={c.title} data-gift className="group w-[78vw] shrink-0 snap-start md:w-auto">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#dcdbd4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.05]" />
              <span className="absolute bottom-5 left-5 grid size-11 translate-y-2 place-items-center rounded-full bg-white/80 opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden>
                ↗
              </span>
            </div>
            <p className="mt-4 text-[18px] leading-tight">{c.title}</p>
            <p className="mt-1 text-[16px] leading-snug text-[var(--muted-2)]">{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
