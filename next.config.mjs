/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "drive.usercontent.google.com",
        pathname: "**",
      },
    ],
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "help.store.com",
          },
        ],
        destination: "/help/:path*",
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "app.store.com",
          },
        ],
        destination: "/app/:path*",
      },
    ]
  },
}

export default nextConfig
