import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server output (not a static export): the /api/chat route needs a serverless function.
  // Vercel handles this automatically; nothing else on the site changes.
  images: { unoptimized: true },
  trailingSlash: true,
  // the résumé lives outside /public and is served by /api/resume; include it in that function's bundle
  outputFileTracingIncludes: { "/api/resume": ["./private/**"] },
};

export default nextConfig;
