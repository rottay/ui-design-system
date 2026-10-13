/**
 * Drills for lib/repo-root: the two finders must land on the right roots and
 * fail closed on a tree with no markers.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { packageRoot, repoRoot } from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

test('packageRoot from a script lands on packages/core', () => {
  assert.ok(packageRoot(HERE).endsWith(join('packages', 'core')));
});

test('repoRoot from a script lands on the workspace root', () => {
  assert.ok(repoRoot(HERE).endsWith('ui-design-system'));
});

test('the two predicates are not interchangeable', () => {
  assert.notEqual(packageRoot(HERE), repoRoot(HERE));
});

test('findUp fails closed on a tree with no markers', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'repo-root-'));
  mkdirSync(join(sandbox, 'a', 'b'), { recursive: true });
  assert.throws(() => repoRoot(join(sandbox, 'a', 'b')), /could not locate/);
});

test('packageRoot does not get confused by a same-named root package.json', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'repo-root-'));
  mkdirSync(join(sandbox, 'packages/core/scripts/libraries/x'), { recursive: true });
  writeFileSync(join(sandbox, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
  writeFileSync(join(sandbox, 'package.json'), JSON.stringify({ name: '@rottay/design-system' }));
  writeFileSync(join(sandbox, 'packages/core/package.json'), JSON.stringify({ name: '@rottay/design-system' }));
  const from = join(sandbox, 'packages/core/scripts/libraries/x');
  assert.equal(packageRoot(from), join(sandbox, 'packages/core'));
  assert.equal(repoRoot(from), sandbox);
});

test('an origin that names nothing on disk and exists under no ancestor fails closed', () => {
  assert.throws(
    () => packageRoot('/scripts/libraries/no-such-library/index.mjs'),
    /could not locate the @rottay\/design-system package root from \/scripts\/libraries\/no-such-library\/index\.mjs/,
  );
  assert.throws(() => repoRoot('/no-such-root-relative-dir/'), /could not locate/);
});

test('an existing marker-less origin is never re-anchored onto this repository', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'repo-root-'));
  mkdirSync(join(sandbox, 'scripts/libraries/repo-root'), { recursive: true });
  assert.throws(() => packageRoot(join(sandbox, 'scripts/libraries/repo-root')), /could not locate/);
});

test('the vite-root-relative origin a transformed module hands over resolves to the same roots', () => {
  const core = packageRoot(HERE);
  assert.equal(packageRoot('/scripts/libraries/tokens/producers/index.mjs'), core);
  assert.equal(packageRoot('/scripts/libraries/tokens/producers/'), core);
  assert.equal(repoRoot('/scripts/libraries/tokens/producers/index.mjs'), repoRoot(HERE));
});

test('under vitest the origin arrives root-relative and both finders still land', () => {
  const core = packageRoot(HERE);
  const run = spawnSync(
    process.execPath,
    [
      join(core, 'node_modules/vitest/vitest.mjs'),
      'run',
      '--config',
      join(HERE, 'repo-root.vitest-context.mjs'),
    ],
    { cwd: core, encoding: 'utf8' },
  );
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  assert.match(run.stdout, /3 passed/);
});
