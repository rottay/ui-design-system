/**
 * Drills for the three F0 honesty gates: ds-underscore-prefix,
 * exports-artifact and root-catalog-freshness. A gate that cannot fail is not
 * a gate, so each check asserts the green path against the real tree AND a
 * planted-violation path against a synthetic tree built outside the repo (the
 * gate scripts resolve their roots from their own location, so a copy under a
 * temp `packages/core/scripts/` audits the synthetic tree).
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { packageRoot as findPackageRoot } from './lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

function run(script, cwd = CORE_ROOT) {
  try {
    const stdout = execFileSync('node', [script], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, out: stdout };
  } catch (error) {
    return { code: error.status ?? 1, out: `${error.stdout ?? ''}${error.stderr ?? ''}` };
  }
}

/** Plant a synthetic package tree and run a COPY of the gate against it. */
function runOnSyntheticTree(scriptName, files) {
  const root = mkdtempSync(join(tmpdir(), 'f0-drill-'));
  const scriptsDir = join(root, 'packages/core/scripts');
  mkdirSync(scriptsDir, { recursive: true });
  cpSync(join(HERE, scriptName), join(scriptsDir, scriptName));
  // The gates resolve their root through the shared helper, so the copy needs it too.
  mkdirSync(join(scriptsDir, 'lib/repo-root'), { recursive: true });
  cpSync(join(HERE, 'lib/repo-root/index.mjs'), join(scriptsDir, 'lib/repo-root/index.mjs'));
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, 'packages/core', path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return run(join(scriptsDir, scriptName), join(root, 'packages/core'));
}

/* ---------------- ds-underscore-prefix-gate ---------------- */

test('ds-underscore-prefix-gate passes on the current tree', () => {
  const result = run(join(HERE, 'ds-underscore-prefix-gate.mjs'));
  assert.equal(result.code, 0, result.out);
});

test('ds-underscore-prefix-gate FAILS on a planted --ds_ in a synthetic skin', () => {
  const result = runOnSyntheticTree('ds-underscore-prefix-gate.mjs', {
    'src/skin/button.css': '.x { color: var(--ds_experimental-red); }\n',
    'package.json': JSON.stringify({ name: '@rottay/design-system' }),
  });
  assert.equal(result.code, 1, result.out);
  assert.match(result.out, /--ds_experimental-red/);
});

test('ds-underscore-prefix-gate ignores the private --_ds- namespace', () => {
  const result = runOnSyntheticTree('ds-underscore-prefix-gate.mjs', {
    'src/skin/button.css': '.x { width: var(--_ds-private-swatch, 12px); }\n',
    'package.json': JSON.stringify({ name: '@rottay/design-system' }),
  });
  assert.equal(result.code, 0, result.out);
});

/* ---------------- exports-artifact-gate ---------------- */

test('exports-artifact-gate passes on the built tree', () => {
  const result = run(join(HERE, 'exports-artifact-gate.mjs'));
  assert.equal(result.code, 0, result.out);
});

test('exports-artifact-gate FAILS on a missing exact target', () => {
  const result = runOnSyntheticTree('exports-artifact-gate.mjs', {
    'package.json': JSON.stringify({
      name: '@rottay/design-system',
      exports: { './a': './dist/a.js' },
    }),
  });
  assert.equal(result.code, 1, result.out);
  assert.match(result.out, /dist\/a\.js/);
});

test('exports-artifact-gate FAILS on a wildcard whose prefix dir is missing', () => {
  const result = runOnSyntheticTree('exports-artifact-gate.mjs', {
    'package.json': JSON.stringify({
      name: '@rottay/design-system',
      exports: { './styles/*': './dist/*.css' },
    }),
    // A .css somewhere else must NOT satisfy the dist wildcard (H1 regression).
    'src/random.css': '.x{}\n',
  });
  assert.equal(result.code, 1, result.out);
});

/* ---------------- root-catalog-freshness-gate ---------------- */

test('root-catalog-freshness-gate passes on the current tree', () => {
  const result = run(join(HERE, 'root-catalog-freshness-gate.mjs'));
  assert.equal(result.code, 0, result.out);
});

test('root-catalog-freshness-gate FAILS on an existe root with no declaration', () => {
  const catalog = {
    roots: [
      { rootId: 'fake.root', channel: '--ds-fake-head', channelStatus: 'existe' },
    ],
  };
  const result = runOnSyntheticTree('root-catalog-freshness-gate.mjs', {
    'scripts/quality-evidence/programs/modern-rescue/manifest/cascade/root-catalog.json':
      JSON.stringify(catalog),
    'src/skin/whatever.css': '.x { color: red; }\n',
    'package.json': JSON.stringify({ name: '@rottay/design-system' }),
  });
  assert.equal(result.code, 1, result.out);
  assert.match(result.out, /catalog says 'existe' but --ds-fake-head/);
});

test('root-catalog-freshness-gate FAILS on a por-crear root that gained a declaration', () => {
  const catalog = {
    roots: [
      { rootId: 'fake.root', channel: '--ds-fake-head', channelStatus: 'por-crear' },
    ],
  };
  const result = runOnSyntheticTree('root-catalog-freshness-gate.mjs', {
    'scripts/quality-evidence/programs/modern-rescue/manifest/cascade/root-catalog.json':
      JSON.stringify(catalog),
    'src/skin/whatever.css': '.x { --ds-fake-head: 1px; }\n',
    'package.json': JSON.stringify({ name: '@rottay/design-system' }),
  });
  assert.equal(result.code, 1, result.out);
  assert.match(result.out, /now declared in src/);
});
