/**
 * Drills for lib/repo-root: the two finders must land on the right roots and
 * fail closed on a tree with no markers.
 */

import assert from 'node:assert/strict';
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
