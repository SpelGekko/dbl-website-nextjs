import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
  },
  experimental: {},
  async rewrites() {
    return [];
  },
};

export default nextConfig;
