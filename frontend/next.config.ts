import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow all network access in dev environment
  allowedDevOrigins: ['192.168.4.197', '10.5.0.2', 'localhost'],
};

export default nextConfig;
