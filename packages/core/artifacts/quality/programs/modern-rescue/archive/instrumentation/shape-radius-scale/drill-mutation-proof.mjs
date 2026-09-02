/**
 * Mutation proof for the two `shape.radius-scale` regression fences.
 *
 * A fence that has only ever been seen to pass has not been seen to work. This
 * replays both fences against the manifest AS IT WAS AT HEAD (the anti-door),
 * read with `git show` into /tmp — nothing in the worktree is mutated.
 *
 * Expected: both fences FAIL on the HEAD manifest and PASS on the corrected one.
 *
 * Run: node test-artifacts/quality-evidence/wo-cra-23/F4B/shape-radius-scale/drill-mutation-proof.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const { buildIngressInput } = await import(
  resolve(CORE, 'src/tooling/resolution-probe/runtime/ingress/index.mjs')
);

// The two fences, replayed exactly as the test file states them.
function fenceLiteralPath(m) {
  const path = m.ingress.staticBrandThemePath;
  assert.equal(path, 'surfaces.radiusScale');
  assert.doesNotMatch(path, /[*{}( ]/u);
  assert.doesNotMatch(path, /borderRadius/u);
}
function fenceStopsReachChannel(m) {
  const seen = new Map();
  for (const stop of m.calibration.normalizedStops) {
    const built = buildIngressInput({
      armId: 'static-brand-theme', controlManifest: m, stopId: stop.id,
    });
    assert.equal(built.document?.surfaces?.radiusScale, stop.value);
    assert.equal(Object.hasOwn(built.document.surfaces, 'borderRadius'), false);
    assert.equal(seen.has(stop.value), false);
    seen.set(stop.value, stop.id);
  }
}

const arms = {
  'HEAD (anti-door: surfaces.borderRadius.*)':
    JSON.parse(readFileSync('/private/tmp/f4b-head-shape-radius-scale.json', 'utf-8')),
  'corrected (surfaces.radiusScale)':
    JSON.parse(readFileSync(resolve(CORE, 'manifest/controls/shape.radius-scale.json'), 'utf-8')),
};

let exit = 0;
for (const [label, manifest] of Object.entries(arms)) {
  const expectFail = label.startsWith('HEAD');
  console.log(`\n${label}`);
  console.log(`  declared staticBrandThemePath: ${JSON.stringify(manifest.ingress.staticBrandThemePath)}`);
  for (const [name, fence] of [['literal-path fence', fenceLiteralPath],
                               ['stops-reach-channel fence', fenceStopsReachChannel]]) {
    let failed = false, why = '';
    try { fence(manifest); } catch (e) { failed = true; why = e.message.split('\n')[0].slice(0, 100); }
    const correct = failed === expectFail;
    if (!correct) exit = 1;
    console.log(`  ${correct ? 'OK ' : 'BAD'}  ${name}: ${failed ? 'FAILED' : 'passed'}` +
                `${expectFail ? ' (expected FAILED)' : ' (expected passed)'}` +
                `${failed ? `\n         -> ${why}` : ''}`);
  }
}
console.log(exit === 0
  ? '\nPROOF OK — both fences detect the anti-door and accept the corrected door.'
  : '\nPROOF BROKEN — a fence did not behave as required.');
process.exit(exit);
