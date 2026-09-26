// Весь сайт одним HTML-файлом: код, стили, фото и звук внутри. Шрифты — с Google Fonts.
// Запуск: npm run build:single → single/ramka.html
// Страница без <html>/<head>/<body>: такой файл можно вставить в любую оболочку или открыть как есть.
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const root = process.cwd();
const out = path.join(root, "single");
mkdirSync(out, { recursive: true });

const WEB = { hero: "hero", grandparents: "grandparents", mom: "mom", couple: "couple", grandpa: "grandpa", motherDaughter: "mother-daughter", sunset: "sunset", hike: "hike", sofa: "sofa", beach: "beach", baby: "baby", window: "window", listening: "listening" };
const dataUri = (file, type) => `data:${type};base64,${readFileSync(path.join(root, "public", file)).toString("base64")}`;

// медиа как data: URI — одностраничной версии не нужны отдельные файлы
const mediaModule = `export const MEDIA = {
  heroPoster: null,
  posters: { front: null, side: null, night: null },
  heroLoop: null,
  photos: ${JSON.stringify(["grandparents", "couple", "mom", "grandpa", "beach", "sofa"].map((n) => dataUri(`media/web/${n}.jpg`, "image/jpeg")))},
  web: ${JSON.stringify(Object.fromEntries(Object.entries(WEB).map(([k, f]) => [k, dataUri(`media/web/${f}.jpg`, "image/jpeg")])))},
  story: {
    audio: ${JSON.stringify(dataUri("media/story-1.mp3", "audio/mpeg"))},
    captions: "",
    captionsText: ${JSON.stringify(readFileSync(path.join(root, "public/media/story-1.vtt"), "utf8"))},
  },
  frameModel: null,
};
`;
writeFileSync(path.join(out, "media.gen.ts"), mediaModule);

const result = await build({
  entryPoints: ["src/standalone/main.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  charset: "ascii",
  jsx: "automatic",
  write: false,
  legalComments: "none",
  logLevel: "warning",
  logOverride: { "unsupported-directive": "silent" },
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_STATIC_DEMO": '"1"',
    "process.env.NEXT_PUBLIC_YM_ID": '""',
    "process.env.NEXT_PUBLIC_SITE_URL": '"https://example.ru"',
    "process.env.NEXT_PUBLIC_PRIVACY_URL": '"#policy"',
  },
  plugins: [
    {
      name: "aliases",
      setup(b) {
        b.onResolve({ filter: /^@\/config\/media$/ }, () => ({ path: path.join(out, "media.gen.ts") }));
        b.onResolve({ filter: /^next\/dynamic$/ }, () => ({ path: path.join(root, "src/standalone/next-dynamic.tsx") }));
      },
    },
  ],
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const cssSrc = readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const css = (await postcss([tailwind({ optimize: { minify: true } })]).process(cssSrc, { from: path.join(root, "src/app/globals.css") })).css;

const html = `<title>Рамка</title>
<meta name="description" content="Фоторамка из цельного дерева, через которую семья присылает бабушке и дедушке фото и голос.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,600;1,500&family=Spectral:ital,wght@0,300;0,400;1,300&display=swap">
<style>${css}</style>
<script>(function(){var d=document.documentElement;d.lang="ru";d.classList.add("js");if(matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("no-motion")})()</script>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync(path.join(out, "ramka.html"), html);
console.log(`single/ramka.html — ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} МБ`);
