import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: there is an unrelated lockfile further up the
  // filesystem that Turbopack would otherwise infer as the root.
  turbopack: { root: path.resolve(".") },

  // Croppen is a fully client-side PWA: no server runtime needed, so we emit a
  // static bundle that Vercel serves straight from the edge cache.
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
