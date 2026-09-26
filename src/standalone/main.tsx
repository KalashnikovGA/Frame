// Одностраничная сборка: вся страница рендерится в браузере из одного HTML-файла (npm run build:single).
import { createRoot } from "react-dom/client";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Page } from "@/components/v2/Page";

createRoot(document.getElementById("root")!).render(
  <>
    <SmoothScroll />
    <Page withPolicy />
  </>,
);
