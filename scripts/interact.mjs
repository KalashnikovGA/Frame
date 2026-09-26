// Проверка интерактивов: node scripts/interact.mjs [url]
import { chromium } from "playwright";
const url = process.argv[2] ?? "http://localhost:3000/";
const out = "screenshots";
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => console.log("pageerror:", e.message));
page.on("console", (m) => m.type() === "error" && console.log("console error:", m.text()));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(9000);

// 1. Послушать
await page.getByRole("button", { name: "Послушать" }).click();
await page.waitForTimeout(12500);
await page.screenshot({ path: `${out}/i-listen.png` });
console.log("story:", await page.getByRole("button", { name: /Пауза|Послушать|Продолжить/ }).innerText());
await page.waitForTimeout(15000);
await page.screenshot({ path: `${out}/i-listen-end.png` });

// 2. Конфигуратор
await page.evaluate(() => document.getElementById("models").scrollIntoView());
await page.waitForTimeout(3000);
const models = page.locator("#models");
await models.getByRole("radio", { name: "Орех" }).click();
await models.getByRole("radio", { name: "13″" }).click();
await page.waitForTimeout(14000);
await page.screenshot({ path: `${out}/i-config.png` });
console.log("price:", await models.locator("[aria-live]").innerText());

// 3. Думаю о тебе — долгое нажатие
await page.evaluate(() => document.getElementById("think").scrollIntoView({ block: "end" }));
await page.waitForTimeout(1500);
const hold = page.getByRole("button", { name: /Удерживайте/ });
const box = await hold.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.waitForTimeout(1100);
await page.mouse.up();
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/i-think-mid.png` });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/i-think.png` });

// 4. Форма
await page.evaluate(() => document.getElementById("preorder").scrollIntoView());
await page.waitForTimeout(1200);
const form = page.locator("#preorder form");
await form.getByRole("button", { name: "Оформить предзаказ" }).click();
await page.waitForTimeout(500);
console.log("errors:", await form.locator("[id$=-err]").allInnerTexts());
await page.screenshot({ path: `${out}/i-form-errors.png` });
await page.fill("#po-name", "Анна");
await page.fill("#po-contact", "+7 912 345-67-89");
await page.check("#po-consent");
await form.getByRole("button", { name: "Оформить предзаказ" }).click();
await page.waitForTimeout(2000);
console.log("done:", await page.locator("#preorder [role=status]").innerText().catch(() => "—"));
await page.screenshot({ path: `${out}/i-form-done.png` });
await browser.close();
