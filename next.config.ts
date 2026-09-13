import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: works on Vercel as-is and also on GitHub Pages / Cloudflare Pages.
  // Remove `output: "export"` if you later add server features (API routes, ISR, etc.).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
