import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const turbopackRoot = fileURLToPath(new URL('../../', import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  turbopack: {
    root: turbopackRoot,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
