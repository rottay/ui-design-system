/**
 * kimi-worklist drills, grouped for CI (Codex final remediation blockers 2+4).
 * Named-cause assertions: each drill's detected violation must match ITS
 * message — with a temporarily red base, count>0 would certify nothing.
 * Hermetic in-memory injection; the tree is never mutated.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'kimi-worklist-gate.mjs');
const run = (name) => spawnSync('node', [SCRIPT, `--drill=${name}`], { encoding: 'utf8' });

const CASES = [
  ['unshipped-owner', /TOMBSTONE|shipping-reachable/],
  ['rule-only-proof', /una regla CSS no es un part|RENDERED_NODE sin renderProof\.tsx/],
  ['tombstone-row', /TOMBSTONE/],
  ['nonexistent-path', /NO EXISTE/],
  ['missing-selector', /NO aparece/],
  ['prose-instead-of-structure', /PROSA|estructura gobernada/],
  ['wrong-repository', /fuera de allowlist/],
  ['stale-commit-or-digest', /RANCIA|fileDigest/],
  ['stale-commit', /commit.*HEAD|commit\/path NO EXISTE/],
  ['invalid-consumer-kind', /consumerKind fuera de vocabulario/],
  ['mismatched-family', /no corresponde a la familia/],
];

for (const [name, causeRe] of CASES) {
  test(`drill "${name}" red por su causa nombrada`, () => {
    const r = run(name);
    assert.equal(r.status, 0, `drill runner falló: ${r.stderr}`);
    assert.match(r.stdout + r.stderr, causeRe, `la violación detectada no es la causa del drill: ${(r.stdout + r.stderr).slice(0, 300)}`);
  });
}

test('meta: un drill no-op FALLA (el runner no puede ser vacuo)', () => {
  const r = run('bogus-no-op');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /DRILL FAIL/);
});
