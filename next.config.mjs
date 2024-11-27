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
      {
        protocol: "https",
        hostname: "dnm.nflximg.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "www.netflix.com",
        pathname: "**",
      },
    ],
  },
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/deposit",
        destination: "https://lin.ee/Ovlixv5",
        permanent: false,
      },
      {
        source: "/register",
        destination: "https://lin.ee/Ovlixv5",
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/:path*", // Redirect all paths
        has: [
          { type: "host", value: "admin.dokmaistore.com" }, // For admin subdomain
        ],
        destination: "/admin/:path*", // Serve `/admin` content
      },
    ]
  },
}

export default nextConfig
