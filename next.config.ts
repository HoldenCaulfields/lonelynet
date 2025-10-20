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
  }
};

export default nextConfig;
