/**
 * component-determinism-gate drills.
 *
 * Two claims, because a scanner that reports nothing and a clean tree look
 * identical from the outside: the scanner must FIND a planted occurrence, and
 * it must not invent one on a clean corpus. The live tree is asserted last, so
 * a regression in `src/components` fails here as well as in the gate.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { COMPONENTS_ROOT, FORBIDDEN_TOKEN, scanDeterminism } from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = findPackageRoot(HERE);
const GATE = join(HERE, 'index.mjs');

function corpus(files) {
  const root = mkdtempSync(join(tmpdir(), 'ds-determinism-test-'));
  for (const [name, body] of Object.entries(files)) {
    const full = join(root, name);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body, 'utf8');
  }
  return root;
}

test('DRILL: a planted occurrence is reported with its exact line', () => {
  const root = corpus({
    'clean/index.tsx': 'export const Clean = () => 1;\n',
    'nested/deep/planted.ts': `const a = 1;\nexport const pick = () => ${FORBIDDEN_TOKEN}();\n`,
  });
  try {
    const findings = scanDeterminism(root, root);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].file, 'nested/deep/planted.ts');
    assert.equal(findings[0].line, 2);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a clean corpus reports nothing, so a green run is a measurement', () => {
  const root = corpus({
    'a/index.tsx': 'export const A = () => 1;\n',
    'b/index.css': '.x { color: red; }\n',
  });
  try {
    assert.deepEqual(scanDeterminism(root, root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the comment form counts too: the closure criterion is a literal grep', () => {
  const root = corpus({ 'c/index.ts': `// never ${FORBIDDEN_TOKEN} in render\n` });
  try {
    assert.equal(scanDeterminism(root, root).length, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the gate self-drill exits 0 and the live component tree is clean', () => {
  const drill = spawnSync(process.execPath, [GATE, '--drill'], { encoding: 'utf8', cwd: PACKAGE_ROOT });
  assert.equal(drill.status, 0, drill.stdout + drill.stderr);
  assert.match(drill.stdout, /DRILL OK/);

  const live = spawnSync(process.execPath, [GATE], { encoding: 'utf8', cwd: PACKAGE_ROOT });
  assert.equal(live.status, 0, `${live.stdout}${live.stderr}`);
  assert.deepEqual(scanDeterminism(resolve(PACKAGE_ROOT, COMPONENTS_ROOT), PACKAGE_ROOT), []);
});
