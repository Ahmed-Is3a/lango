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
  },
})(nextConfig);
