import type { CSSProperties, ReactNode } from "react";
import { Photo } from "./Photo";

type Props = {
  wood?: string;
  glow?: number;
  photo?: number;
  dim?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  alt?: string;
};

/** Рамка, нарисованная в CSS: для схем, интерактивов и статичных версий секций. */
export function MiniFrame({ wood = "#E6D3B3", glow = 0.3, photo = 0, dim = 1, className = "", style, children, alt }: Props) {
  return (
    <div className={`mini-frame ${className}`} style={{ "--wood": wood, "--glow-level": glow, ...style } as CSSProperties}>
      <div className="mini-frame__glow" aria-hidden />
      <div className="mini-frame__body">
        <div className="mini-frame__screen">
          <Photo index={photo} dim={dim} alt={alt} />
        </div>
      </div>
      {children}
    </div>
  );
}
