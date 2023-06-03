module.exports = {
  globDirectory: "dist",
  globPatterns: [
    "**/*.{html,js,css,png,webp,svg,json,woff,woff2,ico,webmanifest}"
  ],
  maximumFileSizeToCacheInBytes: 3000000,
  runtimeCaching: [{
    urlPattern: new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts',
      cacheableResponse: {
        statuses: [0, 200],
      },
      expiration: {
        maxEntries: 30,
      },
    },
  }],
  swDest: "dist/service-worker.js",
  clientsClaim: false,
  skipWaiting: false
};
