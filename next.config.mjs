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
}

export default nextConfig
