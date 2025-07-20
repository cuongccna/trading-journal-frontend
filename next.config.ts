import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:4000/api/:path*', // port phải đúng với backend!
    },
  ];
},
};

export default nextConfig;
