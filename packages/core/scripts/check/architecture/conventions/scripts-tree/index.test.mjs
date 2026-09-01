#!/usr/bin/env node

/**
 * scripts-tree-gate/index.test.mjs — teeth + honesty drills for the §1.2/§2.9
 * scripts-tree gate. A structure gate that cannot fail is debt dressed as law.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  collectFindings,
  evaluate,
  LEGACY_SCRIPT_ROOTS,
  measureScriptsTree,
  SCRIPT_INTENT_ROOTS,
  TRANSITIONAL_LEGACY_PROGRAMS,
} from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GATE = join(HERE, 'index.mjs');
const SCRIPTS_ROOT = resolve(HERE, '../../../..');
const BASELINE = JSON.parse(readFileSync(join(HERE, 'baseline/index.json'), 'utf8'));

const runGate = (args) =>
  spawnSync(process.execPath, [GATE, ...args], { encoding: 'utf8' });

test('positive: the real scripts/ tree passes with exactly the adjudicated baseline', () => {
  const out = runGate([]);
  assert.equal(out.status, 0, out.stderr);
  assert.match(out.stdout, /scripts-tree-gate OK/);
});

test('non-vacuity: the real gate scans live owners under packages/core/scripts', () => {
  const measured = measureScriptsTree(SCRIPTS_ROOT);
  assert.equal(measured.rootName, 'scripts');
  assert.ok(measured.ownerFiles > 0, JSON.stringify(measured));
  assert.ok(readFileSync(join(SCRIPTS_ROOT, 'check', 'architecture', 'conventions', 'scripts-tree', 'index.mjs'), 'utf8').length > 0);
});

test('baseline integrity: every entry carries rule, path and a non-empty reason', () => {
  assert.ok(Array.isArray(BASELINE.entries));
  assert.ok(BASELINE.entries.length >= 0);
  for (const entry of BASELINE.entries) {
    assert.ok(entry.rule, JSON.stringify(entry));
    assert.ok(entry.path, JSON.stringify(entry));
    assert.ok(typeof entry.reason === 'string' && entry.reason.length > 10, JSON.stringify(entry));
  }
});

for (const rule of [
  'R1',
  'R2',
  'R3',
  'R4',
  'intent-root',
  'legacy-root',
  'agent-wave',
  'R8',
  'R9',
  'M1',
]) {
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

// Disk-backed drills prove collection as well as CLI reporting.

const CAPABILITIES = [
  'build/distribution',
  'check/architecture',
  'generate/taxonomy',
  'maintain/codemods',
  'package/exports',
  'libraries/manifest',
  'libraries/repo-root',
];

function buildSandbox(t) {
  const wrapper = mkdtempSync(join(tmpdir(), 'scripts-tree-sandbox-'));
  t.after(() => rmSync(wrapper, { recursive: true, force: true }));
  const root = join(wrapper, 'scripts');
  mkdirSync(root, { recursive: true });
  for (const capability of CAPABILITIES) {
    mkdirSync(join(root, capability), { recursive: true });
    writeFileSync(join(root, capability, 'index.mjs'), '// probe\n');
  }
  return root;
}

const rules = (findings) => findings.map((f) => `${f.rule} ${f.path}`);

test('sandbox: a clean synthetic tree reports zero findings', (t) => {
  const root = buildSandbox(t);
  assert.deepEqual(SCRIPT_INTENT_ROOTS, [
    'build',
    'check',
    'generate',
    'maintain',
    'package',
    'libraries',
  ]);
  assert.deepEqual(collectFindings(root), []);
});

for (const intent of SCRIPT_INTENT_ROOTS) {
  test(`sandbox roots: missing ${intent}/ is rejected`, (t) => {
    const root = buildSandbox(t);
    rmSync(join(root, intent), { recursive: true, force: true });
    assert.ok(
      rules(collectFindings(root)).includes(`R5-missing-intent-root ${intent}`),
    );
  });
}

for (const legacyRoot of LEGACY_SCRIPT_ROOTS) {
  test(`sandbox roots: legacy ${legacyRoot}/ is rejected`, (t) => {
    const root = buildSandbox(t);
    mkdirSync(join(root, legacyRoot, 'probe'), { recursive: true });
    writeFileSync(join(root, legacyRoot, 'probe', 'index.mjs'), '// planted\n');
    assert.ok(
      rules(collectFindings(root)).includes(`R5-legacy-root ${legacyRoot}`),
    );
  });
}

test('transition: Modern Rescue has no legacy path exception', () => {
  assert.deepEqual(TRANSITIONAL_LEGACY_PROGRAMS, []);
  assert.ok(existsSync(join(SCRIPTS_ROOT, 'check', 'modern-rescue', 'check', 'index.mjs')));
});

test('sandbox R1: a loose file at the scripts root is detected on disk', (t) => {
  const root = buildSandbox(t);
  writeFileSync(join(root, 'loose-script.mjs'), '// planted\n');
  assert.ok(rules(collectFindings(root)).includes('R1-loose-root-file loose-script.mjs'));
});

test('sandbox R2: loose files at family and lib-subfamily level are detected on disk', (t) => {
  const root = buildSandbox(t);
  writeFileSync(join(root, 'check', 'loose.mjs'), '// planted\n');
  writeFileSync(join(root, 'libraries', 'loose.mjs'), '// planted\n');
  const found = rules(collectFindings(root));
  assert.ok(found.includes('R2-loose-intent-file check/loose.mjs'));
  assert.ok(found.includes('R2-loose-intent-file libraries/loose.mjs'));
});

test('sandbox R3: a foreign file inside a capability and an ownerless dir are detected on disk', (t) => {
  const root = buildSandbox(t);
  writeFileSync(join(root, 'build', 'distribution', 'other-name.json'), '{}\n');
  mkdirSync(join(root, 'check', 'husk'));
  const found = rules(collectFindings(root));
  assert.ok(found.includes('R3-foreign-file build/distribution/other-name.json'));
  assert.ok(found.includes('R3-ownerless-dir check/husk'));
});

test('sandbox R4: a generic ownership segment is detected on disk', (t) => {
  const root = buildSandbox(t);
  mkdirSync(join(root, 'check', 'utils'));
  assert.ok(rules(collectFindings(root)).includes('R4-forbidden-segment check/utils'));
});

test('sandbox R5: an undeclared family and a family-prefix child are detected on disk', (t) => {
  const root = buildSandbox(t);
  mkdirSync(join(root, 'shadow', 'shadow-probe'), { recursive: true });
  writeFileSync(join(root, 'shadow', 'shadow-probe', 'index.mjs'), '// probe\n');
  mkdirSync(join(root, 'build', 'build-shadow'), { recursive: true });
  writeFileSync(join(root, 'build', 'build-shadow', 'index.mjs'), '// probe\n');
  const found = rules(collectFindings(root));
  assert.ok(found.includes('R5-undeclared-intent-root shadow'));
  assert.ok(found.includes('R5-family-prefix-repeat build/build-shadow'));
});

test('sandbox R7: agent, work-order and wave capability names are detected on disk', (t) => {
  const root = buildSandbox(t);
  for (const name of ['cra-99-shadow', 'agent-wave-probe', 'fable-wave-2']) {
    mkdirSync(join(root, 'check', name), { recursive: true });
    writeFileSync(join(root, 'check', name, 'index.mjs'), '// probe\n');
  }
  const found = rules(collectFindings(root));
  assert.ok(found.includes('R7-opaque-capability-name check/cra-99-shadow'));
  assert.ok(found.includes('R7-opaque-capability-name check/agent-wave-probe'));
  assert.ok(found.includes('R7-opaque-capability-name check/fable-wave-2'));
});

test('sandbox R8: a meaningful subdomain requires at least two capabilities', (t) => {
  const root = buildSandbox(t);
  mkdirSync(join(root, 'check', 'paint', 'only-child'), { recursive: true });
  writeFileSync(join(root, 'check', 'paint', 'only-child', 'index.mjs'), '// probe\n');
  assert.ok(rules(collectFindings(root)).includes('R8-single-child-subdomain check/paint'));
  mkdirSync(join(root, 'check', 'paint', 'second-child'), { recursive: true });
  writeFileSync(join(root, 'check', 'paint', 'second-child', 'index.mjs'), '// probe\n');
  assert.ok(!rules(collectFindings(root)).includes('R8-single-child-subdomain check/paint'));
});

test('sandbox R9: PascalCase and opaque wave directories are detected on disk', (t) => {
  const root = buildSandbox(t);
  mkdirSync(join(root, 'check', 'OpaqueTask'), { recursive: true });
  writeFileSync(join(root, 'check', 'OpaqueTask', 'index.mjs'), '// planted\n');
  mkdirSync(join(root, 'check', 'wave-9-probe'), { recursive: true });
  writeFileSync(join(root, 'check', 'wave-9-probe', 'index.mjs'), '// planted\n');
  const found = rules(collectFindings(root));
  assert.ok(found.includes('R9-non-declarative-directory-name check/OpaqueTask'));
  assert.ok(found.includes('R9-non-declarative-directory-name check/wave-9-probe'));
});

test('sandbox R5-libraries: a root-prefixed capability is detected on disk', (t) => {
  const root = buildSandbox(t);
  mkdirSync(join(root, 'libraries', 'libraries-probe'), { recursive: true });
  writeFileSync(join(root, 'libraries', 'libraries-probe', 'index.mjs'), '// probe\n');
  assert.ok(rules(collectFindings(root)).includes('R5-family-prefix-repeat libraries/libraries-probe'));
});

test('sandbox M1: a loose file at the manifest root is detected on disk', (t) => {
  const root = buildSandbox(t);
  const manifest = join(root, '..', 'governance', 'manifest');
  mkdirSync(manifest, { recursive: true });
  writeFileSync(join(manifest, 'index.json'), '{}\n');
  mkdirSync(join(manifest, 'controls', 'probe'), { recursive: true });
  writeFileSync(join(manifest, 'controls', 'probe', 'index.json'), '{}\n');
  assert.deepEqual(collectFindings(root), []);
  writeFileSync(join(manifest, 'stray.mjs'), '// planted\n');
  assert.ok(rules(collectFindings(root)).includes('M1-loose-manifest-file governance/manifest/stray.mjs'));
});
