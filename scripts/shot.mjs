// Скриншоты страницы: node scripts/shot.mjs [url] [outdir] [scrollY...]
import { chromium } from "playwright";
const url = process.argv[2] ?? "http://localhost:3000/";
const out = process.argv[3] ?? "screenshots";
// цели: число (экранов от верха) или "id:доля" — доля прокрутки внутри секции
const ys = process.argv.slice(4);
const vps = (process.env.VP ?? "desktop,mobile").split(",");
const sizes = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
for (const vp of vps) {
  const ctx = await browser.newContext({ viewport: sizes[vp], deviceScaleFactor: 1, hasTouch: vp === "mobile", isMobile: vp === "mobile" });
  const page = await ctx.newPage();
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && console.log(`[${vp}] ${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => console.log(`[${vp}] pageerror: ${e.message}`));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(Number(process.env.WAIT ?? 6000));
  const list = ys.length ? ys : ["0"];
  for (const y of list) {
    await page.evaluate((y) => {
      if (y.includes(":")) {
        const [id, f] = y.split(":");
        const el = document.getElementById(id);
        const top = el.getBoundingClientRect().top + window.scrollY;
        const span = Math.max(0, el.offsetHeight - window.innerHeight);
        window.scrollTo(0, top + span * Number(f));
      } else window.scrollTo(0, Number(y) * window.innerHeight);
    }, y);
    await page.waitForTimeout(Number(process.env.STEP ?? 2500));
    await page.screenshot({ path: `${out}/${vp}-${y.replace(/[.:]/g, "_")}.png` });
  }
  if (process.env.CLICK) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("button", { name: /Послушать/ }).click();
    await page.waitForTimeout(Number(process.env.CLICK));
    await page.screenshot({ path: `${out}/${vp}-listen.png` });
  }
  await ctx.close();
}
await browser.close();
