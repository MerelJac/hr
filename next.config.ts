import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media*.giphy.com", // allow all Giphy CDN subdomains
      },
    ],
  },
};

export default nextConfig;
