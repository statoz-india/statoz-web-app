import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // The browser calls `/api/*` on this site and the server forwards it, so
  // the backend's address never reaches the browser. Read at build time.
  async rewrites() {
    const api = process.env.API_ORIGIN?.replace(/\/+$/, "");
    if (!api) throw new Error("API_ORIGIN is not set");
    return [{ source: "/api/:path*", destination: `${api}/api/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
