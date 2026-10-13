/**
 * The collection failure of the axis-difference pilot, reduced to its shape: a
 * module vite transformed computes its origin with `new URL('.', import.meta.url)`
 * and receives a path relative to the vite root, not one on disk (web transform,
 * so the DOM runner `./repo-root.vitest-context.mjs` selects). Run by
 * `./index.test.mjs`, never collected by the package's own vitest config.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { packageRoot, repoRoot } from './index.mjs';

const VITE_ORIGIN = new URL('.', import.meta.url).pathname;
const DISK_ORIGIN = dirname(fileURLToPath(import.meta.url));

describe('repo-root under vitest', () => {
  it('receives the vite-root-relative origin, which names nothing on disk', () => {
    expect(VITE_ORIGIN.startsWith('/scripts/libraries/repo-root')).toBe(true);
    expect(existsSync(VITE_ORIGIN)).toBe(false);
  });

  it('resolves both roots from it exactly as from the on-disk origin', () => {
    expect(packageRoot(VITE_ORIGIN)).toBe(packageRoot(DISK_ORIGIN));
    expect(repoRoot(VITE_ORIGIN)).toBe(repoRoot(DISK_ORIGIN));
    expect(existsSync(join(packageRoot(VITE_ORIGIN), 'scripts/libraries/repo-root/index.mjs'))).toBe(true);
  });

  it('still refuses a root-relative origin that exists under no ancestor', () => {
    expect(() => packageRoot('/scripts/libraries/no-such-library/index.mjs')).toThrow(
      'repo-root: could not locate the @rottay/design-system package root from /scripts/libraries/no-such-library/index.mjs',
    );
  });
});
