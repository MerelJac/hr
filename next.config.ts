import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media*.giphy.com", // allow all Giphy CDN subdomains
      },
      {
        protocol: "https",
        hostname: "ignite-assets-bucket.s3.us-east-2.amazonaws.com", // Whitelist S3 bucket domain
      },
    ],
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
