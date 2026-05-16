import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-globe.gl", "three-globe", "three"],
};

export default nextConfig;
