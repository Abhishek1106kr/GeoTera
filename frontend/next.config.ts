import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "deck.gl",
    "@deck.gl/core",
    "@deck.gl/layers",
    "@deck.gl/geo-layers",
    "@deck.gl/react",
    "@luma.gl/core",
    "@luma.gl/constants",
    "@luma.gl/webgl",
    "@math.gl/core",
    "@math.gl/web-mercator",
  ],
};

export default nextConfig;
