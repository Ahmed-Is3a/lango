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
      // ✅ ALL PAGES (including /)
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },

      // ✅ API
      {
        urlPattern: ({ url }) => url.pathname.startsWith("/api/vocabs"),
        handler: "NetworkFirst",
        options: {
          cacheName: "api-vocabs",
          networkTimeoutSeconds: 5,
          matchOptions: { ignoreSearch: true },
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 7,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },

      // ✅ Styles
      {
        urlPattern: ({ request }) => request.destination === "style",
        handler: "CacheFirst",
        options: {
          cacheName: "styles",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },

      // ✅ Scripts & workers
      {
        urlPattern: ({ request }) =>
          request.destination === "script" ||
          request.destination === "worker",
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "assets",
        },
      },
    ],

  },
})(nextConfig);
