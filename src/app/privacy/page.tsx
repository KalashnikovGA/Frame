import type { Metadata } from "next";
import { BRAND_NAME } from "@/config/brand";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";

export const metadata: Metadata = {
  title: `Политика конфиденциальности — ${BRAND_NAME}`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
