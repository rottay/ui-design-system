/**
 * controls-catalog drills, grouped for CI (Codex blocker 5, 2026-08-02).
 *
 * The protected property: "every published control exists, has a real
 * consumer, and the generated documentation matches the living tree."
 * The three drills self-inject their violation in memory (hermetic — the
 * tree is never mutated); this runner asserts each one BITES, and that a
 * case producing no violation fails loudly instead of passing vacuously.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'controls-catalog.mjs');

function runDrill(name) {
  return spawnSync('node', [SCRIPT, `--drill=${name}`], { encoding: 'utf8' });
}

for (const drill of ['stale', 'missing-control', 'zero-consumer']) {
  test(`drill "${drill}" produces its violation`, () => {
    const r = runDrill(drill);
    assert.equal(r.status, 0, `drill exited ${r.status}: ${r.stderr}`);
    assert.match(r.stdout, /drill "[a-z-]+" OK — \d+ violaci/);
  });
}

test('a drill that produces no violation FAILS (the runner is not vacuous)', () => {
  const r = runDrill('bogus-case-that-injects-nothing');
  assert.equal(r.status, 1, 'a no-op drill must fail, or every future drill regression passes silently');
  assert.match(r.stderr, /DRILL FAIL/);
});
