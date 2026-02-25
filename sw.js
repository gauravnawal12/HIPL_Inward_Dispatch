/*
╔══════════════════════════════════════════════════════════════════════╗
║  HELIX INDUSTRIES — SERVICE WORKER  (sw.js)                         ║
║                                                                      ║
║  WHAT IS A SERVICE WORKER?                                           ║
║  Think of it as a silent helper that runs in the background of      ║
║  your browser. It has two main jobs:                                 ║
║                                                                      ║
║  1. OFFLINE CACHING                                                  ║
║     The first time anyone opens the app, this worker downloads      ║
║     and saves all the app files to the device. After that, the      ║
║     app opens instantly — even without internet.                     ║
║                                                                      ║
║  2. MAKING THE APP INSTALLABLE                                       ║
║     Having a service worker is one of the requirements for          ║
║     Chrome to offer "Add to Home Screen" on Android.                ║
║                                                                      ║
║  IMPORTANT:                                                          ║
║  Service workers only work over HTTPS (secure connections).         ║
║  If you open index.html directly from your computer as a            ║
║  file:// URL, the service worker will NOT activate. You must        ║
║  host the files on a web server (GitHub Pages, Netlify, etc.)       ║
║                                                                      ║
║  HOW TO UPDATE THE APP:                                              ║
║  If you make changes to index.html or any other file, you must      ║
║  also bump the cache version below (e.g. v1 → v2).                 ║
║  This forces all users' browsers to download the fresh files.       ║
╚══════════════════════════════════════════════════════════════════════╝
*/

/* ─── CACHE VERSION ─────────────────────────────────────────────────
   Change this string (e.g. "helix-v2") every time you update the app.
   Old caches with different names get automatically deleted below.
──────────────────────────────────────────────────────────────────── */
var CACHE_NAME = "helix-v10";

/* ─── FILES TO PRE-CACHE ────────────────────────────────────────────
   These files are downloaded and saved to the device on first visit.
   All paths are relative to the folder where sw.js lives.
   index.html is the entire app. manifest.json + icons = PWA identity.
──────────────────────────────────────────────────────────────────── */
var PRECACHE = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INSTALL EVENT
   Fires once when the service worker is first registered.
   Downloads all pre-cache files and stores them on the device.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
self.addEventListener("install", function(event) {
  console.log("[Helix SW] Installing… cache:", CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log("[Helix SW] Caching app files…");
        return cache.addAll(PRECACHE);
      })
      .then(function() {
        /* Skip waiting: activate the new service worker immediately
           instead of waiting for old tabs to be closed first. */
        return self.skipWaiting();
      })
      .catch(function(err) {
        /* Pre-caching failed — this usually means one of the files
           listed in PRECACHE above doesn't exist or couldn't be fetched.
           The app will still work but won't be offline-capable. */
        console.error("[Helix SW] Pre-cache failed:", err);
      })
  );
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ACTIVATE EVENT
   Fires after install, once the old service worker (if any) is gone.
   Cleans up any caches from old versions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
self.addEventListener("activate", function(event) {
  console.log("[Helix SW] Activating…");
  event.waitUntil(
    /* Get a list of all caches currently stored on this device */
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(name) {
          /* Delete any cache that has a different name than our current version */
          if (name !== CACHE_NAME) {
            console.log("[Helix SW] Deleting old cache:", name);
            return caches.delete(name);
          }
        })
      );
    }).then(function() {
      /* Take control of all open browser tabs immediately */
      return self.clients.claim();
    })
  );
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FETCH EVENT
   Fires every time the app makes any network request.
   We intercept each request and decide how to respond.

   STRATEGY USED:
   ┌─────────────────────────────────────────────────────────┐
   │ Google Sheets / Google APIs → NETWORK ONLY              │
   │   (live data — must go to internet, never cached)       │
   │                                                         │
   │ SheetJS CDN → NETWORK FIRST, fall back to cache         │
   │   (try to get latest, use cached if offline)            │
   │                                                         │
   │ App files (index.html, icons etc.) → CACHE FIRST        │
   │   (instant load from cache, update cache in background) │
   └─────────────────────────────────────────────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
self.addEventListener("fetch", function(event) {
  var url = event.request.url;

  /* ── CASE 1: Google Sheets / Apps Script calls ──
     These are the actual data sync requests. They MUST reach the internet.
     If offline, they will fail — but the app saves data locally first,
     so no data is ever lost. */
  if (url.includes("script.google.com") || url.includes("googleapis.com")) {
    /* Just pass straight through to the network — no caching involved */
    event.respondWith(fetch(event.request));
    return;
  }

  /* ── CASE 2: Google Fonts ──
     Try network first. Cache for offline if successful. */
  if (url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com")) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          /* Save a copy to cache for offline use */
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
          return response;
        })
        .catch(function() {
          /* Offline — serve from cache (fonts degrade gracefully without them) */
          return caches.match(event.request);
        })
    );
    return;
  }

  /* ── CASE 3: SheetJS CDN (Excel export library) ──
     Network first for freshness, cache as fallback if offline. */
  if (url.includes("cdn.sheetjs.com") || url.includes("cdnjs.cloudflare.com")) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
          return response;
        })
        .catch(function() {
          return caches.match(event.request);
        })
    );
    return;
  }

  /* ── CASE 4: App files (index.html, manifest, icons) ──
     Cache-first: serve from local cache instantly (very fast).
     Also fetch from network in background and silently update the cache.
     This is called "stale-while-revalidate". */
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      /* Background fetch to keep cache fresh */
      var networkFetch = fetch(event.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        }
        return networkResponse;
      }).catch(function() {
        /* Network error — silently ignore, we're serving from cache */
      });

      /* Return cached version immediately if available;
         otherwise wait for the network response */
      return cachedResponse || networkFetch;
    })
  );
});

console.log("[Helix SW] Service worker script loaded. Cache:", CACHE_NAME);
