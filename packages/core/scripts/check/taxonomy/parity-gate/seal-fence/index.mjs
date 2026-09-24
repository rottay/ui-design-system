/**
 * The seal fence — who may still read the quarantined customization manifest.
 *
 * WO-RET-03 sealed `docs/history/inventories/customization-manifest` on
 * 2026-09-19 and its README says no gate may read that tree as authority. The
 * tree does not satisfy that yet: the cascade lane still reads its root
 * catalog, root cells and control calibration because no live twin of those
 * exists. The family SET, however, has a live authority (the family
 * inventory), so for that slice the rule can be enforced now:
 *
 *   F1  every script module that names the seal is listed below, by path, with
 *       the reason it still reads it. A new reader fails until someone writes
 *       its reason down.
 *   F2  every listed module still names the seal. A reader that stopped
 *       reading leaves the list in the same change.
 *   F3  no BLOCKING gate compares live family ids or counts against the seal:
 *       the entry module of a blocking CI gate may not read the seal's family
 *       slice (its `families/` cells, `canonicalFamilies`, `familyReviews`).
 *       Listed readers of the `fence` slice are exempt: they name the forbidden
 *       read in order to forbid it or to plant it in a sandbox.
 *
 * The check is on the entry module a gate runs, not on its import graph; a
 * module reached through an import is still bound by F1.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

export const SEAL_ROOT_REL = 'docs/history/inventories/customization-manifest';

/** Script roots a gate, generator or helper can live in. */
export const SCANNED_ROOTS = Object.freeze([
  'scripts/build',
  'scripts/check',
  'scripts/generate',
  'scripts/libraries',
  'scripts/maintain',
  'scripts/package',
]);

/** A module names the seal by its path or through one of the constants that resolve it. */
export const SEAL_REFERENCE = /customization-manifest|QUARANTINE_MANIFEST_(?:REL|ROOT)|SEAL_ROOT_REL/;

/** Reads of the seal's family slice: the per-family cells and the family-set rollups. */
export const FAMILY_SET_READ = /canonicalFamilies|familyReviews|customization-manifest\/families|(?:MANIFEST_DIR|QUARANTINE_MANIFEST_(?:REL|ROOT)|SEAL_ROOT_REL)[^\n]*['"`]families['"`]|SEAL_ROOT_REL\}\/families/;

const reader = (path, slice, reason) => Object.freeze({ path, slice, reason });

/**
 * Every module allowed to name the seal today. `slice` says which part of the
 * tree it reads; `reason` says why no live source can replace it yet.
 */
export const SEAL_READERS = Object.freeze([
  reader('scripts/check/taxonomy/parity-gate/seal-fence/index.mjs', 'fence',
    'this fence has to name the tree and its family slice in order to forbid them'),
  reader('scripts/check/taxonomy/parity-gate/index.test.mjs', 'fence',
    'the fence drills plant a reader of the seal in a sandbox to prove the fence refuses it'),
  reader('scripts/check/taxonomy/parity-gate/index.mjs', 'retirement-record',
    'the retired manifest-parity leg records its last live divergence census against the seal; it reads nothing from it'),
  reader('scripts/check/orchestration/public/program-state/index.mjs', 'history-citation',
    'cites the seal as the source of the historical figures it renders under their own heading; derive() no longer reads it'),
  reader('scripts/check/orchestration/tests/drills/program-state/index.mjs', 'history-citation',
    'carries a copy of the sealed index into a throwaway repository and mutates it to prove program-state ignores it'),
  reader('scripts/check/modern-rescue/check/index.mjs', 'seal-self-validation',
    'the sealed programme checks its own preserved evidence for internal consistency, seal against seal, never against the live set'),
  reader('scripts/check/modern-rescue/check/index.test.mjs', 'seal-self-validation',
    'the drills of the sealed programme check, which copy the preserved evidence into a sandbox'),
  reader('scripts/check/architecture/conventions/scripts-tree/index.mjs', 'seal-layout-law',
    'rule M1 keeps the quarantine root holding only folder/index data owners; it reads the layout, never the data'),
  reader('scripts/check/architecture/conventions/scripts-tree/index.test.mjs', 'seal-layout-law',
    'the M1 drill plants a loose file at the quarantine root to prove the layout rule refuses it'),
  reader('scripts/check/automation/gates/manifest/index.mjs', 'gate-registry',
    'the CI gate registry names the retired manifest-freshness gate and the quarantine in its prose; it reads nothing from the tree'),
  reader('scripts/check/automation/gates/manifest/tests/index.test.mjs', 'gate-registry',
    'asserts the retired manifest-freshness gate stays retired; the name is an id, not a read'),
  reader('scripts/check/automation/runner/index.test.mjs', 'gate-registry',
    'uses the retired manifest-freshness gate id as a fixture for the runner, not a read of the tree'),
  reader('scripts/check/automation/gates/honesty/index.test.mjs', 'gate-registry',
    'plants the sealed cascade catalog path as a declared input in its honesty fixtures'),
  reader('scripts/check/evidence/framework/receipts/index.test.mjs', 'evidence-contract',
    'cites the sealed schema as where validateReceipt was first named; the receipt contract itself is live'),
  reader('scripts/check/engine/skins/evidence/index.test.mjs', 'family-evidence',
    'reads the sealed family cells as skin evidence for a drill outside CI; it compares skins, not the family set'),
  reader('scripts/libraries/manifest/index.mjs', 'cascade',
    'owns QUARANTINE_MANIFEST_REL, the one path constant every cascade reader resolves the seal through'),
  reader('scripts/libraries/manifest/rules/index.mjs', 'cascade',
    'the validation rules of the sealed corpus, kept for the cascade readers that still load it'),
  reader('scripts/check/modern-rescue/cascade/extraction/index.mjs', 'cascade',
    'extracts the cascade edges against the sealed root catalog, which has no live twin yet'),
  reader('scripts/check/modern-rescue/cascade/producers/index.mjs', 'cascade',
    'reads the sealed root catalog to attribute channel producers; no live root catalog exists'),
  reader('scripts/check/tokens/cascade/normalization/index.mjs', 'cascade',
    'reads the sealed root catalog for the normalization contract; replaced when a live root catalog lands'),
  reader('scripts/check/tokens/cascade/purity/references/index.mjs', 'cascade',
    'reads the sealed root catalog to classify reference purity; no live root catalog exists'),
  reader('scripts/check/tokens/cascade/roots/catalog-freshness/index.mjs', 'cascade',
    'checks the sealed root catalog against the tree it catalogues; the catalog has no live twin'),
  reader('scripts/check/tokens/cascade/roots/exposure/index.mjs', 'cascade',
    'reads the sealed root catalog to classify root exposure; no live root catalog exists'),
  reader('scripts/check/tokens/cascade/roots/exposure/index.test.mjs', 'cascade',
    'the exposure drills read the same sealed root catalog as the gate they prove'),
  reader('scripts/check/tokens/cascade/roots/membership/index.mjs', 'cascade',
    'resolves root membership against the sealed root catalog and step table; no live twin exists'),
  reader('scripts/check/tokens/cascade/roots/membership/index.test.mjs', 'cascade',
    'reads the sealed step table the membership mechanism is specified by'),
  reader('scripts/check/tokens/cascade/slots/index.mjs', 'cascade',
    'joins theme slots to the sealed root catalog; no live root catalog exists'),
  reader('scripts/check/tokens/cascade/slots/index.test.mjs', 'cascade',
    'the slot drills read the same sealed root catalog as the gate they prove'),
  reader('scripts/generate/tokens/manifest/root-checklists/index.mjs', 'cascade',
    'projects the sealed root cells and per-family bindings into root checklists; owned by the cascade programme'),
  reader('scripts/check/theme/single-listing/index.mjs', 'forbidder',
    'forbids gates from reading the sealed control documents, so it has to name that path'),
  reader('scripts/check/tokens/cascade/probe/foundation/paths/index.mjs', 'probe-calibration',
    'owns QUARANTINE_MANIFEST_ROOT for the retained causal-proof harness'),
  reader('scripts/check/tokens/cascade/probe/foundation/negative-controls/index.mjs', 'probe-calibration',
    'reads calibration negative controls from sealed control and family cells; calibration, not family identity'),
  reader('scripts/check/tokens/cascade/probe/foundation/negative-controls/tests/index.test.mjs', 'probe-calibration',
    'the negative-controls drills read the same sealed calibration corpus'),
  reader('scripts/check/tokens/cascade/probe/public/cli/index.mjs', 'probe-calibration',
    'the harness CLI accepts a sealed control or family manifest as calibration input'),
  reader('scripts/check/tokens/cascade/probe/composition/run/index.mjs', 'probe-calibration',
    'the harness run consumes a calibration manifest handed to it by the CLI'),
  reader('scripts/check/tokens/cascade/probe/composition/run/tests/index.test.mjs', 'probe-calibration',
    'plants calibration manifests to prove the harness run refuses a bad one'),
  reader('scripts/check/tokens/cascade/probe/public/drills/tests/index.test.mjs', 'probe-calibration',
    'the public drill set of the harness reads sealed control calibration'),
  reader('scripts/check/tokens/cascade/probe/runtime/ingress/tests/index.test.mjs', 'probe-calibration',
    'the ingress fences measure against the sealed control calibration corpus'),
]);

function* walk(root) {
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      yield* walk(full);
    } else if (entry.name.endsWith('.mjs')) {
      yield full;
    }
  }
}

/**
 * F1-F3 over a core package root. `gates` is the CI gate list (`CI_GATES`);
 * the drills inject their own.
 */
export function collectSealFenceFindings({ coreRoot, gates = [], readers = SEAL_READERS } = {}) {
  const findings = [];
  const listed = new Map(readers.map((entry) => [entry.path, entry]));
  const naming = new Map();
  for (const scanned of SCANNED_ROOTS) {
    for (const pathname of walk(join(coreRoot, scanned))) {
      const text = readFileSync(pathname, 'utf8');
      if (SEAL_REFERENCE.test(text)) naming.set(relative(coreRoot, pathname).replaceAll('\\', '/'), text);
    }
  }

  for (const path of naming.keys()) {
    if (!listed.has(path)) {
      findings.push(`${path} reads the sealed customization manifest (${SEAL_ROOT_REL}) and is not a listed reader; add it to SEAL_READERS with its reason, or read the live source`);
    }
  }
  for (const entry of readers) {
    if (!naming.has(entry.path)) {
      findings.push(`${entry.path} is listed as a reader of the seal but no longer names it; remove it from SEAL_READERS`);
    }
    if (typeof entry.reason !== 'string' || entry.reason.trim().length < 40) {
      findings.push(`${entry.path} is listed without a written reason`);
    }
  }

  for (const gate of gates) {
    if (!gate?.blocking) continue;
    for (const arg of gate.run ?? []) {
      if (!/\.mjs$/.test(arg)) continue;
      const text = naming.get(arg);
      if (listed.get(arg)?.slice === 'fence') continue;
      if (text && FAMILY_SET_READ.test(text)) {
        findings.push(`blocking gate ${gate.id} (${arg}) reads the family slice of the sealed customization manifest; the live family inventory is the family set`);
      }
    }
  }
  return findings;
}
