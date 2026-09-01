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
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const SCRIPTS_ROOT = join(CORE_ROOT, 'scripts');
const PRIVATE_PREFIX_GATE = 'check/tokens/governance/private-prefix/index.mjs';
const EXPORTS_GATE = 'package/artifacts/exports/index.mjs';
const ROOT_CATALOG_GATE = 'check/tokens/cascade/roots/catalog-freshness/index.mjs';
const WIRING_GATE = 'check/automation/wiring/gate-coverage/index.mjs';

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
function runOnSyntheticTree(scriptRelativePath, files) {
  const root = mkdtempSync(join(tmpdir(), 'f0-drill-'));
  const scriptsDir = join(root, 'packages/core/scripts');
  // The copy has to sit at the SAME depth the gate resolves its roots from,
  // so a gate that lives in `<family>/<capability>/index.mjs` is planted there.
  mkdirSync(dirname(join(scriptsDir, scriptRelativePath)), { recursive: true });
  cpSync(join(SCRIPTS_ROOT, scriptRelativePath), join(scriptsDir, scriptRelativePath));
  // The gates resolve their root through the shared helper, so the copy needs it too.
  mkdirSync(join(scriptsDir, 'libraries/repo-root'), { recursive: true });
  cpSync(join(SCRIPTS_ROOT, 'libraries/repo-root/index.mjs'), join(scriptsDir, 'libraries/repo-root/index.mjs'));
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, 'packages/core', path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return run(join(scriptsDir, scriptRelativePath), join(root, 'packages/core'));
}

/* ---------------- ds-underscore-prefix-gate ---------------- */

test('ds-underscore-prefix-gate passes on the current tree', () => {
  const result = run(join(SCRIPTS_ROOT, PRIVATE_PREFIX_GATE));
  assert.equal(result.code, 0, result.out);
});

test('ds-underscore-prefix-gate FAILS on a planted --ds_ in a synthetic skin', () => {
  const result = runOnSyntheticTree(PRIVATE_PREFIX_GATE, {
    'src/skin/button.css': '.x { color: var(--ds_experimental-red); }\n',
    'package.json': JSON.stringify({ name: '@rottay/design-system' }),
  });
  assert.equal(result.code, 1, result.out);
  assert.match(result.out, /--ds_experimental-red/);
});

test('ds-underscore-prefix-gate ignores the private --_ds- namespace', () => {
  const result = runOnSyntheticTree(PRIVATE_PREFIX_GATE, {
    'src/skin/button.css': '.x { width: var(--_ds-private-swatch, 12px); }\n',
    'package.json': JSON.stringify({ name: '@rottay/design-system' }),
  });
  assert.equal(result.code, 0, result.out);
});

/* ---------------- exports-artifact-gate ---------------- */

test('exports-artifact-gate passes on the built tree', () => {
  const result = run(join(SCRIPTS_ROOT, EXPORTS_GATE));
  assert.equal(result.code, 0, result.out);
});

test('exports-artifact-gate FAILS on a missing exact target', () => {
  const result = runOnSyntheticTree(EXPORTS_GATE, {
    'package.json': JSON.stringify({
      name: '@rottay/design-system',
      exports: { './a': './dist/a.js' },
    }),
  });
  assert.equal(result.code, 1, result.out);
  assert.match(result.out, /dist\/a\.js/);
});

test('exports-artifact-gate FAILS on a wildcard whose prefix dir is missing', () => {
  const result = runOnSyntheticTree(EXPORTS_GATE, {
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
  const result = run(join(SCRIPTS_ROOT, ROOT_CATALOG_GATE));
  assert.equal(result.code, 0, result.out);
});

test('root-catalog-freshness-gate FAILS on an existe root with no declaration', () => {
  const catalog = {
    roots: [
      { rootId: 'fake.root', channel: '--ds-fake-head', channelStatus: 'existe' },
    ],
  };
  const result = runOnSyntheticTree(ROOT_CATALOG_GATE, {
    'governance/manifest/cascade/catalog/index.json':
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
  const result = runOnSyntheticTree(ROOT_CATALOG_GATE, {
    'governance/manifest/cascade/catalog/index.json':
      JSON.stringify(catalog),
    'src/skin/whatever.css': '.x { --ds-fake-head: 1px; }\n',
    'package.json': JSON.stringify({ name: '@rottay/design-system' }),
  });
  assert.equal(result.code, 1, result.out);
  assert.match(result.out, /now declared in src/);
});

/* ---------------- wiring-coverage-gate ---------------- */

/**
 * The wiring gate resolves BOTH roots (package + repo) and reads a manifest,
 * so its synthetic tree needs pnpm-workspace.yaml at the repo root and a
 * planted manifest. The gate copy itself lands in the synthetic census, so
 * the planted manifest must wire the gate's own path too. Both the gate and
 * the manifest are planted at the depth the real tree uses, because the gate
 * reads the manifest by that exact path.
 */
function runWiringOnSyntheticTree(extraFiles) {
  const root = mkdtempSync(join(tmpdir(), 'f0-wiring-drill-'));
  const scriptsDir = join(root, 'packages/core/scripts');
  mkdirSync(scriptsDir, { recursive: true });
  mkdirSync(dirname(join(scriptsDir, WIRING_GATE)), { recursive: true });
  cpSync(join(SCRIPTS_ROOT, WIRING_GATE), join(scriptsDir, WIRING_GATE));
  mkdirSync(join(scriptsDir, 'libraries/repo-root'), { recursive: true });
  cpSync(join(SCRIPTS_ROOT, 'libraries/repo-root/index.mjs'), join(scriptsDir, 'libraries/repo-root/index.mjs'));
  writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
  const files = {
    'package.json': JSON.stringify({ name: '@rottay/design-system', scripts: {} }),
    ...extraFiles,
  };
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, 'packages/core', path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return run(join(scriptsDir, WIRING_GATE), join(root, 'packages/core'));
}

const WIRING_MANIFEST = `export const GATES = [
  { id: 'runner', run: ['node', 'scripts/check/automation/runner/index.mjs'] },
  { id: 'wired', run: ['node', 'scripts/check/tokens/wired-gate/index.mjs'] },
  { id: 'wiring', run: ['node', 'scripts/check/automation/wiring/gate-coverage/index.mjs'] },
];
`;

/** The runner's import of the manifest is what wires the manifest itself
 *  (one-hop rule) — mirrors the real tree. */
const WIRING_RUNNER = `import { GATES } from '../gates/manifest/index.mjs';
export { GATES };
`;

test('wiring-coverage-gate passes on the current tree', () => {
  const result = run(join(SCRIPTS_ROOT, WIRING_GATE));
  assert.equal(result.code, 0, result.out);
});

test('wiring-coverage-gate passes with a wired capability at depth', () => {
  const result = runWiringOnSyntheticTree({
    'scripts/check/automation/gates/manifest/index.mjs': WIRING_MANIFEST,
    'scripts/check/automation/runner/index.mjs': WIRING_RUNNER,
    'scripts/check/tokens/wired-gate/index.mjs': 'export {};\n',
  });
  assert.equal(result.code, 0, result.out);
});

test('wiring-coverage-gate FAILS on an orphan planted at depth', () => {
  const result = runWiringOnSyntheticTree({
    'scripts/check/automation/gates/manifest/index.mjs': WIRING_MANIFEST,
    'scripts/check/automation/runner/index.mjs': WIRING_RUNNER,
    'scripts/check/tokens/wired-gate/index.mjs': 'export {};\n',
    'scripts/check/tokens/orphan-gate/index.mjs': 'export {};\n',
  });
  assert.equal(result.code, 1, result.out);
  assert.match(result.out, /scripts\/check\/tokens\/orphan-gate\/index\.mjs/);
});

test('wiring-coverage-gate rejects unwired libraries, codemods and evidence helpers', () => {
  const result = runWiringOnSyntheticTree({
    'scripts/check/automation/gates/manifest/index.mjs': WIRING_MANIFEST,
    'scripts/check/automation/runner/index.mjs': WIRING_RUNNER,
    'scripts/check/tokens/wired-gate/index.mjs': 'export {};\n',
    'scripts/libraries/paint/shared-counter/index.mjs': 'export {};\n',
    'scripts/maintain/codemods/app-side-thing/index.mjs': 'export {};\n',
    'scripts/check/evidence/framework/helper.mjs': 'export {};\n',
  });
  assert.equal(result.code, 1, result.out);
  assert.match(result.out, /scripts\/libraries\/paint\/shared-counter\/index\.mjs/);
  assert.match(result.out, /scripts\/maintain\/codemods\/app-side-thing\/index\.mjs/);
  assert.match(result.out, /scripts\/check\/evidence\/framework\/helper\.mjs/);
});
