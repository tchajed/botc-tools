export const globDirectory = "dist";
export const globPatterns = [
  // core code
  "**/*.{html,js,css}",
  // images
  "**/*.{png,webp,svg,ico}",
  "**/*.{json,woff,woff2,webmanifest}",
];
export const maximumFileSizeToCacheInBytes = 6000000; // 5MB
export const ignoreURLParametersMatching = [
  /^id$/,
  /^page$/,
  /^json$/,
  /^utm_/,
];
export const dontCacheBustURLsMatching = /.*\.[a-f0-9]{8}\..*/;
export const runtimeCaching = [
  {
    urlPattern: /^https:\/\/fonts\.googleapis\.com/,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "google-fonts",
    },
  },
  {
    urlPattern: /^https:\/\/fonts\.gstatic\.com/,
    handler: "CacheFirst",
    options: {
      cacheName: "google-fonts",
      cacheableResponse: {
        statuses: [0, 200],
      },
      expiration: {
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      },
    },
  },
];
export const swDest = "dist/service-worker.js";
export const clientsClaim = false;
export const skipWaiting = false;
export const offlineGoogleAnalytics = true;
