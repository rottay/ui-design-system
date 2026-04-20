import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rottay/design-system'],
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
