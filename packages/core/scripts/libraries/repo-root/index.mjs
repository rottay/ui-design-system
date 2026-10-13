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
 *
 * ONE MORE FORM OF THE SAME ORIGIN, the vitest one. Vite rewrites
 * `new URL('.', import.meta.url)` in a module it transforms, and the caller
 * then hands over its location relative to the vite root
 * (`/scripts/libraries/tokens/producers/index.mjs`) instead of on disk. That
 * path names nothing on the filesystem, so the walk can never meet a marker.
 * It is read only AFTER the walk has failed and only when the origin does not
 * exist on disk: it is re-anchored on the nearest ancestor of THIS file under
 * which it does exist, and the same bounded walk runs from there. An origin
 * that exists and has no marker above it, or one that exists under no
 * ancestor, still throws the same error naming the origin the caller gave.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_LEVELS = 12;

function walkUp(fromDir, predicate) {
  let dir = fromDir;
  for (let i = 0; i < MAX_LEVELS; i += 1) {
    if (predicate(dir)) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/** The on-disk path a vite-root-relative origin names, or null if it names none. */
function reanchor(fromDir) {
  if (typeof fromDir !== 'string' || !isAbsolute(fromDir) || existsSync(fromDir)) return null;
  let own;
  try {
    own = dirname(fileURLToPath(import.meta.url));
  } catch {
    return null;
  }
  const anchor = walkUp(own, (dir) => existsSync(join(dir, fromDir)));
  return anchor === null ? null : join(anchor, fromDir);
}

function findUp(fromDir, predicate, label) {
  const found = walkUp(fromDir, predicate);
  if (found !== null) return found;
  const reanchored = reanchor(fromDir);
  const refound = reanchored === null ? null : walkUp(reanchored, predicate);
  if (refound !== null) return refound;
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
