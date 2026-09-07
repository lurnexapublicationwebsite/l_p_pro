// Service worker for the installable reading app (/textbooks/app). Deliberately minimal:
// it does NOT cache Next.js's hashed JS/CSS bundles (those change on every deploy — caching
// them aggressively would serve stale app code after an update). It only precaches the small
// set of static assets needed to show something instead of a browser error when the device
// is offline, and otherwise gets out of the way (network-first for everything).
const CACHE_NAME = "lurnexa-reader-app-v1";
const PRECACHE_URLS = [
  "/textbooks/app/",
  "/textbook-app-manifest.json",
  "/icons/reader-app-icon-192.png",
  "/icons/reader-app-icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Never intercept API calls — auth, orders, rental access, etc. must always hit the
  // network live; serving a cached response for these would be actively wrong.
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Keep the precached app-shell entry fresh when online.
        if (req.mode === "navigate" || PRECACHE_URLS.includes(url.pathname)) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || (req.mode === "navigate" ? caches.match("/textbooks/app/") : undefined))
      )
  );
});
