import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkStanding, DEFAULT_STANDING, loadMap, loadStanding } from '../../index.mjs';
import { KIT_ROOT, loadFixtureCases, runCase, snapshot, workingCopy } from '../harness/index.mjs';

const CLI = path.join(KIT_ROOT, 'index.mjs');
const CASES = loadFixtureCases();

function run(args, cwd) {
  return spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
}

function withCase(name, body) {
  const work = workingCopy(CASES.find((fixture) => fixture.name === name));
  try {
    body(work);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

test('the default mode is a dry-run: it prints the per-file plan and writes nothing', () => {
  withCase('prop-renamed/direct', (work) => {
    const before = snapshot(work);
    const result = run(['.'], work);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(snapshot(work), before);
    assert.match(result.stdout, /^index\.tsx$/m);
    assert.match(result.stdout, /REWRITE 6:21 prop-renamed\/\.#TooltipValue\.color \[attribute-renamed\]/);
    assert.match(result.stdout, /codemods mode=dry-run files=1 filesWithFindings=1 filesChanged=0 wouldChange=1 rewrite=4 report=0/);
    assert.deepEqual(run(['--dry-run', '.'], work).stdout, result.stdout);
  });
});

test('--check exits 1 while findings remain, writes nothing, and exits 0 once they are gone', () => {
  withCase('prop-renamed/direct', (work) => {
    const before = snapshot(work);
    assert.equal(run(['--check', '--quiet', '.'], work).status, 1);
    assert.deepEqual(snapshot(work), before);
    const written = run(['--write', '.'], work);
    assert.equal(written.status, 0, written.stderr);
    assert.match(written.stdout, /REWROTE 6:21/);
    assert.match(written.stdout, /mode=write files=1 filesWithFindings=1 filesChanged=1/);
    const after = snapshot(work);
    assert.notDeepEqual(after, before);
    const check = run(['--check', '.'], work);
    assert.equal(check.status, 0);
    assert.match(check.stdout, /rewrite=0 report=0/);
    assert.equal(run(['--write', '.'], work).status, 0);
    assert.deepEqual(snapshot(work), after);
  });
});

test('--check stays red on a usage the kit can only report', () => {
  withCase('prop-renamed/wrapper', (work) => {
    assert.equal(run(['--write', '.'], work).status, 0);
    const check = run(['--check', '.'], work);
    assert.equal(check.status, 1);
    assert.match(check.stdout, /REPORT {2}14:15 prop-renamed\/\.#TooltipValue\.color \[indirect\]/);
  });
});

test('--json prints the summary and the findings without touching the tree', () => {
  withCase('glyph-removed/direct', (work) => {
    const before = snapshot(work);
    const result = run(['--json', '.'], work);
    assert.equal(result.status, 0, result.stderr);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.mode, 'dry-run');
    assert.equal(parsed.line, '3.0');
    assert.deepEqual(parsed.summary.totals, { rewrite: 0, report: 3 });
    assert.equal(parsed.summary.byClass['glyph-removed'].reasons['glyph-role-map-absent'], 3);
    assert.equal(parsed.findings[0].file, 'index.tsx');
    assert.equal(parsed.findings[0].edits, undefined);
    assert.deepEqual(snapshot(work), before);
  });
});

test('the live package surface gates a re-point: a retired door moves only names the root publishes', () => {
  withCase('subpath-removed/direct', (work) => {
    const result = run(['--json', '--class', 'subpath-removed', '.'], work);
    const parsed = JSON.parse(result.stdout);
    const reasons = Object.fromEntries(parsed.findings.map((item) => [item.id, item.reason]));
    assert.equal(reasons['subpath-removed/./primitives/button#*'], 'specifier-repointed');
    assert.equal(reasons['subpath-removed/./styles#*'], 'specifier-repointed');
  });
  withCase('subpath-removed/unproven', (work) => {
    const parsed = JSON.parse(run(['--json', '.'], work).stdout);
    const row = parsed.findings.find((item) => item.reason === 'not-exported-at-target');
    assert.match(row.message, /`ButtonGroupLegacy`/);
    assert.equal(parsed.summary.totals.rewrite, 0);
  });
});

test('a bad invocation exits 2 with the usage and writes nothing', () => {
  withCase('prop-renamed/direct', (work) => {
    const before = snapshot(work);
    for (const args of [[], ['--frobnicate', '.'], ['--write', '--check', '.'], ['--class', 'prop-vanished', '.'], ['--map'],
      ['--only', 'prop-removed/.#Nothing.here', '.']]) {
      const result = run(args, work);
      assert.equal(result.status, 2, args.join(' '));
      assert.match(result.stderr, /Usage: node/);
    }
    assert.deepEqual(snapshot(work), before);
  });
});

// The adoption roster of the standing register (AM-1, ratified 2026-10-06): 18 (id, file) keys, 25 reports,
// 17 files. A row is added, swapped, raised or re-classed only by editing this table in review.
const CORE = 'packages/core/src/';
const SHOWROOM = 'packages/showroom/src/';
const TENANT_CONFIG = 'member-changed/.#TenantConfig';
const CALLOUT = 'member-changed/.#Callout';
const REFERENCE_TOKENS = 'css-custom-property-renamed/./server#TENANT_THEME_REFERENCE_TOKENS';
const PALETTE_ALIASES = 'css-custom-property-renamed/.#BrandPaletteAliases';
const ADOPTION_ROSTER = [
  ['css-class-renamed/.#ActionDock', `${CORE}components/structures/workspace/action-dock/tests/ActionDock.test.tsx`, 1, 'retirement-assertion'],
  ['subpath-removed/./does-not-exist#*', `${CORE}entrypoints/eslint/rules/no-unsanctioned-ds-subpath/tests/index.test.ts`, 1, 'retirement-assertion'],
  [REFERENCE_TOKENS, `${CORE}infrastructure/compilers/composition/tenant-theme/tests/tenant-theme-compiler.test.ts`, 1, 'retirement-assertion'],
  [REFERENCE_TOKENS, `${CORE}infrastructure/compilers/runtime/theme/facade/foundation/admission/tests/retired-references.test.ts`, 6, 'retirement-assertion'],
  [PALETTE_ALIASES, `${CORE}infrastructure/compilers/runtime/theme/runtime/lowering/foundation/palette/tests/index.test.ts`, 2, 'retirement-assertion'],
  [PALETTE_ALIASES, `${CORE}infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/tests/index.test.ts`, 2, 'retirement-assertion'],
  [TENANT_CONFIG, `${SHOWROOM}components/brand-locale-evidence/index.tsx`, 1, 'member-report', 'spelled'],
  [TENANT_CONFIG, `${SHOWROOM}components/layout-foundations-evidence/index.tsx`, 1, 'member-report', 'spelled'],
  [TENANT_CONFIG, `${SHOWROOM}components/torture-surface/index.tsx`, 1, 'member-report', 'spelled'],
  [TENANT_CONFIG, `${SHOWROOM}components/visual-authority-probe/config/index.ts`, 1, 'member-report', 'spelled'],
  [TENANT_CONFIG, `${SHOWROOM}app/probe/custom-component-pack/page.tsx`, 1, 'member-carrier', 'carrier'],
  [TENANT_CONFIG, `${SHOWROOM}components/probe-ground/ground/index.tsx`, 1, 'member-carrier', 'carrier'],
  [TENANT_CONFIG, `${SHOWROOM}components/visual-authority-probe/index.tsx`, 1, 'member-carrier', 'carrier'],
  [CALLOUT, `${SHOWROOM}app/probe/ds-reference/sections/display-surfaces/index.tsx`, 1, 'member-report', 'import'],
  [CALLOUT, `${SHOWROOM}app/probe/ds-reference/sections/primitive-state-repairs/index.tsx`, 1, 'member-report', 'import'],
  [CALLOUT, `${SHOWROOM}components/probes/primitives/feedback/index.tsx`, 1, 'member-report', 'import'],
  [CALLOUT, `${SHOWROOM}components/torture-sections/data-display-states/index.tsx`, 1, 'member-report', 'import'],
  ['member-changed/./server#censusRuntimeVisualPayload', `${SHOWROOM}components/visual-authority-probe/index.tsx`, 1, 'member-report', 'import'],
].map(([id, file, count, className, proof]) => ({ id, file, count, class: className, proof }));
const CARRIER_SUB_CEILING = 3;

test('the adoption roster is 18 rows, 25 reports, 17 files, 3 carriers', () => {
  assert.equal(ADOPTION_ROSTER.length, 18);
  assert.equal(ADOPTION_ROSTER.reduce((sum, row) => sum + row.count, 0), 25);
  assert.equal(new Set(ADOPTION_ROSTER.map((row) => row.file)).size, 17);
  assert.equal(ADOPTION_ROSTER.filter((row) => row.class === 'member-carrier').length, CARRIER_SUB_CEILING);
});

test('every register row is a roster key at or below its adoption count, with the roster class and proof', () => {
  const register = loadStanding(DEFAULT_STANDING);
  const roster = new Map(ADOPTION_ROSTER.map((row) => [`${row.id}\0${row.file}`, row]));
  for (const row of register.rows) {
    const pinned = roster.get(`${row.id}\0${row.file}`);
    assert.ok(pinned, `${row.id} ${row.file} is not a roster key`);
    assert.ok(row.count <= pinned.count, `${row.id} ${row.file} stands above its adoption count ${pinned.count}`);
    assert.equal(row.class, pinned.class, `${row.id} ${row.file}`);
    assert.equal(row.proof, pinned.proof, `${row.id} ${row.file}`);
  }
  assert.equal(register.rows.reduce((sum, row) => sum + row.count, 0), register.ceiling);
  assert.ok(register.rows.filter((row) => row.class === 'member-carrier').length <= CARRIER_SUB_CEILING);
  assert.ok(register.ceiling <= 25);
});

const MAP = loadMap();
const ROOT = '/repo';

function finding(id, file, extra = {}) {
  return { id, class: id.split('/')[0], file: `${ROOT}/${file}`, line: 1, column: 1, action: 'report', reason: 'member-changed', ...extra };
}

function judge(rows, findings, options = {}) {
  const standing = { path: 'register', ceiling: rows.reduce((sum, row) => sum + row.count, 0), rows };
  return checkStanding({ findings, standing, map: MAP, operands: [ROOT], root: ROOT, cwd: ROOT, ...options });
}

const kinds = (result) => result.violations.map((violation) => violation.kind).sort();
const CALLOUT_FILE = `${SHOWROOM}feedback/index.tsx`;
const CALLOUT_ROW = { id: CALLOUT, file: CALLOUT_FILE, count: 1, class: 'member-report', proof: 'import', why: 'w' };

test('standing: a registered report passes and is counted', () => {
  const result = judge([CALLOUT_ROW], [finding(CALLOUT, CALLOUT_FILE, { proof: 'import' })]);
  assert.deepEqual(result.violations, []);
  assert.equal(result.reports, 1);
  assert.equal(result.rows, 1);
});

test('standing: an unregistered report, a report above its pin, a pin above live and a zero row are red', () => {
  assert.deepEqual(kinds(judge([], [finding(CALLOUT, CALLOUT_FILE, { proof: 'import' })])), ['unregistered']);
  const two = [finding(CALLOUT, CALLOUT_FILE, { proof: 'import' }), finding(CALLOUT, CALLOUT_FILE, { proof: 'import', line: 9 })];
  assert.deepEqual(kinds(judge([CALLOUT_ROW], two)), ['above-pin']);
  assert.deepEqual(kinds(judge([{ ...CALLOUT_ROW, count: 2 }], two.slice(0, 1))), ['below-pin']);
  assert.deepEqual(kinds(judge([CALLOUT_ROW], [])), ['zero']);
});

test('standing: a live proof that differs from the pin is red, and `escapes` is admitted by no class', () => {
  assert.deepEqual(kinds(judge([CALLOUT_ROW], [finding(CALLOUT, CALLOUT_FILE, { proof: 'spelled' })])), ['proof-differs']);
  const file = `${SHOWROOM}relay/index.ts`;
  const live = [finding(TENANT_CONFIG, file, { proof: 'escapes' })];
  for (const className of ['member-report', 'member-carrier']) {
    const result = judge([{ id: TENANT_CONFIG, file, count: 1, class: className, proof: 'escapes', why: 'w' }], live);
    assert.deepEqual(kinds(result), ['class-refused'], className);
  }
  const carrier = judge([{ id: TENANT_CONFIG, file, count: 1, class: 'member-carrier', proof: 'carrier', why: 'w' }], live);
  assert.deepEqual(kinds(carrier), ['proof-differs']);
});

test('standing: a rewrite is never registrable', () => {
  const file = `${SHOWROOM}button/index.tsx`;
  const id = 'prop-renamed/.#TooltipValue.color';
  const result = judge([{ id, file, count: 1, class: 'member-report', proof: 'import', why: 'w' }],
    [finding(id, file, { action: 'rewrite', reason: 'attribute-renamed' })]);
  assert.ok(kinds(result).includes('rewrite'));
  assert.ok(kinds(result).includes('class-refused'));
});

test('standing: class admission refuses a wrong path, a wrong reason and an id that is not a report-only member entry', () => {
  const testFile = `${CORE}x/tests/index.test.ts`;
  const shown = (rows, findings) => judge(rows, findings).violations.filter((violation) => violation.kind === 'class-refused');
  assert.equal(shown([{ ...CALLOUT_ROW, file: testFile }], [finding(CALLOUT, testFile, { proof: 'import' })]).length, 1);
  const productFile = `${CORE}x/index.ts`;
  const literal = { id: PALETTE_ALIASES, count: 1, class: 'retirement-assertion', why: 'w' };
  assert.equal(shown([{ ...literal, file: productFile }],
    [finding(PALETTE_ALIASES, productFile, { reason: 'string-literal' })]).length, 1);
  assert.equal(shown([{ ...literal, file: testFile }], [finding(PALETTE_ALIASES, testFile, { reason: 'spread' })]).length, 1);
  assert.equal(shown([{ ...literal, file: testFile }], [finding(PALETTE_ALIASES, testFile, { reason: 'string-literal' })]).length, 0);
  const notMember = `${SHOWROOM}y/index.tsx`;
  assert.equal(shown([{ id: PALETTE_ALIASES, file: notMember, count: 1, class: 'member-report', proof: 'import', why: 'w' }],
    [finding(PALETTE_ALIASES, notMember, { reason: 'string-literal' })]).length, 2);
});

test('standing: a row the run does not cover is counted and not judged', () => {
  const result = judge([CALLOUT_ROW], [], { operands: [`${ROOT}/packages/core/src`] });
  assert.deepEqual(result.violations, []);
  assert.equal(result.rows, 0);
  assert.equal(result.outside, 1);
  assert.deepEqual(kinds(judge([CALLOUT_ROW], [], { classes: ['css-class-renamed'] })), []);
  assert.deepEqual(kinds(judge([CALLOUT_ROW], [], { only: [CALLOUT] })), ['zero']);
});

test('standing: the loader refuses a glob, a directory, a duplicate, a sum off its ceiling and a misplaced proof', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'codemods-standing-'));
  const write = (rows, ceiling = rows.reduce((sum, row) => sum + (row.count ?? 0), 0)) => {
    const file = path.join(dir, 'index.json');
    fs.writeFileSync(file, JSON.stringify({ schemaVersion: 1, line: '3.0', ceiling, rows }));
    return () => loadStanding(file);
  };
  try {
    assert.doesNotThrow(write([CALLOUT_ROW]));
    assert.throws(write([{ ...CALLOUT_ROW, file: `${SHOWROOM}**/index.tsx` }]), /no glob, no directory/);
    assert.throws(write([{ ...CALLOUT_ROW, file: `${SHOWROOM}feedback/` }]), /no glob, no directory/);
    assert.throws(write([CALLOUT_ROW, CALLOUT_ROW]), /duplicate/);
    assert.throws(write([CALLOUT_ROW], 2), /sum to 1, the header `ceiling` is 2/);
    assert.throws(write([{ ...CALLOUT_ROW, proof: undefined }]), /pins its `proof`/);
    assert.throws(write([{ id: PALETTE_ALIASES, file: `${CORE}x/tests/index.test.ts`, count: 1, class: 'retirement-assertion', proof: 'import', why: 'w' }]),
      /states no `proof`/);
    assert.throws(write([{ ...CALLOUT_ROW, class: 'notice' }]), /unknown class `notice`/);
    assert.throws(write([{ ...CALLOUT_ROW, waiver: true }]), /a row is/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the member-changed finding carries its proof kind as data', () => {
  const fixture = CASES.find((item) => item.name === 'member-changed/member-spelling');
  const work = workingCopy(fixture);
  try {
    const proofs = Object.fromEntries(runCase(fixture, work).result.findings
      .map((item) => [path.relative(work, item.file).split(path.sep).join('/'), item.proof ?? null]));
    assert.equal(proofs['read/index.ts'], 'spelled');
    assert.equal(proofs['asserted-alias/index.ts'], 'carrier');
    assert.equal(proofs['spread-relay/index.ts'], 'carrier');
    assert.equal(proofs['local-export/index.ts'], 'escapes');
    assert.equal(proofs['reexport/index.ts'], null);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
  const callout = CASES.find((item) => item.name === 'member-changed/callout');
  const copy = workingCopy(callout);
  try {
    assert.deepEqual(runCase(callout, copy).result.findings.map((item) => item.proof), ['import']);
  } finally {
    fs.rmSync(copy, { recursive: true, force: true });
  }
});

test('--check reads a register; --no-standing reads none; each prints its standing line', () => {
  withCase('member-changed/callout', (work) => {
    fs.mkdirSync(path.join(work, 'packages/showroom/src'), { recursive: true });
    fs.renameSync(path.join(work, 'index.tsx'), path.join(work, 'packages/showroom/src/index.tsx'));
    const register = path.join(work, 'standing.json');
    const row = { ...CALLOUT_ROW, file: 'packages/showroom/src/index.tsx' };
    fs.writeFileSync(register, JSON.stringify({ schemaVersion: 1, line: '3.0', ceiling: 1, rows: [row] }));
    const held = run(['--check', '--standing', register, 'packages/showroom/src'], work);
    assert.equal(held.status, 0, held.stdout + held.stderr);
    assert.match(held.stdout, /^standing: 1 report\(s\) in 1 row\(s\), ceiling 1 \(register standing\.json\)$/m);
    const raw = run(['--check', '--no-standing', 'packages/showroom/src'], work);
    assert.equal(raw.status, 1);
    assert.match(raw.stdout, /REPORT {2}1:17 member-changed\/\.#Callout/);
    assert.match(raw.stdout, /^standing: not read \(--no-standing\)$/m);
    fs.writeFileSync(register, JSON.stringify({ schemaVersion: 1, line: '3.0', ceiling: 2, rows: [{ ...row, count: 2 }] }));
    const short = run(['--check', '--standing', register, 'packages/showroom/src'], work);
    assert.equal(short.status, 1);
    assert.match(short.stdout, /STANDING below-pin member-changed\/\.#Callout packages\/showroom\/src\/index\.tsx: 1 live/);
    const json = JSON.parse(run(['--check', '--json', '--standing', register, 'packages/showroom/src'], work).stdout);
    assert.deepEqual(json.standing.violations.map((violation) => violation.kind), ['below-pin']);
    assert.equal(json.findings[0].proof, 'import');
    for (const args of [['--standing', register, '.'], ['--no-standing', '.'], ['--check', '--no-standing', '--standing', register, '.']]) {
      assert.equal(run(args, work).status, 2, args.join(' '));
    }
  });
});
