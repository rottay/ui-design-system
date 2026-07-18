#!/usr/bin/env node
// Dist-freshness prepack precondition (BLD dist-freshness gate).
//
// `prepack` currently runs a battery of validation gates but never verifies
// that `dist/` actually corresponds to the current source. Because `dist/` is
// gitignored and rebuilt out of band, a `npm pack` / `npm publish` run against
// a stale `dist/` would ship artifacts from an OLDER source state while every
// other gate stays green. This gate closes that hole: it reads the build stamp
// that `build:stamp` writes at the end of `build` and refuses to proceed when
// the recomputed build-input hash no longer matches, or when the stamp is
// missing, or when it was written for a different package version.
//
// This gate does NOT build. Making `prepack` build is against the rules
// (explicit, owner-visible builds only); the gate instead FAILS with a message
// naming the exact build command. The build is the Build agent's singleton.
//
// Usage:
//   node scripts/dist-freshness-gate.mjs --check          (default)
//   node scripts/dist-freshness-gate.mjs --check \
//     --package-root <dir> --stamp <file>   (fixture mode, self-test only)

import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { computeBuildInputHash } from './lib/build-input-hash.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRootDefault = resolve(scriptDir, '..');
const BUILD_COMMAND = 'pnpm --filter @rottay/design-system build';

function parseArgs(argv) {
  const options = { packageRoot: packageRootDefault, stampPath: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--package-root') options.packageRoot = resolve(argv[i + 1]);
    if (argv[i] === '--stamp') options.stampPath = resolve(argv[i + 1]);
  }
  if (!options.stampPath) options.stampPath = resolve(options.packageRoot, 'dist/build-stamp.json');
  return options;
}

/**
 * Assert that `dist/` was built from the current source. Pure: returns
 * `{ ok, failures }` and reads only the filesystem it is pointed at.
 */
export function assertDistFresh({ packageRoot, stampPath }) {
  const failures = [];
  const rel = (p) => relative(packageRoot, p).split(sep).join('/');

  if (!existsSync(stampPath)) {
    failures.push(
      `build stamp missing at ${rel(stampPath)}. dist/ is unbuilt or was built before the freshness ` +
      `stamp existed. Build it: ${BUILD_COMMAND}`,
    );
    return { ok: false, failures };
  }

  let stamp;
  try {
    stamp = JSON.parse(readFileSync(stampPath, 'utf8'));
  } catch (error) {
    failures.push(`build stamp is not valid JSON (${rel(stampPath)}): ${error.message}. Rebuild: ${BUILD_COMMAND}`);
    return { ok: false, failures };
  }

  if (typeof stamp.sourceHash !== 'string' || stamp.sourceHash.length === 0) {
    failures.push(`build stamp has no sourceHash (${rel(stampPath)}). Rebuild: ${BUILD_COMMAND}`);
    return { ok: false, failures };
  }

  const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
  if (stamp.producerVersion !== pkg.version) {
    failures.push(
      `dist was built for version ${String(stamp.producerVersion)} but package.json is ${String(pkg.version)}. ` +
      `Rebuild before packing: ${BUILD_COMMAND}`,
    );
  }

  const { sourceHash } = computeBuildInputHash(packageRoot);
  if (sourceHash !== stamp.sourceHash) {
    failures.push(
      'dist is STALE: design-system source changed since the last build ' +
      `(stamp ${stamp.sourceHash.slice(0, 12)}, source now ${sourceHash.slice(0, 12)}). ` +
      `Rebuild before packing/publishing: ${BUILD_COMMAND}`,
    );
  }

  return { ok: failures.length === 0, failures };
}

const invokedDirectly = resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const options = parseArgs(process.argv.slice(2));
  const { ok, failures } = assertDistFresh(options);
  if (!ok) {
    console.error(`dist-freshness-gate: FAIL (${failures.length})`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log('dist-freshness-gate: OK -- dist/ matches the current source (build stamp verified)');
}
