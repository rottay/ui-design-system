/**
 * @fileoverview Drills for the live calibration table.
 *
 * Run: node --test scripts/check/tokens/cascade/probe/foundation/calibration/tests/index.test.mjs
 *
 * @module Tooling/ResolutionProbe/Foundation/Calibration/Tests
 */

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  CALIBRATION_TABLE,
  catalogRecognisedIds,
  catalogRowsById,
  coverageApplies,
  readCalibrationRecords,
  readControlCalibration,
  validateCalibrationTable,
} from '../index.mjs';

const LIVE = JSON.parse(readFileSync(CALIBRATION_TABLE, 'utf8'));

function plant(table) {
  const box = mkdtempSync(join(tmpdir(), 'probe-calibration-'));
  const path = join(box, 'index.json');
  writeFileSync(path, `${JSON.stringify(table, null, 2)}\n`);
  return { box, path };
}

function refusal(table) {
  const { box, path } = plant(table);
  try {
    readCalibrationRecords({ path });
  } catch (error) {
    return error.message;
  } finally {
    rmSync(box, { recursive: true, force: true });
  }
  return null;
}

test('the live table validates, and every key is a control the typed catalog recognises', () => {
  assert.deepEqual(validateCalibrationTable(LIVE), []);
  const records = readCalibrationRecords();
  assert.ok(records.length > 0, 'the live table calibrates at least one control');
  const recognised = catalogRecognisedIds();
  for (const { id, document } of records) {
    assert.ok(recognised.has(id), `${id} is recognised by the typed catalog`);
    assert.equal(document.controlId, id, 'the record carries its id from the key');
  }
});

test('anti-vacuity: an EMPTY table is refused, never read as "nothing declared"', () => {
  const message = refusal({ ...LIVE, controls: {} });
  assert.ok(message, 'an empty table must not read');
  assert.match(message, /the calibration table is empty/);
});

test('anti-vacuity: a key the typed catalog does not recognise refuses the WHOLE table, by name', () => {
  const [firstId] = Object.keys(LIVE.controls);
  const message = refusal({
    ...LIVE,
    controls: { ...LIVE.controls, 'planted.unknown-control': LIVE.controls[firstId] },
  });
  assert.ok(message, 'a row for an unlisted control must not read');
  assert.match(message, /"planted\.unknown-control" is not a control the typed catalog recognises/);
});

test('a row may not restate its id, and must carry the fields the probe measures against', () => {
  const [firstId] = Object.keys(LIVE.controls);
  const row = LIVE.controls[firstId];
  const restated = refusal({ ...LIVE, controls: { [firstId]: { ...row, controlId: 'other' } } });
  assert.match(restated ?? '', /restates controlId/);
  const { negativeControls: _dropped, ...calibration } = row.calibration;
  const bare = refusal({ ...LIVE, controls: { [firstId]: { ...row, calibration } } });
  assert.match(bare ?? '', /no calibration\.negativeControls list/);
  const kindless = refusal({ ...LIVE, controls: { [firstId]: { ...row, domain: {} } } });
  assert.match(kindless ?? '', /declares no domain\.kind/);
});

test('an uncalibrated control is refused by name, with the calibrated set', () => {
  const [uncalibrated] = LIVE.uncalibrated.ids;
  assert.ok(uncalibrated, 'the live table lists at least one uncalibrated catalog row');
  assert.throws(
    () => readControlCalibration(uncalibrated),
    (error) =>
      error.message.includes(`"${uncalibrated}" has no calibration record. Calibrated: `) &&
      error.message.includes('spacing.rhythm'),
  );
  assert.equal(readControlCalibration('spacing.rhythm').controlId, 'spacing.rhythm');
});

const clone = () => structuredClone(LIVE);
const findingsOf = (table, options) => validateCalibrationTable(table, options).join('\n');

/** A calibrated catalog row with no carried record, and the catalog row it mirrors. */
function plainCalibratedRow() {
  const rows = catalogRowsById();
  const id = Object.keys(LIVE.controls).find(
    (key) => rows.has(key) && (LIVE.controls[key].carriedFromSeal ?? []).length === 0,
  );
  return { id, entry: rows.get(id) };
}

test('kind: a row whose probe kind the vocabulary does not map is refused', () => {
  const table = clone();
  const { id } = plainCalibratedRow();
  table.controls[id].domain.kind = 'planted-kind';
  assert.match(findingsOf(table), /declares probe kind "planted-kind", which kindVocabulary does not map/);
});

test('kind: a probe/catalog kind pair outside the vocabulary is refused', () => {
  const table = clone();
  const { id, entry } = plainCalibratedRow();
  const kind = table.controls[id].domain.kind;
  table.kindVocabulary.map[kind] = table.kindVocabulary.map[kind].filter((c) => c !== entry.domain.kind);
  assert.match(
    findingsOf(table, { coverage: false }),
    new RegExp(`pairs probe kind "${kind}" with catalog kind "${entry.domain.kind}"`),
  );
});

test('doors and channels: every live difference from the catalog is registered, with an owner', () => {
  const rows = catalogRowsById();
  let registered = 0;
  for (const [id, row] of Object.entries(LIVE.controls)) {
    for (const record of row.carriedFromSeal ?? []) {
      registered += 1;
      assert.ok(rows.has(id), `${id} registers a carried value against a catalog row`);
      assert.ok(record.owner.trim().length > 0 && record.reason.trim().length > 0, `${id} ${record.field}`);
    }
  }
  assert.ok(registered > 0, 'the live table carries at least one registered difference');
});

test('doors and channels: an UNREGISTERED difference from the catalog is refused', () => {
  const table = clone();
  const [id] = Object.keys(table.controls).filter((key) => (table.controls[key].carriedFromSeal ?? []).length > 0);
  const { field } = table.controls[id].carriedFromSeal[0];
  delete table.controls[id].carriedFromSeal;
  assert.match(
    findingsOf(table, { coverage: false }),
    new RegExp(`"${id.replace('.', '\\.')}" ${field.replace('.', '\\.')} is .* and no carriedFromSeal record registers the difference`),
  );
  const planted = clone();
  const { id: plain, entry } = plainCalibratedRow();
  planted.controls[plain].ingress.staticThemePath = `${entry.keypath.brandTheme}.planted`;
  assert.match(findingsOf(planted, { coverage: false }), /ingress\.staticThemePath is .* no carriedFromSeal record/);
});

test('doors and channels: a registered difference that no longer holds is refused', () => {
  const [id] = Object.keys(LIVE.controls).filter((key) => (LIVE.controls[key].carriedFromSeal ?? []).length > 0);
  const { field, catalog } = LIVE.controls[id].carriedFromSeal[0];
  const healed = clone();
  const [head, leaf] = field.split('.');
  healed.controls[id][head][leaf] = catalog;
  assert.match(findingsOf(healed, { coverage: false }), /now equals the catalog; drop the record/);
  const drifted = clone();
  drifted.controls[id].carriedFromSeal[0].catalog = 'planted.catalog.value';
  assert.match(findingsOf(drifted, { coverage: false }), /no longer describes the difference/);
  const ownerless = clone();
  ownerless.controls[id].carriedFromSeal[0].owner = ' ';
  assert.match(findingsOf(ownerless, { coverage: false }), /names no owner/);
});

test('doors and channels: a carried record on a row the catalog does not list cannot be verified', () => {
  const table = clone();
  const rows = catalogRowsById();
  const id = Object.keys(table.controls).find((key) => !rows.has(key));
  table.controls[id].carriedFromSeal = [{ field: 'declaredOutputs.channels', carried: [], catalog: [], owner: 'x', ruling: 'x', reason: 'x' }];
  assert.match(findingsOf(table, { coverage: false }), /is not a catalog row, so nothing can verify it/);
});

test('coverage: a catalog row that is neither calibrated nor listed uncalibrated is refused', () => {
  const table = clone();
  const dropped = table.uncalibrated.ids.pop();
  assert.match(findingsOf(table), new RegExp(`catalog row "${dropped.replace('.', '\\.')}" has no calibration row and is not listed`));
});

test('coverage: the uncalibrated list may name only catalog rows without a calibration row', () => {
  const table = clone();
  table.uncalibrated.ids.push('spacing.rhythm', 'planted.unknown-control');
  const findings = findingsOf(table);
  assert.match(findings, /"spacing\.rhythm" is listed uncalibrated and has a calibration row/);
  assert.match(findings, /uncalibrated "planted\.unknown-control" is not a typed catalog row/);
});

test('coverage: every mapped kind pair and every mapped kind is witnessed by a row', () => {
  const table = clone();
  table.kindVocabulary.map['closed-enum'] = [...table.kindVocabulary.map['closed-enum'], 'planted-catalog-kind'];
  table.kindVocabulary.map['planted-kind'] = [];
  const findings = findingsOf(table);
  assert.match(findings, /pairs "closed-enum" with catalog kind "planted-catalog-kind", which no row witnesses/);
  assert.match(findings, /maps probe kind "planted-kind", which no row uses/);
});

test('coverage binds the live table, and a planted subset table is row-checked only', () => {
  assert.equal(coverageApplies(CALIBRATION_TABLE), true);
  const table = clone();
  table.uncalibrated.ids.pop();
  const { box, path } = plant(table);
  try {
    assert.equal(coverageApplies(path), false);
    assert.equal(readCalibrationRecords({ path }).length, Object.keys(table.controls).length);
    assert.throws(() => readCalibrationRecords({ path, coverage: true }), /has no calibration row and is not listed/);
  } finally {
    rmSync(box, { recursive: true, force: true });
  }
});
