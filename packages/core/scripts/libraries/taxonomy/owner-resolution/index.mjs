/**
 * Source-owner resolution: maps each inventory row's recorded `sourceOwner`
 * directory onto the physical tree, or refuses to resolve at all.
 *
 * WHY THIS EXISTS. Every consumer that tests containment -- does this
 * terminal file sit inside that owner? -- silently answers "no" for a row
 * whose recorded directory cannot be found, and a containment check that
 * matches nothing does not fail. It reports a clean tree in which every
 * component is unowned. That is the false green this module removes: owners
 * resolve once, up front, and a row that cannot resolve is an error rather
 * than an empty answer.
 *
 * WHY FAIL-CLOSED. Every way of not knowing is its own named state and none
 * is a silent skip. A row is `missing` when its directory is not on disk, and
 * `colliding` when two rows claim one directory and ownership stops being
 * one-to-one. Every rejection is collected and reported together, because a
 * caller repairing an inventory needs the whole list.
 *
 * WHY EXISTENCE IS CASE-EXACT. `fs.existsSync` answers yes for `.../Badge`
 * when the directory is really `.../badge`, because macOS and Windows compare
 * case-insensitively. Consumers then take the recorded spelling and test
 * containment against real file paths with a case-SENSITIVE string compare,
 * which never matches -- every component under that owner reads as unowned,
 * and nothing failed. So existence here means a path whose every segment
 * matches a real directory entry byte for byte, and the answer does not
 * change with the host filesystem.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Thrown once, after every row has been examined, when anything failed to
 * resolve. `rejections` carries the full list so a caller can report or
 * assert on it without re-parsing the message.
 */
export class RelocationError extends Error {
  /** @param {Array<{ id: string, sourceOwner: string, reason: string }>} rejections */
  constructor(rejections) {
    const lines = rejections.map(
      ({ id, sourceOwner, reason }) => `  - ${id}: ${sourceOwner} (${reason})`,
    );
    super(`relocateSourceOwners rejected ${rejections.length} row(s):\n${lines.join('\n')}`);
    this.name = 'RelocationError';
    this.rejections = rejections;
  }
}

/**
 * Case-exact directory existence.
 *
 * Every segment is matched against a `readdir` listing of its parent, walked
 * from the filesystem root, and must be present byte for byte. `fs.existsSync`
 * and `realpath` are deliberately unused: both answer yes for `.../Badge` when
 * the directory is really `.../badge` on a case-insensitive volume, and that
 * yes is what lets a wrongly-cased owner travel downstream into a
 * case-sensitive containment test that can never match.
 *
 * @param {string} absoluteDir Absolute directory to test.
 * @param {{ readdir?: (dir: string) => string[] }} [options] `readdir` is
 *   injectable so drills need no filesystem.
 * @returns {boolean}
 */
export function caseExactDirExists(absoluteDir, { readdir = (dir) => fs.readdirSync(dir) } = {}) {
  const { root } = path.parse(absoluteDir);
  const relative = path.relative(root, absoluteDir);
  if (relative === '') return true;

  let current = root;
  for (const segment of relative.split(path.sep)) {
    let names;
    try {
      names = readdir(current);
    } catch {
      return false;
    }
    if (!names.includes(segment)) return false;
    current = path.join(current, segment);
  }
  return true;
}

/** A directory key that cannot prefix-match a sibling whose name extends it. */
function asOwnerDirectory(absolute) {
  return absolute.endsWith(path.sep) ? absolute : absolute + path.sep;
}

/**
 * Resolves each row's `sourceOwner` onto an absolute directory in the physical
 * tree, taken as written.
 *
 * @param {Array<{ id: string, sourceOwner: string }>} rows Inventory rows.
 * @param {object} options
 * @param {string} options.repoRoot Absolute repository root.
 * @param {(candidate: string) => boolean} [options.exists] Injected for hermetic drills.
 *   Defaults to `caseExactDirExists`.
 * @returns {Map<string, string>} Row id to absolute owner directory, trailing separator included.
 * @throws {RelocationError} If any row fails to resolve.
 */
export function relocateSourceOwners(
  rows,
  { repoRoot, exists = caseExactDirExists } = {},
) {
  if (typeof repoRoot !== 'string' || repoRoot.length === 0) {
    throw new TypeError('relocateSourceOwners requires an absolute repoRoot');
  }

  // First pass over rows. Collisions need every row's answer before they can
  // be seen, so they are deferred.
  const outcomes = [];
  for (const row of rows) {
    const { id, sourceOwner } = row;
    const resolved = path.resolve(repoRoot, sourceOwner);
    if (!exists(resolved)) {
      outcomes.push({ id, sourceOwner, reason: 'missing' });
      continue;
    }
    outcomes.push({ id, sourceOwner, directory: asOwnerDirectory(resolved) });
  }

  // Second pass: ownership is one-to-one, so a directory claimed by more than
  // one row rejects every row that claimed it. Keeping the first and dropping
  // the rest would be the silent skip this module exists to prevent.
  const claimants = new Map();
  for (const outcome of outcomes) {
    if (!outcome.directory) continue;
    const ids = claimants.get(outcome.directory) ?? [];
    ids.push(outcome.id);
    claimants.set(outcome.directory, ids);
  }

  const rejections = [];
  const resolved = new Map();
  for (const outcome of outcomes) {
    if (outcome.reason) {
      rejections.push({ id: outcome.id, sourceOwner: outcome.sourceOwner, reason: outcome.reason });
      continue;
    }
    if (claimants.get(outcome.directory).length > 1) {
      rejections.push({ id: outcome.id, sourceOwner: outcome.sourceOwner, reason: 'colliding' });
      continue;
    }
    resolved.set(outcome.id, outcome.directory);
  }

  if (rejections.length > 0) throw new RelocationError(rejections);
  return resolved;
}
