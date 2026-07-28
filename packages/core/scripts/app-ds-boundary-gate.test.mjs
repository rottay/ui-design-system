/**
 * Drills for the app<->DS boundary gate.
 *
 * THE DEFECT THESE EXIST FOR. The first version of this gate returned 0 when
 * `app-bithire` was not checked out, and it was wired as BLOCKING. In the
 * design system's single-repo CI job that meant "green because it did not
 * look" -- the precise failure class the whole programme is removing, shipped
 * inside the gate meant to enforce it.
 *
 * Every drill below runs the REAL CLI and asserts its exit code.
 */

import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const HERE = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(HERE, '..');
const gate = resolve(HERE, 'app-ds-boundary-gate.mjs');
const realWorkspace = resolve(packageRoot, '../../..');
const APP_CSS = 'app-bithire/src/styles/foundation.css';

function runGate(args) {
  return spawnSync(process.execPath, [gate, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
  });
}

/** A workspace containing only a copy of the app CSS we want to perturb. */
function withWorkspace(mutate) {
  const dir = mkdtempSync(join(tmpdir(), 'app-ds-boundary-'));
  try {
    const target = join(dir, APP_CSS);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(realWorkspace, APP_CSS), target);
    mutate?.(target);
    return { dir, run: (args) => runGate([...args, '--workspace-root', dir]) };
  } catch (error) {
    rmSync(dir, { recursive: true, force: true });
    throw error;
  }
}

test('DRILL 1: a blocking run with NO app repo fails', () => {
  const empty = mkdtempSync(join(tmpdir(), 'app-ds-empty-'));
  try {
    const result = runGate(['--check', '--workspace-root', empty]);
    assert.equal(result.status, 1, 'a blocking gate must not pass without its corpus');
    assert.match(result.stderr, /corpus missing/);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test('--optional downgrades a missing corpus, and only then', () => {
  const empty = mkdtempSync(join(tmpdir(), 'app-ds-empty-'));
  try {
    const result = runGate(['--check', '--optional', '--workspace-root', empty]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /not enforcing/);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test('DRILL 2: a NEW global `--ds-*` assignment fails', () => {
  const ws = withWorkspace((file) => {
    const css = readFileSync(file, 'utf8');
    writeFileSync(file, css.replace(':root {', ':root {\n  --ds-color-primary: #ff0000;'), 'utf8');
  });
  try {
    const result = ws.run(['--check']);
    assert.equal(result.status, 1, 'a new bare-:root DS declaration must fail');
    assert.match(result.stderr, /--ds-color-primary/);
  } finally {
    rmSync(ws.dir, { recursive: true, force: true });
  }
});

test('DRILL 3: a legitimate SCOPED hook assignment passes', () => {
  // The law is about WHERE, not about whether the app touches `--ds-*` at all.
  // A feature tuning a component it renders is exactly what is allowed, and a
  // gate that forbade it would push teams into worse workarounds.
  const ws = withWorkspace((file) => {
    const css = readFileSync(file, 'utf8');
    writeFileSync(
      file,
      `${css}\n.rt-some-feature {\n  --ds-button-ghost-color: var(--ds-color-text-secondary);\n}\n`,
      'utf8',
    );
  });
  try {
    assert.equal(ws.run(['--check']).status, 0, 'scoped hook assignments are legitimate');
  } finally {
    rmSync(ws.dir, { recursive: true, force: true });
  }
});

test('DRILL 4: draining a channel is allowed (decrease-only)', () => {
  // Removing a tracked declaration must never fail. A baseline that punished
  // improvement would make the debt permanent. The live baseline has drained
  // to zero tracked declarations, so the scenario is built explicitly: an
  // injected baseline that still tracks declarations the corpus no longer
  // makes.
  const ws = withWorkspace();
  const baseline = join(ws.dir, 'baseline.json');
  writeFileSync(
    baseline,
    JSON.stringify({
      shadowed: [`${APP_CSS} :: --ds-surface-card-bg`],
      globalOwn: [`${APP_CSS} :: --ds-meter-fill`],
      orphan: [],
    }),
  );
  try {
    const result = ws.run(['--check', '--baseline', baseline]);
    assert.equal(result.status, 0, 'removing a declaration must stay green');
  } finally {
    rmSync(ws.dir, { recursive: true, force: true });
  }
});

test('DRILL 5: the GitHub Actions path layout resolves via APP_BITHIRE_ROOT', () => {
  // Reproduces the layout actions/checkout can materialize: the DS is cloned at
  // `$GITHUB_WORKSPACE` and the private corpus is nested under it. The gate must
  // use the explicit environment variable rather than depend on local sibling
  // repository placement.
  const runner = mkdtempSync(join(tmpdir(), 'gha-runner-'));
  try {
    const workspace = join(runner, 'ui-design-system');
    const corpus = join(workspace, '.corpora/app-bithire');
    mkdirSync(workspace, { recursive: true });
    const target = join(corpus, 'src/styles/foundation.css');
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(realWorkspace, APP_CSS), target);

    // With only --workspace-root the sibling is absent: fail-closed.
    const withoutEnv = runGate(['--check', '--workspace-root', workspace]);
    assert.equal(withoutEnv.status, 1, 'the GHA layout has no sibling; the gate must fail');

    // With the variable the workflow exports, it finds the real corpus.
    const withEnv = spawnSync(process.execPath, [gate, '--check', '--workspace-root', workspace], {
      cwd: packageRoot,
      encoding: 'utf8',
      env: { ...process.env, APP_BITHIRE_ROOT: corpus },
    });
    assert.equal(
      withEnv.status,
      0,
      `APP_BITHIRE_ROOT must supply the corpus:\n${withEnv.stdout}${withEnv.stderr}`,
    );
    assert.match(withEnv.stdout, /corpus .*\.corpora[/\\]app-bithire/);
  } finally {
    rmSync(runner, { recursive: true, force: true });
  }
});

test('DRILL 6: --app-root beats the environment and the sibling default', () => {
  const ws = withWorkspace();
  try {
    const result = runGate(['--check', '--app-root', join(ws.dir, 'app-bithire')]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /corpus SHA unavailable/);
  } finally {
    rmSync(ws.dir, { recursive: true, force: true });
  }
});

test('the unmodified corpus is green', () => {
  const ws = withWorkspace();
  try {
    assert.equal(ws.run(['--check']).status, 0);
  } finally {
    rmSync(ws.dir, { recursive: true, force: true });
  }
});
