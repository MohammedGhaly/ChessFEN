const CACHE_NAME = "fen-app-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/assets/index*.js",
  "/assets/index*.css",
  "/assets/board_placeholder*.png",
  "/chess_color_classifier.json",
  "/chess_FEN_model.json",
  "/color_classifier_weights.json",
  "/weights.json",
  "/index.html",
];

// Install Service Worker and cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app resources...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Intercept network requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Update cache on activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
