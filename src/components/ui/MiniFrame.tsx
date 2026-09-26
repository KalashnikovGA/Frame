"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { woodDataUrl } from "@/lib/wood";
import { Photo } from "./Photo";

type Props = {
  wood?: string;
  glow?: number;
  photo?: number;
  dim?: number;
  className?: string;
  style?: CSSProperties;
  /** слои поверх фото на экране (второе фото, кольцо касания…) */
  screen?: ReactNode;
  children?: ReactNode;
  alt?: string;
};

/** Рамка, нарисованная в CSS (с настоящей текстурой дерева): для схем, интерактивов и статичных версий. */
export function MiniFrame({ wood = "#E6D3B3", glow = 0.3, photo = 0, dim = 1, className = "", style, screen, children, alt }: Props) {
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (body.current) body.current.style.setProperty("--wood-img", `url(${woodDataUrl(wood)})`);
  }, [wood]);
  return (
    <div className={`mini-frame ${className}`} style={{ "--wood": wood, "--glow-level": glow, ...style } as CSSProperties}>
      <div className="mini-frame__glow" aria-hidden />
      <div ref={body} className="mini-frame__body">
        <div className="mini-frame__screen">
          <Photo index={photo} dim={dim} alt={alt} />
          {screen}
        </div>
      </div>
      {children}
    </div>
  );
}
