"use client";

const cache = new Map<string, string>();

function hash(i: number) {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/** Текстура дерева для рамок, нарисованных в CSS: волокна, кольца и поры в цвете породы. */
export function woodDataUrl(hex: string) {
  const hit = cache.get(hex);
  if (hit) return hit;
  const W = 480;
  const H = 360;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, W, H);
  // крупные тоновые полосы
  for (let i = 0; i < 14; i++) {
    const y = hash(i) * H;
    const g = ctx.createLinearGradient(0, y - 30, 0, y + 30);
    const a = 0.05 + hash(i + 9) * 0.07;
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.5, hash(i + 3) > 0.5 ? `rgba(60,30,10,${a})` : `rgba(255,240,220,${a})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 30, W, 60);
  }
  // годовые кольца — тонкие волнистые линии
  for (let i = 0; i < 70; i++) {
    const y0 = (i / 70) * H + hash(i + 40) * 4;
    const amp = 2 + hash(i + 70) * 5;
    const f = 0.006 + hash(i + 90) * 0.01;
    const ph = hash(i + 110) * 10;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const y = y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 3.1 + ph) * amp * 0.3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(55,28,10,${0.05 + hash(i + 130) * 0.1})`;
    ctx.lineWidth = 0.6 + hash(i + 150) * 1.2;
    ctx.stroke();
  }
  // поры
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(40,20,8,${0.06 + hash(i + 300) * 0.1})`;
    ctx.fillRect(hash(i + 500) * W, hash(i + 700) * H, 1 + hash(i + 900) * 3, 1);
  }
  const url = c.toDataURL("image/jpeg", 0.86);
  cache.set(hex, url);
  return url;
}
