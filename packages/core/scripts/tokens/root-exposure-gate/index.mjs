/**
 * root-exposure-gate -- the 63-root cascade catalog says which roots a tenant
 * can turn and which ones it must never reach. This gate makes that claim
 * answerable to the 20 controls instead of to prose.
 *
 * Companion to `root-catalog-freshness-gate`, and deliberately disjoint from
 * it: that gate answers "does this head channel exist in authored CSS?"
 * (`channelStatus`); this one answers "who is allowed to move it?"
 * (`exposure`). Neither re-derives the other's field.
 *
 * The catalog classifies every root into a closed vocabulary:
 *   - `tenant-dial`   -- a tenant control governs it. `governedBy` names the
 *                        control.
 *   - `internal-head` -- correctly knobless. It cascades; it is not a dial.
 *                        27 of the 63 roots, and 1477 of the channels: the
 *                        structural finding of the catalog is this bucket, not
 *                        the gap count.
 *   - `gap`           -- a missing knob, adjudicated root by root.
 *
 * THE DECLARED LINK IS `governedBy`, NOT THE CHANNEL LIST. Every control's
 * `declaredOutputs.channels` carries `representativeOnly: true`, so absence
 * from that list proves nothing: 12 of the 26 tenant-dial roots are governed
 * with `parcial`/`total` scope without their head channel ever being named.
 * Using the list as the test would have condemned all twelve. The list is used
 * the other way round -- as the tripwire that catches a knobless root quietly
 * GAINING a dial.
 *
 * The three laws:
 *   1. every `tenant-dial` root names a control that exists;
 *   2. every `internal-head` root names no control AND no control declares its
 *      head channel -- winning a knob in silence is the failure;
 *   3. `gap` is decrease-only. A gap root whose head channel a control has
 *      started declaring must be RECLASSIFIED in the catalog, or the note must
 *      say in writing why the mention is not a knob. `ramp.seed.error` is the
 *      live case: `token-overrides` lists `--ds-color-error`, and the catalog
 *      records that a per-channel pro allowlist is not a seed. That written
 *      adjudication is what this gate demands -- naming the control, so the
 *      escape hatch cannot be a shrug.
 *
 * The 26/27/10 snapshot and the catalog's own `reading` are pinned in
 * `root-exposure-gate.baseline.json`. Any movement -- including the good kind,
 * a gap closing -- fails until the snapshot is updated on purpose.
 *
 * Usage: node scripts/tokens/root-exposure-gate/index.mjs
 * Exit 0 = catalog, controls and snapshot agree. Exit 1 = every disagreement.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

export const EXPOSURES = Object.freeze(['tenant-dial', 'internal-head', 'gap']);
export const CATALOG_PATH = join(CORE_ROOT, 'manifest/cascade/root-catalog.json');
export const CONTROLS_DIR = join(CORE_ROOT, 'manifest/controls');
export const BASELINE_PATH = join(HERE, 'root-exposure-gate.baseline.json');

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/** control id -> the head channels it declares. `representativeOnly`, by contract. */
export function declaredChannelOwners(controlsDir = CONTROLS_DIR) {
  const owners = new Map();
  if (!existsSync(controlsDir)) return owners;
  for (const entry of readdirSync(controlsDir).sort()) {
    if (!entry.endsWith('.json')) continue;
    const control = readJson(join(controlsDir, entry));
    if (!control) continue;
    for (const channel of control.declaredOutputs?.channels ?? []) {
      if (!owners.has(channel)) owners.set(channel, []);
      owners.get(channel).push(control.controlId ?? entry.replace(/\.json$/u, ''));
    }
  }
  return owners;
}

export function countByExposure(roots) {
  const counts = Object.fromEntries(EXPOSURES.map((key) => [key, 0]));
  for (const root of roots) {
    if (Object.prototype.hasOwnProperty.call(counts, root?.exposure)) counts[root.exposure] += 1;
  }
  return counts;
}

export function collectFindings({
  catalogPath = CATALOG_PATH,
  controlsDir = CONTROLS_DIR,
  baselinePath = BASELINE_PATH,
} = {}) {
  const findings = [];
  const catalog = readJson(catalogPath);
  if (!catalog) return ['root-catalog.json is missing or is not valid JSON'];
  const baseline = readJson(baselinePath);
  if (!baseline) return ['root-exposure-gate.baseline.json is missing or is not valid JSON'];

  const roots = Array.isArray(catalog.roots) ? catalog.roots : [];
  const controlIds = new Set(
    existsSync(controlsDir)
      ? readdirSync(controlsDir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/u, ''))
      : [],
  );
  const owners = declaredChannelOwners(controlsDir);

  // 0. closed vocabulary. An unknown exposure is not a new category: it is a typo
  //    that would silently drop a root out of every law below.
  for (const root of roots) {
    if (!EXPOSURES.includes(root?.exposure)) {
      findings.push(
        `${root?.rootId ?? '<unnamed>'}: exposure ${JSON.stringify(root?.exposure ?? null)} is not one of ` +
          EXPOSURES.join(' | '),
      );
    }
  }

  const counts = countByExposure(roots);

  // 1. the catalog has to agree with itself before anyone quotes it.
  const declared = catalog.reconciliation?.byExposure?.counts ?? {};
  for (const exposure of EXPOSURES) {
    if (declared[exposure] !== counts[exposure]) {
      findings.push(
        `reconciliation.byExposure.counts.${exposure} says ${JSON.stringify(declared[exposure] ?? null)} ` +
          `but roots[] holds ${counts[exposure]}`,
      );
    }
  }

  // 2. the pinned snapshot, reading included. Movement in ANY direction fails
  //    until someone updates the baseline on purpose -- a gap closing is good
  //    news that still has to be written down.
  for (const exposure of EXPOSURES) {
    const pinned = baseline.counts?.[exposure];
    if (pinned !== counts[exposure]) {
      const direction = exposure === 'gap' && counts[exposure] < pinned ? 'shrank' : 'moved';
      findings.push(
        `snapshot: ${exposure} ${direction} from ${JSON.stringify(pinned ?? null)} to ${counts[exposure]}; ` +
          'update counts in scripts/tokens/root-exposure-gate/root-exposure-gate.baseline.json ' +
          '(decrease-only for gap: it may never grow)',
      );
    }
  }
  if (baseline.reading !== catalog.reconciliation?.byExposure?.reading) {
    findings.push(
      'snapshot: the catalog reading changed; re-read it and update `reading` in ' +
        'scripts/tokens/root-exposure-gate/root-exposure-gate.baseline.json',
    );
  }

  for (const root of roots) {
    const rootId = root?.rootId ?? '<unnamed>';
    const channel = root?.channel;
    const named = owners.get(channel) ?? [];

    // LAW 1. A dial with no control is a claim with no owner.
    if (root?.exposure === 'tenant-dial') {
      if (!root.governedBy) {
        findings.push(`${rootId}: exposure 'tenant-dial' but governedBy is ${JSON.stringify(root.governedBy ?? null)}`);
      } else if (!controlIds.has(root.governedBy)) {
        findings.push(`${rootId}: governedBy ${JSON.stringify(root.governedBy)} is not a control in manifest/controls/`);
      }
      continue;
    }

    // LAWS 2 and 3 share the same first half: a knobless root names no control.
    if (root?.exposure === 'internal-head' || root?.exposure === 'gap') {
      if (root.governedBy) {
        findings.push(
          `${rootId}: exposure ${JSON.stringify(root.exposure)} but governedBy names ` +
            `${JSON.stringify(root.governedBy)}; a governed root is a tenant-dial`,
        );
      }
    }

    // LAW 2. An internal head that a control starts declaring has won a knob in
    // silence. There is no note that makes that acceptable: it is a
    // reclassification, and the catalog has to say so.
    if (root?.exposure === 'internal-head' && named.length > 0) {
      findings.push(
        `${rootId}: exposure 'internal-head' but ${named.join(', ')} declares its head channel ${channel}; ` +
          "reclassify it as 'tenant-dial' with governedBy, or drop the channel from the control",
      );
    }

    // LAW 3. A gap whose channel a control declares must either be reclassified
    // or carry a written adjudication that NAMES the control. Requiring the name
    // is what keeps the note from becoming a shrug.
    if (root?.exposure === 'gap' && named.length > 0) {
      const note = String(root.exposureNote ?? '');
      const unexplained = named.filter((controlId) => !note.includes(controlId));
      if (unexplained.length > 0) {
        findings.push(
          `${rootId}: exposure 'gap' but ${unexplained.join(', ')} declares its head channel ${channel} and ` +
            "exposureNote does not name it; reclassify to 'tenant-dial' with governedBy, or record in " +
            'exposureNote why that mention is not a knob',
        );
      }
    }
  }

  return findings;
}

function main() {
  const findings = collectFindings();
  if (findings.length > 0) {
    console.error('root-exposure-gate FAILED:');
    for (const finding of findings) console.error(`  - ${finding}`);
    process.exit(1);
  }
  const counts = countByExposure(readJson(CATALOG_PATH)?.roots ?? []);
  console.log(
    `root-exposure-gate OK -- ${counts['tenant-dial']} tenant-dial, ${counts['internal-head']} internal-head, ` +
      `${counts.gap} gap; every dial has an owner and no knobless root gained one`,
  );
}

if (process.argv[1] && process.argv[1].endsWith('index.mjs')) main();
