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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '6qf4kgcbit1ipocg.public.blob.vercel-storage.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '**',
      },
    ],
  },
  reactStrictMode: true,
  // async redirects() {
  //   return [
  //     {
  //       source: '/register',
  //       destination: 'https://lin.ee/Ovlixv5',
  //       permanent: false,
  //     },
  //   ];
  // },

  async redirects() {
    // Only redirect to maintenance in production environment
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/((?!maintenance).*)',
          destination: '/maintenance',
          permanent: false,
        },
      ];
    }

    return [];
  },
};

export default nextConfig;
