import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const destination = apiURL.startsWith('http') ? apiURL : `http://${apiURL}`;
    return [
      {
        source: '/api/:path*',
        destination: `${destination}/:path*`,
      },
    ];
  },
};

export default nextConfig;
