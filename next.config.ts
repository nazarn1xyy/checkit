import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  allowedDevOrigins: ['172.20.10.4', '172.20.10.1', 'localhost:3000', '192.168.0.0/16', '192.168.2.139', '0631-93-183-214-8.ngrok-free.app'],
};

export default nextConfig;
