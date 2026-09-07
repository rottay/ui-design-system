/**
 * component-runtime-boundary-gate drills.
 *
 * The gate answers "does any component tier reach a browser global directly",
 * and a scanner that stopped scanning answers "no" in exactly the same words.
 * So: it must find each planted name, it must not invent one on a clean
 * corpus, and the live tiers are asserted here too.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FORBIDDEN_NAMES, GOVERNED_ROOTS, scanRuntimeBoundary } from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = findPackageRoot(HERE);
const GATE = join(HERE, 'index.mjs');

function corpus(files) {
  const root = mkdtempSync(join(tmpdir(), 'ds-runtime-boundary-test-'));
  for (const [name, body] of Object.entries(files)) {
    const full = join(root, name);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body, 'utf8');
  }
  return root;
}

test('DRILL: each forbidden name is reported on its own line', () => {
  const root = corpus({
    'surface/index.tsx': [
      'export function S() {',
      '  window.location.href = "/x";',
      '  window.localStorage.setItem("k", "v");',
      '  window.dispatchEvent(new CustomEvent("ds:x"));',
      '}',
      '',
    ].join('\n'),
  });
  try {
    const findings = scanRuntimeBoundary(root, root);
    assert.deepEqual(findings.map((finding) => finding.name).sort(), [...FORBIDDEN_NAMES].sort());
    assert.deepEqual(findings.map((finding) => finding.line), [2, 3, 4]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a component that goes through a runtime hook is clean', () => {
  const root = corpus({
    'surface/index.tsx': [
      "import { useLayoutPreference } from '@/infrastructure/runtime/application/state';",
      'export const S = () => useLayoutPreference({ key: "k", defaults: {} });',
      '',
    ].join('\n'),
  });
  try {
    assert.deepEqual(scanRuntimeBoundary(root, root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the gate self-drill exits 0 and both live tiers are clean', () => {
  const drill = spawnSync(process.execPath, [GATE, '--drill'], { encoding: 'utf8', cwd: PACKAGE_ROOT });
  assert.equal(drill.status, 0, drill.stdout + drill.stderr);
  assert.match(drill.stdout, /DRILL OK/);

  const live = spawnSync(process.execPath, [GATE], { encoding: 'utf8', cwd: PACKAGE_ROOT });
  assert.equal(live.status, 0, `${live.stdout}${live.stderr}`);
  for (const root of GOVERNED_ROOTS) {
    assert.deepEqual(scanRuntimeBoundary(resolve(PACKAGE_ROOT, root), PACKAGE_ROOT), []);
  }
});
