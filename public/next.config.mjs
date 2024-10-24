/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["drive.google.com", "drive.usercontent.google.com"],
  },
}
withOffline({
  workboxOpts: {
    swDest: "static/service-worker.js",
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "offlineCache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
})
export default nextConfig
