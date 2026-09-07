/**
 * The drills for `controls-catalog`. Each one has to produce ITS OWN cause: a
 * drill credited by a pre-existing baseline failure proves the tree is red, not
 * that the gate can see.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { DRILL_CASES, DRILL_NAMES, build, check, parseCommand } from './index.mjs';
import { readThemeCatalog } from '../../../libraries/theme-catalog/index.mjs';

test('the grammar is closed and rejects everything else', () => {
  assert.deepEqual(parseCommand(['--check']), { ok: true, command: 'check' });
  assert.deepEqual(parseCommand(['--write']), { ok: true, command: 'write' });
  assert.deepEqual(parseCommand(['--drill=stale']), { ok: true, command: 'drill', drill: 'stale' });
  for (const argv of [[], ['--check', '--write'], ['--drill'], ['--drill='], ['--drill=nope'], ['x']]) {
    assert.equal(parseCommand(argv).ok, false, `${JSON.stringify(argv)} must be rejected`);
  }
});

test('the live view is fresh', () => {
  assert.deepEqual(check(), []);
});

test('the view publishes every catalog row and nothing else', () => {
  const { md } = build();
  const rows = readThemeCatalog();
  for (const row of rows) assert.ok(md.includes(`\`${row.id}\``), `${row.id} must be published`);
  const published = [...md.matchAll(/^\| `([a-z.\-]+)` \| \d+ \|/gmu)].map((match) => match[1]);
  assert.deepEqual([...published].sort(), rows.map((row) => row.id).sort());
});

test('an owner-pending minimum is published AS an example, never as a floor', () => {
  const { md } = build();
  const pending = readThemeCatalog().filter(
    (row) => row.minimumFamilies.kind === 'owner-pending',
  );
  assert.ok(pending.length > 0, 'the fixture needs at least one owner-pending row');
  assert.ok(md.includes('is NOT a binding floor'));
  assert.equal(md.includes('minimum >= 20/25'), false);
});

for (const name of DRILL_NAMES) {
  test(`DRILL ${name}: produces its own cause and is not credited by a baseline failure`, () => {
    const definition = DRILL_CASES[name];
    const failures = check({ drill: name });
    const causal = failures.filter((failure) => definition.matches(failure));
    assert.ok(causal.length > 0, `${name} produced no own cause; got ${JSON.stringify(failures)}`);
    // The live tree is green, so EVERY failure the drill run reports must be
    // the drill's own. That is what makes the verdict causal.
    assert.equal(failures.length, causal.length, `${name} inherited a baseline failure`);
  });
}

test('check() refuses a drill name outside the closed grammar', () => {
  assert.throws(() => check({ drill: 'nope' }), /the grammar is closed/u);
});
