import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // ✅ Image configuration
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.microlink.io" },
    ],
  },
  allowedDevOrigins: ["192.168.1.39"],
  turbopack:{},

  // ✅ Webpack fallback for crypto-browserify (for Cognito SECRET_HASH)
  webpack: (config) => {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      crypto: require.resolve("crypto-browserify"),
    };
    
    return config;
  },
};

export default nextConfig;
