#!/usr/bin/env node
/**
 * artifact-name-intersection — the F-54 closure measure (WO-EVI-02, DT ruling 2026-10-08).
 *
 * The denominator is the composed per-vertical bundle a consumer mounts: of the distinct `--ds-*`
 * names the three tracked bundles DECLARE, the share every one declares must stay >= 90%. A name
 * outside that shared set passes only when the baseline adjudicates it by name, with the verticals
 * allowed to declare it; anything else fails closed. A residual name disappearing is lawful.
 *
 * The facade-class figure is printed beside it and never gates (see `FACADE_REASON`).
 *
 * Usage:
 *   node scripts/check/theme/artifact-name-intersection/index.mjs          exit 1 on a violation
 *   node scripts/check/theme/artifact-name-intersection/index.mjs --json   the measurement
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import { ARTIFACT_ROOT, declaredChannels } from '../artifact-coverage/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(HERE);
export const BASELINE_PATH = join(HERE, 'baseline/index.json');
export { ARTIFACT_ROOT };
export const FACADE_ROOT = 'src/foundation/tokens/css/facade/artifacts';

// The fiche's threshold, unchanged by the ruling; it lives here so no baseline edit can lower it.
export const THRESHOLD = 0.9;

export const FACADE_REASON =
  'informational, never gating: rottay and evnto are neutral foundations until the owner-deferred D-30 '
  + 'identities land, so the facade class measures the declaration population of the only authored identity '
  + '(bithire), not vocabulary divergence (F-54 ruling 2026-10-08).';

/** The `--ds-*` names a stylesheet declares; comments and `var()` reads are not declarations. */
export function declaredNames(css) {
  return new Set([...declaredChannels(css)].filter((name) => name.startsWith('--ds-')));
}

/** vertical -> declared `--ds-*` names, for every `<vertical>/index.css` under `base`. */
export function readArtifacts(root, base) {
  const dir = join(root, base);
  const byVertical = new Map();
  if (!existsSync(dir)) return byVertical;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name, 'index.css');
    if (entry.isDirectory() && existsSync(file)) byVertical.set(entry.name, declaredNames(readFileSync(file, 'utf8')));
  }
  return new Map([...byVertical].sort(([a], [b]) => a.localeCompare(b)));
}

function intersect(byVertical) {
  const verticals = [...byVertical.keys()];
  const union = new Set([...byVertical.values()].flatMap((names) => [...names]));
  const nonShared = {};
  let shared = 0;
  for (const name of [...union].sort()) {
    const declaredBy = verticals.filter((vertical) => byVertical.get(vertical).has(name));
    if (declaredBy.length === verticals.length) shared += 1;
    else nonShared[name] = declaredBy;
  }
  return {
    verticals: Object.fromEntries([...byVertical].map(([vertical, names]) => [vertical, names.size])),
    shared,
    union: union.size,
    ratio: union.size === 0 ? 0 : shared / union.size,
    nonShared,
  };
}

export function measure(root = DEFAULT_ROOT) {
  const composed = intersect(readArtifacts(root, ARTIFACT_ROOT));
  const facadeArtifacts = readArtifacts(root, FACADE_ROOT);
  const facade = intersect(facadeArtifacts);
  return {
    ...composed,
    facade: {
      verticals: facade.verticals,
      shared: facade.shared,
      union: facade.union,
      ratio: facade.ratio,
      available: facadeArtifacts.size > 0,
    },
  };
}

/** Returns `{ failures, notices }`; only failures block. The facade figure is never read here. */
export function evaluate(result, baseline) {
  const failures = [];
  const notices = [];
  const pinned = [...(baseline.verticals ?? [])].sort();
  const measured = Object.keys(result.verticals).sort();

  if (pinned.length === 0) failures.push('baseline: no verticals pinned — the denominator has no members');
  for (const vertical of pinned) {
    if (!measured.includes(vertical)) failures.push(`${vertical}: pinned but its composed bundle was not found`);
  }
  for (const vertical of measured) {
    if (!pinned.includes(vertical)) {
      failures.push(`${vertical}: a composed bundle nobody pinned — add it to the baseline's verticals in this commit`);
    }
    if (result.verticals[vertical] === 0) failures.push(`${vertical}: its composed bundle declares no --ds-* name at all`);
  }

  if (result.ratio < THRESHOLD) {
    failures.push(
      `shared names ${result.shared}/${result.union} = ${(result.ratio * 100).toFixed(2)}% < `
      + `${THRESHOLD * 100}% — the three composed bundles no longer declare one vocabulary`,
    );
  }

  const residual = baseline.residual ?? {};
  for (const [name, entry] of Object.entries(residual)) {
    if (!Array.isArray(entry?.declaredBy) || entry.declaredBy.length === 0) {
      failures.push(`${name}: adjudicated with no declaredBy — the residual names who may declare it`);
    }
    for (const key of ['identity', 'ruledBy']) {
      if (typeof entry?.[key] !== 'string' || entry[key].trim() === '') {
        failures.push(`${name}: adjudicated with no written ${key}`);
      }
    }
  }

  for (const [name, declaredBy] of Object.entries(result.nonShared)) {
    const entry = residual[name];
    if (!entry) {
      failures.push(
        `${name}: declared by ${declaredBy.join(' + ')} only and not adjudicated — a tenant-only name enters `
        + 'the residual only through a reviewed lot citing its owner-ratified identity authoring',
      );
      continue;
    }
    const outside = declaredBy.filter((vertical) => !(entry.declaredBy ?? []).includes(vertical));
    if (outside.length > 0) {
      failures.push(
        `${name}: adjudicated for ${(entry.declaredBy ?? []).join(' + ')} and now also declared by ${outside.join(' + ')}`,
      );
    }
  }

  for (const name of Object.keys(residual)) {
    if (!Object.hasOwn(result.nonShared, name)) {
      notices.push(`${name}: adjudicated residual no longer tenant-only — lawful (shrink-only); it may leave the baseline`);
    }
  }
  return { failures, notices };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const result = measure();
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const { failures, notices } = evaluate(result, baseline);
  const percent = (ratio) => `${(ratio * 100).toFixed(2)}%`;
  console.log(
    `artifact-name-intersection — composed bundles: ${result.shared}/${result.union} declared --ds-* names `
    + `shared by all ${Object.keys(result.verticals).length} (${percent(result.ratio)}, threshold `
    + `${THRESHOLD * 100}%); ${Object.entries(result.verticals).map(([v, n]) => `${v} ${n}`).join(', ')}; `
    + `${Object.keys(result.nonShared).length} tenant-only name(s), adjudicated residual ${Object.keys(baseline.residual ?? {}).length}`,
  );
  console.log(
    result.facade.available
      ? `  facade class: ${result.facade.shared}/${result.facade.union} (${percent(result.facade.ratio)}) — ${FACADE_REASON}`
      : `  facade class: no facade artifacts found — ${FACADE_REASON}`,
  );
  for (const [name, entry] of Object.entries(baseline.residual ?? {})) {
    if (entry?.ruledBy?.startsWith('OWED')) console.log(`  ruling owed: ${name} — ${entry.ruledBy}`);
  }
  for (const notice of notices) console.log(`  notice: ${notice}`);
  if (failures.length > 0) {
    for (const failure of failures) console.error(`artifact-name-intersection FAIL — ${failure}`);
    process.exit(1);
  }
  console.log('artifact-name-intersection OK — every tenant-only name is adjudicated by name.');
}
