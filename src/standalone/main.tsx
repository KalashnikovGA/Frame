// Одностраничная сборка: вся страница рендерится в браузере из одного HTML-файла (npm run build:single).
import { createRoot } from "react-dom/client";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Anatomy } from "@/components/sections/Anatomy";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ThinkOfYou } from "@/components/sections/ThinkOfYou";
import { Night } from "@/components/sections/Night";
import { Configurator } from "@/components/sections/Configurator";
import { Voice } from "@/components/sections/Voice";
import { Privacy } from "@/components/sections/Privacy";
import { Preorder } from "@/components/sections/Preorder";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";

function App() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main>
        <Hero />
        <Anatomy />
        <HowItWorks />
        <ThinkOfYou />
        <Night />
        <Configurator />
        <Voice />
        <Privacy />
        <Preorder />
        <Faq />
      </main>
      <PrivacyPolicy id="policy" backHref="#top" />
      <Footer />
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
