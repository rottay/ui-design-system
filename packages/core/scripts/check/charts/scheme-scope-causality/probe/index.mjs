/**
 * Vitest harness for the scheme-scope causality probe.
 *
 * The probe lives under `scripts/` deliberately: the package's `unit` project
 * includes `src/**` and four `tests/` branches, so a measurement that is
 * EXPECTED to record a divergence cannot redden the product suites. It is run
 * only by its own instrument, through this config.
 */
import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import { packageRoot } from '../../../../libraries/repo-root/index.mjs';

const CORE = packageRoot(import.meta.dirname);

export default defineConfig({
  root: CORE,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: resolve(CORE, 'tests/setup/index.ts'),
    css: true,
    pool: 'forks',
    include: ['scripts/check/charts/scheme-scope-causality/probe/index.test.tsx'],
    testTimeout: 60000,
    hookTimeout: 60000,
    retry: 0,
    reporters: [['default', { summary: false }]],
  },
  resolve: {
    alias: {
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
