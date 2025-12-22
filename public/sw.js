const VERSION = "v1";
const PRECACHE = `precache-${VERSION}`;
const PAGE_CACHE = `pages-${VERSION}`;
const API_CACHE = `api-vocabs-${VERSION}`;
const STYLE_CACHE = `styles-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;

const PRECACHE_URLS = ["/offline.html"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  const allowlist = [PRECACHE, PAGE_CACHE, API_CACHE, STYLE_CACHE, ASSET_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((k) => (allowlist.includes(k) ? undefined : caches.delete(k))))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  
  // Only handle http/https requests
  if (!url.protocol.startsWith("http")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, PAGE_CACHE, 5000).catch(() => caches.match("/offline.html"))
    );
    return;
  }

  if (url.pathname.startsWith("/api/vocabs")) {
    event.respondWith(networkFirst(request, API_CACHE, 5000));
    return;
  }

  if (request.destination === "style") {
    event.respondWith(cacheFirst(request, STYLE_CACHE));
    return;
  }

  if (request.destination === "script" || request.destination === "worker") {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
});

async function networkFirst(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  try {
    const response = await withTimeout(fetch(request, { credentials: "same-origin" }), timeoutMs);
    if (isCacheable(response)) cache.put(request, response.clone());
    return response;
  } catch (_) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw _;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request, { credentials: "same-origin" });
  if (isCacheable(response)) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request, { credentials: "same-origin" })
    .then((response) => {
      if (isCacheable(response)) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || networkPromise;
}

function isCacheable(response) {
  return response && (response.status === 200 || response.status === 0);
}

function withTimeout(promise, ms) {
  let id;
  const timeout = new Promise((_, reject) => {
    id = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise.finally(() => clearTimeout(id)), timeout]);
}
