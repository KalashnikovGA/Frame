import { MEDIA } from "@/config/media";

const GRADIENTS = [
  "linear-gradient(160deg,#F2C27B,#D98F5C 55%,#6E4A3A)",
  "linear-gradient(160deg,#EBD3B0,#C99C78 55%,#5B4639)",
  "linear-gradient(160deg,#F5D9A6,#E0A96D 55%,#7D5B45)",
  "linear-gradient(160deg,#E9C7A1,#B98A6B 55%,#4F3C34)",
  "linear-gradient(160deg,#F0D2B4,#D3A07E 55%,#6A4B3F)",
  "linear-gradient(160deg,#EED9BD,#C7A487 55%,#5C4A40)",
];

/** Семейное фото из MEDIA.photos или тёплая заглушка с подписью «фото». */
export function Photo({ index, alt = "", className = "", dim = 1 }: { index: number; alt?: string; className?: string; dim?: number }) {
  const src = MEDIA.photos[index];
  const style = dim < 1 ? { filter: `brightness(${dim})` } : undefined;
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" decoding="async" className={className} style={style} draggable={false} />;
  }
  return (
    <div className={`grid place-items-center ${className}`} style={{ background: GRADIENTS[index % GRADIENTS.length], ...style }} role={alt ? "img" : undefined} aria-label={alt || undefined}>
      <span className="t-caption text-white/80" style={{ fontSize: 10 }}>
        фото
      </span>
    </div>
  );
}
