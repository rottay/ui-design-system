#!/usr/bin/env node
// Build-freshness stamp writer (BLD dist-freshness precondition).
//
// Runs as the LAST step of `build`, after every dist artifact is written. It
// records the build-input content hash (see scripts/lib/build/input-hash/index.mjs)
// and the producer version into `dist/build-stamp.json`. `prepack` then runs
// `dist-freshness-gate.mjs`, which recomputes the same hash and refuses to pack
// when it diverges from this stamp -- i.e. when `dist/` was built from a
// different source state than the one about to be published.
//
// The stamp lives inside `dist/`, which is gitignored (never committed) and is
// NOT matched by the package `files` allowlist (`dist/**/*.{js,cjs,d.ts}` plus
// named `.css`), so it never ships in the tarball. It is a local/CI build
// verification artifact only.
//
// This writer does NOT build. It refuses to stamp a `dist/` that is missing the
// sentinel root artifacts, so a stamp can never claim freshness for an absent
// or partial build.
//
// Usage:
//   node scripts/builders/write-build-stamp/index.mjs            (writes dist/build-stamp.json)
//   node scripts/builders/write-build-stamp/index.mjs --dist <dir> --package-root <dir>

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { computeBuildInputHash } from '../../libraries/build/input-hash/index.mjs';
import { packageRoot as findPackageRoot } from '../../libraries/repo-root/index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRootDefault = findPackageRoot(scriptDir);

function parseArgs(argv) {
  const options = { packageRoot: packageRootDefault, dist: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--package-root') options.packageRoot = resolve(argv[i + 1]);
    if (argv[i] === '--dist') options.dist = resolve(argv[i + 1]);
  }
  if (!options.dist) options.dist = resolve(options.packageRoot, 'dist');
  return options;
}

/**
 * Root artifacts a real build always emits. Their absence means `dist/` was not
 * built (or only partially), and stamping it would be a lie.
 *
 * The set is the package `files` allowlist minus its globs. It used to be three
 * entries, so a build that produced `index.{js,cjs,d.ts}` and nothing else --
 * no vertical CSS, no modern engine bundle -- stamped successfully.
 */
export const SENTINEL_ARTIFACTS = [
  'index.js',
  'index.cjs',
  'index.d.ts',
  'styles.css',
  'modern-engine.css',
  'rottay.css',
  'bithire.css',
  'evnto.css',
];

/**
 * The build session marker.
 *
 * `build:stamp` is a first-class npm script, so it can be run against an
 * arbitrarily old `dist/`: it stamps the CURRENT source hash onto it and the
 * freshness gate turns green. The gate proved "source now equals source when
 * stamped", never "dist was produced from that source".
 *
 * The build writes this nonce after the bundler step (which empties `dist/`);
 * the stamp REQUIRES it, embeds it, and deletes it. A standalone `build:stamp`
 * therefore fails loud, and the nonce cannot be reused for a second stamp.
 *
 * The bound is stated rather than implied: chaining `build:session` by hand
 * would still open one. What that cannot forge is the `distManifest` the stamp
 * embeds, which pins the exact dist bytes that were stamped and is re-verified
 * by the freshness gate -- so a forged session over an old dist still has to
 * match every byte of it against the current source.
 */
export const BUILD_SESSION_FILE = '.build-session.json';

export function writeBuildSession({ dist, nonce }) {
  if (!existsSync(dist)) mkdirSync(dist, { recursive: true });
  const session = { nonce: nonce ?? createHash('sha256').update(`${process.pid}:${Date.now()}:${Math.random()}`).digest('hex') };
  writeFileSync(resolve(dist, BUILD_SESSION_FILE), `${JSON.stringify(session, null, 2)}\n`);
  return session.nonce;
}

/**
 * Every shipped file under `dist/`, with its digest. Embedded in the stamp and
 * re-verified by the gate, so a dist byte mutated after stamping -- or a dist
 * emptied down to the stamp itself -- is detectable. The gate previously read
 * only the stamp and never enumerated dist at all.
 */
const SHIPPED_DIST = /\.(js|cjs|d\.ts|css)$/;

export function collectDistManifest(dist) {
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) { walk(absolute); continue; }
      if (!SHIPPED_DIST.test(entry.name)) continue;
      if (entry.name.endsWith('.d.ts.map')) continue;
      files.push({
        path: relative(dist, absolute).split(sep).join('/'),
        sha256: createHash('sha256').update(readFileSync(absolute)).digest('hex'),
      });
    }
  };
  if (existsSync(dist) && statSync(dist).isDirectory()) walk(dist);
  files.sort((left, right) => left.path.localeCompare(right.path));
  return files;
}

export function writeBuildStamp({ packageRoot, dist, requireSession = true }) {
  const sessionPath = resolve(dist, BUILD_SESSION_FILE);
  let sessionNonce = null;
  if (requireSession) {
    if (!existsSync(sessionPath)) {
      return {
        ok: false,
        message:
          `write-build-stamp: refusing to stamp without a build session marker (${BUILD_SESSION_FILE} in ${dist}). ` +
          'A stamp written outside a build proves only that the source hash was recomputed, not that dist came ' +
          'from it. Run the full build: pnpm --filter @rottay/design-system build',
      };
    }
    try {
      sessionNonce = JSON.parse(readFileSync(sessionPath, 'utf8')).nonce;
    } catch {
      sessionNonce = null;
    }
    if (typeof sessionNonce !== 'string' || sessionNonce.length === 0) {
      return { ok: false, message: `write-build-stamp: build session marker at ${sessionPath} is malformed.` };
    }
  }
  const missing = SENTINEL_ARTIFACTS.filter((name) => !existsSync(resolve(dist, name)));
  if (missing.length > 0) {
    return {
      ok: false,
      message:
        `write-build-stamp: refusing to stamp an unbuilt dist -- missing ${missing.join(', ')} in ${dist}. ` +
        'Run the full build first: pnpm --filter @rottay/design-system build',
    };
  }
  const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
  const {
    sourceHash,
    fileCount,
    buildInputFingerprint,
    buildInputManifest,
  } = computeBuildInputHash(packageRoot);
  const lockfile = buildInputManifest.workspace.find(
    (entry) => entry.id === 'workspace:pnpm-lock.yaml',
  );
  if (!lockfile || lockfile.sha256 === '<absent>') {
    return {
      ok: false,
      message:
        'write-build-stamp: refusing to stamp without a pnpm-lock.yaml build input. ' +
        'Run the build from a complete workspace checkout.',
    };
  }
  const stamp = {
    schemaVersion: 3,
    buildSession: sessionNonce,
    distManifest: collectDistManifest(dist),
    producer: '@rottay/design-system',
    producerVersion: pkg.version,
    sourceHash,
    sourceFileCount: fileCount,
    buildInputFingerprint,
    buildInputManifest,
    // No wall-clock time on purpose: the stamp is content-addressed and must be
    // reproducible for a given source state.
    generatedAtOmitted: true,
    note:
      'Local build-freshness stamp. Gitignored (dist/) and not shipped (not in the files allowlist). ' +
      'Written by build:stamp at the end of `build`; verified by dist-freshness-gate.mjs at prepack.',
  };
  if (!existsSync(dist)) mkdirSync(dist, { recursive: true });
  writeFileSync(resolve(dist, 'build-stamp.json'), `${JSON.stringify(stamp, null, 2)}\n`);
  // The nonce is single-use: leaving it behind would let the next standalone
  // `build:stamp` reuse this build's session and re-stamp a stale dist.
  if (requireSession) rmSync(sessionPath, { force: true });
  return { ok: true, stamp };
}

const invokedDirectly = resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const options = parseArgs(process.argv.slice(2));
  if (process.argv.includes('--open-session')) {
    const nonce = writeBuildSession({ dist: options.dist });
    console.log(`write-build-stamp: build session opened (${nonce.slice(0, 12)})`);
    process.exit(0);
  }
  const result = writeBuildStamp(options);
  if (!result.ok) {
    console.error(result.message);
    process.exit(1);
  }
  console.log(
    `write-build-stamp: OK -- dist/build-stamp.json for ${result.stamp.producer}@${result.stamp.producerVersion} ` +
    `(${result.stamp.sourceFileCount} source inputs, sourceHash ${result.stamp.sourceHash.slice(0, 12)}, ` +
    `buildInputFingerprint ${result.stamp.buildInputFingerprint.slice(0, 12)})`,
  );
}
