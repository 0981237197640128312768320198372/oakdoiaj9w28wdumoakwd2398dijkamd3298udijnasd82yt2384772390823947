/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'drive.usercontent.google.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'dnm.nflximg.net',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'www.netflix.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dokmaistore.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '**',
      },
    ],
  },
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/deposit',
        destination: 'https://lin.ee/Ovlixv5',
        permanent: false,
      },
      {
        source: '/register',
        destination: 'https://lin.ee/Ovlixv5',
        permanent: false,
      },
      {
        source: '/indefatigability/perspicacity/thebot',
        destination: 'https://www.mediafire.com/folder/dy6nfl2n96w9a/Thebot',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
