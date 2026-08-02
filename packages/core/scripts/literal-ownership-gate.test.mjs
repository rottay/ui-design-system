/**
 * literal-ownership drills, grouped for CI (Codex final remediation blocker 4).
 * Each drill must go red FOR ITS NAMED CAUSE (message match, never bare
 * count>0 — a red-for-another-reason must not certify a drill), and the
 * meta-drill proves a no-op drill FAILS. Hermetic: drills self-inject in
 * memory; the tree is never mutated.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'literal-ownership-gate.mjs');
const run = (name) => spawnSync('node', [SCRIPT, `--drill=${name}`], { encoding: 'utf8' });

const CASES = [
  ['duplicate-one', /DUPLICADA|missing-real-site|stale-extra-row/],
  ['drop-one', /LITERAL VIVO SIN FILA|ratchet secundario/],
  ['missing-real-site', /LITERAL VIVO SIN FILA/],
  ['stale-extra-row', /FILA SIN LITERAL/],
  ['duplicate-key', /DUPLICADA/],
  ['broken-without-owner', /sin owner\+razón\+prueba/],
  ['pin-drift', /ratchet secundario/],
  ['planted-literal', /LITERAL VIVO SIN FILA/],
];

for (const [name, causeRe] of CASES) {
  test(`drill "${name}" red por su causa nombrada`, () => {
    const r = run(name);
    assert.equal(r.status, 0, `drill runner falló: ${r.stderr}`);
    assert.match(r.stdout, /drill "[a-z-]+" OK/);
    assert.match(r.stdout, causeRe, `la violación detectada no es la causa del drill: ${r.stdout}`);
  });
}

test('meta: un drill no-op FALLA (el runner no puede ser vacuo)', () => {
  const r = run('bogus-no-op');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /DRILL FAIL/);
});
