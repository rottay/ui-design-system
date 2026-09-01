/**
 * repo-root — the single ascending root-finder every script uses.
 *
 * Two semantics, two predicates. The repo root's package.json and the
 * package's package.json share the name `@rottay/design-system`, so a single
 * name-based findUp is ambiguous (REAUDITORIA-FABLE-2 §2.2):
 *
 *   repoRoot()      -> the workspace root (the directory holding
 *                      `pnpm-workspace.yaml`). For repo-level artifacts
 *                      (test-artifacts/, docs/, .github/).
 *   packageRoot()   -> the `packages/core` directory (the nearest ancestor
 *                      whose package.json is named `@rottay/design-system`).
 *                      For package artifacts (dist/, styles/, scripts/).
 *
 * Both fail closed: they throw if the marker is not found within 12 levels.
 * Hardcoding `resolve(HERE, '..')` chains is what this replaces — a script
 * that computes its own depth breaks the day it moves.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const MAX_LEVELS = 12;

function findUp(fromDir, predicate, label) {
  let dir = fromDir;
  for (let i = 0; i < MAX_LEVELS; i += 1) {
    if (predicate(dir)) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`repo-root: could not locate ${label} from ${fromDir}`);
}

/** Workspace root: the directory that holds pnpm-workspace.yaml. */
export function repoRoot(fromDir) {
  return findUp(
    fromDir,
    (dir) => existsSync(join(dir, 'pnpm-workspace.yaml')),
    'the workspace root (pnpm-workspace.yaml)',
  );
}

/** Package root: nearest ancestor package.json named @rottay/design-system. */
export function packageRoot(fromDir) {
  return findUp(
    fromDir,
    (dir) => {
      const manifest = join(dir, 'package.json');
      if (!existsSync(manifest)) return false;
      try {
        return JSON.parse(readFileSync(manifest, 'utf8')).name === '@rottay/design-system';
      } catch {
        return false;
      }
    },
    'the @rottay/design-system package root',
  );
}
