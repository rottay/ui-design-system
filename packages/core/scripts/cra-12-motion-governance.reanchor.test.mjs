/**
 * CRA-12 re-anchor drills.
 *
 * WHY THIS FILE EXISTS. On 2026-07-26 the ui-design-system rows were re-anchored
 * to the accepted commit `a5a4c3b4`, because scanning a clean archive of that
 * commit reproduced every one of the 12 findings the gate was reporting: they
 * were stale registry rows, not R1 regressions.
 *
 * Re-anchoring a ratchet is exactly the move that destroys a gate's credibility
 * when it is done casually, so it needs its own guard. These drills assert that
 * the re-anchored gate STILL BITES -- that it was reconciled, not disarmed.
 */

import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const HERE = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(HERE, '..');
const gate = resolve(HERE, 'cra-12-motion-governance.mjs');
const registryPath = resolve(HERE, 'cra-12-motion-governance.registry.json');

function runGate(extra = []) {
  return spawnSync(
    process.execPath,
    [gate, '--repositories', 'ui-design-system', ...extra],
    { cwd: packageRoot, encoding: 'utf8' },
  );
}

test('the re-anchored DS slice passes on the current tree', () => {
  const result = runGate();
  assert.equal(result.status, 0, `expected PASS, got:\n${result.stdout}${result.stderr}`);
});

test('DRILL: a NEW raw motion timing turns the gate red', () => {
  // The property that matters after a re-anchor: the ratchet still catches
  // growth. A gate re-anchored to "whatever is there now" but unable to detect
  // additions would be strictly worse than no gate.
  //
  // The injection goes into the REAL scanned tree, because a partial copy
  // changes every digest and drowns the signal in unrelated drift. The file is
  // uniquely named and removed in `finally`.
  const injected = resolve(
    packageRoot,
    'src/foundation/tokens/css/__cra12-reanchor-drill.css',
  );

  assert.equal(runGate().status, 0, 'precondition: the gate is green before injection');

  try {
    writeFileSync(
      injected,
      '/* transient drill artifact */\n' +
        '.cra12-reanchor-drill {\n' +
        '  transition-duration: 12345ms;\n' +
        '  animation-duration: 6789ms;\n' +
        '}\n',
      'utf8',
    );

    const result = runGate();
    assert.notEqual(result.status, 0, 'a new raw timing must turn CRA-12 red');
    assert.match(result.stderr, /raw-motion-timing/);
    assert.match(result.stderr, /ds-internal/);
  } finally {
    rmSync(injected, { force: true });
  }

  assert.equal(runGate().status, 0, 'the tree must be restored after the drill');
});

test('the registry records the re-anchor as a one-off, not a routine update', () => {
  // Provenance is what stops the next person reading these numbers as a normal
  // baseline refresh and repeating it.
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  const reanchored = Object.entries(registry.baselines).filter(
    ([, contract]) => contract.reanchor,
  );

  assert.ok(reanchored.length >= 3, 'expected the re-anchored channels to record provenance');
  for (const [channel, contract] of reanchored) {
    const { reanchor } = contract;
    assert.equal(reanchor.kind, 'one-off-reanchor', `${channel}: wrong provenance kind`);
    assert.match(reanchor.snapshotSha, /^[0-9a-f]{7,40}$/, `${channel}: no snapshot SHA`);
    assert.ok(reanchor.owner, `${channel}: no owner`);
    assert.ok(
      reanchor.notAnImprovement?.length > 40,
      `${channel}: must state that the count is inherited debt, not an achievement`,
    );
    assert.ok(
      reanchor.doNotRepeat?.length > 40,
      `${channel}: must state that this is not the routine way to update a baseline`,
    );
  }
});

test('every baseline channel still carries owner, reason and a future expiry', () => {
  // The re-anchor must not have dropped the governance metadata the gate itself
  // enforces.
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  for (const [channel, contract] of Object.entries(registry.baselines)) {
    assert.ok(contract.owner, `${channel}: missing owner`);
    assert.ok(contract.reason, `${channel}: missing reason`);
    assert.ok(contract.expires, `${channel}: missing expiry`);
    assert.ok(
      new Date(`${contract.expires}T23:59:59Z`) > new Date('2026-07-26T00:00:00Z'),
      `${channel}: expiry is already in the past`,
    );
  }
});
