import type { NextConfig } from "next";

// STATIC_EXPORT=1 — статическая сборка в out/ (см. scripts/export-static.mjs)
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(staticExport ? { output: "export" as const, trailingSlash: true, typescript: { ignoreBuildErrors: true } } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  agentRules: false,
};

export default nextConfig;
