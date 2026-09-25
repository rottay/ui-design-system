/**
 * The live family bindings: which inventory family owns a source file or
 * folder that sits outside every family's `sourceOwner`.
 *
 * One cell per inventory family at
 * `governance/manifest/bindings/<layer>/<group>/<slug>/index.json`:
 *
 *   { familyId, sourceBindings: [path], shared?: [{ path, with: [familyId], reason }],
 *     noBindings?: { reason }, provenance? }
 *
 * The laws, checked on every read and fail-closed over the whole directory:
 *
 *   B1  every cell's familyId is its own folder and a live inventory row, and
 *       every inventory row has a cell. The inventory is the family set; this
 *       map claims files, never identity.
 *   B2  every path is repo-relative, carries no `:line` or `#symbol` suffix, and
 *       exists in the tree as a file or folder.
 *   B3  a cell with no bindings says why (`noBindings.reason`); a cell with
 *       bindings carries no `noBindings`.
 *   B4  a path claimed by several cells, or claimed by one cell while it sits
 *       under another family's `sourceOwner`, carries a `shared` record in each
 *       claiming cell naming exactly the other families, with a reason. A record
 *       that no longer describes the tree is refused too.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { indexJsonFiles } from '../../../../libraries/manifest/index.mjs';

/** Package-relative home of the map. */
export const BINDINGS_REL = 'governance/manifest/bindings';

const CELL_KEYS = new Set(['familyId', 'sourceBindings', 'shared', 'noBindings', 'provenance']);
const LOCATOR_SUFFIX = /:\d[\d,-]*$|#/u;

const sorted = (values) => [...values].sort();
const sameSet = (left, right) => left.length === right.length && sorted(left).every((value, index) => value === sorted(right)[index]);

/** The family whose `sourceOwner` is the longest prefix of `repoPath`, or null. */
function ownerOf(repoPath, owners) {
  let best = null;
  for (const owner of owners) {
    if (repoPath === owner.owner || repoPath.startsWith(`${owner.owner}/`)) {
      if (!best || owner.owner.length > best.owner.length) best = owner;
    }
  }
  return best?.id ?? null;
}

/**
 * Reads every cell under `bindingsRoot`. A stray non-`index.json` entry throws
 * through the shared manifest walker.
 */
export function readBindingCells(bindingsRoot) {
  return indexJsonFiles(bindingsRoot).map((pathname) => ({
    pathname,
    folder: path.relative(bindingsRoot, path.dirname(pathname)).split(path.sep).join('/'),
    cell: JSON.parse(readFileSync(pathname, 'utf8')),
  }));
}

/**
 * Every reason the map cannot be read, as sentences. Empty means readable.
 *
 * @param {{bindingsRoot: string, repositoryRoot: string, inventoryRows: {id: string, sourceOwner: string}[]}} input
 * @returns {string[]}
 */
export function validateBindingsMap({ bindingsRoot, repositoryRoot, inventoryRows }) {
  const findings = [];
  if (!existsSync(bindingsRoot)) return [`${BINDINGS_REL} does not exist, so no family binding can be read`];
  const records = readBindingCells(bindingsRoot);
  const inventoryIds = new Set(inventoryRows.map((row) => row.id));
  const owners = inventoryRows.map((row) => ({ id: row.id, owner: row.sourceOwner }));
  const cellIds = new Set();
  const claimants = new Map();

  for (const { folder, cell } of records) {
    const id = cell?.familyId;
    if (typeof id !== 'string' || id !== folder) {
      findings.push(`${BINDINGS_REL}/${folder}/index.json declares familyId ${JSON.stringify(id ?? null)}; a cell's id is its folder`);
      continue;
    }
    cellIds.add(id);
    if (!inventoryIds.has(id)) findings.push(`${id} has a bindings cell but is not a live inventory row`);
    for (const key of Object.keys(cell)) {
      if (!CELL_KEYS.has(key)) findings.push(`${id} carries an unknown key "${key}"`);
    }
    const bindings = cell.sourceBindings;
    if (!Array.isArray(bindings)) {
      findings.push(`${id} has no sourceBindings list`);
      continue;
    }
    if (new Set(bindings).size !== bindings.length) findings.push(`${id} binds a path twice`);
    if (bindings.length === 0 && !(typeof cell.noBindings?.reason === 'string' && cell.noBindings.reason.trim().length > 0)) {
      findings.push(`${id} binds nothing and gives no noBindings.reason`);
    }
    if (bindings.length > 0 && cell.noBindings !== undefined) findings.push(`${id} binds paths and still declares noBindings`);
    for (const binding of bindings) {
      if (typeof binding !== 'string' || !binding.startsWith('packages/') || /\s/u.test(binding)) {
        findings.push(`${id} binds ${JSON.stringify(binding)}, which is not a repo-relative path`);
        continue;
      }
      if (LOCATOR_SUFFIX.test(binding)) {
        findings.push(`${id} binds ${binding} with a line or symbol locator; a binding names a file or folder`);
        continue;
      }
      if (!existsSync(path.join(repositoryRoot, binding))) findings.push(`${id} binds ${binding}, which does not exist`);
      claimants.set(binding, [...(claimants.get(binding) ?? []), id]);
    }
  }
  for (const id of inventoryIds) {
    if (!cellIds.has(id)) findings.push(`inventory row ${id} has no bindings cell`);
  }

  for (const { folder, cell } of records) {
    if (cell?.familyId !== folder || !Array.isArray(cell.sourceBindings)) continue;
    const id = folder;
    const records = Array.isArray(cell.shared) ? cell.shared : [];
    if (cell.shared !== undefined && !Array.isArray(cell.shared)) findings.push(`${id} shared is not a list`);
    const recordByPath = new Map();
    for (const record of records) {
      if (recordByPath.has(record?.path)) findings.push(`${id} records ${record?.path} as shared twice`);
      recordByPath.set(record?.path, record);
      if (!cell.sourceBindings.includes(record?.path)) {
        findings.push(`${id} records ${record?.path} as shared but does not bind it`);
      }
      if (typeof record?.reason !== 'string' || record.reason.trim().length === 0) {
        findings.push(`${id} records ${record?.path} as shared without a reason`);
      }
    }
    for (const binding of cell.sourceBindings) {
      const others = new Set((claimants.get(binding) ?? []).filter((other) => other !== id));
      const owner = ownerOf(binding, owners);
      if (owner && owner !== id) others.add(owner);
      const record = recordByPath.get(binding);
      if (others.size === 0) {
        if (record) findings.push(`${id} records ${binding} as shared, but no other family claims or owns it`);
        continue;
      }
      if (!record) {
        findings.push(`${id} binds ${binding}, which ${sorted(others).join(', ')} also claim or own, and records no shared entry`);
      } else if (!Array.isArray(record.with) || !sameSet(record.with, [...others])) {
        findings.push(`${id} records ${binding} as shared with ${JSON.stringify(record.with ?? null)}; the tree says ${JSON.stringify(sorted(others))}`);
      }
    }
  }
  return findings;
}

/**
 * The validated map as the consumers read it: package-relative path -> the
 * families that bind it. Throws when any law fails.
 */
export function readBindingsMap({ bindingsRoot, repositoryRoot, inventoryRows }) {
  const findings = validateBindingsMap({ bindingsRoot, repositoryRoot, inventoryRows });
  if (findings.length > 0) {
    throw new Error(`the family bindings map is refused:\n  ${findings.join('\n  ')}`);
  }
  const records = readBindingCells(bindingsRoot);
  const bindings = new Map();
  for (const { cell } of records) {
    for (const binding of cell.sourceBindings) {
      const file = binding.replace(/^packages\/core\//u, '');
      bindings.set(file, new Set([...(bindings.get(file) ?? []), cell.familyId]));
    }
  }
  return { records, bindings };
}
