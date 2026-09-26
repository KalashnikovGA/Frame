// Статическая версия сайта в out/ с относительными путями: открывается с любого адреса и из подпапки.
// Форма предзаказа в ней работает как демо: API-роута на статическом хостинге нет, и страница прямо говорит об этом.
// Запуск: npm run export:static
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const api = "src/app/api";
const parked = ".api-parked";
rmSync("out", { recursive: true, force: true });
renameSync(api, parked);
try {
  execSync("npx next build", { stdio: "inherit", env: { ...process.env, STATIC_EXPORT: "1", NEXT_PUBLIC_STATIC_DEMO: "1" } });
} finally {
  renameSync(parked, api);
}
if (!existsSync("out/index.html")) process.exit(1);

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f)) : [path.join(d, f)]));
const abs = (p) => new RegExp(`(?<![\\w.])${p}`, "g");

for (const file of walk("out")) {
  const rel = path.relative("out", file);
  if (file.endsWith(".js")) {
    const s = readFileSync(file, "utf8");
    const t = s
      .replace(/"\/media\/([^"]+)"/g, '(self.__BASE__+"media/$1")')
      // буквальный U+FFFD в строках библиотек → эквивалентный escape (некоторые хостинги такие файлы не принимают)
      .replace(/\uFFFD/g, "\\ufffd");
    if (t !== s) writeFileSync(file, t);
  } else if (/\.(html|txt)$/.test(file)) {
    const depth = rel.split(path.sep).length - 1;
    const base = depth ? "../".repeat(depth) : "./";
    let s = readFileSync(file, "utf8");
    s = s
      .replace(abs("/_next/"), `${base}_next/`)
      .replace(abs("/media/"), `${base}media/`)
      .replace(abs("/icon\\.svg"), `${base}icon.svg`)
      .replace(/(href=|\\"href\\":)(\\?")\/privacy\2/g, `$1$2${base}privacy/index.html$2`)
      .replace(/(href=|\\"href\\":)(\\?")\/\2/g, `$1$2${base}index.html$2`);
    if (file.endsWith(".html"))
      s = s.replace("<head>", `<head><script>self.__BASE__="${base}";self.TURBOPACK_CHUNK_BASE_PATH="${base}_next/"</script>`);
    writeFileSync(file, s);
  }
}
console.log("Готово: out/index.html");
