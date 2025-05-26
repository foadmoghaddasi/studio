import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // If you decide to add full PWA support with next-pwa or similar:
  // experimental: {
  //   appDir: true,
  // },
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  //   disable: process.env.NODE_ENV === 'development'
  // }
};

export default nextConfig;
