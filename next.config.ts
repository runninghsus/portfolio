import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server output (not a static export): the /api/chat route needs a serverless function.
  // Vercel handles this automatically; nothing else on the site changes.
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
