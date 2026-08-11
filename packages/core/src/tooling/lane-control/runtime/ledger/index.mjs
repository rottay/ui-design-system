/**
 * @fileoverview The ledger reader — family rows plus the synthetic rows that
 * give non-family waves the same shape.
 *
 * WHY SYNTHETIC ROWS EXIST. `family-ledger.json` bounds 252 FAMILY lanes and
 * nothing else. The programme also runs lanes over the base CSS layer, the
 * gates, the generator and the capability registry, and those lanes were
 * bounded by prose. A lane bounded by prose cannot be checked, so they get
 * rows of the same shape in `../work-order/synthetic-rows.json` and go
 * through the identical machinery. A synthetic row is not a family and never
 * claims to be one: `synthetic: true` is on every one of them.
 *
 * WHAT THIS MODULE REFUSES TO DO. It does not write the ledger, and it does
 * not trust the ledger's own summary fields. `sharedSkinFiles` is RE-DERIVED
 * from `rows[].skinFiles` and compared with the recorded map; a disagreement
 * is reported as drift rather than resolved silently in either direction.
 * The ledger records coverage facts, so a stale summary is a live hazard: it
 * is the field that decides which CSS files no family lane may write.
 */
import { readFileSync } from 'node:fs';
import { normalizePath } from '../../foundation/glob/index.mjs';

export const DEFAULT_LEDGER_PATH = 'packages/core/test-artifacts/quality-evidence/wo-cra-23/family-ledger.json';
export const DEFAULT_SYNTHETIC_PATH = 'packages/core/src/tooling/lane-control/public/work-order/synthetic-rows.json';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Derive, from the rows themselves, every skin file claimed by more than one
 * family. This is the multi-owner set: no single family lane may write one
 * of these files, because writing it edits another family's rendering.
 */
export function deriveSharedSkinFiles(rows) {
  const owners = new Map();
  for (const row of rows) {
    for (const file of row.skinFiles ?? []) {
      const key = normalizePath(file);
      if (!owners.has(key)) owners.set(key, []);
      owners.get(key).push(row.id);
    }
  }
  const shared = new Map();
  for (const [file, ids] of owners) {
    const unique = [...new Set(ids)].sort();
    if (unique.length > 1) shared.set(file, unique);
  }
  return { owners, shared };
}

/** Compare the derived multi-owner map against the one the ledger records. */
export function sharedSkinDrift(ledger, derivedShared) {
  const declared = new Map(
    Object.entries(ledger.sharedSkinFiles ?? {}).map(([file, ids]) => [normalizePath(file), [...ids].sort()]),
  );
  const missing = [];
  const extra = [];
  const mismatched = [];
  for (const [file, ids] of derivedShared) {
    if (!declared.has(file)) {
      missing.push({ file, derivedOwners: ids });
      continue;
    }
    const recorded = declared.get(file);
    if (recorded.join('|') !== ids.join('|')) mismatched.push({ file, recorded, derived: ids });
  }
  for (const [file, ids] of declared) {
    if (!derivedShared.has(file)) extra.push({ file, recordedOwners: ids });
  }
  return { missing, extra, mismatched, clean: missing.length + extra.length + mismatched.length === 0 };
}

const SYNTHETIC_REQUIRED = ['id', 'layer', 'family', 'sourceOwner', 'writeRoot', 'writeExcludes', 'synthetic'];

export function loadRows({ root, ledgerPath = DEFAULT_LEDGER_PATH, syntheticPath = DEFAULT_SYNTHETIC_PATH }) {
  const ledger = readJson(`${root}/${ledgerPath}`);
  const familyRows = ledger.rows ?? [];

  let syntheticRows = [];
  if (syntheticPath) {
    const synthetic = readJson(`${root}/${syntheticPath}`);
    syntheticRows = synthetic.rows ?? [];
    for (const row of syntheticRows) {
      for (const field of SYNTHETIC_REQUIRED) {
        if (row[field] === undefined) {
          throw new Error(`lane-control: synthetic row "${row.id ?? '<no id>'}" is missing required field "${field}"`);
        }
      }
    }
  }

  const index = new Map();
  for (const row of familyRows) {
    if (typeof row.id !== 'string' || row.id.length === 0) {
      throw new Error('lane-control: family row is missing a non-empty id');
    }
    if (index.has(row.id)) {
      throw new Error(`lane-control: duplicate family row id "${row.id}"`);
    }
    index.set(row.id, row);
  }
  for (const row of syntheticRows) {
    if (index.has(row.id)) {
      throw new Error(`lane-control: synthetic row id "${row.id}" collides with a family row id`);
    }
    index.set(row.id, row);
  }

  const { owners, shared } = deriveSharedSkinFiles(familyRows);
  return {
    ledger,
    familyRows,
    syntheticRows,
    index,
    skinOwners: owners,
    derivedSharedSkinFiles: shared,
    drift: sharedSkinDrift(ledger, shared),
  };
}

/**
 * The write set a row implies when a lane does not narrow it: the whole
 * subtree under `writeRoot`, or — for synthetic rows that declare one — the
 * row's own `writeSet`.
 */
export function writeSetForRow(row) {
  if (Array.isArray(row.writeSet) && row.writeSet.length > 0) return [...row.writeSet];
  return [`${normalizePath(row.writeRoot)}/**`];
}

export function writeExcludesForRow(row) {
  return (row.writeExcludes ?? []).map((entry) => normalizePath(entry));
}
