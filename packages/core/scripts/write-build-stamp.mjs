#!/usr/bin/env node
// Build-freshness stamp writer (BLD dist-freshness precondition).
//
// Runs as the LAST step of `build`, after every dist artifact is written. It
// records the build-input content hash (see scripts/lib/build-input-hash.mjs)
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
//   node scripts/write-build-stamp.mjs            (writes dist/build-stamp.json)
//   node scripts/write-build-stamp.mjs --dist <dir> --package-root <dir>

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { computeBuildInputHash } from './lib/build-input-hash.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRootDefault = resolve(scriptDir, '..');

function parseArgs(argv) {
  const options = { packageRoot: packageRootDefault, dist: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--package-root') options.packageRoot = resolve(argv[i + 1]);
    if (argv[i] === '--dist') options.dist = resolve(argv[i + 1]);
  }
  if (!options.dist) options.dist = resolve(options.packageRoot, 'dist');
  return options;
}

// Root artifacts a real build always emits. Their absence means `dist/` was not
// built (or only partially), and stamping it would be a lie.
const SENTINEL_ARTIFACTS = ['index.js', 'index.cjs', 'index.d.ts'];

export function writeBuildStamp({ packageRoot, dist }) {
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
  const { sourceHash, fileCount } = computeBuildInputHash(packageRoot);
  const stamp = {
    schemaVersion: 1,
    producer: '@rottay/design-system',
    producerVersion: pkg.version,
    sourceHash,
    sourceFileCount: fileCount,
    // No wall-clock time on purpose: the stamp is content-addressed and must be
    // reproducible for a given source state.
    generatedAtOmitted: true,
    note:
      'Local build-freshness stamp. Gitignored (dist/) and not shipped (not in the files allowlist). ' +
      'Written by build:stamp at the end of `build`; verified by dist-freshness-gate.mjs at prepack.',
  };
  if (!existsSync(dist)) mkdirSync(dist, { recursive: true });
  writeFileSync(resolve(dist, 'build-stamp.json'), `${JSON.stringify(stamp, null, 2)}\n`);
  return { ok: true, stamp };
}

const invokedDirectly = resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const options = parseArgs(process.argv.slice(2));
  const result = writeBuildStamp(options);
  if (!result.ok) {
    console.error(result.message);
    process.exit(1);
  }
  console.log(
    `write-build-stamp: OK -- dist/build-stamp.json for ${result.stamp.producer}@${result.stamp.producerVersion} ` +
    `(${result.stamp.sourceFileCount} source inputs, sourceHash ${result.stamp.sourceHash.slice(0, 12)})`,
  );
}
