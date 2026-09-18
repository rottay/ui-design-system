/**
 * FAM-09 debrief probe harness. Mirrors packages/core/vitest.config.ts's alias map
 * with `root` pinned at packages/core, so the probes run against the real package.
 * Self-locating: no absolute paths to edit.
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { realpathSync } from 'fs';
import { resolve } from 'path';

const HERE = realpathSync(__dirname);
const CORE = realpathSync(resolve(HERE, '../../../packages/core'));

export default defineConfig({
  root: CORE,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: resolve(CORE, 'tests/setup/index.ts'),
    css: true,
    pool: 'forks',
    include: [`${HERE}/**/*.test.tsx`],
    testTimeout: 20000,
    reporters: ['verbose'],
  },
  server: { fs: { allow: [CORE, HERE, realpathSync(resolve(CORE, '../..'))] } },
  resolve: {
    alias: {
      // The probes live outside the package, so bare specifiers do not resolve by
      // directory walk. Pin the one the probes import directly.
      '@testing-library/react': resolve(CORE, './node_modules/@testing-library/react'),
      '@rottay/design-system/icons': resolve(CORE, './src/entrypoints/icons/index.ts'),
      '@rottay/design-system/server': resolve(CORE, './src/entrypoints/server/index.ts'),
      '@rottay/design-system': resolve(CORE, './src/index.ts'),
      '@': resolve(CORE, './src'),
      '@ui': resolve(CORE, './src/components'),
      '@checks': resolve(CORE, './scripts/check'),
      '@tests': resolve(CORE, './tests'),
    },
  },
});
