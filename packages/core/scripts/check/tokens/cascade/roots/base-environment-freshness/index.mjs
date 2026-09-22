#!/usr/bin/env node
/**
 * base-environment-freshness — the committed `:root` projections must describe
 * the bundles as they are today.
 *
 * WHY IT IS BLOCKING. The base environment is what the non-CSS token emitter
 * resolves a compilation against: a compilation resolved against itself leaves
 * roughly two channels in five unresolvable, because the properties they read
 * live in the static token layer. A STALE snapshot does not fail loudly -- it
 * silently answers with the values the static layer used to declare, and the
 * emitted document reports colours and lengths the browser never paints. A
 * freshness check that has quietly stopped detecting drift reports zero
 * findings and looks exactly like a fresh tree, which is why this gate arrives
 * with its drill.
 *
 * WHAT IT RE-DERIVES. The projection, from the committed vertical bundle, with
 * the same library the producer uses -- there is one projector, and the
 * producer and this gate are two readers of it rather than two spellings. It
 * then checks TWO things a byte comparison alone would not separate: that the
 * projection still matches, and that each document's own digest matches its own
 * channels, so a hand-edited snapshot with an untouched digest is named.
 *
 * Usage: node scripts/check/tokens/cascade/roots/base-environment-freshness/index.mjs [--check]
 * Exit 0 = every snapshot is fresh and self-consistent. Exit 1 = drift, named.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../../../libraries/repo-root/index.mjs';
import {
  BASE_ENVIRONMENT_MODES,
  baseEnvironmentDocument,
  baseEnvironmentPath,
  digestOf,
  serializeBaseEnvironment,
  verticalBundlePath,
} from '../../../../../libraries/tokens/base-environment/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CORE_ROOT = findPackageRoot(HERE);

/**
 * The roster is read from `dist/`, like every other reader of it, so a vertical
 * that joins the roster joins this census without an edit here.
 */
export async function firstPartySlugs({ coreRoot = CORE_ROOT, importModule = (specifier) => import(specifier) } = {}) {
  const roster = await importModule(
    pathToFileURL(`${coreRoot}/dist/foundation/presets/verticals/roster/index.js`).href,
  );
  return roster.FIRST_PARTY_VERTICAL_ROSTER.map((row) => row.slug);
}

/** Every finding for one (vertical, mode), named rather than counted. */
export function auditSnapshot({ coreRoot = CORE_ROOT, vertical, mode }) {
  const findings = [];
  const bundlePath = verticalBundlePath(coreRoot, vertical);
  const snapshotPath = baseEnvironmentPath(coreRoot, vertical, mode);
  const named = relative(coreRoot, snapshotPath);
  if (!existsSync(bundlePath)) {
    findings.push(`${vertical}: no committed bundle at ${relative(coreRoot, bundlePath)}`);
    return findings;
  }
  if (!existsSync(snapshotPath)) {
    findings.push(`${named}: missing. Regenerate with pnpm -C packages/core build:vertical-css`);
    return findings;
  }
  const expected = serializeBaseEnvironment(
    baseEnvironmentDocument(readFileSync(bundlePath, 'utf8'), { vertical, mode }),
  );
  const current = readFileSync(snapshotPath, 'utf8');
  if (current !== expected) {
    findings.push(`${named}: stale against its bundle. ${namedDrift(current, expected)}`);
  }
  let document = null;
  try {
    document = JSON.parse(current);
  } catch {
    findings.push(`${named}: is not readable JSON`);
    return findings;
  }
  const recomputed = digestOf({
    vertical: document.vertical,
    mode: document.mode,
    channels: document.channels ?? {},
  });
  if (document.digest !== recomputed) {
    findings.push(`${named}: its digest does not describe its own channels (hand-edited)`);
  }
  if (document.channelCount !== Object.keys(document.channels ?? {}).length) {
    findings.push(`${named}: channelCount disagrees with the channels it carries`);
  }
  if (document.vertical !== vertical || document.mode !== mode) {
    findings.push(`${named}: declares ${document.vertical}/${document.mode}, which is not where it lives`);
  }
  return findings;
}

/** The first channel that moved, so a diff is a sentence rather than a file. */
function namedDrift(current, expected) {
  let before = {};
  try {
    before = JSON.parse(current).channels ?? {};
  } catch {
    return 'the committed file is not readable JSON.';
  }
  const after = JSON.parse(expected).channels ?? {};
  const names = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  const moved = names.filter((name) => before[name] !== after[name]);
  if (moved.length === 0) return 'the channels agree but the document envelope moved.';
  const first = moved[0];
  return `${moved.length} channel(s) moved, first ${first}: ${JSON.stringify(before[first] ?? null)} -> ${JSON.stringify(after[first] ?? null)}`;
}

export async function auditAll({ coreRoot = CORE_ROOT, slugs = null } = {}) {
  const verticals = slugs ?? (await firstPartySlugs({ coreRoot }));
  const findings = [];
  let audited = 0;
  for (const vertical of verticals) {
    for (const mode of BASE_ENVIRONMENT_MODES) {
      audited += 1;
      findings.push(...auditSnapshot({ coreRoot, vertical, mode }));
    }
  }
  return { audited, findings };
}

async function main() {
  const { audited, findings } = await auditAll();
  // A census that audits nothing is a vacuous pass, not a pass.
  if (audited === 0) {
    console.error('base-environment-freshness: FAIL — the roster named no vertical to audit.');
    process.exit(1);
  }
  if (findings.length > 0) {
    console.error(`base-environment-freshness: FAIL — ${findings.length} finding(s) across ${audited} snapshot(s):`);
    for (const finding of findings) console.error(`  ${finding}`);
    console.error('\nRegenerate with:\n  pnpm -C packages/core build:vertical-css');
    process.exit(1);
  }
  console.log(`base-environment-freshness: OK — ${audited} root projections fresh and self-consistent`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`base-environment-freshness: ${error?.message ?? error}`);
    process.exit(1);
  });
}
