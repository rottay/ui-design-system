import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const turbopackRoot = fileURLToPath(new URL('../../', import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  transpilePackages: ['@rottay/design-system'],
  turbopack: {
    root: turbopackRoot,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'antd',
      '@ant-design/icons',
      'framer-motion',
    ],
  },
};

export default nextConfig;
