import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Railway deployment
  // better-sqlite3 is a native module — must be excluded from the server bundle
  serverExternalPackages: ["better-sqlite3"],

  // Disable strict mode checks that can consume memory during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Fail build on type errors but allow Railway to show them
    ignoreBuildErrors: false,
  },

  // Optimize production build
  swcMinify: true,
  compress: true,

  // Increase server memory for production
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;