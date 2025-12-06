import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* other config options here */
  turbopack: {}
};

export default withPWA({
  dest: "public",
  register: true,
  workboxOptions: {
    navigateFallback: "/offline.html",
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname.startsWith('/api/vocabs'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-vocabs',
          networkTimeoutSeconds: 3,
          matchOptions: { ignoreSearch: true },
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: { cacheName: 'pages' },
      },
      {
        urlPattern: ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'assets' },
      },
    ],
  },
})(nextConfig);
