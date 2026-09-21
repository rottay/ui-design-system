import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const CORE = resolve(__dirname, '../../..');

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: resolve(CORE, 'tests/setup/index.ts'),
    css: true,
    pool: 'forks',
    maxWorkers: 1,
    minWorkers: 1,
    testTimeout: 600000,
    hookTimeout: 600000,
    retry: 0,
    reporters: ['verbose'],
    include: [resolve(__dirname, '*.test.tsx')],
  },
  resolve: {
    alias: {
      '@rottay/design-system/icons': resolve(CORE, 'src/entrypoints/icons/index.ts'),
      '@rottay/design-system/server': resolve(CORE, 'src/entrypoints/server/index.ts'),
      '@rottay/design-system': resolve(CORE, 'src/index.ts'),
      '@': resolve(CORE, 'src'),
      '@ui': resolve(CORE, 'src/components'),
      '@checks': resolve(CORE, 'scripts/check'),
      '@tests': resolve(CORE, 'tests'),
    },
  },
});
