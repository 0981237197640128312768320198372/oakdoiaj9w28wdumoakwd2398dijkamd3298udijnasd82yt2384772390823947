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
      // If you want to allow all domains, you would typically not use a wildcard directly.
      // Instead, consider using a more secure approach or external services for image loading.
    ],
  },
}

export default nextConfig
