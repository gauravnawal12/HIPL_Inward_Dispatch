/*
  ╔════════════════════════════════════════════════════════╗
  ║  HELIX FACTORY PWA — SERVICE WORKER                    ║
  ║                                                        ║
  ║  This file runs in the background in the browser and   ║
  ║  makes the app work even when there's no internet.     ║
  ║                                                        ║
  ║  HOW IT WORKS:                                         ║
  ║  1. On first load, it saves (caches) all the app       ║
  ║     files to the device storage.                       ║
  ║  2. On every subsequent load, it serves those cached   ║
  ║     files instantly — no internet needed.              ║
  ║  3. When internet IS available, it fetches fresh files ║
  ║     from the server (SheetJS CDN, etc.) and updates   ║
  ║     the cache silently in the background.              ║
  ║                                                        ║
  ║  DATA SYNC still requires internet — the offline       ║
  ║  mode only means the UI always opens and works for     ║
  ║  form-filling and local record browsing.               ║
  ╚════════════════════════════════════════════════════════╝
*/

/* Cache name — bump the version (v2, v3…) whenever you update the app files
   so that old cached files get replaced with fresh ones automatically */
var CACHE_NAME = "helix-register-v1";

/* Files to pre-cache during install so the app works fully offline.
   All paths are relative to the folder where this sw.js file lives. */
var PRECACHE_FILES = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INSTALL EVENT — runs once when the service worker is
   first registered. Downloads and caches all app files.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
self.addEventListener("install", function(event) {
  console.log("[SW] Installing Helix Factory PWA v1…");
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("[SW] Pre-caching app files…");
      return cache.addAll(PRECACHE_FILES);
    }).then(function() {
      /* Skip the waiting phase so the new SW activates immediately */
      return self.skipWaiting();
    })
  );
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ACTIVATE EVENT — runs after install. Deletes old caches
   from previous versions so storage doesn't fill up.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
self.addEventListener("activate", function(event) {
  console.log("[SW] Activating…");
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          /* Delete any cache that isn't the current version */
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      /* Take control of all open tabs immediately */
      return self.clients.claim();
    })
  );
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FETCH EVENT — intercepts every network request the app
   makes and decides: serve from cache or fetch live.

   Strategy used: Cache-First for app files, Network-First
   for external resources (SheetJS CDN, Google Sheets API).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
self.addEventListener("fetch", function(event) {
  var url = event.request.url;

  /* ── NETWORK-ONLY: Google Sheets API calls ──
     These MUST go to the network — there's no point caching live data.
     If offline, they will fail gracefully (the app shows "Sync Failed"). */
  if (url.includes("script.google.com") || url.includes("googleapis.com")) {
    event.respondWith(fetch(event.request));
    return;
  }

  /* ── NETWORK-FIRST: External CDN files (SheetJS) ──
     Try to get the latest version online; fall back to cache if offline. */
  if (url.includes("cdn.sheetjs.com") || url.includes("cdnjs.cloudflare.com")) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          /* Save fresh copy to cache for next offline use */
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(function() {
          /* Offline — serve from cache (even if slightly old) */
          return caches.match(event.request);
        })
    );
    return;
  }

  /* ── CACHE-FIRST: All local app files ──
     Serve from cache instantly. Also fetch from network in background
     and update the cache (stale-while-revalidate pattern). */
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      /* Kick off a background fetch to keep the cache fresh */
      var fetchPromise = fetch(event.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      }).catch(function() {
        /* Network error — that's fine, we're serving from cache anyway */
      });

      /* Return cache immediately if available, else wait for network */
      return cachedResponse || fetchPromise;
    })
  );
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SYNC EVENT — handles background sync when connectivity
   is restored. Future enhancement: offline queue of failed
   Sheets pushes could be replayed here.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
self.addEventListener("sync", function(event) {
  if (event.tag === "sync-sheets") {
    console.log("[SW] Background sync triggered — connectivity restored");
    /* Background sync logic can be added here in a future version */
  }
});

console.log("[SW] Helix Factory Service Worker loaded.");
