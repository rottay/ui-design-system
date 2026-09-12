import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { COMPILER_MODULES } from '../compiler-bootstrap/index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const root = findPackageRoot(dirname(fileURLToPath(import.meta.url)));
const { scripts } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const GENERATOR = 'scripts/build/verticals/bundle-build/index.mjs';

/** The `build` chain, one step per `&&`, with `pnpm run x` expanded to x's own command. */
function buildSteps() {
  return scripts.build.split('&&').map((step) => {
    const trimmed = step.trim();
    const named = /^pnpm run ([\w:-]+)$/u.exec(trimmed);
    return { step: trimmed, command: named ? scripts[named[1]] : trimmed };
  });
}

function indexOf(steps, predicate, label) {
  const index = steps.findIndex(predicate);
  assert.notEqual(index, -1, `build has no ${label} step: ${scripts.build}`);
  return index;
}

test('the runtime module is generated before any step that compiles it', () => {
  const steps = buildSteps();
  const generate = indexOf(
    steps,
    ({ command }) => command.includes(GENERATOR) && !command.includes('--verify-dist'),
    'artifact generation',
  );
  assert.ok(generate < indexOf(steps, ({ command }) => command === 'tsc', 'tsc'));
  assert.ok(generate < indexOf(steps, ({ command }) => command.startsWith('vite build'), 'vite build'));
  assert.equal(
    steps.filter(({ command }) => command.includes(GENERATOR) && !command.includes('--verify-dist')).length,
    1,
    'the generator runs once per build',
  );
});

test('the shipped runtime block is verified after the bundle and before the stamp', () => {
  const steps = buildSteps();
  const verify = indexOf(steps, ({ command }) => command.includes(`${GENERATOR} --verify-dist`), 'dist verification');
  assert.ok(verify > indexOf(steps, ({ command }) => command.startsWith('vite build'), 'vite build'));
  assert.ok(verify < indexOf(steps, ({ command }) => command.includes('scripts/build/stamp/index.mjs') && !command.includes('--open-session'), 'stamp'));
});

test('every bootstrap compiler module is a real source module', () => {
  for (const path of Object.values(COMPILER_MODULES)) {
    assert.ok(existsSync(resolve(root, 'src', `${path}.ts`)), `src/${path}.ts`);
  }
});
