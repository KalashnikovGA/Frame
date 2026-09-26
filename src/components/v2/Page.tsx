"use client";
import { TopBar } from "./TopBar";
import { Hero } from "./Hero";
import { Ticker } from "./Ticker";
import { Arrive } from "./Arrive";
import { Listen } from "./Listen";
import { Showcase } from "./Showcase";
import { Variants } from "./Variants";
import { Everywhere } from "./Everywhere";
import { GiftFor } from "./GiftFor";
import { Preorder } from "@/components/sections/Preorder";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";

/** Страница целиком — общая для Next.js и для одностраничной сборки. */
export function Page({ withPolicy = false }: { withPolicy?: boolean }) {
  return (
    <div className="v2">
      <TopBar />
      <main>
        <Hero />
        <Ticker />
        <Arrive />
        <Listen />
        <Showcase />
        <Variants />
        <Everywhere />
        <GiftFor />
        <Preorder />
        <Faq />
      </main>
      {withPolicy && <PrivacyPolicy id="policy" backHref="#top" />}
      <Footer />
    </div>
  );
}
