/** @type {import('next').nextConfig} */
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  async rewrites() {
    // In production, API is served from the same server (no rewrite needed)
    // In development, proxy to local Express server
    if (isProduction) {
      return [];
    }
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3001/api/v1/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
    unoptimized: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  output: 'standalone',
};

module.exports = nextConfig;
