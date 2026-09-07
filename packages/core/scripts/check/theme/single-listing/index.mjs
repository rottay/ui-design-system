#!/usr/bin/env node
/**
 * theme-single-listing — the typed catalog is the ONLY list of controls.
 *
 * F-04 found the catalog written five times: the capability registry, the
 * governance control documents, the cascade roots, the hand-written
 * `customization-model` and the generated product document. WO-CAT-02 makes
 * `src/contracts/theme/runtime/catalog` the listing and everything else a view.
 * This gate is what keeps it that way, and it checks four things a reviewer
 * cannot check by reading:
 *
 *   1. NO GATE READS THE RETIRED CONTROL DOCUMENTS. Every `scripts/check` and
 *      `scripts/generate` module is scanned for `governance/manifest/controls`.
 *      The manifest tree survives as sealed WO-CRA-23 evidence; what must not
 *      survive is a gate sourcing its truth from it.
 *   2. `customization-model` IS GONE, not kept "for reference".
 *   3. THE LEGACY REGISTRY INTRODUCES NO CONTROL THE CATALOG DOES NOT KNOW.
 *      `capabilities/index.ts` is the input the sealed governance manifest was
 *      generated from and is frozen at that population; it may shrink, it may
 *      never grow a name the catalog does not recognise.
 *   4. THE CATALOG AGREES WITH ITSELF. Ids unique, kit rows 1..N, tiers only
 *      standard/pro, and the annex and retired sets disjoint from the rows.
 *
 * Run: node scripts/check/theme/single-listing/index.mjs
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import { parseRegistry } from '../../../generate/tokens/customization/surface/index.mjs';
import {
  readThemeCatalog,
  readThemeCatalogAnnex,
  readThemeCatalogRetired,
} from '../../../libraries/theme-catalog/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

export const RETIRED_CONTROL_PATH = 'governance/manifest/controls';
export const RETIRED_MODEL_PATH = 'scripts/check/modern-rescue/customization-model';

/** The script roots a gate can live in. Fixtures and evidence are not scanned. */
export const SCANNED_ROOTS = Object.freeze(['scripts/check', 'scripts/generate', 'scripts/libraries']);

/**
 * Modules allowed to keep naming the retired path, each with a written reason.
 *
 * The rule is about a gate SOURCING a control's identity from the sealed tree,
 * not about the word appearing. A module that writes that tree, validates it as
 * evidence, or is this gate naming what it forbids, is not sourcing anything
 * from it. An entry without a reason is not an entry: the drill refuses it.
 */
export const NAMING_EXCEPTIONS = Object.freeze([
  {
    path: 'scripts/check/theme/single-listing/index.mjs',
    reason: 'this gate has to name the path it forbids in order to forbid it',
  },
  {
    path: 'scripts/check/theme/single-listing/index.test.mjs',
    reason: 'the drill plants the forbidden path, so it must be able to write it',
  },
  {
    path: 'scripts/generate/tokens/manifest/generation/index.mjs',
    reason: 'it WRITES the sealed WO-CRA-23 evidence tree; a writer of history is not a reader of truth',
  },
  {
    path: 'scripts/libraries/manifest/rules/index.mjs',
    reason: 'the validation rules of that same generator, and only in prose',
  },
  {
    path: 'scripts/check/modern-rescue/check/index.mjs',
    reason: 'the sealed programme validating its own preserved evidence for internal consistency',
  },
  {
    path: 'scripts/check/tokens/cascade/probe/public/cli/index.mjs',
    reason: 'the retained WO-CRA-23 causal-proof harness: its --control-manifest argument carries calibration evidence the catalog does not hold',
  },
  {
    path: 'scripts/check/tokens/cascade/probe/composition/run/index.mjs',
    reason: 'the same harness: it consumes a calibration manifest handed to it, and never resolves one by name',
  },
  {
    path: 'scripts/check/tokens/cascade/probe/composition/run/tests/index.test.mjs',
    reason: 'the harness drill, which plants calibration manifests to prove the run refuses a bad one',
  },
  {
    path: 'scripts/check/tokens/cascade/probe/composition/receipt/tests/index.test.mjs',
    reason: 'the receipt drill of the same retained harness',
  },
  {
    path: 'scripts/check/tokens/cascade/probe/foundation/negative-controls/index.mjs',
    reason: 'it reads calibration.negativeControls, which is sealed evidence and not a control identity',
  },
  {
    path: 'scripts/check/tokens/cascade/probe/public/drills/tests/index.test.mjs',
    reason: 'the public drill set of the same retained harness',
  },
  {
    path: 'scripts/check/tokens/cascade/probe/runtime/ingress/tests/index.test.mjs',
    reason: 'the H-1/H-2 fences of the retained harness, which measure against the sealed calibration corpus',
  },
]);

function* walk(root) {
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith('.mjs')) yield full;
  }
}

export function collectFindings({
  coreRoot = CORE_ROOT,
  /* Injected registry rows. `parseRegistry` resolves the live source by name,
   * so the drill plants a synthetic row here rather than a rewritten copy of a
   * 1,000-line contract: the law under test is "this id is unknown to the
   * catalog", never "a file was edited". */
  registryRows = null,
} = {}) {
  const findings = [];

  // 1. no gate sources its control truth from the sealed manifest tree
  const exceptions = new Set(NAMING_EXCEPTIONS.map((entry) => entry.path));
  for (const scanned of SCANNED_ROOTS) {
    for (const pathname of walk(join(coreRoot, scanned))) {
      const rel = relative(coreRoot, pathname).replaceAll('\\', '/');
      if (exceptions.has(rel)) continue;
      if (readFileSync(pathname, 'utf8').includes(RETIRED_CONTROL_PATH)) {
        findings.push(
          `${rel} still reads ${RETIRED_CONTROL_PATH}; the typed catalog is the listing `
            + '(scripts/libraries/theme-catalog is the reader)',
        );
      }
    }
  }

  // 2. the hand-written model is deleted, not archived beside the catalog
  if (existsSync(join(coreRoot, RETIRED_MODEL_PATH))) {
    findings.push(
      `${RETIRED_MODEL_PATH} still exists; WO-CAT-02 deletes it rather than keeping it for reference`,
    );
  }

  // 3. the frozen registry may shrink, never grow past the catalog's names
  const rows = readThemeCatalog();
  const recognised = new Set([
    ...rows.map((row) => row.id),
    ...readThemeCatalogRetired().map((entry) => entry.id),
    ...readThemeCatalogAnnex().map((entry) => entry.id),
  ]);
  for (const entry of registryRows ?? parseRegistry()) {
    if (!recognised.has(entry.id)) {
      findings.push(
        `capability registry declares "${entry.id}", which the typed catalog does not recognise; `
          + 'a new control is a catalog row, and the registry is frozen at the population the '
          + 'sealed governance manifest was generated from',
      );
    }
  }

  // 4. the catalog agrees with itself
  const ids = rows.map((row) => row.id);
  if (new Set(ids).size !== ids.length) findings.push('the catalog declares a duplicate id');
  rows.forEach((row, index) => {
    if (row.kitRow !== index + 1) {
      findings.push(`row "${row.id}" is at position ${index + 1} but declares kit row ${row.kitRow}`);
    }
    if (row.tier !== 'standard' && row.tier !== 'pro') {
      findings.push(`row "${row.id}" declares tier "${row.tier}"; a control tier is standard or pro`);
    }
  });
  const rowIds = new Set(ids);
  for (const entry of [...readThemeCatalogAnnex(), ...readThemeCatalogRetired()]) {
    if (rowIds.has(entry.id)) {
      findings.push(`"${entry.id}" is both a catalog row and an annex/retired entry`);
    }
  }
  return findings;
}

const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (invokedDirectly) {
  const findings = collectFindings();
  for (const finding of findings) console.error(`theme-single-listing FAIL — ${finding}`);
  if (findings.length > 0) process.exit(1);
  console.log(
    `theme-single-listing OK — ${readThemeCatalog().length} catalog rows are the only listing; `
      + 'no gate reads the retired control documents',
  );
}
