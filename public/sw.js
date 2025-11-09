const STATIC_CACHE_NAME = "subcheck-static-v1";
const RUNTIME_CACHE_NAME = "subcheck-runtime-v1";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/diagnosis/select",
  "/diagnosis/usage",
  "/diagnosis/results",
  "/offline",
];

// Network-first resources (dynamic data)
const NETWORK_FIRST_PATTERNS = [/\/api\//, /\/diagnosis\/api\//];

// Cache-first resources (static assets)
const CACHE_FIRST_PATTERNS = [
  /\/_next\/static\//,
  /\/_next\/image\//,
  /\/icons\//,
  /\.(?:css|js|woff2?|png|jpg|jpeg|webp|svg|ico)$/,
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error);
      })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== RUNTIME_CACHE_NAME &&
              cacheName.startsWith("subcheck-")
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Service worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Cache-first strategy for static assets
  if (CACHE_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first strategy for API calls
  if (NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Stale-while-revalidate for pages
  event.respondWith(staleWhileRevalidate(request));
});

// Cache-first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE_NAME);

    // Cache successful responses
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[SW] Cache-first failed:", error);
    return new Response("Offline", { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", error);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for API calls
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "This request requires network connectivity",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Always try to fetch and update cache in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log("[SW] Network request failed:", error);
      return null;
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Otherwise wait for network
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  // Fallback to offline page for navigation requests
  if (request.mode === "navigate") {
    const offlinePage = await cache.match("/offline");
    if (offlinePage) {
      return offlinePage;
    }
  }

  return new Response("Offline", { status: 503 });
}

// Handle background sync for storing diagnosis results
self.addEventListener("sync", (event) => {
  if (event.tag === "diagnosis-sync") {
    event.waitUntil(syncDiagnosisData());
  }
});

// Sync diagnosis data when online
async function syncDiagnosisData() {
  try {
    // Get pending diagnosis data from IndexedDB
    const pendingData = await getPendingDiagnosisData();

    if (pendingData.length > 0) {
      console.log("[SW] Syncing pending diagnosis data:", pendingData.length);

      for (const data of pendingData) {
        try {
          // Attempt to send to server
          const response = await fetch("/api/diagnosis/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            // Remove from pending queue
            await removePendingDiagnosisData(data.id);
          }
        } catch (error) {
          console.error("[SW] Failed to sync diagnosis data:", error);
        }
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error);
  }
}

// IndexedDB helpers for offline data storage
async function getPendingDiagnosisData() {
  // This would integrate with IndexedDB
  // For now, return empty array
  return [];
}

async function removePendingDiagnosisData(id) {
  // This would remove from IndexedDB
  console.log("[SW] Would remove pending data:", id);
}

// Handle push notifications (for future alert functionality)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "subcheck-alert",
    vibrate: [200, 100, 200],
    actions: [
      {
        action: "view",
        title: "確認",
        icon: "/icons/shortcut-results.png",
      },
      {
        action: "dismiss",
        title: "閉じる",
      },
    ],
    data: {
      url: data.url || "/diagnosis/results",
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "SubCheck", options)
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view" || !event.action) {
    const urlToOpen = event.notification.data?.url || "/";

    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }

        // Open new window if not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

console.log("[SW] Service worker script loaded");
