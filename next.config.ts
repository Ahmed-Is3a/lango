import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* PWA assets served from public: manifest and service worker */
  headers: async () => [
    {
      source: '/manifest.json',
      headers: [
        { key: 'Content-Type', value: 'application/manifest+json' }
      ],
    },
  ],
};

export default nextConfig;
