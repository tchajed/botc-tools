module.exports = {
  globDirectory: "dist",
  globPatterns: [
    "**/*.{html,js,css,png,svg,jpg,gif,json,woff,woff2,eot,ico,webmanifest,map}"
  ],
  runtimeCaching: [{
    urlPattern: new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts',
    },
  }],
  swDest: "dist/service-worker.js",
  clientsClaim: true,
  skipWaiting: true
};
