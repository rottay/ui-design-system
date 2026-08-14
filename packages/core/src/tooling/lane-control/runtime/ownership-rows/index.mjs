/**
 * @fileoverview The ownership-row reader — one row per family, derived from the
 * active canonical inventory, plus the synthetic rows that give the non-family
 * waves the same shape.
 *
 * WHERE A FAMILY ROW COMES FROM. `family-inventory.json` is the canonical
 * catalog: it is what the manifest, the denominator and the checkpoint figures
 * are derived from, and it is regenerated from source. This module reads that
 * same file and nothing else. A lane boundary and the catalog it bounds now
 * have ONE authority; if the inventory says a family's source owner moved, the
 * lane that may write it moves with it, in the same run, with no second
 * document to update.
 *
 * The predecessor read `test-artifacts/quality-evidence/wo-cra-23/family-ledger.json`
 * — a sealed R0 receipt. That made history the active lane boundary: renaming a
 * family in source left the lane bounded by the name it had in a receipt nobody
 * may edit, and the only way to correct a lane was to rewrite the archive. An
 * archive that must be rewritten to stay true is not an archive. The sealed
 * receipt is still evidence of what R0 found; it is no longer an input to
 * anything that runs.
 *
 * HOW THE BOUND IS DERIVED — `writeRoot` IS `sourceOwner`, EXACTLY.
 *
 *   - A family lane may write its own source owner subtree and nothing else.
 *     There is no separate declared `writeRoot` to drift away from the folder
 *     the family actually lives in.
 *   - `writeExcludes` is every OTHER row's `sourceOwner` that lies strictly
 *     inside this row's. It is computed on every load, so a family that moves
 *     inside another family's folder is bounded correctly the moment the
 *     inventory records the move. Today exactly one pair nests.
 *   - Shared CSS, contracts and barrels are NOT inside any family's source
 *     owner, so they cannot be reached by a family lane's bound at all. They
 *     are bounded separately, as reserved and integrator domains, and by the
 *     single-owner set in `../shared-files`. A per-family list of skin files is
 *     not needed to bound a family and is not kept here.
 *
 * Two families sharing one `sourceOwner` is NOT refused here. It is a real
 * inventory condition, and the honest consequence — the two lanes are not
 * disjoint and may not run in one plan — is computed by the intersection
 * checker's territory rule rather than asserted by this loader.
 *
 * WHY SYNTHETIC ROWS EXIST. The inventory bounds FAMILY lanes and nothing
 * else. The programme also runs lanes over the base CSS layer, the gates, the
 * generator and the capability registry, and those lanes were bounded by prose.
 * A lane bounded by prose cannot be checked, so they get rows of the same shape
 * in `../../public/work-order/synthetic-rows.json` and go through identical
 * machinery. A synthetic row is not a family and never claims to be one:
 * `synthetic: true` is on every one of them, and it declares its own
 * `writeRoot` because no family source owner describes it.
 *
 * This module states no family count. A count written into a comment is a
 * second authority with none of the checking.
 */
import { readFileSync, statSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { normalizePath } from '../../foundation/glob/index.mjs';

function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

export const DEFAULT_INVENTORY_PATH =
  'packages/core/scripts/quality-evidence/programs/modern-rescue/family-inventory.json';
export const DEFAULT_SYNTHETIC_PATH = 'packages/core/src/tooling/lane-control/public/work-order/synthetic-rows.json';

/**
 * The retired catalog flags, refused rather than ignored.
 *
 * Silently dropping `--inventory` would be worse than accepting it: a script
 * that still passes one would keep exiting 0 while quietly running against the
 * canonical catalog, and nobody would learn that the override is gone. Every
 * public entrypoint calls this before it loads anything.
 */
export const RETIRED_CATALOG_FLAGS = ['inventory', 'synthetic'];

export function assertNoCatalogOverride(flags) {
  const used = RETIRED_CATALOG_FLAGS.filter((flag) => flags.get(flag) !== undefined);
  if (used.length === 0) return;
  throw new Error(
    `the catalog is not an argument: ${used.map((flag) => `--${flag}`).join(', ')} is refused. `
      + `Ownership rows come from ${DEFAULT_INVENTORY_PATH} and ${DEFAULT_SYNTHETIC_PATH}, and from nowhere else. `
      + 'A run that could name its own catalog could bind any lane to any subtree.',
  );
}

/**
 * Paths are repo-relative by default. An ABSOLUTE path is honoured as given,
 * which is what lets a drill point the loader at a mutated copy of the
 * inventory in a temp directory instead of editing the working tree to find
 * out whether the working tree is load-bearing.
 */
function readJson(root, path) {
  return JSON.parse(readFileSync(isAbsolute(path) ? path : resolve(root, path), 'utf8'));
}

const SYNTHETIC_REQUIRED = ['id', 'layer', 'family', 'sourceOwner', 'writeRoot', 'writeExcludes', 'synthetic'];

/**
 * Turn inventory rows into ownership rows: `writeRoot` from `sourceOwner`, and
 * `writeExcludes` from whichever other source owners nest inside it.
 */
export function deriveFamilyRows(inventoryRows, { root }) {
  const owners = [];
  for (const entry of inventoryRows) {
    if (typeof entry.id !== 'string' || entry.id.length === 0) {
      throw new Error('lane-control: family inventory row is missing a non-empty id');
    }
    if (typeof entry.sourceOwner !== 'string' || entry.sourceOwner.length === 0) {
      throw new Error(`lane-control: family "${entry.id}" has no sourceOwner, so no lane can be bounded to it`);
    }
    const owner = normalizePath(entry.sourceOwner);
    // A bound that names nothing is not a bound. A lane rooted at a path that
    // does not exist covers no file, so every containment check over it passes
    // vacuously and the lane is unbounded in practice while looking bounded.
    if (!isDirectory(resolve(root, owner))) {
      throw new Error(
        `lane-control: family "${entry.id}" declares sourceOwner "${owner}", which is not a directory in this tree — a lane cannot be bounded to a path that does not exist`,
      );
    }
    owners.push(owner);
  }

  return inventoryRows.map((entry, position) => {
    const root = owners[position];
    const writeExcludes = owners
      .filter((other, index) => index !== position && other.startsWith(`${root}/`))
      .sort();
    return {
      id: entry.id,
      layer: entry.layer,
      family: entry.family,
      sourceOwner: root,
      writeRoot: root,
      writeExcludes,
      synthetic: false,
    };
  });
}

/**
 * THE CATALOG IS NOT AN ARGUMENT. There is exactly one canonical inventory and
 * one canonical synthetic-rows file, and no caller of any command may name a
 * different one. The predecessor took `--inventory` / `--synthetic` on the
 * public CLIs and asked a substitute catalog to mark itself
 * `"noncanonical": true`, which is not a check: the file asserting its own
 * legitimacy is written by the same hand as the lane it waves through. An
 * Avatar lane was rebound onto Button's 25 files and exited 0.
 *
 * `testCatalog` replaces it and is deliberately unusable from a command line:
 * it is an in-process argument, it is named for what it is, and the public
 * entrypoints refuse the old flags loudly rather than ignoring them. A drill
 * injects a fixture by calling this module; nothing a caller can type does.
 */
export function loadRows({ root, testCatalog }) {
  const inventoryPath = testCatalog?.inventoryPath ?? DEFAULT_INVENTORY_PATH;
  const syntheticPath = testCatalog?.syntheticPath ?? DEFAULT_SYNTHETIC_PATH;
  const inventory = readJson(root, inventoryPath);

  const familyRows = deriveFamilyRows(inventory.rows ?? [], { root });

  let syntheticRows = [];
  if (syntheticPath) {
    const synthetic = readJson(root, syntheticPath);
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

  return { inventory, familyRows, syntheticRows, index };
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
