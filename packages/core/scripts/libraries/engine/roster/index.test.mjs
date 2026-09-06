/**
 * The scripts-layer roster reader: it must DERIVE, and it must fail closed.
 *
 * A parse that silently returns a short roster is worse than no parse at all --
 * every consumer would then quietly measure fewer engines than the DS ships.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  ADMITTED_ENGINE_NAMES,
  CASCADE_ENGINE_ORDER,
  ENGINE_IDENTITY_SOURCE,
  ENGINE_NAMES,
  FROZEN_ENGINE_NAMES,
  IMPLEMENTED_ENGINE_NAMES,
  assertCascadeEngineOrder,
} from './index.mjs';

test('the parsed roster is the identity contract, name for name', () => {
  const source = readFileSync(ENGINE_IDENTITY_SOURCE, 'utf8');
  const declared = /export const ENGINE_NAMES = \[([^\]]*)\] as const;/.exec(source);
  assert.ok(declared, 'the identity contract must declare ENGINE_NAMES');
  const names = [...declared[1].matchAll(/'([a-z][a-z0-9-]*)'/g)].map((m) => m[1]);
  assert.deepEqual([...ENGINE_NAMES], names);
});

test('the derived sets partition the roster', () => {
  assert.deepEqual(
    [...IMPLEMENTED_ENGINE_NAMES, ...ENGINE_NAMES.filter((n) => !IMPLEMENTED_ENGINE_NAMES.includes(n))].sort(),
    [...ENGINE_NAMES].sort()
  );
  assert.deepEqual(
    [...ADMITTED_ENGINE_NAMES, ...FROZEN_ENGINE_NAMES].sort(),
    [...ENGINE_NAMES].sort()
  );
  for (const frozen of FROZEN_ENGINE_NAMES)
    assert.ok(!ADMITTED_ENGINE_NAMES.includes(frozen), `${frozen} must not be admitted`);
});

test('the cascade order is a permutation of the implemented roster', () => {
  assert.deepEqual([...CASCADE_ENGINE_ORDER].sort(), [...IMPLEMENTED_ENGINE_NAMES].sort());
});

test('the cascade order matches the published producers manifest', () => {
  assert.equal(assertCascadeEngineOrder(), CASCADE_ENGINE_ORDER.join('+'));
});

test('a manifest whose multi-engine scope order drifted is refused', async () => {
  const { mkdtempSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const planted = join(mkdtempSync(join(tmpdir(), 'engine-roster-')), 'producers.json');
  writeFileSync(
    planted,
    JSON.stringify({ rows: [{ engineScope: [...CASCADE_ENGINE_ORDER].reverse() }] })
  );
  assert.throws(() => assertCascadeEngineOrder(planted), /derived cascade order/);
});

test('a contract that stops declaring the roster is a hard failure, never an empty list', async () => {
  const { mkdtempSync, writeFileSync, mkdirSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join, dirname } = await import('node:path');
  const { pathToFileURL } = await import('node:url');
  const root = mkdtempSync(join(tmpdir(), 'engine-roster-root-'));
  const contract = join(
    root,
    'packages/core/src/foundation/contracts/kernel/engine-identity/index.ts'
  );
  mkdirSync(dirname(contract), { recursive: true });
  writeFileSync(contract, 'export const NOTHING = 1;\n');
  writeFileSync(join(root, 'packages/core/package.json'), '{"name":"@rottay/design-system"}');
  writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
  // Re-import the module from a tree whose contract declares nothing; the
  // module body must throw at load rather than publish an empty roster.
  const copy = join(root, 'packages/core/scripts/libraries/engine/roster/index.mjs');
  mkdirSync(dirname(copy), { recursive: true });
  const repoRootLib = join(root, 'packages/core/scripts/libraries/repo-root/index.mjs');
  mkdirSync(dirname(repoRootLib), { recursive: true });
  writeFileSync(
    repoRootLib,
    `export const packageRoot = () => ${JSON.stringify(join(root, 'packages/core'))};\n`
  );
  writeFileSync(copy, readFileSync(new URL('./index.mjs', import.meta.url), 'utf8'));
  await assert.rejects(
    import(pathToFileURL(copy).href),
    /no longer declares `export const ENGINE_NAMES/
  );
});
