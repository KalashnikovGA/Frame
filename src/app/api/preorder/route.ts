import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getPrice, type Size, type Species } from "@/config/pricing";
import { contactKind, validatePreorder, type PreorderInput } from "@/lib/preorder";

export const runtime = "nodejs";

export type PreorderRecord = PreorderInput & { contactKind: "email" | "phone"; price: number; createdAt: string; userAgent?: string };

/**
 * Куда уходят предзаказы. Сейчас — в лог и в файл data/preorders.jsonl.
 * Чтобы подключить CRM или платёжный сервис, добавьте сюда ещё одну функцию.
 */
const sinks: ((r: PreorderRecord) => Promise<void>)[] = [
  async (r) => console.log("[preorder]", JSON.stringify(r)),
  async (r) => {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "preorders.jsonl"), JSON.stringify(r) + "\n", "utf8");
  },
];

export async function POST(req: Request) {
  let body: Partial<PreorderInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { model: "Некорректный запрос" } }, { status: 400 });
  }

  const input: Partial<PreorderInput> = {
    name: String(body.name ?? "").slice(0, 120),
    contact: String(body.contact ?? "").slice(0, 120),
    consent: body.consent === true,
    species: body.species as Species,
    size: Number(body.size) as Size,
  };
  const errors = validatePreorder(input);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const record: PreorderRecord = {
    ...(input as PreorderInput),
    name: input.name!.trim(),
    contact: input.contact!.trim(),
    contactKind: contactKind(input.contact!)!,
    price: getPrice(input.size!, input.species!),
    createdAt: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? undefined,
  };

  const results = await Promise.allSettled(sinks.map((s) => s(record)));
  results.forEach((r) => r.status === "rejected" && console.error("[preorder] sink failed", r.reason));
  if (results.every((r) => r.status === "rejected")) return NextResponse.json({ ok: false }, { status: 500 });

  return NextResponse.json({ ok: true });
}
