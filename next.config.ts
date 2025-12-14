import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // serverExternalPackages: ["pdf-parse"], // Remove this line
  async redirects() {
    return [
      {
        source: '/classes/manage',
        destination: '/classes/manage',
        permanent: false, // Not a permanent move, just for user convenience
      },
    ]
  },
};

export default nextConfig;
