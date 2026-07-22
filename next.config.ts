import type { NextConfig } from "next";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // ✅ Trailing slash configuration to match Django URL patterns
  trailingSlash: true,
  
  // ✅ Image & Build configuration
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.microlink.io" },
    ],
  },
  allowedDevOrigins: ["192.168.1.39"],

  // ✅ Webpack fallback for crypto-browserify (for Cognito SECRET_HASH)
  webpack: (config) => {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      crypto: require.resolve("crypto-browserify"),
    };
    
    return config;
  },

  // ✅ Prevent cache on admin panel routes (both pages and APIs)
  async headers() {
    return [
      {
        source: "/quotation/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
      {
        source: "/api/quotation/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
