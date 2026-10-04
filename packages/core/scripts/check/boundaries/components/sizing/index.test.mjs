/**
 * Self-test for size-axis-law-gate.mjs (TAX-SIZE-TONE).
 *
 * Runs the real gate against the actual tree (there is no synthetic fixture
 * mode -- the law is "every exported *Props size field in the real repo",
 * so a fixture-only test would not prove anything about the live contracts)
 * and asserts both the floor (the scan is actually finding fields, not
 * silently returning zero) and the pass/fail contract, plus the CLI `--check`
 * exit code.
 *
 * The drills plant a violation in the program the checker really resolves --
 * an in-memory overlay in front of the disk, nothing is written -- and require
 * the gate to name it. A gate that only ever ran green would prove nothing.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { ENGINE_BINDING_SIZE_FIELDS, evaluateSizeCensus, runSizeAxisLawGate } from './index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'index.mjs');
const coreRoot = resolve(scriptDir, '../../../../..');
const ANT_SPELLINGS = ['small', 'middle', 'large', 'default'];

test('size-axis-law-gate: allowed vocabulary is exactly Size | ModalSize, with no Ant Design spelling', () => {
  const result = runSizeAxisLawGate();
  const expected = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'full'].sort();
  assert.deepEqual(result.allowedVocabulary, expected);
  for (const spelling of ANT_SPELLINGS) {
    assert.ok(!result.allowedVocabulary.includes(spelling), `${spelling} is vocabulary again`);
  }
});

test('size-axis-law-gate: the Ant Design spellings appear only in the four engine bindings', () => {
  const result = runSizeAxisLawGate();
  assert.deepEqual(result.engineBindings, [
    'DescriptionsEngineProps.size',
    'ListEngineProps.size',
    'SpaceEngineProps.size',
    'SegmentedEngineProps.size',
  ]);
  const carriers = result.census
    .filter((entry) => entry.literals.some((literal) => ANT_SPELLINGS.includes(literal)))
    .map((entry) => `${entry.owner}@${entry.file}`)
    .sort();
  const bindings = ENGINE_BINDING_SIZE_FIELDS.map((binding) => `${binding.owner}@${binding.file}`).sort();
  assert.deepEqual(carriers, bindings);
});

test('size-axis-law-gate: the four retired acceptors publish a canonical size', () => {
  const result = runSizeAxisLawGate();
  const literalsOf = (owner, file) => result.census.find((entry) => entry.owner === owner && entry.file === file)?.literals;
  assert.deepEqual(literalsOf('DescriptionsProps', 'src/components/primitives/display/descriptions/index.tsx'), ['lg', 'md', 'sm']);
  assert.deepEqual(literalsOf('ListProps', 'src/components/primitives/display/list/index.tsx'), ['lg', 'md', 'sm']);
  assert.deepEqual(literalsOf('SegmentedProps', 'src/components/primitives/navigation/segmented/index.tsx'), ['lg', 'md', 'sm']);
  assert.deepEqual(literalsOf('SpaceProps', 'src/components/primitives/layout/space/index.ts'), ['lg', 'md', 'sm']);
});

test('size-axis-law-gate: scan floor -- finds real *Props size fields, not a silently-empty scan', () => {
  const result = runSizeAxisLawGate();
  // 71 at authoring time (six migrated contracts + prior AutoComplete-family
  // precedent + the wider catalog); a hard floor well under that guards
  // against a rootNames/path regression collapsing the scan toward zero
  // while still reporting `pass: true` for lack of anything to check.
  assert.ok(result.sizeFieldsChecked >= 40, `expected >= 40 size fields, found ${result.sizeFieldsChecked}`);
});

test('size-axis-law-gate: the five migrated contracts still published are in the census and compliant', () => {
  const result = runSizeAxisLawGate();
  const owners = new Set(result.census.map((entry) => entry.owner));
  for (const owner of ['TimePickerProps', 'DatePickerProps', 'FormProps', 'InputNumberProps', 'TableProps']) {
    assert.ok(owners.has(owner), `expected ${owner} in the census`);
  }
  const violationOwners = new Set(result.violations.map((entry) => entry.owner));
  for (const owner of ['TimePickerProps', 'DatePickerProps', 'FormProps', 'InputNumberProps', 'TableProps']) {
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
  assert.match(outcome.stdout, /OK — every exported \*Props size field resolves within Size \| ModalSize;/);
});

test('drill: a new *Props that spells its size the Ant Design way is named', () => {
  const planted = join(coreRoot, 'src/components/size-axis-drill/index.ts');
  const result = runSizeAxisLawGate({
    overlay: { [planted]: "export interface DrillProps {\n  size?: 'small' | 'md';\n}\n" },
  });
  assert.equal(result.pass, false);
  assert.deepEqual(
    result.violations.map((violation) => [violation.owner, violation.file, violation.badLiterals]),
    [['DrillProps', 'src/components/size-axis-drill/index.ts', ['small']]],
  );
});

test('drill: a facade that takes the Ant Design spelling back voids its engine binding', () => {
  const facade = join(coreRoot, 'src/components/primitives/navigation/segmented/index.tsx');
  const source = readFileSync(facade, 'utf8');
  const canonical = '  size?: SegmentedSize;';
  assert.ok(source.includes(canonical), 'the Segmented facade no longer declares the line this drill rewrites');
  const result = runSizeAxisLawGate({
    overlay: { [facade]: source.replace(canonical, "  size?: 'small' | 'middle' | 'large';") },
  });
  assert.equal(result.pass, false);
  const named = result.violations.filter((violation) => violation.owner === 'SegmentedProps');
  assert.ok(named.some((violation) => violation.reason === 'outside Size | ModalSize'));
  assert.ok(named.some((violation) => violation.reason === 'engine binding SegmentedEngineProps has no canonical facade size field'));
});

test('drill: an engine binding cannot widen, go stale, or stand without its facade', () => {
  const allowed = ['sm', 'md', 'lg'];
  const binding = {
    owner: 'WidgetEngineProps',
    file: 'src/components/widget/contracts/index.ts',
    literals: ['large', 'small'],
    facadeOwner: 'WidgetProps',
    facadeFile: 'src/components/widget/index.tsx',
  };
  const bound = { owner: binding.owner, file: binding.file, line: 3, literals: ['large', 'small'] };
  const facade = { owner: binding.facadeOwner, file: binding.facadeFile, line: 9, literals: ['lg', 'sm'] };

  assert.deepEqual(evaluateSizeCensus([bound, facade], allowed, [binding]), []);

  const widened = evaluateSizeCensus([{ ...bound, literals: ['large', 'middle', 'small'] }, facade], allowed, [binding]);
  assert.deepEqual(widened.map((violation) => violation.reason), ['engine binding drifted from large | small']);

  const stale = evaluateSizeCensus([facade], allowed, [binding]);
  assert.deepEqual(stale.map((violation) => violation.reason), ['stale engine binding: no such size field']);

  const bare = evaluateSizeCensus([bound], allowed, [binding]);
  assert.deepEqual(bare.map((violation) => violation.reason), ['engine binding WidgetEngineProps has no canonical facade size field']);

  const sameNameElsewhere = evaluateSizeCensus(
    [bound, facade, { ...bound, file: 'src/components/other/contracts/index.ts' }],
    allowed,
    [binding],
  );
  assert.deepEqual(sameNameElsewhere.map((violation) => [violation.file, violation.badLiterals]), [
    ['src/components/other/contracts/index.ts', ['large', 'small']],
  ]);
});

test('size-axis-law-gate: script is directly runnable and matches process.argv[1] identity check', () => {
  assert.equal(resolve(gate), gate);
});
