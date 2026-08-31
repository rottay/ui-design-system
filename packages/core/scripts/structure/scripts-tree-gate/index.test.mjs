#!/usr/bin/env node

/**
 * scripts-tree-gate/index.test.mjs — teeth + honesty drills for the §1.2/§2.9
 * scripts-tree gate. A structure gate that cannot fail is debt dressed as law.
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

import { collectFindings, evaluate } from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GATE = join(HERE, 'index.mjs');
const SCRIPTS_ROOT = dirname(dirname(HERE));
const BASELINE = JSON.parse(readFileSync(join(HERE, 'scripts-tree-gate.baseline.json'), 'utf8'));

const runGate = (args) =>
  spawnSync(process.execPath, [GATE, ...args], { encoding: 'utf8' });

test('positive: the real scripts/ tree passes with exactly the adjudicated baseline', () => {
  const out = runGate([]);
  assert.equal(out.status, 0, out.stderr);
  assert.match(out.stdout, /scripts-tree-gate OK/);
});

test('baseline integrity: every entry carries rule, path and a non-empty reason', () => {
  assert.ok(Array.isArray(BASELINE.entries));
  assert.ok(BASELINE.entries.length > 0);
  for (const entry of BASELINE.entries) {
    assert.ok(entry.rule, JSON.stringify(entry));
    assert.ok(entry.path, JSON.stringify(entry));
    assert.ok(typeof entry.reason === 'string' && entry.reason.length > 10, JSON.stringify(entry));
  }
});

for (const rule of ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'M1']) {
  test(`drill ${rule}: an injected ${rule} violation is caught`, () => {
    const out = runGate([`--drill=${rule}`]);
    assert.equal(out.status, 0, out.stderr);
    assert.match(out.stdout, new RegExp(`drill ${rule}: violation caught`));
  });
}

test('drill honesty: a drill that reports nothing fails the gate itself', () => {
  const failures = evaluate(collectFindings(SCRIPTS_ROOT, { drill: 'R1' }), BASELINE);
  assert.ok(failures.some((f) => f.includes('drill-loose-file.mjs')));
});

test('evaluate: a finding outside the baseline is NEW and fails', () => {
  const failures = evaluate([{ rule: 'R1-loose-root-file', path: 'planted.mjs' }], BASELINE);
  assert.ok(failures.some((f) => f.startsWith('NEW R1-loose-root-file planted.mjs')));
});

test('evaluate: a baseline entry without a live finding is STALE and fails (decrease-only)', () => {
  const ghost = { entries: [{ rule: 'R5-family-prefix-repeat', path: 'ci/ci-ghost', reason: 'planted stale entry for the drill' }] };
  const failures = evaluate([], ghost);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^STALE baseline entry/);
});

test('the baseline never absorbs silently: live findings match the baseline exactly, entry by entry', () => {
  const live = new Set(collectFindings(SCRIPTS_ROOT).map((f) => `${f.rule} ${f.path}`));
  const recorded = new Set(BASELINE.entries.map((e) => `${e.rule} ${e.path}`));
  assert.deepEqual(live, recorded);
});

// ── Sandbox drills (Fable H2, F1): detection proven with REAL planted files ──
// The --drill=<rule> CLI mode injects synthetic findings into the report array;
// these drills instead plant real files in a synthetic scripts/ skeleton under a
// tmpdir and run collectFindings against it. Detection and reporting both covered.

const FAMILIES = [
  'boundaries', 'builders', 'ci', 'codemods', 'engine', 'evidence', 'generators',
  'i18n', 'lib', 'packaging', 'quality-evidence', 'structure', 'taxonomy',
  'tokens', 'verticals',
];
const LIB_SUBS = ['build', 'engine', 'evidence', 'hooks', 'paint', 'source', 'taxonomy', 'tokens', 'verticals'];

function buildSandbox(t) {
  // Wrapper dir so a sibling `manifest/` (M1) also lands inside the sandbox —
  // the M1 drill once leaked into the shared tmpdir parent and poisoned the
  // clean-tree drill on the next run. Hermetic now: everything under wrapper/.
  const wrapper = mkdtempSync(join(tmpdir(), 'scripts-tree-sandbox-'));
  t.after(() => rmSync(wrapper, { recursive: true, force: true }));
  const root = join(wrapper, 'scripts');
  mkdirSync(root, { recursive: true });
  for (const family of FAMILIES) {
    if (family === 'lib') {
      mkdirSync(join(root, 'lib', 'repo-root'), { recursive: true });
      writeFileSync(join(root, 'lib', 'repo-root', 'index.mjs'), '// repo-root\n');
      for (const sub of LIB_SUBS) {
        mkdirSync(join(root, 'lib', sub, 'probe'), { recursive: true });
        writeFileSync(join(root, 'lib', sub, 'probe', 'index.mjs'), '// probe\n');
      }
      continue;
    }
    mkdirSync(join(root, family, 'probe'), { recursive: true });
    writeFileSync(join(root, family, 'probe', 'index.mjs'), '// probe\n');
  }
  return root;
}

const rules = (findings) => findings.map((f) => `${f.rule} ${f.path}`);

test('sandbox: a clean synthetic tree reports zero findings', (t) => {
  const root = buildSandbox(t);
  assert.deepEqual(collectFindings(root), []);
});

test('sandbox R1: a loose file at the scripts root is detected on disk', (t) => {
  const root = buildSandbox(t);
  writeFileSync(join(root, 'loose-script.mjs'), '// planted\n');
  assert.ok(rules(collectFindings(root)).includes('R1-loose-root-file loose-script.mjs'));
});

test('sandbox R2: loose files at family and lib-subfamily level are detected on disk', (t) => {
  const root = buildSandbox(t);
  writeFileSync(join(root, 'ci', 'loose.mjs'), '// planted\n');
  writeFileSync(join(root, 'lib', 'paint', 'loose.mjs'), '// planted\n');
  const found = rules(collectFindings(root));
  assert.ok(found.includes('R2-loose-family-file ci/loose.mjs'));
  assert.ok(found.includes('R2-loose-libsub-file lib/paint/loose.mjs'));
});

test('sandbox R3: a foreign file inside a capability and an ownerless dir are detected on disk', (t) => {
  const root = buildSandbox(t);
  writeFileSync(join(root, 'tokens', 'probe', 'other-name.json'), '{}\n');
  mkdirSync(join(root, 'ci', 'husk'));
  const found = rules(collectFindings(root));
  assert.ok(found.includes('R3-foreign-file tokens/probe/other-name.json'));
  assert.ok(found.includes('R3-ownerless-dir ci/husk'));
});

test('sandbox R4: a generic ownership segment is detected on disk', (t) => {
  const root = buildSandbox(t);
  mkdirSync(join(root, 'engine', 'utils'));
  assert.ok(rules(collectFindings(root)).includes('R4-forbidden-segment engine/utils'));
});

test('sandbox R5: an undeclared family and a family-prefix child are detected on disk', (t) => {
  const root = buildSandbox(t);
  mkdirSync(join(root, 'shadow', 'shadow-probe'), { recursive: true });
  writeFileSync(join(root, 'shadow', 'shadow-probe', 'index.mjs'), '// probe\n');
  mkdirSync(join(root, 'ci', 'ci-shadow'), { recursive: true });
  writeFileSync(join(root, 'ci', 'ci-shadow', 'index.mjs'), '// probe\n');
  const found = rules(collectFindings(root));
  assert.ok(found.includes('R5-undeclared-family shadow'));
  assert.ok(found.includes('R5-family-prefix-repeat ci/ci-shadow'));
});

test('sandbox R6: an undeclared lib subfamily is detected on disk', (t) => {
  const root = buildSandbox(t);
  mkdirSync(join(root, 'lib', 'shadow', 'shadow-probe'), { recursive: true });
  writeFileSync(join(root, 'lib', 'shadow', 'shadow-probe', 'index.mjs'), '// probe\n');
  assert.ok(rules(collectFindings(root)).includes('R6-undeclared-lib-subfamily lib/shadow'));
});

test('sandbox R7: agent and work-order capability names are detected on disk', (t) => {
  const root = buildSandbox(t);
  mkdirSync(join(root, 'engine', 'cra-99-shadow'), { recursive: true });
  writeFileSync(join(root, 'engine', 'cra-99-shadow', 'index.mjs'), '// probe\n');
  assert.ok(rules(collectFindings(root)).includes('R7-opaque-capability-name engine/cra-99-shadow'));
});

test('sandbox R5-lib: a subfamily-prefix child inside lib/ is detected on disk (Fable H1)', (t) => {
  const root = buildSandbox(t);
  rmSync(join(root, 'lib', 'paint', 'probe'), { recursive: true, force: true });
  mkdirSync(join(root, 'lib', 'paint', 'paint-probe'), { recursive: true });
  writeFileSync(join(root, 'lib', 'paint', 'paint-probe', 'index.mjs'), '// probe\n');
  assert.ok(rules(collectFindings(root)).includes('R5-family-prefix-repeat lib/paint/paint-probe'));
});

test('sandbox M1: a loose file at the manifest root is detected on disk', (t) => {
  const root = buildSandbox(t);
  mkdirSync(join(root, '..', 'manifest'), { recursive: true });
  writeFileSync(join(root, '..', 'manifest', 'index.json'), '{}\n');
  mkdirSync(join(root, '..', 'manifest', 'generator'));
  writeFileSync(join(root, '..', 'manifest', 'generator', 'index.mjs'), '// gen\n');
  assert.deepEqual(collectFindings(root), []);
  writeFileSync(join(root, '..', 'manifest', 'stray.mjs'), '// planted\n');
  assert.ok(rules(collectFindings(root)).includes('M1-loose-manifest-file manifest/stray.mjs'));
});
