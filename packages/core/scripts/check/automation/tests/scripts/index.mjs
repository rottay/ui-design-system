import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import { packageRoot } from '../../../../libraries/repo-root/index.mjs';

const coreRoot = packageRoot(import.meta.dirname);

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(coreRoot, 'src'),
      '@checks': resolve(coreRoot, 'scripts/check'),
      '@tests': resolve(coreRoot, 'tests'),
    },
  },
  test: {
    environment: 'node',
    include: ['scripts/**/*.vitest.test.ts', 'scripts/**/index.test.ts'],
  },
});
