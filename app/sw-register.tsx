"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        const already = regs.some((r) => r.active?.scriptURL.endsWith("/sw.js"));
        if (!already) {
          const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          reg.onupdatefound = () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.onstatechange = () => {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  console.log("New content available. Refresh to update.");
                } else {
                  console.log("Content cached for offline use.");
                }
              }
            };
          };
          console.log("Service worker registered:", reg.scope);
        }
      } catch (err) {
        console.error("Service worker registration failed:", err);
      }
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
