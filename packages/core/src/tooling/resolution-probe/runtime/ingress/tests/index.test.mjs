/**
 * @fileoverview Negative drills for the two ingress arms.
 *
 * Run: node --test src/tooling/resolution-probe/runtime/ingress/tests/index.test.mjs
 *
 * No compiler is executed here and no browser is opened. The compilers are
 * TypeScript compiled into `dist/`, and a mechanics checkpoint that imported a
 * build product would be testing whether somebody had run a build. What IS
 * tested is everything the harness itself decides: where each arm lands, that a
 * payload without a compiler binding is refused, that the input document is
 * built at the path the MANIFEST declares, and that a lowering which emits none
 * of the declared channels is a finding rather than an empty arm.
 *
 * @module Tooling/ResolutionProbe/Runtime/Ingress/Tests
 */

import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';

import { readManifest } from '../../../foundation/negative-controls/index.mjs';
import { CORE_ROOT } from '../../../foundation/paths/index.mjs';
import {
  assertArmProvenance,
  assertArmsMatchManifest,
  buildIngressInput,
  composeDbArm,
  composeStaticArm,
  INGRESS_ARM_IDS,
  INGRESS_ARMS,
  loadCompilerArms,
  lowerStop,
  tenantArmSelector,
} from '../index.mjs';

const CONTROL_MANIFEST = readManifest(
  resolve(CORE_ROOT, 'scripts/quality-evidence/programs/modern-rescue/manifest/controls/spacing.rhythm.json'),
);

const PRODUCED_BY = {
  module: 'dist/infrastructure/compilers/kernel/runtime/brand-theme/index.js',
  exportName: 'compileBrandTheme',
  input: { path: 'surfaces.rhythm', stopId: 'airy' },
};

test('the two arms are the two doors the manifest declares, and they land in different places', () => {
  assert.deepEqual([...INGRESS_ARM_IDS], ['static-brand-theme', 'db-tenant-theme']);
  assert.notEqual(
    INGRESS_ARMS['static-brand-theme'].position,
    INGRESS_ARMS['db-tenant-theme'].position,
  );
  for (const spec of Object.values(INGRESS_ARMS)) {
    assert.ok(
      CONTROL_MANIFEST.ingress[spec.manifestIngressKey],
      `${spec.id} names a manifest ingress key the control does not declare`,
    );
  }
});

test('the static arm selector is the one the generated artifacts emit', () => {
  assert.equal(
    tenantArmSelector('rottay'),
    ":is(html[data-tenant='rottay'], :where([data-ds-root][data-vertical='rottay']))",
    'Rottay keys on one canonical slug; a hand-typed selector would drift from the artifacts',
  );
  assert.throws(() => tenantArmSelector('none'), /carries no tenant arm/);
});

test('positive control: a static arm appends a tenant block and leaves the baseline untouched', () => {
  const arm = composeStaticArm({
    vertical: 'rottay',
    variables: { '--ds-rhythm-scale': '1.2' },
    producedBy: PRODUCED_BY,
  });
  const baseline = ':root { --ds-rhythm-scale: 1; }';
  const mutated = arm.mutateCss(baseline);
  assert.ok(mutated.startsWith(baseline), 'the baseline bytes must survive verbatim');
  assert.ok(mutated.includes("html[data-tenant='rottay']"));
  assert.ok(mutated.includes('--ds-rhythm-scale: 1.2;'));
  assert.equal(
    arm.mutateCss(baseline).length > baseline.length,
    true,
    'removal re-serves the baseline string, so the mutation must be additive',
  );
});

test('positive control: a DB arm carries no CSS, because it writes inline on the root', () => {
  const arm = composeDbArm({
    variables: { '--ds-rhythm-scale': '1.2' },
    producedBy: { ...PRODUCED_BY, exportName: 'compileAppearanceVariables' },
  });
  assert.equal(arm.position, 'root-inline-style');
  const baseline = ':root { --ds-rhythm-scale: 1; }';
  assert.equal(arm.mutateCss(baseline), baseline);
});

test('negative drill: a payload with NO compiler binding is refused', () => {
  assert.throws(
    () => composeDbArm({ variables: { '--ds-rhythm-scale': '1.2' } }),
    /needs a producedBy binding/,
    'a variable map the harness wrote itself proves only that the harness can multiply',
  );
  assert.throws(() => assertArmProvenance({ module: 'x' }), /missing: exportName, input/);
});

test('negative drill: an EMPTY lowering is a finding, not an arm', () => {
  assert.throws(
    () => composeStaticArm({ vertical: 'rottay', variables: {}, producedBy: PRODUCED_BY }),
    /carries no variable/,
  );
});

test('negative drill: an arm may carry custom properties only', () => {
  assert.throws(
    () =>
      composeDbArm({ variables: { 'font-size': '12px' }, producedBy: PRODUCED_BY }),
    /custom properties only/,
  );
});

test('the lowering input is built at the path the MANIFEST declares, not a remembered one', () => {
  const staticInput = buildIngressInput({
    armId: 'static-brand-theme',
    controlManifest: CONTROL_MANIFEST,
    stopId: 'airy',
  });
  assert.equal(staticInput.path, CONTROL_MANIFEST.ingress.staticBrandThemePath);
  assert.deepEqual(staticInput.document, { surfaces: { rhythm: 'airy' } });

  const dbInput = buildIngressInput({
    armId: 'db-tenant-theme',
    controlManifest: CONTROL_MANIFEST,
    stopId: 'tight',
  });
  assert.equal(dbInput.path, CONTROL_MANIFEST.ingress.dbTenantThemePath);
  assert.deepEqual(dbInput.document, { appearance: { general: { rhythm: 'tight' } } });
});

test('negative drill: a stop the manifest does not declare is refused', () => {
  assert.throws(
    () =>
      buildIngressInput({
        armId: 'db-tenant-theme',
        controlManifest: CONTROL_MANIFEST,
        stopId: 'roomy',
      }),
    /is not a normalized stop/,
  );
});

test('positive control: lowerStop keeps only the declared channels and records provenance', () => {
  const lowered = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: CONTROL_MANIFEST,
    stopId: 'airy',
    // A test double standing in for compileAppearanceVariables: the mechanics
    // under test are the extraction and the provenance, not the arithmetic.
    compile: () => ({ variables: { '--ds-rhythm-scale': '1.2', '--ds-unrelated': 'x' } }),
  });
  assert.deepEqual(lowered.variables, { '--ds-rhythm-scale': '1.2' });
  assert.deepEqual(lowered.producedBy.emittedChannels, ['--ds-rhythm-scale']);
  assert.deepEqual(lowered.producedBy.omittedChannels, ['--ds-rhythm-effective-scale']);
  assert.equal(lowered.producedBy.input.path, 'appearance.general.rhythm');
  assert.equal(lowered.producedBy.exportName, 'compileAppearanceVariables');
});

test('negative drill: a compiler that emits NONE of the declared channels throws', () => {
  assert.throws(
    () =>
      lowerStop({
        armId: 'static-brand-theme',
        controlManifest: CONTROL_MANIFEST,
        stopId: 'airy',
        vertical: 'rottay',
        compile: () => ({ variables: { '--ds-something-else': '1.2' } }),
      }),
    /emitted none of the declared channels/,
    'an arm carrying an empty map would later be reported as "the control moved nothing"',
  );
});

test('positive control: lowerStop reshapes the document into the REAL compiler argument shape', () => {
  // compileAppearanceVariables(appearance: TenantAppearance) destructures
  // appearance.general immediately -- so the compiler must see {general:{...}},
  // never the DB document's own {appearance:{general:{...}}} wrapper.
  let dbSeen = null;
  lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: CONTROL_MANIFEST,
    stopId: 'airy',
    compile: (input) => {
      dbSeen = input;
      return { variables: { '--ds-rhythm-scale': '1.2' } };
    },
  });
  assert.deepEqual(dbSeen, { general: { rhythm: 'airy' } });

  // compileBrandTheme(input: BrandCompilerInput) destructures
  // { brandTheme, tenantSlug } immediately -- so the compiler must see the
  // BrandTheme fragment wrapped under `brandTheme`, alongside the tenant slug
  // the manifest path never carries.
  let staticSeen = null;
  lowerStop({
    armId: 'static-brand-theme',
    controlManifest: CONTROL_MANIFEST,
    stopId: 'airy',
    vertical: 'rottay',
    compile: (input) => {
      staticSeen = input;
      return { variables: { '--ds-rhythm-scale': '1.2' } };
    },
  });
  assert.deepEqual(staticSeen, { brandTheme: { surfaces: { rhythm: 'airy' } }, tenantSlug: 'rottay' });
});

test('negative drill: the db arm refuses a document with no "appearance" root', () => {
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: { ...CONTROL_MANIFEST, ingress: { dbTenantThemePath: 'general.rhythm' } },
        stopId: 'airy',
        compile: () => ({ variables: { '--ds-rhythm-scale': '1.2' } }),
      }),
    /has no "appearance" object at its root/,
  );
});

test('negative drill: the static arm refuses to compile with no tenantSlug', () => {
  assert.throws(
    () =>
      lowerStop({
        armId: 'static-brand-theme',
        controlManifest: CONTROL_MANIFEST,
        stopId: 'airy',
        compile: () => ({ variables: { '--ds-rhythm-scale': '1.2' } }),
      }),
    /needs a tenantSlug|needs --vertical/,
  );
});

test('negative drill: an arm whose lowered path disagrees with the manifest is reported', () => {
  const arm = composeDbArm({
    variables: { '--ds-rhythm-scale': '1.2' },
    producedBy: {
      module: 'dist/.../appearance/index.js',
      exportName: 'compileAppearanceVariables',
      input: { path: 'appearance.general.spacing' },
    },
  });
  const agreement = assertArmsMatchManifest({ controlManifest: CONTROL_MANIFEST, arms: [arm] });
  assert.equal(agreement.ok, false);
  assert.match(agreement.failures[0].reason, /appearance\.general\.spacing.*appearance\.general\.rhythm/);
});

test('negative drill: a compiler module with no callable export is refused, not fabricated', async () => {
  await assert.rejects(
    () =>
      loadCompilerArms({
        importModule: async () => ({}),
        assertFresh: () => ({ ok: true, failures: [] }),
      }),
    /exports no callable/,
  );
});

test('negative drill: stale compiled arms are refused before they can be imported', async () => {
  let imported = false;
  await assert.rejects(
    () =>
      loadCompilerArms({
        importModule: async () => {
          imported = true;
          return {};
        },
        assertFresh: () => ({ ok: false, failures: ['dist is stale'] }),
      }),
    /dist is stale/,
  );
  assert.equal(imported, false);
});

test('loadCompilerArms claims freshness only after the dist gate proves it', async () => {
  const loaded = await loadCompilerArms({
    importModule: async () => ({
      compileBrandTheme: () => ({}),
      compileAppearanceVariables: () => ({}),
    }),
    assertFresh: () => ({ ok: true, failures: [] }),
  });
  for (const arm of Object.values(loaded)) {
    assert.equal(arm.provenance.freshnessProven, true);
    assert.match(arm.provenance.freshnessNote, /build-input fingerprint/);
    assert.ok(arm.provenance.sourceOfTruth.startsWith('src/'));
  }
});

test('negative drill: manifest agreement rejects a forged compiler module or export', () => {
  const arm = composeDbArm({
    variables: { '--ds-rhythm-scale': '1.2' },
    producedBy: {
      module: 'dist/fake/compiler.js',
      exportName: 'compileSomethingElse',
      input: { path: 'appearance.general.rhythm', stopId: 'airy' },
    },
  });
  const agreement = assertArmsMatchManifest({ controlManifest: CONTROL_MANIFEST, arms: [arm] });
  assert.equal(agreement.ok, false);
  assert.ok(agreement.failures.some((row) => /compiler module/.test(row.reason)));
  assert.ok(agreement.failures.some((row) => /compiler export/.test(row.reason)));
});
