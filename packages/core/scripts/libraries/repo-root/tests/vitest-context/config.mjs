/**
 * The vitest context of the repo-root drill: the package as its vite root and
 * one probe, so the probe's module is transformed the way a suite's imports are.
 * The DOM runner is the point, not a default: it selects vite's web transform,
 * the one that rewrites `new URL('.', import.meta.url)`; under the node runner
 * the origin arrives on disk and the probe measures nothing.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const HERE = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: join(HERE, '../../../../..'),
  test: {
    environment: 'happy-dom',
    include: ['scripts/libraries/repo-root/tests/vitest-context/index.vitest.mjs'],
    reporters: ['default'],
  },
});
