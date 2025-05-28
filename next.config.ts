import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd, // فقط در production فعال است
};

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

const withPWA = isProd
  ? require("next-pwa")(pwaConfig)
  : (config: NextConfig) => config;

export default withPWA(nextConfig);
