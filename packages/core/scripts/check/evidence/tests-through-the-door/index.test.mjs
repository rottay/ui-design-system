import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';

import {
  BASELINE_LEDGER,
  HARNESS_FILE,
  TEST_LEDGER,
  UNASSIGNED_CLASS,
  censusHarnessConsumers,
  censusUnproducedAssertions,
  censusVisualBaselines,
  checkArms,
  extractChannelTextAssertions,
  measure,
} from './index.mjs';

const testLedger = JSON.parse(readFileSync(TEST_LEDGER, 'utf8'));
const baselineLedger = JSON.parse(readFileSync(BASELINE_LEDGER, 'utf8'));
const live = measure();
const clone = (value) => JSON.parse(JSON.stringify(value));
const check = (overrides = {}) =>
  checkArms({ ...live, testLedger, baselineLedger, ...overrides });
const empty = { producers: new Set(), runtime: new Set(), artifact: new Set() };

const scratch = mkdtempSync(join(tmpdir(), 'evi03-baselines-'));
after(() => rmSync(scratch, { recursive: true, force: true }));
function plantShowroom(files) {
  const root = mkdtempSync(join(scratch, 'showroom-'));
  for (const [path, bytes] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), bytes);
  }
  return root;
}

test('LIVE: every arm equals its ledger on the real tree', () => {
  assert.deepEqual(check(), []);
});

test('LIVE: the censuses reached the tree (none is vacuous)', () => {
  assert.ok(live.consumers.length > 0, 'the harness census found no consumer');
  assert.ok(live.assertions > 500, `only ${live.assertions} channel-text assertions were read`);
  assert.ok(live.baselines.length > 0 && live.baselines.every((set) => set.baselines > 0));
  assert.ok(!live.consumers.includes(HARNESS_FILE), 'the harness is not its own consumer');
});

test('MUTANT arm 1: a new harness consumer is red', () => {
  const findings = check({ consumers: [...live.consumers, 'core/src/drill/tests/planted.test.ts'] });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /harness consumers: new row core\/src\/drill/u);
});

test('MUTANT arm 1: a consumer that leaves without its exit written down is red', () => {
  const findings = check({ consumers: live.consumers.slice(1) });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /left the census -- write the exit/u);
});

test('LIVE arm 1: every retained row carries its reason, and every reason its row', () => {
  const { files, retainedBecause } = testLedger.harnessConsumers;
  assert.ok(files.length > 0);
  assert.deepEqual(Object.keys(retainedBecause).sort(), [...files].sort());
  assert.ok(files.every((file) => retainedBecause[file].trim().length > 0));
});

test('MUTANT arm 1: a retained row without a reason is red by name', () => {
  const [row] = testLedger.harnessConsumers.files;
  for (const because of [undefined, '', '   ', 42]) {
    const ledger = clone(testLedger);
    if (because === undefined) delete ledger.harnessConsumers.retainedBecause[row];
    else ledger.harnessConsumers.retainedBecause[row] = because;
    const findings = checkArms({ ...live, testLedger: ledger, baselineLedger });
    assert.equal(findings.length, 1, findings.join('\n'));
    assert.equal(findings[0], `harness consumers: ${row} is retained without a reason -- write its retainedBecause or route it through the door`);
  }
});

test('MUTANT arm 1: a ledger with no retainedBecause at all is red once per row', () => {
  const ledger = clone(testLedger);
  delete ledger.harnessConsumers.retainedBecause;
  const findings = checkArms({ ...live, testLedger: ledger, baselineLedger });
  assert.equal(findings.length, testLedger.harnessConsumers.files.length);
  assert.ok(findings.every((finding) => /is retained without a reason/u.test(finding)));
});

test('MUTANT arm 1: a reason whose row is not retained is red by name', () => {
  const ledger = clone(testLedger);
  ledger.harnessConsumers.retainedBecause['core/src/drill/tests/orphan.test.ts'] = 'Measured: a reason for a row that is not in files[].';
  const findings = checkArms({ ...live, testLedger: ledger, baselineLedger });
  assert.equal(findings.length, 1, findings.join('\n'));
  assert.equal(findings[0], 'harness consumers: retainedBecause names core/src/drill/tests/orphan.test.ts, which is not a retained row -- remove the orphan reason');
});

test('CONTROL arm 1: the binding counts in code, not in a comment or another name', () => {
  const sources = [
    { path: 'core/a.test.ts', text: 'const r = lowerFlatThemeFixture({ flatTheme });' },
    { path: 'core/b.test.ts', text: '// lowerFlatThemeFixture used to live here\nconst r = compileThemeIntent(i);' },
    { path: 'core/c.test.ts', text: 'const r = lowerFlatThemeFixtureOld();' },
    { path: HARNESS_FILE, text: 'export function lowerFlatThemeFixture() {}' },
  ];
  assert.deepEqual(censusHarnessConsumers(sources), ['core/a.test.ts']);
});

test('MUTANT arm 2: a planted assertion on a channel nobody writes is red', () => {
  const planted = censusUnproducedAssertions(
    [{ path: 'core/drill/tests/x.test.ts', text: "expect(skin).toContain('var(--ds-drill-dead-channel, 4px)');" }],
    empty,
  ).unproduced;
  assert.equal(planted.length, 1);
  const findings = check({ unproduced: [...live.unproduced, ...planted] });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /new row core\/drill\/tests\/x\.test\.ts::--ds-drill-dead-channel/u);
});

test('CONTROL arm 2: a produced, negated, prefixed or self-planted channel is not a row', () => {
  const text = [
    "expect(a).toContain('var(--ds-made, 1px)');",
    "expect(a).not.toContain('--ds-gone');",
    "expect(a).toContain('--ds-made-');",
    "const css = '.x { --ds-drill-local: 1px; }';",
    "expect(css).toContain('--ds-drill-local');",
    "// expect(a).toContain('--ds-in-a-comment');",
  ].join('\n');
  const producers = { ...empty, producers: new Set(['--ds-made', '--ds-made-strong']) };
  const census = censusUnproducedAssertions([{ path: 'core/t.test.ts', text }], producers);
  assert.deepEqual(census.unproduced, []);
  assert.equal(census.assertions, 3);
});

test('CONTROL arm 2: every writer shape the census admits is a producer', () => {
  const text = "expect(s).toContain('--ds-w');";
  for (const set of ['producers', 'runtime', 'artifact']) {
    const census = censusUnproducedAssertions([{ path: 'core/t.test.ts', text }], { ...empty, [set]: new Set(['--ds-w']) });
    assert.deepEqual(census.unproduced, [], set);
  }
  for (const local of ["vars['--ds-w'] = 1;", "({ ['--ds-w' as const]: 1 })", "style={{ '--ds-w': 1 }}"]) {
    const census = censusUnproducedAssertions([{ path: 'core/t.test.ts', text: `${local}\n${text}` }], empty);
    assert.deepEqual(census.unproduced, [], local);
  }
});

test('CONTROL arm 2: the literal is read whole, with its line', () => {
  const rows = extractChannelTextAssertions('core/t.test.ts', "\n\nexpect(s).toContain(\n  'a: var(--ds-one, var(--ds-two))',\n);");
  assert.deepEqual(rows.map((row) => [row.name, row.line]), [['--ds-one', 3], ['--ds-two', 3]]);
});

test('MUTANT arm 2: a row without an owner, a reason or a declared class is red', () => {
  const row = testLedger.unproducedChannelAssertions.rows.find((entry) => entry.owner !== null);
  const orphan = testLedger.unproducedChannelAssertions.rows.find((entry) => entry.class === UNASSIGNED_CLASS);
  for (const [mutate, pattern] of [
    [(ledger) => { ledger.unproducedChannelAssertions.rows.find((entry) => entry.file === row.file && entry.name === row.name).owner = null; }, /is not a work order/u],
    [(ledger) => { ledger.unproducedChannelAssertions.rows.find((entry) => entry.file === orphan.file && entry.name === orphan.name).ownerProposal = undefined; }, /is not a work order/u],
    [(ledger) => { ledger.unproducedChannelAssertions.rows.find((entry) => entry.file === row.file && entry.name === row.name).reason = ''; }, /no reason/u],
    [(ledger) => { ledger.unproducedChannelAssertions.rows.find((entry) => entry.file === row.file && entry.name === row.name).class = 'accepted'; }, /is not declared/u],
    [(ledger) => { ledger.unproducedChannelAssertions.rows.find((entry) => entry.file === row.file && entry.name === row.name).occurrences += 1; }, /occurrence\(s\), the ledger records/u],
  ]) {
    const ledger = clone(testLedger);
    mutate(ledger);
    const findings = checkArms({ ...live, testLedger: ledger, baselineLedger });
    assert.equal(findings.length, 1, findings.join('\n'));
    assert.match(findings[0], pattern);
  }
});

test('MUTANT arm 2: a row whose producer landed must leave the ledger', () => {
  const findings = check({ unproduced: live.unproduced.slice(1) });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /left the census/u);
});

test('MUTANT arm 3: a baseline set with no expiry note is red', () => {
  const root = plantShowroom({ 'e2e/visual/__screenshots__/drill.spec.ts/a-chromium-darwin.png': 'png' });
  const findings = check({ baselines: [...live.baselines, ...censusVisualBaselines({ showroomRoot: root })] });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /e2e\/visual\/drill\.spec\.ts: 1 baseline\(s\) carry no expiry note/u);
});

test('MUTANT arm 3: a baseline added under an existing note, or a set regenerated, is red', () => {
  const [first] = live.baselines;
  const added = check({ baselines: [{ ...first, baselines: first.baselines + 1 }, ...live.baselines.slice(1)] });
  assert.equal(added.length, 1);
  assert.match(added[0], /a baseline without its note/u);
  const regenerated = check({ baselines: [{ ...first, sha256: '0'.repeat(64) }, ...live.baselines.slice(1)] });
  assert.equal(regenerated.length, 1);
  assert.match(regenerated[0], /not regenerated before reference-identity-approved/u);
});

test('MUTANT arm 3: the digest moves with one byte of one baseline', () => {
  const files = { 'e2e/x/__screenshots__/s.spec.ts/a.png': 'aaaa', 'e2e/x/__screenshots__/s.spec.ts/b.png': 'bbbb' };
  const before = censusVisualBaselines({ showroomRoot: plantShowroom(files) });
  const after = censusVisualBaselines({ showroomRoot: plantShowroom({ ...files, 'e2e/x/__screenshots__/s.spec.ts/b.png': 'bbbc' }) });
  assert.deepEqual(before.map((set) => [set.spec, set.baselines]), [['e2e/x/s.spec.ts', 2]]);
  assert.notEqual(before[0].sha256, after[0].sha256);
});

test('MUTANT arm 3: a stale note and an undeclared expiry are red', () => {
  const stale = clone(baselineLedger);
  stale.entries.push({ ...stale.entries[0], spec: 'e2e/visual/gone.spec.ts' });
  assert.match(checkArms({ ...live, testLedger, baselineLedger: stale }).join('\n'), /gone\.spec\.ts: the note covers no baseline/u);
  const undeclared = clone(baselineLedger);
  undeclared.entries[0].expiresWhen = 'someday';
  const findings = checkArms({ ...live, testLedger, baselineLedger: undeclared });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /expiresWhen "someday" is not a declared expiry/u);
});
