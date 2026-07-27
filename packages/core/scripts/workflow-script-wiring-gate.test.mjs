/**
 * Drills for the workflow script-wiring gate.
 *
 * The gate exists because a CI step read `pnpm run gates:ci:list` from the
 * repository root while that script lived only in `packages/core`. Its negative
 * proof was manual, which is the same weakness the gate itself guards against:
 * a check nobody runs is a check that does not exist.
 *
 * Every case below runs the REAL CLI against a synthetic repository, so the
 * scanner, the resolution rules and the exit code are all exercised together.
 */

import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const HERE = dirname(fileURLToPath(import.meta.url));
const gate = resolve(HERE, 'workflow-script-wiring-gate.mjs');

/**
 * Builds a throwaway repository with the same shape the gate expects
 * (`<repo>/packages/core/scripts`, `<repo>/.github/workflows`) and runs the
 * gate from inside it.
 */
function withRepo({ rootScripts = {}, coreScripts = {}, workflow }) {
  const repo = mkdtempSync(join(tmpdir(), 'wiring-gate-'));
  const core = join(repo, 'packages/core/scripts');
  mkdirSync(core, { recursive: true });
  mkdirSync(join(repo, '.github/workflows'), { recursive: true });

  writeFileSync(
    join(repo, 'package.json'),
    JSON.stringify({ name: 'root', scripts: rootScripts }, null, 2),
  );
  writeFileSync(
    join(repo, 'packages/core/package.json'),
    JSON.stringify({ name: '@rottay/design-system', scripts: coreScripts }, null, 2),
  );
  writeFileSync(join(repo, '.github/workflows/ci.yml'), workflow, 'utf8');

  // The gate locates the repo from its own path, so it must run from the copy.
  const copied = join(core, 'workflow-script-wiring-gate.mjs');
  writeFileSync(copied, readGate(), 'utf8');

  return {
    repo,
    run: () =>
      spawnSync(process.execPath, [copied], {
        cwd: join(repo, 'packages/core'),
        encoding: 'utf8',
      }),
    cleanup: () => rmSync(repo, { recursive: true, force: true }),
  };
}

function readGate() {
  return readFileSync(gate, 'utf8');
}

/** Six `pnpm run` references, so the non-vacuity floor (5) is cleared. */
function padding(script) {
  return Array.from(
    { length: 6 },
    () => `      - run: pnpm --filter @rottay/design-system run ${script}\n`,
  ).join('');
}

test('a valid reference passes', () => {
  const fixture = withRepo({
    coreScripts: { build: 'tsc' },
    workflow: `jobs:\n  core:\n    steps:\n${padding('build')}`,
  });
  try {
    const result = fixture.run();
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /every referenced script resolves/);
  } finally {
    fixture.cleanup();
  }
});

test('DRILL: a script that does not exist fails', () => {
  // The original defect, reproduced exactly: the script exists in packages/core
  // but the step runs from the repository root.
  const fixture = withRepo({
    coreScripts: { 'gates:ci:list': 'node run.mjs' },
    workflow:
      `jobs:\n  core:\n    steps:\n${padding('gates:ci:list')}` +
      '      - run: pnpm run gates:ci:list\n',
  });
  try {
    const result = fixture.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"gates:ci:list" does not exist/);
  } finally {
    fixture.cleanup();
  }
});

test('a correct --filter target resolves against that package', () => {
  const fixture = withRepo({
    coreScripts: { 'gates:ci': 'node run.mjs' },
    workflow: `jobs:\n  core:\n    steps:\n${padding('gates:ci')}`,
  });
  try {
    assert.equal(fixture.run().status, 0);
  } finally {
    fixture.cleanup();
  }
});

test('DRILL: an unknown --filter target fails', () => {
  const fixture = withRepo({
    coreScripts: { 'gates:ci': 'node run.mjs' },
    workflow:
      `jobs:\n  core:\n    steps:\n${padding('gates:ci')}` +
      '      - run: pnpm --filter @rottay/does-not-exist run gates:ci\n',
  });
  try {
    const result = fixture.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /cannot resolve --filter @rottay\/does-not-exist/);
  } finally {
    fixture.cleanup();
  }
});

test('DRILL: a vacuous scan fails instead of reporting success', () => {
  // A scanner that matches nothing prints the same "OK" as a fully-wired repo.
  // The floor turns that silence into a failure.
  const fixture = withRepo({
    coreScripts: { build: 'tsc' },
    workflow: 'jobs:\n  core:\n    steps:\n      - run: echo nothing to see\n',
  });
  try {
    const result = fixture.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /not reading the workflows/);
  } finally {
    fixture.cleanup();
  }
});

test('a job-level working-directory is honoured', () => {
  // `defaults.run.working-directory: packages/core` makes a bare `pnpm run`
  // resolve against the package, not the root.
  const fixture = withRepo({
    coreScripts: { 'gates:ci': 'node run.mjs' },
    workflow:
      'jobs:\n  core:\n    defaults:\n      run:\n        working-directory: packages/core\n' +
      `    steps:\n${Array.from({ length: 6 }, () => '      - run: pnpm run gates:ci\n').join('')}`,
  });
  try {
    const result = fixture.run();
    assert.equal(result.status, 0, result.stdout + result.stderr);
  } finally {
    fixture.cleanup();
  }
});

test('a step-level working-directory overrides the job default', () => {
  const fixture = withRepo({
    rootScripts: { 'root-only': 'echo root' },
    coreScripts: { 'core-only': 'echo core' },
    workflow:
      'jobs:\n  core:\n    defaults:\n      run:\n        working-directory: packages/core\n' +
      `    steps:\n${Array.from({ length: 5 }, () => '      - run: pnpm run core-only\n').join('')}` +
      '      - name: root step\n        working-directory: .\n        run: pnpm run root-only\n',
  });
  try {
    const result = fixture.run();
    assert.equal(result.status, 0, result.stdout + result.stderr);
  } finally {
    fixture.cleanup();
  }
});

test('an actions/checkout path nested under GITHUB_WORKSPACE passes', () => {
  const fixture = withRepo({
    coreScripts: { build: 'tsc' },
    workflow:
      'jobs:\n  core:\n    steps:\n' +
      '      - uses: actions/checkout@v4\n' +
      '        with:\n' +
      '          path: .corpora/app-bithire\n' +
      padding('build'),
  });
  try {
    const result = fixture.run();
    assert.equal(result.status, 0, result.stdout + result.stderr);
  } finally {
    fixture.cleanup();
  }
});

test('DRILL: an actions/checkout path cannot escape GITHUB_WORKSPACE', () => {
  const fixture = withRepo({
    coreScripts: { build: 'tsc' },
    workflow:
      'jobs:\n  core:\n    steps:\n' +
      '      - uses: actions/checkout@v4\n' +
      '        with:\n' +
      '          path: ../app-bithire-corpus\n' +
      padding('build'),
  });
  try {
    const result = fixture.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /actions\/checkout path .* escapes GITHUB_WORKSPACE/);
  } finally {
    fixture.cleanup();
  }
});
