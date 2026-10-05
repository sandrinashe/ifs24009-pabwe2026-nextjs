import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // CSS disisipkan ke HTML agar tidak ada request CSS yang memblokir render
  experimental: {
    inlineCss: true,
  },
  productionBrowserSourceMaps: true,
  poweredByHeader: false,
};

export default nextConfig;
