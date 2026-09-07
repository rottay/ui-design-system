/**
 * @fileoverview Can the published measurement still be read as today's?
 *
 * The STATUS indicator republishes `evidence/index.json` verbatim, and nothing
 * bound that file to the tree it measured. A door change with no re-run left a
 * real number describing a tree that no longer exists, and STATUS kept printing
 * it as MEASURED -- a measurement nobody took, which is the one thing that
 * indicator is not allowed to publish.
 *
 * WHY A CONTENT DIGEST AND NOT AN MTIME. `libraries/build/input-hash` states
 * the reason for `dist/`: a fresh checkout stamps every tracked file with the
 * same time, so mtime carries no staleness signal. The artifact is COMMITTED,
 * so it is one clone away from exactly that. `assertDoorBuildIsFresh` stays
 * what it is -- a local guard that a run measures the build it just made; this
 * one is the guard on the published file.
 *
 * WHAT IS IN THE FINGERPRINT, AND WHY NOT MORE. A guard CI cannot re-satisfy
 * (the run needs a browser) must not go red for a change that cannot move the
 * number, so both sets are narrow and both are derived rather than listed:
 *   door       -- the shippable files under `DOOR_SOURCES`, the same two roots
 *                 the run already declares as what `dist/server.js` is built
 *                 from that can move a compiled channel, filtered through the
 *                 build's own non-shipping exclusions.
 *   instrument -- the transitive closure of the probe's own relative module
 *                 graph plus the data files those owners carry, so a borrowed
 *                 owner is covered the moment it is imported and a harness
 *                 change invalidates the measurements it produced.
 * The published artifact is excluded from its own digest by construction: it
 * lives under `evidence/`, which owns no module.
 *
 * @module Tooling/DecisionsLit/Runtime/Freshness
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

import { collectBuildInputFiles } from '../../../../libraries/build/input-hash/index.mjs';
import { CORE_ROOT, DOOR_SOURCES, repoRelative } from '../compile/index.mjs';

/** The module the instrument's closure is walked from: its one public door. */
export const INSTRUMENT_ENTRY = 'scripts/check/decisions-lit/public/cli/index.mjs';

/** The command a red verdict must name; a guard that cannot be answered is noise. */
export const RERUN_COMMAND = 'pnpm --filter @rottay/design-system run decisions-lit';

/** Mirrors `wiring-coverage`'s walk: a relative module this tree really imports. */
const RELATIVE_IMPORT = /(?:from\s+|import\s*(?:\(\s*)?)['"](\.{1,2}\/[\w./-]+\.mjs)['"]/g;

const EXCLUDED_DIRECTORY = new Set(['tests', '__tests__', 'node_modules']);

function portable(path) {
  return path.split('\\').join('/');
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * A digest over (path, bytes) pairs, sorted so it is order-independent and
 * reproducible from the repository alone.
 */
export function digestOf(files, { coreRoot = CORE_ROOT } = {}) {
  const hash = createHash('sha256');
  for (const file of [...files].sort()) {
    const absolute = resolve(coreRoot, file);
    hash.update(file);
    hash.update('\0');
    hash.update(existsSync(absolute) ? sha256(readFileSync(absolute)) : 'MISSING');
    hash.update('\n');
  }
  return hash.digest('hex');
}

/**
 * The door files, taken from the build's own input collector so the exclusion
 * rules have one authority, then narrowed to the roots the run declares.
 */
export function doorFiles({ coreRoot = CORE_ROOT, roots = DOOR_SOURCES } = {}) {
  return collectBuildInputFiles(coreRoot)
    .map(portable)
    .filter((file) => roots.some((root) => file === root || file.startsWith(`${root}/`)))
    .sort();
}

/** Every `.json` an owner carries below its own folder; a module's folder is its data. */
function dataFilesUnder(coreRoot, folder) {
  const absolute = resolve(coreRoot, folder);
  if (!existsSync(absolute) || !statSync(absolute).isDirectory()) return [];
  const found = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRECTORY.has(entry.name)) walk(resolve(directory, entry.name));
        continue;
      }
      if (entry.isFile() && entry.name.endsWith('.json')) {
        found.push(portable(relative(coreRoot, resolve(directory, entry.name))));
      }
    }
  };
  walk(absolute);
  return found;
}

function resolveRelative(coreRoot, fromFile, specifier) {
  const candidate = resolve(dirname(resolve(coreRoot, fromFile)), specifier);
  if (!existsSync(candidate) || !statSync(candidate).isFile()) return null;
  return portable(relative(coreRoot, candidate));
}

/**
 * The instrument's own production files: the module closure of {@link
 * INSTRUMENT_ENTRY} plus the data those owners carry.
 *
 * Tests are excluded deliberately -- a test edit must not invalidate a
 * measurement it cannot change -- which is also why the closure is walked from
 * the CLI rather than from the suite.
 */
export function instrumentFiles({ coreRoot = CORE_ROOT, entry = INSTRUMENT_ENTRY } = {}) {
  const modules = [];
  const seen = new Set();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file) || file.includes('/tests/') || file.includes('.test.')) continue;
    seen.add(file);
    let source;
    try {
      source = readFileSync(resolve(coreRoot, file), 'utf8');
    } catch {
      continue;
    }
    modules.push(file);
    for (const match of source.matchAll(RELATIVE_IMPORT)) {
      const resolved = resolveRelative(coreRoot, file, match[1]);
      if (resolved && !seen.has(resolved)) queue.push(resolved);
    }
  }
  const data = modules.flatMap((file) => dataFilesUnder(coreRoot, dirname(file)));
  return [...new Set([...modules, ...data])].sort();
}

/** Both fingerprints, in the exact shape a run publishes and a check recomputes. */
export function sourceFingerprints({ coreRoot = CORE_ROOT } = {}) {
  const door = doorFiles({ coreRoot });
  const instrument = instrumentFiles({ coreRoot });
  return {
    door: {
      roots: [...DOOR_SOURCES],
      fileCount: door.length,
      digest: digestOf(door, { coreRoot }),
    },
    instrument: {
      entry: INSTRUMENT_ENTRY,
      fileCount: instrument.length,
      digest: digestOf(instrument, { coreRoot }),
    },
  };
}

function compare(name, recorded, current, failures) {
  if (!recorded || typeof recorded.digest !== 'string') {
    failures.push(
      `the artifact records no ${name} fingerprint, so nothing binds it to the tree it measured. ` +
        `Re-run \`${RERUN_COMMAND}\`.`,
    );
    return;
  }
  if (recorded.digest === current.digest) return;
  failures.push(
    `the ${name} moved since the published run: recorded ${recorded.digest.slice(0, 12)} ` +
      `over ${recorded.fileCount} files, current ${current.digest.slice(0, 12)} over ` +
      `${current.fileCount}. The published number describes a tree that no longer exists; ` +
      `re-run \`${RERUN_COMMAND}\`.`,
  );
}

/**
 * Every reason the published artifact must not be read as a current
 * measurement. Pure: it is handed the artifact and the fingerprints, so the
 * drill can plant either side.
 */
export function freshnessFailures({ artifact, fingerprints, artifactPath }) {
  const failures = [];
  const where = artifactPath ? ` (${artifactPath})` : '';
  if (artifact === null) {
    return [
      `no run has published an artifact${where}. The indicator has nothing to publish; run ` +
        `\`${RERUN_COMMAND}\`.`,
    ];
  }
  if (typeof artifact?.headline !== 'string' || !artifact?.summary) {
    return [`the artifact${where} carries no headline; it cannot be read as a measurement.`];
  }
  compare('door', artifact.provenance?.sources?.door, fingerprints.door, failures);
  compare('instrument', artifact.provenance?.sources?.instrument, fingerprints.instrument, failures);
  const violations = Array.isArray(artifact.violations) ? artifact.violations : [];
  for (const violation of violations) {
    failures.push(`the published run did not certify itself: ${violation}`);
  }
  return failures;
}

/** Reads the published artifact, or `null` when there is none to read. */
export function readArtifact(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export { repoRelative };
