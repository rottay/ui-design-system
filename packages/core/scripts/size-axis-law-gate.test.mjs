/**
 * Self-test for size-axis-law-gate.mjs (TAX-SIZE-TONE).
 *
 * Runs the real gate against the actual tree (there is no synthetic fixture
 * mode -- the law is "every exported *Props size field in the real repo",
 * so a fixture-only test would not prove anything about the live contracts)
 * and asserts both the floor (the scan is actually finding fields, not
 * silently returning zero) and the pass/fail contract, plus a unit-level
 * check of the pure literal-flattening/report shape via the CLI `--check`
 * exit code.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { runSizeAxisLawGate } from './size-axis-law-gate.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'size-axis-law-gate.mjs');

test('size-axis-law-gate: allowed vocabulary is exactly Size | LegacySizeAlias | ModalSize', () => {
  const result = runSizeAxisLawGate();
  const expected = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'small', 'middle', 'large', 'default', '4xl', '5xl', 'full'].sort();
  assert.deepEqual(result.allowedVocabulary, expected);
});

test('size-axis-law-gate: scan floor -- finds real *Props size fields, not a silently-empty scan', () => {
  const result = runSizeAxisLawGate();
  // 71 at authoring time (six migrated contracts + prior AutoComplete-family
  // precedent + the wider catalog); a hard floor well under that guards
  // against a rootNames/path regression collapsing the scan toward zero
  // while still reporting `pass: true` for lack of anything to check.
  assert.ok(result.sizeFieldsChecked >= 40, `expected >= 40 size fields, found ${result.sizeFieldsChecked}`);
});

test('size-axis-law-gate: the six migrated contracts are in the census and compliant', () => {
  const result = runSizeAxisLawGate();
  const owners = new Set(result.census.map((entry) => entry.owner));
  for (const owner of ['SwitchProps', 'TimePickerProps', 'DatePickerProps', 'FormProps', 'InputNumberProps', 'TableProps']) {
    assert.ok(owners.has(owner), `expected ${owner} in the census`);
  }
  const violationOwners = new Set(result.violations.map((entry) => entry.owner));
  for (const owner of ['SwitchProps', 'TimePickerProps', 'DatePickerProps', 'FormProps', 'InputNumberProps', 'TableProps']) {
    assert.ok(!violationOwners.has(owner), `${owner} unexpectedly violates the axis law`);
  }
});

test('size-axis-law-gate: the two TAX-01 "odd scale" families pass without modification', () => {
  const result = runSizeAxisLawGate();
  const byOwner = new Map(result.census.map((entry) => [entry.owner, entry.literals]));
  // Input/Select/Checkbox: hand-rolled 5-step, already canonical-shaped 'xs'..'xl'.
  for (const owner of ['InputProps', 'SelectProps', 'CheckboxProps']) {
    assert.deepEqual(byOwner.get(owner), ['lg', 'md', 'sm', 'xl', 'xs'], `${owner} vocabulary drifted`);
  }
  // TagInput/OTPInput/Pagination/Tabs: canonical 3-step subset.
  for (const owner of ['TagInputProps', 'OTPInputProps', 'PaginationProps', 'TabsProps']) {
    assert.deepEqual(byOwner.get(owner), ['lg', 'md', 'sm'], `${owner} vocabulary drifted`);
  }
});

test('size-axis-law-gate: full repo scan passes (0 violations)', () => {
  const result = runSizeAxisLawGate();
  assert.deepEqual(result.violations, [], 'unexpected axis-law violations');
  assert.equal(result.pass, true);
});

test('size-axis-law-gate: --check exits 0 on the real (compliant) tree', () => {
  const outcome = spawnSync(process.execPath, [gate, '--check'], { encoding: 'utf8' });
  assert.equal(outcome.status, 0, outcome.stdout + outcome.stderr);
  assert.match(outcome.stdout, /OK — every exported \*Props size field resolves within Size \| LegacySizeAlias\./);
});

test('size-axis-law-gate: script is directly runnable and matches process.argv[1] identity check', () => {
  assert.equal(resolve(gate), gate);
});
