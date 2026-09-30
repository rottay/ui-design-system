import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, test } from 'node:test';

import {
  ARCHIVE_MANIFEST_SCHEMA,
  ARCHIVE_ROOT_ENV,
  ArchiveRefusal,
  archiveRoot,
  openArchivedUnit,
  sha256,
  snapshotDir,
  unitDigestOf,
  verifyArchivedUnit,
} from './index.mjs';

const UNIT = 'evidence/sealed';
const FILES = {
  [`${UNIT}/index.json`]: '{"cells":2}\n',
  [`${UNIT}/cells/a/index.json`]: '{"id":"a","status":"MUST_REACH"}\n',
  [`${UNIT}/cells/b/index.json`]: '{"id":"b","status":"MUST_NOT_REACH"}\n',
};

const made = [];
afterEach(() => {
  while (made.length > 0) rmSync(made.pop(), { recursive: true, force: true });
});

function entriesOf(files) {
  return Object.entries(files).map(([path, text]) => ({
    path,
    bytes: Buffer.byteLength(text),
    sha256: sha256(Buffer.from(text)),
  }));
}

/** A consistent snapshot on disk, and the pin of the unit it replaces. */
function snapshot({ files = FILES, unit = UNIT, extraUnits = [] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'archive-door-'));
  made.push(dir);
  for (const [path, text] of Object.entries(files)) {
    const target = join(dir, 'files', path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
  const entries = entriesOf(files);
  const header = {
    path: unit,
    files: entries.length,
    bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
    unitDigest: unitDigestOf(entries),
    entries,
  };
  const manifest = { schema: ARCHIVE_MANIFEST_SCHEMA, units: [header, ...extraUnits] };
  writeFileSync(join(dir, 'MANIFEST.json'), JSON.stringify(manifest));
  const pin = { unit: UNIT, files: header.files, bytes: header.bytes, unitDigest: header.unitDigest };
  return { dir, manifest, header, pin };
}

function rewrite(dir, manifest) {
  writeFileSync(join(dir, 'MANIFEST.json'), JSON.stringify(manifest));
}

function refusedWith(result, fragment) {
  assert.equal(result.unit, null, 'a refused unit is never served');
  assert.ok(
    result.failures.some((failure) => failure.includes(fragment)),
    `expected a refusal containing ${JSON.stringify(fragment)}; got ${JSON.stringify(result.failures)}`,
  );
}

test('unitDigestOf is sha256 over sorted "<sha256>  <path>\\n" lines', () => {
  const entries = [
    { path: 'b', sha256: '2'.repeat(64) },
    { path: 'a', sha256: '1'.repeat(64) },
  ];
  const expected = sha256(Buffer.from(`${'1'.repeat(64)}  a\n${'2'.repeat(64)}  b\n`, 'utf8'));
  assert.equal(unitDigestOf(entries), expected);
});

test('archiveRoot takes the env override, else the sibling docs-engineering checkout', () => {
  assert.equal(archiveRoot({ repoRoot: '/w/ui-design-system', env: {} }), resolve('/w/docs-engineering'));
  assert.equal(archiveRoot({ repoRoot: '/w/ui-design-system', env: { [ARCHIVE_ROOT_ENV]: '/x/docs' } }), resolve('/x/docs'));
  assert.equal(snapshotDir('/x/docs', 'id'), join('/x/docs', 'archive', 'snapshots', 'id'));
});

test('a consistent unit opens and serves exactly the verified bytes, enumerated from the manifest', () => {
  const { dir, pin } = snapshot();
  const unit = openArchivedUnit({ snapshotDir: dir, pin });
  assert.deepEqual(unit.paths(), ['cells/a/index.json', 'cells/b/index.json', 'index.json']);
  assert.deepEqual(unit.paths('cells'), ['cells/a/index.json', 'cells/b/index.json']);
  assert.equal(unit.readJson('cells/a/index.json').status, 'MUST_REACH');
  assert.equal(unit.has('cells/c/index.json'), false);
  assert.throws(() => unit.readText('cells/c/index.json'), /has no entry cells\/c\/index.json/);
});

test('a missing snapshot or MANIFEST.json is refused', () => {
  const { dir, pin } = snapshot();
  refusedWith(verifyArchivedUnit({ snapshotDir: join(dir, 'nowhere'), pin }), 'MANIFEST.json is missing');
  rmSync(join(dir, 'MANIFEST.json'));
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), 'MANIFEST.json is missing');
});

test('an unreadable manifest or a foreign schema is refused', () => {
  const { dir, manifest, pin } = snapshot();
  writeFileSync(join(dir, 'MANIFEST.json'), '{not json');
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), 'is not JSON');
  rewrite(dir, { ...manifest, schema: 'rottay.archive.traceability/v0' });
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), 'schema is');
});

test('a renamed or duplicated unit is refused', () => {
  const { dir, manifest, header, pin } = snapshot();
  rewrite(dir, { ...manifest, units: [{ ...header, path: `${UNIT}-renamed` }] });
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), 'carries 0 units');
  rewrite(dir, { ...manifest, units: [header, header] });
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), 'carries 2 units');
});

test('a corrupted byte is refused even when the length is unchanged', () => {
  const { dir, pin } = snapshot();
  writeFileSync(join(dir, 'files', UNIT, 'cells/a/index.json'), '{"id":"a","status":"MUST_REACX"}\n');
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), `archived file ${UNIT}/cells/a/index.json hashes to`);
});

test('a changed length is refused', () => {
  const { dir, pin } = snapshot();
  writeFileSync(join(dir, 'files', UNIT, 'cells/a/index.json'), '{}\n');
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), 'the manifest says');
});

test('a missing archived file is refused', () => {
  const { dir, pin } = snapshot();
  rmSync(join(dir, 'files', UNIT, 'cells/b/index.json'));
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), `archived file ${UNIT}/cells/b/index.json is missing`);
});

test('a short manifest that re-derives consistently is refused against the replaced unit (anti-vacuity)', () => {
  const files = { ...FILES };
  delete files[`${UNIT}/cells/b/index.json`];
  const full = snapshot();
  const short = snapshot({ files });
  const result = verifyArchivedUnit({
    snapshotDir: short.dir,
    pin: { ...full.pin, unitDigest: short.pin.unitDigest },
  });
  refusedWith(result, `covers 2 files / ${short.pin.bytes} B, fewer than the 3 files / ${full.pin.bytes} B`);
  assert.equal(result.failures.length, 1, 'only the floor refuses a self-consistent short manifest');
});

test('a file without a manifest entry is refused', () => {
  const { dir, pin } = snapshot();
  writeFileSync(join(dir, 'files', UNIT, 'cells/planted.json'), '{}');
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), `archived file ${UNIT}/cells/planted.json has no manifest entry`);
});

test('a header that disagrees with its entries is refused', () => {
  const { dir, manifest, header, pin } = snapshot();
  rewrite(dir, { ...manifest, units: [{ ...header, files: 4 }] });
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), 'declares 4 files but lists 3 entries');
  rewrite(dir, { ...manifest, units: [{ ...header, bytes: header.bytes + 1 }] });
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), 'but its entries sum to');
  rewrite(dir, { ...manifest, units: [{ ...header, unitDigest: '0'.repeat(64) }] });
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), 'does not re-derive');
});

test('a consistently re-stamped unit is refused against a different pin', () => {
  const { dir, pin } = snapshot();
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin: { ...pin, unitDigest: 'f'.repeat(64) } }), 'but the reader pins');
});

test('an entry outside its unit, or repeated, is refused', () => {
  const { dir, manifest, header, pin } = snapshot();
  const outside = { path: `${UNIT}/../escape.json`, bytes: 0, sha256: sha256(Buffer.alloc(0)) };
  rewrite(dir, { ...manifest, units: [{ ...header, entries: [...header.entries, outside] }] });
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), 'is not a clean path inside');
  rewrite(dir, { ...manifest, units: [{ ...header, entries: [...header.entries, header.entries[0]] }] });
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin }), 'is listed twice');
});

test('a pin without a unit, counts or digest is refused before anything is read', () => {
  const { dir, pin } = snapshot();
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin: { ...pin, unit: '' } }), 'names no unit path');
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin: { ...pin, bytes: 0 } }), 'must carry positive files/bytes');
  refusedWith(verifyArchivedUnit({ snapshotDir: dir, pin: { ...pin, unitDigest: 'abc' } }), 'must carry positive files/bytes');
});

test('openArchivedUnit throws an ArchiveRefusal carrying every reason', () => {
  const { dir, pin } = snapshot();
  renameSync(join(dir, 'files', UNIT, 'index.json'), join(dir, 'moved.json'));
  assert.throws(
    () => openArchivedUnit({ snapshotDir: dir, pin }),
    (error) => error instanceof ArchiveRefusal && error.unit === UNIT && error.reasons.some((r) => r.includes('is missing')),
  );
});
