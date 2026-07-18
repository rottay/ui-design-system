/**
 * Registered executable evidence for the surface-profile-overrides claim
 * (gat-07-public-claim-floor.json). Pins exact parity between the claim floor
 * and the tree in both directions: every registered consumer applies the hook,
 * and no unregistered surface page applies it. Wiring or unwiring a page
 * without re-adjudicating the claim floor fails this test.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CORE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FLOOR = JSON.parse(readFileSync(join(CORE_ROOT, 'scripts/gat-07-public-claim-floor.json'), 'utf8'));
const CLAIM = FLOOR.claims.find((claim) => claim.id === 'surface-profile-overrides');
const HOOK_CALL = /useSurfaceProfileDefaultsWithOverrides\s*\(/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.tsx?$/.test(entry) && !/\.d\.ts$/.test(entry)) out.push(path);
  }
  return out;
}

test('claim floor shape matches the reconciled declared/applied model', () => {
  assert.equal(CLAIM.runtimeStatus, 'declared-33-applied-11');
  assert.equal(CLAIM.productionConsumers.length, CLAIM.requiredAssertions.staticallyResolvedSurfaceHookCalls);
  assert.equal(CLAIM.executableAssertions.length, CLAIM.requiredAssertions.registeredExecutableEvidence);
});

test('every registered production consumer applies the overrides hook', () => {
  for (const consumer of CLAIM.productionConsumers) {
    const text = readFileSync(join(CORE_ROOT, consumer), 'utf8');
    assert.match(text, HOOK_CALL, `${consumer} is registered as a consumer but does not call the hook`);
  }
});

test('no unregistered source file applies the overrides hook', () => {
  const registered = new Set(CLAIM.productionConsumers);
  const offenders = [];
  for (const path of walk(join(CORE_ROOT, 'src'))) {
    const relative = path.slice(CORE_ROOT.length + 1);
    if (/\/tests\/|\/__tests__\//.test(relative)) continue;
    if (!HOOK_CALL.test(readFileSync(path, 'utf8'))) continue;
    if (relative.endsWith('src/ui/surfaces/runtime/profile-defaults/overrides/index.ts')) continue;
    if (!registered.has(relative)) offenders.push(relative);
  }
  assert.deepEqual(
    offenders,
    [],
    'files applying the hook without claim-floor registration; re-adjudicate the claim before wiring',
  );
});
