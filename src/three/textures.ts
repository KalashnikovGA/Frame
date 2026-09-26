import * as THREE from "three";
import { MEDIA } from "@/config/media";

/* ---------- процедурное дерево ---------- */

function hash(x: number, y: number) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Бесшовный value-noise: индексы заворачиваются по периоду. */
function noise(x: number, y: number, px: number, py: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const x0 = ((xi % px) + px) % px;
  const y0 = ((yi % py) + py) % py;
  const x1 = (x0 + 1) % px;
  const y1 = (y0 + 1) % py;
  const a = hash(x0, y0);
  const b = hash(x1, y0);
  const c = hash(x0, y1);
  const d = hash(x1, y1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, px: number, py: number, oct = 4) {
  let s = 0;
  let amp = 0.5;
  for (let o = 0; o < oct; o++) {
    s += amp * noise(x, y, px, py);
    x *= 2;
    y *= 2;
    px *= 2;
    py *= 2;
    amp *= 0.5;
  }
  return s;
}

const grainCache = new Map<number, THREE.CanvasTexture>();

/**
 * Серая текстура волокон (годовые кольца + волокна + поры), бесшовная.
 * Цвет породы задаётся цветом материала — так смена породы плавно перетекает.
 */
export function getGrainTexture(size = 1024) {
  const cached = grainCache.get(size);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const data = img.data;
  for (let j = 0; j < size; j++) {
    const v = j / size;
    for (let i = 0; i < size; i++) {
      const u = i / size;
      const warp = fbm(u * 2, v * 3, 2, 3, 3);
      const figure = fbm(u * 3 + 7.1, v * 6, 3, 6, 2);
      const r = v * 34 + warp * 2.4 + figure * 0.5;
      const s = 0.5 + 0.5 * Math.sin(r * Math.PI * 2);
      const ring = Math.pow(s, 9); // тонкая линия годового кольца
      const late = Math.pow(s, 2.2); // поздняя древесина — мягкая тень вокруг
      const fiber = noise(u * 10, v * 420, 10, 420);
      const fiber2 = noise(u * 24 + 3, v * 900, 24, 900);
      const tone = fbm(u * 2 + 11, v * 2, 2, 2, 2);
      const pore = hash(i * 7 + 1, j * 13 + 5) > 0.997 ? 0.05 : 0;
      let val = 0.93 + 0.06 * (tone - 0.5) - 0.09 * ring - 0.05 * late - 0.06 * (fiber - 0.5) - 0.035 * (fiber2 - 0.5) - pore;
      val = Math.max(0, Math.min(1, val));
      const k = (j * size + i) * 4;
      const g = val * 255;
      data[k] = g;
      data[k + 1] = g * 0.985;
      data[k + 2] = g * 0.96;
      data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  grainCache.set(size, tex);
  return tex;
}

/* ---------- фото и заглушки ---------- */

const PALETTES: [string, string, string][] = [
  ["#F2C27B", "#D98F5C", "#6E4A3A"],
  ["#EBD3B0", "#C99C78", "#5B4639"],
  ["#F5D9A6", "#E0A96D", "#7D5B45"],
  ["#E9C7A1", "#B98A6B", "#4F3C34"],
  ["#F0D2B4", "#D3A07E", "#6A4B3F"],
  ["#EED9BD", "#C7A487", "#5C4A40"],
];

/** Тёплый градиент с подписью «фото» — пока настоящего снимка нет. */
export function placeholderPhoto(index: number, w = 1024, h = 768) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const [a, b, d] = PALETTES[index % PALETTES.length];
  const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
  g.addColorStop(0, a);
  g.addColorStop(0.55, b);
  g.addColorStop(1, d);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = ctx.createRadialGradient(w * 0.3, h * 0.25, 0, w * 0.3, h * 0.25, w * 0.7);
  r.addColorStop(0, "rgba(255,240,215,0.55)");
  r.addColorStop(1, "rgba(255,240,215,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `500 ${Math.round(w * 0.022)}px Onest, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = "ФОТО";
  const spaced = label.split("").join("  ");
  ctx.fillText(spaced, w / 2, h / 2);
  return c;
}

export function loadPhoto(index: number): Promise<CanvasImageSource> {
  const src = MEDIA.photos[index];
  if (!src) return Promise.resolve(placeholderPhoto(index));
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(placeholderPhoto(index));
    img.src = src;
  });
}

/* ---------- экран рамки: фото + субтитры ---------- */

export class ScreenCanvas {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly texture: THREE.CanvasTexture;
  private photo: CanvasImageSource | null = null;
  private caption: string | null = null;
  private alpha = 0;
  private fontReady = false;

  constructor(w = 1024, h = 768) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx = this.canvas.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
    this.ctx.fillStyle = "#2a1f18";
    this.ctx.fillRect(0, 0, w, h);
    document.fonts?.load('600 48px "Cormorant Garamond"').then(() => {
      this.fontReady = true;
      this.draw();
    });
  }

  setPhoto(p: CanvasImageSource) {
    this.photo = p;
    this.draw();
  }

  /** Возвращает true, пока идёт плавное появление/исчезание субтитра. */
  update(caption: string | null, dt: number) {
    if (caption && caption !== this.caption) {
      this.caption = caption;
      this.alpha = 0;
    }
    const target = caption ? 1 : 0;
    if (Math.abs(this.alpha - target) < 0.01) {
      if (this.alpha !== target) {
        this.alpha = target;
        this.draw();
      }
      return;
    }
    this.alpha += (target - this.alpha) * Math.min(1, dt * 7);
    if (!caption && this.alpha < 0.01) this.caption = null;
    this.draw();
  }

  private draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    if (this.photo) {
      const iw = (this.photo as HTMLImageElement).naturalWidth || (this.photo as HTMLCanvasElement).width;
      const ih = (this.photo as HTMLImageElement).naturalHeight || (this.photo as HTMLCanvasElement).height;
      const s = Math.max(w / iw, h / ih);
      ctx.drawImage(this.photo, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
    }
    if (this.caption && this.alpha > 0.001) {
      const grad = ctx.createLinearGradient(0, h * 0.62, 0, h);
      grad.addColorStop(0, "rgba(20,14,10,0)");
      grad.addColorStop(1, `rgba(20,14,10,${0.5 * this.alpha})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, h * 0.62, w, h * 0.38);

      const size = Math.round(w * 0.056);
      ctx.font = `600 ${size}px ${this.fontReady ? '"Cormorant Garamond"' : "Georgia"}, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      const lines = wrap(ctx, this.caption, w * 0.84);
      const lh = size * 1.18;
      let y = h - h * 0.075 - (lines.length - 1) * lh;
      ctx.shadowColor = `rgba(0,0,0,${0.55 * this.alpha})`;
      ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(255,250,242,${this.alpha})`;
      for (const l of lines) {
        ctx.fillText(l, w / 2, y);
        y += lh;
      }
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
    }
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > max && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
