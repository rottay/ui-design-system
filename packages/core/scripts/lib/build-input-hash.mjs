// Shared build-input content hash (BLD dist-freshness precondition).
//
// The design-system `build` produces `dist/` from hand-authored source under
// `src/` plus a few build-config files. Nothing recorded WHICH source state
// produced the current `dist/`, so a stale `dist/` (source edited after the
// last build) could be packed and published as if fresh. mtime comparison is
// unreliable: a fresh CI checkout stamps every tracked file with the same
// checkout time and `dist/` is gitignored (rebuilt), so mtimes carry no signal
// about staleness. A content hash of the build inputs is the authoritative
// signal and is what both sides use here.
//
// `write-build-stamp.mjs` records this hash into `dist/build-stamp.json` at the
// END of the build; `dist-freshness-gate.mjs` recomputes it and fails when it
// diverges. Both import this ONE module so the two computations are identical
// by construction -- a drift between writer and reader would silently defeat
// the gate.
//
// Input set: every file under `src/` except the non-shipping inputs the
// production tsconfig already excludes (tests, stories, examples, markdown),
// plus the build-config files and the package.json fields that steer the build
// (version + every `build*` script). Over-inclusion is the safe direction: a
// superfluous input can only produce a false "stale" (forcing a rebuild that
// was going to happen before publish anyway), never a false "fresh".

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';

// Non-shipping source inputs. Mirrors the production tsconfig `exclude` intent:
// these files are not compiled into `dist/`, so a change to one cannot make
// `dist/` stale and must not flip the freshness signal.
const EXCLUDED_FILE = [
  /\.(test|spec|stories)\.[cm]?[jt]sx?$/u,
  /(?:^|\/)EXAMPLES\.tsx$/u,
  /(?:^|\/)ADVANCED_EXAMPLES\.tsx$/u,
  /(?:^|\/)USAGE_EXAMPLE\.tsx$/u,
  /(?:^|\/)examples\.tsx$/u,
  /(?:^|\/)__test_imports\.ts$/u,
  /\.md$/u,
];
const EXCLUDED_SEGMENT = new Set(['__tests__', 'tests', 'testing']);

// Build-config files (relative to the package root) that steer `dist/` output.
const BUILD_CONFIG_FILES = ['vite.config.ts', 'tsconfig.json', 'postcss.config.mjs'];

function portable(path) {
  return path.split(sep).join('/');
}

function isExcluded(relPath) {
  const segments = relPath.split('/');
  // Drop the trailing filename before testing directory segments so a file
  // literally named `tests.ts` is not mistaken for a `tests/` directory.
  for (const segment of segments.slice(0, -1)) {
    if (EXCLUDED_SEGMENT.has(segment)) return true;
  }
  return EXCLUDED_FILE.some((re) => re.test(relPath));
}

/**
 * Collect the shippable build-input files under `srcRoot`, as portable paths
 * relative to `packageRoot`, sorted for determinism.
 */
export function collectBuildInputFiles(packageRoot) {
  const srcRoot = resolve(packageRoot, 'src');
  const found = [];
  const walk = (dir) => {
    for (const dirent of readdirSync(dir, { withFileTypes: true })) {
      const abs = resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!dirent.isFile()) continue;
      const rel = portable(relative(packageRoot, abs));
      if (isExcluded(rel)) continue;
      found.push(rel);
    }
  };
  if (existsSync(srcRoot)) walk(srcRoot);
  found.sort();
  return found;
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Compute the deterministic build-input hash for the package at `packageRoot`.
 * Returns `{ sourceHash, fileCount }`. Reads file bytes (not text) so binary
 * source assets hash correctly.
 */
export function computeBuildInputHash(packageRoot) {
  const files = collectBuildInputFiles(packageRoot);
  const lines = [];
  for (const rel of files) {
    lines.push(`src:${rel}\0${sha256(readFileSync(resolve(packageRoot, rel)))}`);
  }
  for (const name of BUILD_CONFIG_FILES) {
    const abs = resolve(packageRoot, name);
    if (existsSync(abs)) {
      lines.push(`config:${name}\0${sha256(readFileSync(abs))}`);
    } else {
      lines.push(`config:${name}\0<absent>`);
    }
  }
  const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
  const buildScripts = Object.fromEntries(
    Object.entries(pkg.scripts ?? {})
      .filter(([key]) => key === 'build' || key.startsWith('build:'))
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  lines.push(`pkg:version\0${pkg.version ?? ''}`);
  lines.push(`pkg:buildScripts\0${JSON.stringify(buildScripts)}`);

  return {
    sourceHash: sha256(lines.join('\n')),
    fileCount: files.length,
  };
}
