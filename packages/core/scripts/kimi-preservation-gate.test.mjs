/** No-loss drills: each preservation law must be able to fail. */
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = (...a) => {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts/kimi-preservation-manifest.mjs'), ...a], { cwd: ROOT, encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}` };
};
test('positive: 80/80 decided, 506 classified, zero undecided', () => {
  const { status, out } = run('--check');
  assert.equal(status, 0, out);
});
test('drill: an undecided prototoken fails', () => {
  const { status, out } = run('--drill=undecided');
  assert.notEqual(status, 0);
  assert.match(out, /undecided prototoken/);
});
test('drill: RETIRE without successor/death proof fails', () => {
  const { status, out } = run('--drill=retire-no-proof');
  assert.notEqual(status, 0);
  assert.match(out, /RETIRE without successor/);
});
test('drill: a Kimi-premium dead writer marked RETIRE is FORBIDDEN', () => {
  const { status, out } = run('--drill=kimi-retire');
  assert.notEqual(status, 0);
  assert.match(out, /FORBIDDEN: Kimi-premium/);
});
test('drill: IMPLEMENTED with placeholder evidence is rejected (FASE A)', () => {
  const { status, out } = run('--drill=placeholder');
  assert.notEqual(status, 0);
  assert.match(out, /placeholder evidence/);
});
