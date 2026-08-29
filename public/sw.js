const VERSION = "herpitches-pwa-v1";
const APP_CACHE = `${VERSION}-app`;
const PAGE_CACHE = `${VERSION}-pages`;
const IMAGE_CACHE = `${VERSION}-images`;
const CORE_ASSETS = [
  "/offline",
  "/news",
  "/data",
  "/community",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/logo1.png",
];
const PUBLIC_NAV_PREFIXES = ["/", "/news", "/data", "/community", "/club", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => ![APP_CACHE, PAGE_CACHE, IMAGE_CACHE].includes(key)).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || request.destination === "document") {
    if (isPublicNavigation(url.pathname)) {
      event.respondWith(networkFirstPage(request));
      return;
    }
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (["script", "style", "font"].includes(request.destination)) {
    event.respondWith(cacheFirst(request, APP_CACHE));
    return;
  }
});

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok && response.url === request.url) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await cache.match(request)) ?? (await caches.match("/offline")) ?? new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return cached ?? new Response("", { status: 504 });
  }
}

function isPublicNavigation(pathname) {
  return PUBLIC_NAV_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
