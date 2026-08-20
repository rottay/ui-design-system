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
//   node scripts/packaging/dist-freshness-gate/index.mjs --check          (default)
//   node scripts/packaging/dist-freshness-gate/index.mjs --check \
//     --package-root <dir> --stamp <file>   (fixture mode, self-test only)

import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  computeBuildInputHash,
  fingerprintBuildInputManifest,
} from '../../lib/build/build-input-hash/index.mjs';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRootDefault = findPackageRoot(scriptDir);
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

  if (typeof stamp.buildInputFingerprint !== 'string' || stamp.buildInputFingerprint.length === 0) {
    failures.push(
      `build stamp has no buildInputFingerprint (${rel(stampPath)}). Rebuild: ${BUILD_COMMAND}`,
    );
    return { ok: false, failures };
  }
  if (!stamp.buildInputManifest || typeof stamp.buildInputManifest !== 'object') {
    failures.push(`build stamp has no buildInputManifest (${rel(stampPath)}). Rebuild: ${BUILD_COMMAND}`);
    return { ok: false, failures };
  }
  const embeddedFingerprint = fingerprintBuildInputManifest(stamp.buildInputManifest);
  if (embeddedFingerprint !== stamp.buildInputFingerprint) {
    failures.push(
      `build stamp manifest fingerprint is inconsistent (${rel(stampPath)}). Rebuild: ${BUILD_COMMAND}`,
    );
    return { ok: false, failures };
  }

  const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
  if (stamp.producerVersion !== pkg.version) {
    failures.push(
      `dist was built for version ${String(stamp.producerVersion)} but package.json is ${String(pkg.version)}. ` +
      `Rebuild before packing: ${BUILD_COMMAND}`,
    );
  }

  const { sourceHash, buildInputFingerprint } = computeBuildInputHash(packageRoot);
  if (sourceHash !== stamp.sourceHash) {
    failures.push(
      'dist is STALE: design-system source changed since the last build ' +
      `(stamp ${stamp.sourceHash.slice(0, 12)}, source now ${sourceHash.slice(0, 12)}). ` +
      `Rebuild before packing/publishing: ${BUILD_COMMAND}`,
    );
  }
  if (buildInputFingerprint !== stamp.buildInputFingerprint) {
    failures.push(
      'dist is STALE: build inputs changed since the last build ' +
      `(stamp ${stamp.buildInputFingerprint.slice(0, 12)}, inputs now ${buildInputFingerprint.slice(0, 12)}). ` +
      `This includes the workspace lockfile, package/config, and producer scripts. ` +
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
  console.log('dist-freshness-gate: OK -- dist/ matches current source and build inputs (stamp verified)');
}
