import type { NextConfig } from "next";

const apiOrigin = (process.env.API_URL ?? "http://localhost:3000/api").replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
