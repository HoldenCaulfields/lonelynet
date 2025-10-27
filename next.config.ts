import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lonelynet.onrender.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ],
    formats: ['image/webp', 'image/avif'], // ✅ Modern formats
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'react-leaflet']
  },
  allowedDevOrigins: [
    'http://192.168.1.12:3000',
  ],
};

export default nextConfig;
