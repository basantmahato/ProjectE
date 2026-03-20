import type { NextConfig } from "next";

// Backend URL for rewrites. /api/* is proxied here. API runs on 3000; run Next on 3001 to avoid conflict (see web package.json dev script).
const apiProxyTarget =
  process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // Proxy /api/* to the backend so billing and auth work when web runs on port 3000.
  // Run the API on port 3001 (e.g. PORT=3001 in api/.env or API_PROXY_TARGET).
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiProxyTarget}/:path*` }];
  },
};

export default nextConfig;
