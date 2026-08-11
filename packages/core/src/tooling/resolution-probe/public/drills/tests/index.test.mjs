/**
 * @fileoverview The drills, as assertions.
 *
 * Run: node --test src/tooling/resolution-probe/quality/drills/tests/index.test.mjs
 *
 * NOT registered in any CI manifest, and deliberately named `.test.mjs`: the
 * vitest project globs `src/**\/*.test.{ts,tsx}`, so this file is invisible to
 * the suite and cannot lengthen it. It is run by hand, by whoever is about to
 * trust a number this instrument produced.
 *
 * The browser drills open one Chromium. They are slow by the standards of a
 * unit test and fast by the standards of being wrong.
 *
 * @module Tooling/ResolutionProbe/Quality/Drills/Tests
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { diffArtifacts } from '../../../composition/diff/index.mjs';
import { serialiseArtifact } from '../../../composition/run/index.mjs';
import { firstDifferingLine, resolveBundle, sha256 } from '../../../runtime/bundle/index.mjs';
import { declaredProperties, FIXTURES } from '../../../foundation/roster/index.mjs';
import { rootAttributes, rootAttributesToHtml } from '../../../foundation/scope/index.mjs';
import {
  runBrowserDrills,
  runFixtureDrill,
  runFormulaAgreementDrill,
  runProjectionDrill,
} from '../index.mjs';

test('movement drill: the dial moves a derived radius, and does NOT move its shadowed twin', async () => {
  const { movement } = await runBrowserDrills();

  assert.equal(
    movement.witness['--ds-radius-scale'],
    '2',
    'the dial did not land at all, so neither verdict below means anything',
  );
  assert.equal(movement.live.before, '4px');
  assert.equal(
    movement.live.after,
    '8px',
    'POSITIVE CONTROL FAILED: a radius that derives from the dial did not move. ' +
      'Every inert verdict this harness produces is void until this passes.',
  );
  assert.equal(movement.liveMoved, true);

  assert.equal(movement.shadowed.before, '10px');
  assert.equal(
    movement.shadowed.after,
    '10px',
    'INJECTED DEFECT NOT DETECTED: a token flat-declared at the tenant scope above its ' +
      'derivation moved anyway, so this harness cannot tell a live dial from a dead one.',
  );
  assert.equal(movement.shadowedMoved, false);
});

test('canary drill: an unapplied bundle throws instead of reporting zeros', async () => {
  const { canary } = await runBrowserDrills();
  assert.equal(
    canary.threw,
    true,
    'a stylesheet that declares none of the canary tokens was measured anyway; its initial ' +
      'values would have been published as inert channels',
  );
  assert.match(canary.message, /did not apply for scope/);
  assert.match(canary.message, /Refusing to publish/);
});

test('fixture drill: a renamed selector is reported unmatched, not measured', () => {
  const { intact, broken } = runFixtureDrill();
  assert.equal(intact.matched, true, 'positive control: the real selectors must match');
  assert.deepEqual(intact.missing, []);
  assert.equal(broken.matched, false, 'a renamed selector was not detected');
  assert.equal(broken.missing.length, 1);
});

test('projection drill: the scope vocabulary still agrees with the SSR projection', () => {
  const result = runProjectionDrill();
  assert.equal(
    result.agrees,
    true,
    `the harness and resolveDocumentRootAttributes disagree about root attributes. ` +
      `missing from harness: ${result.missingFromHarness.join(', ') || 'none'}; ` +
      `invented by harness: ${result.inventedByHarness.join(', ') || 'none'}`,
  );
});

test('formula drill: the fresh composition agrees with the repository staleness gate', async () => {
  const result = await runFormulaAgreementDrill();
  assert.ok(
    Object.keys(result.gate).length > 0,
    'the staleness gate reported no divergence at all — either it now passes (in which case ' +
      'dist is fresh and this drill needs rewriting) or its output format changed',
  );
  assert.equal(
    result.agrees,
    true,
    'this harness recomposes the bundles with a formula transcribed from build-vertical-css.mjs. ' +
      'It no longer agrees with the gate about where the shipped bundle diverges from source, ' +
      `so "fresh" is fresh only by its own definition: ${JSON.stringify(result.comparisons)}`,
  );
});

test('scope: an undeclared theme is not silently allowed', () => {
  assert.throws(() => rootAttributes({ vertical: 'platform', theme: 'auto' }), /unknown theme/);
  assert.throws(() => rootAttributes({ vertical: 'nope', theme: 'light' }), /unknown vertical/);
});

test('scope: the valueless data-ds-root attribute serialises bare', () => {
  const html = rootAttributesToHtml(rootAttributes({ vertical: 'platform', theme: 'dark' }));
  assert.match(html, /(^| )data-ds-root( |$)/, 'data-ds-root must not serialise as an empty pair');
  assert.match(html, /data-tenant="rottay"/, 'platform keys on the rottay slug, not its own name');
  assert.match(html, /data-vertical="platform"/);
});

test('bundle: fresh composition is reproducible and its drift against dist is stated', async () => {
  const first = await resolveBundle({ vertical: 'platform', mode: 'fresh' });
  const second = await resolveBundle({ vertical: 'platform', mode: 'fresh' });
  assert.equal(first.provenance.sha256, second.provenance.sha256);
  assert.equal(sha256(first.css), first.provenance.sha256);
  assert.equal(first.provenance.freshnessProven, true);
  assert.ok(
    first.provenance.shippedDistDrift,
    'a fresh bundle must always state its relationship to the shipped one',
  );
});

test('bundle: styles/ is byte-identical to dist/, so it is not a second opinion', async () => {
  const shipped = await resolveBundle({ vertical: 'platform', mode: 'dist' });
  assert.equal(shipped.provenance.distMatchesStyles, true);
  assert.equal(
    shipped.provenance.freshnessProven,
    false,
    'reading a shipped bundle must never claim proven freshness',
  );
});

test('bundle: firstDifferingLine points at the line, not at the file', () => {
  assert.equal(firstDifferingLine('a\nb\nc', 'a\nb\nc'), null);
  assert.equal(firstDifferingLine('a\nb\nc', 'a\nX\nc').line, 2);
  assert.equal(firstDifferingLine('a\nb', 'a\nb\nc').line, 3);
});

test('roster: every fixture declares selectors and at least one property', () => {
  for (const fixture of FIXTURES) {
    assert.ok(fixture.requiresSelectors?.length > 0, `${fixture.id} declares no selectors`);
    assert.ok(fixture.targets.length > 0, `${fixture.id} declares no targets`);
    for (const target of fixture.targets) {
      assert.ok(target.properties.length > 0, `${fixture.id}/${target.id} reads nothing`);
    }
  }
  assert.ok(declaredProperties().length > 0);
});

test('serialisation: key order cannot depend on insertion order', () => {
  const a = serialiseArtifact({ b: 1, a: { d: 2, c: 3 } });
  const b = serialiseArtifact({ a: { c: 3, d: 2 }, b: 1 });
  assert.equal(a, b);
});

test('diff: a value change is reported; a bundle-sha change alone stays comparable', () => {
  const base = {
    artifactVersion: 1,
    scopeOfRun: { fixtures: ['f'], verticals: ['platform'], themes: ['light'], engine: 'modern' },
    provenance: { bundleMode: 'fresh', browser: {}, bundles: { platform: { sha256: 'aaa' } } },
    readings: { 'platform/light/modern/both': { 'f/root': { present: true, values: { x: '1px' } } } },
  };
  const changed = structuredClone(base);
  changed.provenance.bundles.platform.sha256 = 'bbb';
  changed.readings['platform/light/modern/both']['f/root'].values.x = '2px';

  const result = diffArtifacts(base, changed);
  assert.equal(result.comparable, true, 'a changed bundle is the POINT of a diff, not a defect');
  assert.equal(result.inputDifferences.length, 1);
  assert.equal(result.totals.changedRows, 1);
  assert.deepEqual(result.changes[0], {
    kind: 'value-changed',
    scope: 'platform/light/modern/both',
    target: 'f/root',
    property: 'x',
    before: '1px',
    after: '2px',
  });
});

test('diff: a different bundle MODE is not comparable', () => {
  const base = {
    artifactVersion: 1,
    scopeOfRun: {},
    provenance: { bundleMode: 'fresh', browser: {}, bundles: {} },
    readings: {},
  };
  const other = structuredClone(base);
  other.provenance.bundleMode = 'dist';
  const result = diffArtifacts(base, other);
  assert.equal(result.comparable, false);
  assert.equal(result.provenanceDifferences[0].field, 'provenance.bundleMode');
});
