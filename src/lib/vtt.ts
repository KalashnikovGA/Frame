export type Cue = { start: number; end: number; text: string };

function toSeconds(t: string) {
  const parts = t.trim().split(":").map(Number);
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

/** Минимальный разбор WebVTT: время и текст реплик. */
export function parseVTT(src: string): Cue[] {
  const cues: Cue[] = [];
  for (const block of src.replace(/\r/g, "").split(/\n{2,}/)) {
    const lines = block.split("\n");
    const i = lines.findIndex((l) => l.includes("-->"));
    if (i === -1) continue;
    const [a, b] = lines[i].split("-->");
    cues.push({ start: toSeconds(a), end: toSeconds(b.split(" ").filter(Boolean)[0]), text: lines.slice(i + 1).join(" ").trim() });
  }
  return cues;
}
