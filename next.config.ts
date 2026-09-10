import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Playwright / local tooling that hits 127.0.0.1 while Next binds localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
