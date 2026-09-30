/**
 * archive — the one door to evidence that left this tree for the docs-engineering archive.
 *
 * A snapshot lives at `<docs-engineering>/archive/snapshots/<snapshotId>/` and carries a
 * `MANIFEST.json` (schema `rottay.archive.traceability/v1`) plus `files/<repo-relative path>`
 * byte copies. Each unit in the manifest lists its entries with a per-file sha256 and byte
 * length, and a `unitDigest` = sha256 over the UTF-8 lines `<sha256>  <path>\n` sorted by path.
 *
 * A reader never walks the archive layout by hand. It asks this door for a unit with a PIN:
 * the unit path, and the file count, byte total and unitDigest of the in-tree unit the archive
 * replaces. The door re-hashes every byte and refuses, naming each reason, when:
 *
 *   - the snapshot or its MANIFEST.json is missing or unreadable, or the schema is not v1;
 *   - no unit carries the pinned path (a renamed or dropped unit), or two do;
 *   - an entry sits outside its unit, repeats, or names a file that is absent;
 *   - a file's bytes or sha256 differ from its entry;
 *   - the unit header's files/bytes differ from its entries, or its unitDigest does not re-derive;
 *   - the re-derived unitDigest differs from the pin;
 *   - the manifest covers fewer files or bytes than the unit it replaces (anti-vacuity);
 *   - a file sits under the unit's archived folder without an entry.
 *
 * The opened unit serves only the bytes it hashed, so a reader sees exactly what was verified.
 * Enumeration comes from the manifest entries, never from the directory.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

export const ARCHIVE_MANIFEST_SCHEMA = 'rottay.archive.traceability/v1';

/** Names the docs-engineering checkout that holds the archive; defaults to the sibling repository. */
export const ARCHIVE_ROOT_ENV = 'DS_EVIDENCE_ARCHIVE_ROOT';

/** The RET-03 snapshot the two sealed units were archived into. */
export const RET03_EVIDENCE_SNAPSHOT = '2026-09-29-ds-ret03-evidence';

/** The docs-engineering checkout: the env override, or `<workspace>/../docs-engineering`. */
export function archiveRoot({ repoRoot, env = process.env }) {
  const override = env[ARCHIVE_ROOT_ENV];
  if (typeof override === 'string' && override.trim() !== '') return resolve(override);
  return resolve(repoRoot, '..', 'docs-engineering');
}

/** The snapshot directory for an id under an archive root. */
export function snapshotDir(root, snapshotId) {
  return join(root, 'archive', 'snapshots', snapshotId);
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** The unitDigest law: sha256 over `<sha256>  <path>\n` lines sorted by path. */
export function unitDigestOf(entries) {
  const lines = [...entries]
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((entry) => `${entry.sha256}  ${entry.path}\n`)
    .join('');
  return sha256(Buffer.from(lines, 'utf8'));
}

export class ArchiveRefusal extends Error {
  constructor(unit, reasons) {
    super(`archive refused ${unit}:\n${reasons.map((reason) => `  - ${reason}`).join('\n')}`);
    this.name = 'ArchiveRefusal';
    this.unit = unit;
    this.reasons = reasons;
  }
}

function filesUnder(dir) {
  if (!existsSync(dir)) return [];
  const found = [];
  const pending = [dir];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) pending.push(absolute);
      else found.push(absolute);
    }
  }
  return found;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

/**
 * Verifies one unit against its pin. Returns `{ failures, unit }`; `unit` is null unless
 * `failures` is empty.
 *
 * @param {{ snapshotDir: string, pin: { unit: string, files: number, bytes: number, unitDigest: string } }} options
 */
export function verifyArchivedUnit({ snapshotDir: dir, pin }) {
  const failures = [];
  const unitPath = pin?.unit;
  if (typeof unitPath !== 'string' || unitPath === '' || unitPath.endsWith('/')) {
    return { failures: ['the pin names no unit path'], unit: null };
  }
  if (!isPositiveInteger(pin.files) || !isPositiveInteger(pin.bytes) || !/^[0-9a-f]{64}$/u.test(pin.unitDigest ?? '')) {
    return { failures: [`the pin for ${unitPath} must carry positive files/bytes and a sha256 unitDigest`], unit: null };
  }
  const manifestPath = join(dir, 'MANIFEST.json');
  if (!existsSync(manifestPath)) {
    return { failures: [`${manifestPath} is missing`], unit: null };
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    return { failures: [`${manifestPath} is not JSON: ${error.message}`], unit: null };
  }
  if (manifest?.schema !== ARCHIVE_MANIFEST_SCHEMA) {
    return { failures: [`${manifestPath} schema is ${JSON.stringify(manifest?.schema ?? null)}, not ${ARCHIVE_MANIFEST_SCHEMA}`], unit: null };
  }
  const matches = (Array.isArray(manifest.units) ? manifest.units : []).filter((unit) => unit?.path === unitPath);
  if (matches.length !== 1) {
    return {
      failures: [`MANIFEST.json carries ${matches.length} units at ${unitPath}; exactly one is required (renamed or dropped unit)`],
      unit: null,
    };
  }
  const header = matches[0];
  const entries = Array.isArray(header.entries) ? header.entries : [];
  if (entries.length === 0) failures.push(`unit ${unitPath} lists no entries`);

  const filesRoot = join(dir, 'files');
  const prefix = `${unitPath}/`;
  const seen = new Set();
  const bytesByPath = new Map();
  let coveredBytes = 0;
  for (const entry of entries) {
    const path = entry?.path;
    if (typeof path !== 'string' || !path.startsWith(prefix) || path.split('/').some((part) => part === '..' || part === '.' || part === '')) {
      failures.push(`entry ${JSON.stringify(path ?? null)} is not a clean path inside ${unitPath}`);
      continue;
    }
    if (seen.has(path)) {
      failures.push(`entry ${path} is listed twice`);
      continue;
    }
    seen.add(path);
    if (!Number.isInteger(entry.bytes) || entry.bytes < 0 || !/^[0-9a-f]{64}$/u.test(entry.sha256 ?? '')) {
      failures.push(`entry ${path} carries no byte length or sha256`);
      continue;
    }
    coveredBytes += entry.bytes;
    const absolute = join(filesRoot, ...path.split('/'));
    if (!existsSync(absolute) || !statSync(absolute).isFile()) {
      failures.push(`archived file ${path} is missing`);
      continue;
    }
    const bytes = readFileSync(absolute);
    if (bytes.length !== entry.bytes) {
      failures.push(`archived file ${path} is ${bytes.length} B, the manifest says ${entry.bytes} B`);
      continue;
    }
    const digest = sha256(bytes);
    if (digest !== entry.sha256) {
      failures.push(`archived file ${path} hashes to ${digest}, the manifest says ${entry.sha256}`);
      continue;
    }
    bytesByPath.set(path, bytes);
  }

  if (header.files !== entries.length) {
    failures.push(`unit ${unitPath} declares ${header.files} files but lists ${entries.length} entries`);
  }
  if (header.bytes !== coveredBytes) {
    failures.push(`unit ${unitPath} declares ${header.bytes} B but its entries sum to ${coveredBytes} B`);
  }
  const derived = unitDigestOf(entries.filter((entry) => typeof entry?.path === 'string'));
  if (header.unitDigest !== derived) {
    failures.push(`unit ${unitPath} unitDigest ${header.unitDigest} does not re-derive (entries give ${derived})`);
  }
  if (derived !== pin.unitDigest) {
    failures.push(`unit ${unitPath} re-derives to ${derived}, but the reader pins ${pin.unitDigest}`);
  }
  if (entries.length < pin.files || coveredBytes < pin.bytes) {
    failures.push(
      `unit ${unitPath} covers ${entries.length} files / ${coveredBytes} B, fewer than the ${pin.files} files / ${pin.bytes} B `
        + 'of the unit it replaces: a short manifest proves nothing about what it left out',
    );
  }
  for (const absolute of filesUnder(join(filesRoot, ...unitPath.split('/')))) {
    const path = relative(filesRoot, absolute).split(sep).join('/');
    if (!seen.has(path)) failures.push(`archived file ${path} has no manifest entry`);
  }

  if (failures.length > 0) return { failures, unit: null };
  return { failures, unit: openedUnit(header, bytesByPath) };
}

function openedUnit(header, bytesByPath) {
  const prefix = `${header.path}/`;
  const bytesOf = (rel) => {
    const bytes = bytesByPath.get(`${prefix}${rel}`);
    if (!bytes) throw new Error(`archived unit ${header.path} has no entry ${rel}`);
    return bytes;
  };
  return Object.freeze({
    path: header.path,
    files: header.files,
    bytes: header.bytes,
    unitDigest: header.unitDigest,
    /** Unit-relative paths of every verified entry, sorted, optionally under a unit-relative prefix. */
    paths(under = '') {
      const start = under === '' ? '' : `${under.replace(/\/$/u, '')}/`;
      return [...bytesByPath.keys()]
        .map((path) => path.slice(prefix.length))
        .filter((rel) => rel.startsWith(start))
        .sort();
    },
    has: (rel) => bytesByPath.has(`${prefix}${rel}`),
    readBytes: bytesOf,
    readText: (rel) => bytesOf(rel).toString('utf8'),
    readJson: (rel) => JSON.parse(bytesOf(rel).toString('utf8')),
  });
}

/** Opens a unit or throws an ArchiveRefusal naming every reason. */
export function openArchivedUnit(options) {
  const { failures, unit } = verifyArchivedUnit(options);
  if (failures.length > 0) throw new ArchiveRefusal(options?.pin?.unit ?? '<no unit>', failures);
  return unit;
}
