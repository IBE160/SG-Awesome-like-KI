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
  env: {
    GEMINI_API_KEY: 'AIzaSyD0hNHAzG0huvcaLN62OoFD54NkyY3L5Y4', // Keep this line as is
    GEMINI_MODEL_NAME: 'gemini-2.5-flash', // Add this line
  },
};

export default nextConfig;
