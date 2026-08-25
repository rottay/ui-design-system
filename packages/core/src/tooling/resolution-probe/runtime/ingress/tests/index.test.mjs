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
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

import { readManifest } from '../../../foundation/negative-controls/index.mjs';
import { CORE_ROOT } from '../../../foundation/paths/index.mjs';
import { VERTICALS } from '../../../foundation/scope/index.mjs';
import {
  assertArmProvenance,
  assertArmsMatchManifest,
  assertNoRetiredCompilerBinding,
  buildIngressInput,
  composeDbArm,
  dbTenantIdentity,
  ingressPathMembers,
  resolveIngressMember,
  composeStaticArm,
  INGRESS_ARM_IDS,
  INGRESS_ARMS,
  advancedCompileOptions,
  isLowerableFontStack,
  dbIngressSpace,
  DB_INGRESS_SPACES,
  IngressSpaceError,
  loadCompilerArms,
  assertStopDiscrimination,
  loadStaticBaselines,
  lowerStop,
  RETIRED_DB_COMPILER_EXPORTS,
  staticTenantAuthoredPaths,
  tenantArmSelector,
  verticalDefaultMode,
  classifyStopExclusion,
  StopExclusionError,
  STOP_EXCLUSION_CLASSES,
} from '../index.mjs';

const CONTROL_MANIFEST = readManifest(
  resolve(CORE_ROOT, 'manifest/controls/spacing.rhythm.json'),
);

/* FASE-A: the advanced manifest these drills lower is SYNTHETIC, and it has to
 * be. Censused over the seven advanced controls: every one declares either zero
 * normalized stops or zero CSS output channels -- `responsive.posture` is the
 * only one with stops (3) and it declares no channels because it is data-only,
 * routed to the DATA runner which never passes through `toCompilerInput`. So
 * NO advanced control is lowerable end to end through the CSS arm today, and
 * the branch this phase builds has no live consumer yet by construction.
 *
 * The synthetic keeps a real control's stops and channels and changes ONLY the
 * declared space, so the drills measure the space law and nothing else. The day
 * a real advanced control declares both, it replaces this fixture. */
const ADVANCED_MANIFEST = {
  ...CONTROL_MANIFEST,
  ingress: { dbTenantThemePath: 'visualFoundation.advanced.tokenOverrides' },
};
const ADVANCED_STOP = 'airy';
const FAKE_DIGEST = `sha256-${'a'.repeat(64)}`;

const PRODUCED_BY = {
  module: 'dist/infrastructure/compilers/kernel/runtime/brand-theme/index.js',
  exportName: 'compileBrandTheme',
  input: {
    path: 'surfaces.rhythm',
    stopId: 'airy',
    // H-1 (V1): a static arm must name the vertical baseline it composed onto,
    // so every static fixture in this file carries one. The drill that proves
    // the requirement bites declares its own producedBy WITHOUT it.
    baseline: { source: 'dist/index.js#rottayBrandTheme', digest: 'f'.repeat(64) },
  },
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

test('positive control: the DB arm SERVES the compiled artifact, scoped like production', () => {
  /* AGED EXPECTATION, re-legislated in H-3 phase (a). This asserted the arm
   * carried no CSS "because it writes inline on the root" -- true until phase
   * (a), and false in two places at once (the position AND the untouched CSS).
   * What aged is the transport, not the law: the arm must still be attributable
   * to its compiler and must still leave the baseline byte-identical. */
  const arm = composeDbArm({
    vertical: 'rottay',
    variables: { '--ds-rhythm-scale': '1.2' },
    producedBy: { ...PRODUCED_BY, exportName: 'compileTenantThemeConfig' },
  });
  assert.equal(arm.position, 'tenant-artifact-stylesheet');
  assert.equal(arm.selector, tenantArmSelector('rottay'), 're-scoped onto the scene, not the probe slug');
  const baseline = ':root { --ds-rhythm-scale: 1; }';
  const mutated = arm.mutateCss(baseline);
  assert.notEqual(mutated, baseline, 'the arm now carries CSS');
  assert.ok(mutated.startsWith(baseline), 'and it APPENDS: the baseline bytes are never rewritten');
  assert.ok(mutated.includes('--ds-rhythm-scale: 1.2;'));
});

test('negative drill: a payload with NO compiler binding is refused', () => {
  assert.throws(
    () => composeDbArm({ vertical: 'rottay', variables: { '--ds-rhythm-scale': '1.2' } }),
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
      composeDbArm({ vertical: 'rottay', variables: { 'font-size': '12px' }, producedBy: PRODUCED_BY }),
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
    // A test double standing in for compileTenantThemeConfig: the mechanics
    // under test are the extraction and the provenance, not the arithmetic.
    compile: () => ({ variables: { '--ds-rhythm-scale': '1.2', '--ds-unrelated': 'x' } }),
    vertical: 'rottay',
    provenance: { schemaVersion: 1 },
  });
  assert.deepEqual(lowered.variables, { '--ds-rhythm-scale': '1.2' });
  assert.deepEqual(lowered.producedBy.emittedChannels, ['--ds-rhythm-scale']);
  assert.deepEqual(lowered.producedBy.omittedChannels, ['--ds-rhythm-effective-scale']);
  assert.equal(lowered.producedBy.input.path, 'appearance.general.rhythm');
  assert.equal(lowered.producedBy.exportName, 'compileTenantThemeConfig');
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
  // compileTenantThemeConfig takes the read/compile ENVELOPE, so the stop moves
  // from the manifest's normalized `appearance.general` position into the
  // config's flat `appearance`, carrying the trusted identity columns.
  let dbSeen = null;
  lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: CONTROL_MANIFEST,
    stopId: 'airy',
    compile: (input) => {
      dbSeen = input;
      return { variables: { '--ds-rhythm-scale': '1.2' } };
    },
    vertical: 'rottay',
    provenance: { schemaVersion: 1 },
  });
  assert.deepEqual(dbSeen, {
    schemaVersion: 1,
    mode: 'simple',
    appearance: { rhythm: 'airy' },
    tenantId: 'probe-tenant-rottay',
    slug: 'probe-tenant-rottay',
    verticalKey: 'rottay',
    rowVersion: 1,
  });
  // The DB arm must never compile under a first-party slug: those are reserved
  // code-owned STATIC identities and compileTenantThemeConfig rejects them.
  assert.notEqual(dbSeen.slug, 'rottay');

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
  // AGED_EXPECTATION, re-adjudicated F4B-7. This asserted the FLAT shape
  // `{ brandTheme: { surfaces: { rhythm: 'airy' } } }`, which Z-1 of B-1
  // retired: the static arm now hands the compiler the two floors SEPARATELY,
  // because a flattened object cannot tell a tenant's stop from the vertical's
  // own baseline authoring. The drill's PURPOSE is unchanged -- the lowering
  // reshapes the document into the real compiler argument -- and it is asserted
  // over the shape that exists now: the stop rides `tenantPatch`, the baseline
  // rides `brandTheme`, and here there is no baseline to ride.
  //
  // AGED AGAIN IN B-2, and again the good kind: the shape gained a FOURTH
  // field. The patch now travels with the authorship of the one keypath it
  // wrote, so an assertion that pinned the three-field shape would have been
  // asserting that the arm still tells the compiler no tenant exists. Pinned
  // deeply rather than loosely on purpose -- this drill's whole value is that
  // it notices a shape change instead of tolerating one.
  assert.deepEqual(staticSeen, {
    brandTheme: {},
    tenantPatch: { surfaces: { rhythm: 'airy' } },
    tenantSlug: 'rottay',
    tenantAuthoredPaths: new Set(['surfaces.rhythm']),
  });

  // ...and with a baseline, the two floors stay APART. This is the half the old
  // flat assertion could not express at all.
  let composedSeen = null;
  lowerStop({
    armId: 'static-brand-theme',
    controlManifest: CONTROL_MANIFEST,
    stopId: 'airy',
    vertical: 'rottay',
    base: { typography: { scale: 1.02 } },
    baselineSource: { path: 'fixture', digest: 'f'.repeat(64) },
    compile: (input) => {
      composedSeen = input;
      return { variables: { '--ds-rhythm-scale': '1.2' } };
    },
  });
  assert.deepEqual(composedSeen.brandTheme, { typography: { scale: 1.02 } });
  assert.deepEqual(composedSeen.tenantPatch, { surfaces: { rhythm: 'airy' } });
  // B-2: the authorship rides the patch, and names the patch's own keypath --
  // not the baseline's, which the tenant did not write.
  assert.deepEqual([...composedSeen.tenantAuthoredPaths], ['surfaces.rhythm']);
});

/* FASE-A SUPERSEDES THE MESSAGE THIS DRILL USED TO ASSERT.
 *
 * It reached the generic "has no appearance.general object" throw by declaring
 * `general.rhythm` -- a path under NEITHER document space. That throw described
 * the SYMPTOM (a missing object) for what is really a defect in the manifest's
 * declared space, and it was the only way to reach it: `buildIngressInput`
 * walks the declared path and therefore always builds the node it names. The
 * space law now catches that case first and by name, so the drill asserts the
 * law instead of the symptom -- and asserts which side of the closed set it
 * falls on (W-B). */
test('A1 (W-B): a path under neither space THROWS, and is NOT publishable as an exclusion', () => {
  let thrown = null;
  try {
    lowerStop({
      armId: 'db-tenant-theme',
      controlManifest: { ...CONTROL_MANIFEST, ingress: { dbTenantThemePath: 'general.rhythm' } },
      stopId: 'airy',
      compile: () => ({ variables: { '--ds-rhythm-scale': '1.2' } }),
      vertical: 'rottay',
      provenance: { schemaVersion: 1 },
    });
  } catch (error) {
    thrown = error;
  }
  assert.ok(thrown instanceof IngressSpaceError, 'the third edge throws its own class');
  assert.match(thrown.message, /lives under neither legal document space/);
  assert.match(thrown.message, /appearance\.general\.<rest>/);
  assert.match(thrown.message, /visualFoundation\.<rest>/);
  // W-B: a manifest defect is NOT a stop the compiler refused. Unclassified =>
  // the R-2 hardening re-throws it and the run breaks, instead of the witness
  // set quietly shrinking by one.
  assert.equal(classifyStopExclusion(thrown), null);
  assert.ok(!Object.hasOwn(STOP_EXCLUSION_CLASSES, 'UNKNOWN_INGRESS_SPACE'));
});

test('A1: the space is decided by the DECLARED path -- simple and advanced', () => {
  assert.equal(dbIngressSpace('appearance.general.rhythm'), 'simple');
  assert.equal(dbIngressSpace('visualFoundation.advanced.responsivePosture'), 'advanced');
  assert.deepEqual(Object.values(DB_INGRESS_SPACES).sort(), ['advanced', 'simple']);

  let simpleInput = null;
  lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: CONTROL_MANIFEST,
    stopId: 'airy',
    compile: (input) => {
      simpleInput = input;
      return { variables: { '--ds-rhythm-scale': '1.2' } };
    },
    vertical: 'rottay',
    provenance: { schemaVersion: 1 },
  });
  assert.equal(simpleInput.mode, 'simple');
  assert.ok(simpleInput.appearance, 'simple keeps the general object at `appearance`');
  assert.equal(simpleInput.visualFoundation, undefined);

  let advancedInput = null;
  lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: ADVANCED_MANIFEST,
    stopId: ADVANCED_STOP,
    compile: (input) => {
      advancedInput = input;
      return { variables: { '--ds-rhythm-scale': '1.2' }, verticalEnvelopeDigest: FAKE_DIGEST };
    },
    vertical: 'rottay',
    provenance: { schemaVersion: 1 },
    verticalEnvelopeFor: () => ({ verticalKey: 'rottay' }),
  });
  assert.equal(advancedInput.mode, 'advanced');
  assert.ok(advancedInput.visualFoundation, 'advanced carries the foundation');
  assert.equal(advancedInput.appearance, undefined, 'and NOT an appearance field');
});

test('negative drill: the db arm refuses to hardcode the contract version', () => {
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: CONTROL_MANIFEST,
        stopId: 'airy',
        compile: () => ({ variables: { '--ds-rhythm-scale': '1.2' } }),
        vertical: 'rottay',
      }),
    /TENANT_THEME_SCHEMA_VERSION/,
  );
});

test('negative drill: the db arm refuses to compile with no vertical envelope', () => {
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: CONTROL_MANIFEST,
        stopId: 'airy',
        compile: () => ({ variables: { '--ds-rhythm-scale': '1.2' } }),
        provenance: { schemaVersion: 1 },
      }),
    /needs --vertical/,
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
    vertical: 'rottay',
    variables: { '--ds-rhythm-scale': '1.2' },
    producedBy: {
      module: 'dist/.../appearance/index.js',
      exportName: 'compileTenantThemeConfig',
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
      compileTenantThemeConfig: () => ({}),
      TENANT_THEME_SCHEMA_VERSION: 1,
      // FASE-A: the DB arm now also refuses to load without the envelope
      // resolver, for the same reason and at the same moment as the schema
      // version above.
      getTenantThemeVerticalEnvelope: () => ({ verticalKey: 'rottay' }),
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
    vertical: 'rottay',
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

// ---------------------------------------------------------------------------
// The productive DB door. These load the REAL published modules, so they are
// the drills the previous binding could not have survived.
// ---------------------------------------------------------------------------

test('both arms resolve a callable export from a REAL module, not a test double', async () => {
  const arms = await loadCompilerArms();
  assert.equal(typeof arms['static-brand-theme'].compile, 'function');
  assert.equal(typeof arms['db-tenant-theme'].compile, 'function');
  assert.equal(arms['db-tenant-theme'].provenance.exportName, 'compileTenantThemeConfig');
  // A PUBLISHED subpath, not a deep path a bundler may tree-shake.
  assert.equal(arms['db-tenant-theme'].provenance.moduleSubpath, '@rottay/design-system/server');
  assert.doesNotMatch(arms['db-tenant-theme'].provenance.module, /compilers\/kernel\/runtime\/appearance/);
});

test('negative drill: the DB arm may never be rebound to a retired compiler', () => {
  assert.ok(RETIRED_DB_COMPILER_EXPORTS.includes('compileAppearanceVariables'));
  assert.ok(RETIRED_DB_COMPILER_EXPORTS.includes('appearanceGeneralToVariables'));
  assert.equal(
    RETIRED_DB_COMPILER_EXPORTS.includes(INGRESS_ARMS['db-tenant-theme'].compilerExport),
    false,
  );
  for (const retired of RETIRED_DB_COMPILER_EXPORTS) {
    assert.throws(
      () =>
        assertNoRetiredCompilerBinding({
          'db-tenant-theme': { ...INGRESS_ARMS['db-tenant-theme'], compilerExport: retired },
        }),
      /RETIRED DB compiler/,
      `rebinding to ${retired} must throw`,
    );
  }
  assert.throws(
    () =>
      assertNoRetiredCompilerBinding({
        'db-tenant-theme': {
          ...INGRESS_ARMS['db-tenant-theme'],
          compilerModule: 'dist/infrastructure/compilers/kernel/runtime/appearance/index.js',
        },
      }),
    /deep-imports the retired appearance compiler/,
  );
});

test('the retired DB compiler is absent from every PUBLISHED entrypoint', async () => {
  // Ruling 3: a deep .d.ts/JS divergence is non-blocking debt; a symbol that is
  // genuinely public would be a different decision. This pins which world we are in.
  const { createRequire } = await import('node:module');
  const require_ = createRequire(resolve(CORE_ROOT, 'package.json'));
  const exportsMap = require_('./package.json').exports;
  for (const [subpath, entry] of Object.entries(exportsMap)) {
    const target = typeof entry === 'string' ? entry : entry?.import;
    if (typeof target !== 'string' || !target.endsWith('.js')) continue;
    // Wildcard subpaths are patterns, not modules; they cannot be imported literally.
    if (subpath.includes('*') || target.includes('*')) continue;
    const module = await import(pathToFileURL(resolve(CORE_ROOT, target)).href);
    for (const retired of RETIRED_DB_COMPILER_EXPORTS) {
      assert.equal(
        typeof module[retired],
        'undefined',
        `${retired} is public on "${subpath}" — that changes the ruling, so stop rather than bind it`,
      );
    }
  }
});

test('the DB arm lowers every declared stop through the productive compiler', async () => {
  const arms = await loadCompilerArms();
  const factors = { tight: '0.85', normal: '1', airy: '1.2' };
  for (const [stopId, expected] of Object.entries(factors)) {
    const lowered = lowerStop({
      armId: 'db-tenant-theme',
      controlManifest: CONTROL_MANIFEST,
      stopId,
      compile: arms['db-tenant-theme'].compile,
      provenance: arms['db-tenant-theme'].provenance,
      vertical: 'rottay',
    });
    assert.equal(lowered.variables['--ds-rhythm-scale'], expected);
  }
});

test('manifest-ingress parity: both arms lower the SAME stop to the SAME channel value', async () => {
  const arms = await loadCompilerArms();
  for (const stopId of ['tight', 'normal', 'airy']) {
    const lowered = Object.fromEntries(
      INGRESS_ARM_IDS.map((armId) => [
        armId,
        lowerStop({
          armId,
          controlManifest: CONTROL_MANIFEST,
          stopId,
          compile: arms[armId].compile,
          provenance: arms[armId].provenance,
          vertical: 'rottay',
        }),
      ]),
    );
    assert.deepEqual(
      lowered['static-brand-theme'].variables,
      lowered['db-tenant-theme'].variables,
      `arms diverged at stop "${stopId}"`,
    );
    // Each arm really travelled its own manifest-declared door.
    assert.equal(lowered['static-brand-theme'].producedBy.input.path, 'surfaces.rhythm');
    assert.equal(lowered['db-tenant-theme'].producedBy.input.path, 'appearance.general.rhythm');
  }
});

/* ------------------------------------------------------------------------ *
 * A BOUNDED control writes its stop's NUMBER, not the stop's NAME.
 *
 * `spacing.rhythm` is `closed-enum`, so its stop id IS the value a tenant
 * writes and the two halves of a stop were indistinguishable in every drill
 * above. `surfaces.effect-intensity` is `bounded`: the tenant writes `0.6`,
 * and `sobrio` is only the label this programme gave that number.
 * ------------------------------------------------------------------------ */

const BOUNDED_CONTROL_MANIFEST = readManifest(
  resolve(CORE_ROOT, 'manifest/controls/surfaces.effect-intensity.json'),
);

test('a BOUNDED control lowers the stop VALUE at the ingress path, never the stop id', () => {
  const staticInput = buildIngressInput({
    armId: 'static-brand-theme',
    controlManifest: BOUNDED_CONTROL_MANIFEST,
    stopId: 'sobrio',
  });
  assert.deepEqual(staticInput.document, { surfaces: { effectIntensity: 0.6 } });
  assert.equal(staticInput.ingressValue, 0.6);
  assert.equal(staticInput.stopId, 'sobrio');

  const dbInput = buildIngressInput({
    armId: 'db-tenant-theme',
    controlManifest: BOUNDED_CONTROL_MANIFEST,
    stopId: 'mate',
  });
  assert.deepEqual(dbInput.document, {
    appearance: { general: { surfaces: { effectIntensity: 0 } } },
  });
  // 0 is a real stop, not an absent one. A truthiness test anywhere on this
  // path would erase the single most interesting stop this control has.
  assert.equal(dbInput.ingressValue, 0);

  // The closed-enum contract is unchanged: its id IS the written value.
  assert.equal(
    buildIngressInput({
      armId: 'static-brand-theme',
      controlManifest: CONTROL_MANIFEST,
      stopId: 'airy',
    }).ingressValue,
    'airy',
  );
});

test('counterfactual: writing the stop NAME into the bounded field is a FALSE NEGATIVE, not a smaller number', async () => {
  // This is the defect the fix above retires, reproduced through the REAL
  // static lowering rather than asserted in prose. `compileBrandTheme` lowers
  // `surfaces.effectIntensity` as `String(su.effectIntensity ?? 1)` with no
  // numeric guard, so the name survives into the channel verbatim.
  const arms = await loadCompilerArms();
  const compile = arms['static-brand-theme'].compile;

  const withName = compile({
    brandTheme: { surfaces: { effectIntensity: 'mate' } },
    tenantSlug: 'rottay',
  });
  // Same resolution `lowerStop` performs: compileBrandTheme returns its map as
  // `cssVariables`, compileTenantThemeConfig as `variables`.
  const emittedForName = (withName?.variables ?? withName?.cssVariables)['--ds-effect-intensity'];
  assert.equal(
    emittedForName,
    'mate',
    'the static lowering has no numeric guard, so the stop NAME reaches the channel verbatim',
  );
  // `--ds-effect-intensity` is a registered @property with syntax '<number>'
  // and initial-value 1, so that declaration is invalid at computed-value time
  // and the browser substitutes the INITIAL value. Every stop would then paint
  // exactly the baseline and the run would report a live control as inert --
  // while the arm still carried a non-empty variable map, so no existing guard
  // would have fired. Pin the two facts that make it invalid rather than the
  // browser behaviour this unit cannot observe.
  assert.equal(Number.isNaN(Number(emittedForName)), true);
  const properties = readFileSync(
    resolve(CORE_ROOT, 'src/foundation/tokens/css/foundation/base/properties.css'),
    'utf8',
  );
  assert.match(
    properties,
    /@property --ds-effect-intensity \{\s*syntax: '<number>';\s*inherits: true;\s*initial-value: 1;/,
    'the registered @property is what turns an invalid value into a silent baseline reading',
  );

  // And the fixed path lowers a real number for the same stop.
  const lowered = lowerStop({
    armId: 'static-brand-theme',
    controlManifest: BOUNDED_CONTROL_MANIFEST,
    stopId: 'mate',
    compile,
    provenance: arms['static-brand-theme'].provenance,
    vertical: 'rottay',
  });
  assert.equal(lowered.variables['--ds-effect-intensity'], '0');
  assert.equal(lowered.producedBy.input.ingressValue, 0);
});

test('negative drill: a bounded stop with no finite numeric value is refused, not coerced', () => {
  for (const value of [undefined, null, 'mate', Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () =>
        buildIngressInput({
          armId: 'static-brand-theme',
          controlManifest: {
            ...BOUNDED_CONTROL_MANIFEST,
            calibration: { normalizedStops: [{ id: 'sobrio', value }] },
          },
          stopId: 'sobrio',
        }),
      /declares no finite numeric value/,
      `stop value ${JSON.stringify(value)} must be refused`,
    );
  }
});

/* ------------------------------------------------------------------------ *
 * A PROFILE-ID control writes its stop's opaque registry ID.
 *
 * The third shape, and not a spelling of `closed-enum`: the written value IS
 * the stop id, but the closed set is `calibration.catalog` (a first-party
 * REGISTRY that grows by registration) rather than `domain.enumValues`, which
 * is empty by contract for this kind. Reading the closure from the catalog is
 * what keeps the branch fail-closed instead of turning "enumValues is empty"
 * into "anything may be written".
 * ------------------------------------------------------------------------ */

const PROFILE_ID_CONTROL_MANIFEST = readManifest(
  resolve(CORE_ROOT, 'manifest/controls/experience.profile.json'),
);

test('a PROFILE-ID control lowers the opaque registry id VERBATIM at both doors', () => {
  const staticInput = buildIngressInput({
    armId: 'static-brand-theme',
    controlManifest: PROFILE_ID_CONTROL_MANIFEST,
    stopId: 'rottay/bithire-technical@1',
  });
  // Verbatim: the slash, the vendor prefix and the @version all survive. A
  // trimmed or version-stripped id is rejected fail-closed by
  // `validateExperienceProfileSelection`, and a rejected selection paints
  // exactly what the baseline paints — the false negative this asserts against.
  assert.deepEqual(staticInput.document, {
    expressive: { experienceProfile: 'rottay/bithire-technical@1' },
  });
  assert.equal(staticInput.ingressValue, 'rottay/bithire-technical@1');

  const dbInput = buildIngressInput({
    armId: 'db-tenant-theme',
    controlManifest: PROFILE_ID_CONTROL_MANIFEST,
    stopId: 'rottay/management-editorial@1',
  });
  assert.deepEqual(dbInput.document, {
    appearance: { general: { experienceProfile: 'rottay/management-editorial@1' } },
  });
  assert.equal(dbInput.ingressValue, 'rottay/management-editorial@1');
});

test('negative drill: a profile id outside the closed REGISTRY catalog is refused', () => {
  assert.throws(
    () =>
      buildIngressInput({
        armId: 'static-brand-theme',
        controlManifest: {
          ...PROFILE_ID_CONTROL_MANIFEST,
          calibration: {
            ...PROFILE_ID_CONTROL_MANIFEST.calibration,
            // A plausible-looking id that is NOT registered. `enumValues` is
            // empty here, so only the catalog can catch this.
            normalizedStops: [{ id: 'rottay/bithire-technical@2' }],
            catalog: ['rottay/bithire-technical@1', 'rottay/management-editorial@1'],
          },
        },
        stopId: 'rottay/bithire-technical@2',
      }),
    /is not in the closed profile registry/,
  );
});

test('negative drill: a profile-id control with no catalog is refused, not treated as open', () => {
  for (const catalog of [[], undefined]) {
    assert.throws(
      () =>
        buildIngressInput({
          armId: 'static-brand-theme',
          controlManifest: {
            ...PROFILE_ID_CONTROL_MANIFEST,
            calibration: {
              ...PROFILE_ID_CONTROL_MANIFEST.calibration,
              normalizedStops: [{ id: 'rottay/bithire-technical@1' }],
              catalog,
            },
          },
          stopId: 'rottay/bithire-technical@1',
        }),
      /no `calibration.catalog`|closed registry that bounds it is unreadable/,
      `catalog ${JSON.stringify(catalog)} must fail closed rather than open the domain`,
    );
  }
});

test('negative drill: a profile-id stop with no non-empty string id is refused', () => {
  for (const id of [undefined, null, '', 42]) {
    assert.throws(
      () =>
        ingressValueForStopViaBuild({
          controlManifest: PROFILE_ID_CONTROL_MANIFEST,
          stop: { id },
        }),
      /no non-empty string id|is not a normalized stop/,
      `stop id ${JSON.stringify(id)} must be refused`,
    );
  }
});

/**
 * `ingressValueForStop` is private, so the id checks are driven through the
 * public `buildIngressInput` with the stop planted in `normalizedStops` —
 * which is also the only way a real caller can reach it.
 */
function ingressValueForStopViaBuild({ controlManifest, stop }) {
  return buildIngressInput({
    armId: 'static-brand-theme',
    controlManifest: {
      ...controlManifest,
      calibration: { ...controlManifest.calibration, normalizedStops: [stop] },
    },
    stopId: stop.id,
  });
}

test('negative drill: a domain kind this harness cannot write fails closed', () => {
  // `profile-id` and, since F4B-8, `color-set` are deliberately ABSENT from this
  // list — both are supported shapes, drilled positively elsewhere. AGED
  // EXPECTATION, re-legislated rather than weakened: what the drill defends is
  // that an UNKNOWN kind refuses instead of falling back to writing the stop id,
  // and `color-set` stopped being unknown. Every kind still outside the four
  // must refuse.
  for (const kind of ['token-map', 'scale', 'chrome-map', undefined]) {
    assert.throws(
      () =>
        buildIngressInput({
          armId: 'static-brand-theme',
          controlManifest: { ...BOUNDED_CONTROL_MANIFEST, domain: { kind } },
          stopId: 'sobrio',
        }),
      /a profile-id registry id, or a color-set hex colour/,
      `domain kind ${String(kind)} must fail closed rather than write the stop id`,
    );
  }
});

test('negative drill: a closed-enum stop outside the declared domain values is refused', () => {
  assert.throws(
    () =>
      buildIngressInput({
        armId: 'static-brand-theme',
        controlManifest: {
          ...CONTROL_MANIFEST,
          calibration: { normalizedStops: [{ id: 'roomy', value: 1.4 }] },
        },
        stopId: 'roomy',
      }),
    /is not one of the closed-enum domain values/,
  );
});

/**
 * REGRESSION FENCE — `shape.radius-scale` must keep a door that CARRIES it.
 *
 * The control shipped declaring `surfaces.borderRadius.*` as its static door.
 * That is not merely a wildcard `buildIngressInput` cannot resolve; it is the
 * COMPENSATION path. `compileBrandTheme` emits `borderRadius.{sm,md,lg,xl}` as
 * `--ds-radius-{step}-base`, and when a scale is live it emits that base as
 * `calc(authored / scale)` on purpose, so the foundation's
 * `calc(base * scale)` reproduces the authored value. Pointing the control at
 * it lowered a CONSTANT `--ds-radius-scale: 1` at every stop on all three
 * verticals — and the empty-lowering guard did NOT fire, because the compiler
 * emits that channel unconditionally as a default. The run would have reported
 * a live control as inert.
 *
 * These two drills fence both halves of that defect: the path must stay a
 * literal one `buildIngressInput` can walk, and it must never point back at a
 * `borderRadius` slot. Measured evidence:
 * test-artifacts/quality-evidence/wo-cra-23/F4B/shape-radius-scale/.
 */
const RADIUS_MANIFEST = readManifest(
  resolve(CORE_ROOT, 'manifest/controls/shape.radius-scale.json'),
);

test('regression fence: the radius-scale static door is a literal path, never a wildcard or prose', () => {
  const path = RADIUS_MANIFEST.ingress.staticBrandThemePath;
  assert.equal(
    path,
    'surfaces.radiusScale',
    'shape.radius-scale must lower through the bounded multiplier BrandSurfaces documents as ' +
      'the canonical radius dial. Change the authority (capabilities/index.ts brandThemePath) ' +
      'and regenerate; do not edit the generated manifest.',
  );
  assert.doesNotMatch(
    path,
    /[*{}( ]/u,
    `buildIngressInput resolves a door by literal path.split('.'), so "${path}" would write a ` +
      'key no compiler reads and the stop would never reach the channel.',
  );
  assert.doesNotMatch(
    path,
    /borderRadius/u,
    'borderRadius.* sets the ramp OPERANDS and is divided by the live scale to cancel this ' +
      'very dial. It is the anti-door for this control, not a door.',
  );
});

test('regression fence: every stop of radius-scale reaches the channel, and distinctly', () => {
  const stops = RADIUS_MANIFEST.calibration.normalizedStops;
  assert.ok(stops.length >= 2, 'a dial needs at least two stops to be shown to move');
  const seen = new Map();
  for (const stop of stops) {
    const built = buildIngressInput({
      armId: 'static-brand-theme',
      controlManifest: RADIUS_MANIFEST,
      stopId: stop.id,
    });
    assert.equal(
      built.document?.surfaces?.radiusScale,
      stop.value,
      `stop "${stop.id}" must land its NUMBER at surfaces.radiusScale`,
    );
    assert.equal(
      Object.hasOwn(built.document.surfaces, 'borderRadius'),
      false,
      'the lowered document must not carry a borderRadius slot: authoring one alongside the ' +
        'dial makes the compiler divide the base by the scale and the painted corner stops moving',
    );
    // The defect this fences was a CONSTANT lowering that still satisfied the
    // empty-lowering guard, so distinctness is the assertion that catches it.
    assert.equal(
      seen.has(stop.value),
      false,
      `stops "${seen.get(stop.value)}" and "${stop.id}" lower the same value, so no run could ` +
        'tell them apart',
    );
    seen.set(stop.value, stop.id);
  }
});

/* The SAME defect class, found a second time, on density.mode -- and this time
 * before a run rather than after one.
 *
 * `capabilities/index.ts` declared `surfaces.density / surfaces.densityScale`.
 * That is not a keypath: `buildIngressInput` walks a door with a literal
 * `path.split('.')`, so the string resolved to
 * `surfaces["density / surfaces"].densityScale` and wrote the stop where no
 * compiler reads it. The static arm carried NO stop at all.
 *
 * And nothing would have said so. `--ds-density-scale` is emitted
 * unconditionally from the compiler's vars seed (brand-theme/index.ts, the
 * `"--ds-density-scale": String(bt.surfaces?.densityScale ?? 1)` line), so the
 * arm stayed non-empty and the empty-lowering guard never fires -- the exact
 * false-INERT vector shape.radius-scale reported and left open in its
 * knownDefects. Two controls have now hit it, so it is fenced by name here.
 *
 * Note the asymmetry with radius-scale: there the anti-door CANCELLED the dial
 * (the ramp operands are divided by the live scale). Here the anti-door simply
 * misses -- `surfaces.densityScale` is a real, separate axis with its own
 * lowering, it is just not this control's door. Both fences below are about the
 * door being literal and being the ENUM's.
 */
const DENSITY_MANIFEST = readManifest(
  resolve(CORE_ROOT, 'manifest/controls/density.mode.json'),
);

test('regression fence: the density.mode static door is a literal path, and it is the ENUM', () => {
  const path = DENSITY_MANIFEST.ingress.staticBrandThemePath;
  assert.equal(
    path,
    'surfaces.density',
    'density.mode lowers through the enum BrandSurfaces documents. Change the authority ' +
      '(capabilities/index.ts brandThemePath) and regenerate; do not edit the generated manifest.',
  );
  assert.doesNotMatch(
    path,
    /[*{}( /]/u,
    `buildIngressInput resolves a door by literal path.split('.'), so "${path}" would write a ` +
      'key no compiler reads and the stop would never reach the channel. The slash is fenced ' +
      'explicitly: naming two alternates in one string is how this defect was written.',
  );
  assert.doesNotMatch(
    path,
    /densityScale/u,
    'surfaces.densityScale is the vertical STRUCTURAL multiplier, lowered on its own into ' +
      '--ds-density-scale. It is a different axis, not a spelling of this door.',
  );
});

test('regression fence: every stop of density.mode reaches the channel, and distinctly', () => {
  const stops = DENSITY_MANIFEST.calibration.normalizedStops;
  assert.ok(stops.length >= 2, 'a dial needs at least two stops to be shown to move');
  const seen = new Map();
  for (const stop of stops) {
    const built = buildIngressInput({
      armId: 'static-brand-theme',
      controlManifest: DENSITY_MANIFEST,
      stopId: stop.id,
    });
    // A closed-enum tenant writes the NAME; `value` records the factor it resolves to.
    assert.equal(
      built.document?.surfaces?.density,
      stop.id,
      `stop "${stop.id}" must land its NAME at surfaces.density`,
    );
    assert.equal(
      Object.hasOwn(built.document.surfaces, 'densityScale'),
      false,
      'the lowered document must not carry a densityScale slot: that is the structural axis ' +
        'and authoring it here would mix two controls in one measurement',
    );
    assert.equal(
      seen.has(stop.value),
      false,
      `stops "${seen.get(stop.value)}" and "${stop.id}" lower the same factor, so no run could ` +
        'tell them apart',
    );
    seen.set(stop.value, stop.id);
  }
});

/* ===================================================================== *
 * H-1 — the static arm composes its stop OVER the vertical's baseline.
 *
 * Before H-1 it compiled a ONE-FIELD BrandTheme. `compileBrandTheme` read that
 * input correctly; there was simply no baseline in it, so every
 * `?? <default>` branch fired and all three verticals were measured as if they
 * were rottay. The signature of the defect is UNIFORMITY WHERE PRODUCTION
 * DIVERGES, and it is what these drills fence.
 *
 * The drills that need the real compilers are marked: they import `dist/` and
 * therefore go red on a stale build, exactly like the arm drills above.
 * ===================================================================== */

const DENSITY_MANIFEST_H1 = readManifest(resolve(CORE_ROOT, 'manifest/controls/density.mode.json'));
const FIRST_PARTY = Object.keys(VERTICALS).filter((id) => id !== 'none');

/** Structural scale each vertical AUTHORS. If these move, the drills below say so. */
const AUTHORED_DENSITY_SCALE = { rottay: '1', bithire: '0.9', evnto: '1.125' };

test('H-1 drill 1: a base is COMPOSED into, not replaced by, the ingress keypath', () => {
  // Pure: no compiler. The claim is about the document the harness builds.
  const base = { surfaces: { densityScale: 0.9, borderRadius: { md: '10px' } }, palette: { seed: 'x' } };
  const built = buildIngressInput({
    armId: 'static-brand-theme',
    controlManifest: DENSITY_MANIFEST_H1,
    stopId: 'compact',
    base,
  });
  assert.equal(built.document.surfaces.density, 'compact', 'the stop must land at its keypath');
  assert.equal(built.document.surfaces.densityScale, 0.9, 'the SIBLING the stop does not own must survive');
  assert.deepEqual(built.document.surfaces.borderRadius, { md: '10px' });
  assert.deepEqual(built.document.palette, { seed: 'x' }, 'unrelated branches survive too');
  assert.equal(base.surfaces.density, undefined, 'the caller\'s base must not be mutated');
});

test('H-1 drill 2 [needs dist]: no vertical collapses onto the rottay value any more', async () => {
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  for (const vertical of FIRST_PARTY) {
    const lowered = lowerStop({
      armId: 'static-brand-theme',
      controlManifest: DENSITY_MANIFEST_H1,
      stopId: 'compact',
      compile: arms['static-brand-theme'].compile,
      vertical,
      base: baselines[vertical].theme,
      baselineSource: baselines[vertical].source,
    });
    assert.equal(
      lowered.variables['--ds-density-scale'],
      AUTHORED_DENSITY_SCALE[vertical],
      `${vertical} must lower its OWN structural scale, not a default`,
    );
    // The stop itself is carried either way; this is the channel that used to collapse.
    assert.equal(lowered.variables['--ds-density-mode-factor'], '0.85');
  }
  const distinct = new Set(
    FIRST_PARTY.map((v) => AUTHORED_DENSITY_SCALE[v]),
  );
  assert.equal(distinct.size, FIRST_PARTY.length, 'the three verticals must remain distinguishable');
});

/* Controls whose lowering is base-SENSITIVE by design. Everything else closed
 * must be base-INVARIANT, and drill 3 proves it by iterating the manifest rather
 * than a list, so a control added later is covered the day it closes. Adding an
 * entry here is a deliberate, reviewable act; forgetting to add one is a red. */
/**
 * The controls whose terminal is a normalized datum, not a painted channel.
 *
 * Read from the SAME single authority the ladder amendment uses -- a cascade
 * root declaring `rootChannel.channel: null`, admitted only under the complete
 * head-empty conjunction. Not a hand-kept exclusion list: a list would have to
 * be remembered, and the whole reason these fences iterate from the manifest is
 * that a control closing later is covered the day it closes. Not
 * `declaredOutputs.channels.length === 0` either, which LOOKS like the right
 * predicate and is not: profiles.icon and chrome.anatomy both declare an empty
 * channel list while their roots declare real heads (--ds-icon-stroke-width with
 * 118 terminalReach edges; data-anatomy-card with 353), so that predicate would
 * quietly route two painting controls into the "cannot paint" branch and green
 * their under-declaration.
 */
function dataTerminalControlIds() {
  const dir = resolve(CORE_ROOT, 'manifest/cascade/roots');
  const ids = new Set();
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const root = JSON.parse(readFileSync(resolve(dir, name), 'utf8'));
    if (root?.rootChannel && root.rootChannel.channel === null) ids.add(root.rootId);
  }
  return ids;
}

const BASE_SENSITIVE_BY_DESIGN = new Map([
  [
    'experience.profile',
    'the vertical\'s AUTHORED typography outranks the profile (brand-theme: authored > profile > ' +
      'seeds), so composing over the baseline changes --ds-letter-spacing-heading and, on bithire, ' +
      '--ds-material-canvas-texture. Re-measured under H-1; drill 4 pins the change.',
  ],
  [
    'density.mode',
    'its declared --ds-density-scale IS the vertical structural scale, which only exists in the ' +
      'baseline. That is the defect H-1 corrects; drill 2 pins the corrected values.',
  ],
  [
    'palette.seeds',
    'THREE of its five declared channels are vertical-AUTHORED or derive against the vertical\'s ' +
      'own ground, so they cannot exist without a baseline -- measured, not assumed, across all ' +
      'five stops x three verticals. (a) --ds-color-text-on-primary is `undefined` without a base ' +
      'on all three and carries the vertical\'s authored palette.onPrimaryColor with one ' +
      '(#0C0C0E / #ffffff / #ffffff): an authored leaf has no value to have when there is no ' +
      'author. (b) --ds-color-primary-500 differs everywhere because the OKLCH ramp derives ' +
      'against the vertical\'s own ground, and on rottay it is pinned outright at #A0A0A5 by the ' +
      'authored palette.ramps.primary, which wins over derivation regardless of the seed. ' +
      '(c) --ds-chart-series-1 differs on rottay for the same ground reason (dark vs the default ' +
      'light). And the identity stop cannot lower without a base BY LAW (W-A: an identity ' +
      'resolves the vertical\'s own value), which the drill\'s own catch already skips. None of ' +
      'this is a regression: it is the same structural fact this control publishes as ' +
      'measuredResult.r2BlindWitnesses, seen from the H-1 side.',
  ],
]);

test('H-1 drill 3 [needs dist]: every OTHER closed control lowers identically with and without a base', async () => {
  const { readdirSync } = await import('node:fs');
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  const dir = resolve(CORE_ROOT, 'manifest/controls');
  const dataTerminals = dataTerminalControlIds();
  let checked = 0;
  const covered = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const manifest = readManifest(resolve(dir, file));
    const id = manifest.controlId;
    const stops = manifest.calibration?.normalizedStops ?? [];
    // "Closed" = it has stops to lower AND a state that made it evidence-bearing.
    const closed = stops.length > 0 && manifest.calibration?.assessmentState === 'COMPUTED_VERIFIED';
    // A DATA terminal has no channel to compare with and without a baseline, so
    // it is out of this fence's question entirely -- routed by the same single
    // authority, never by a remembered list. Without this it would enter the
    // loop the moment its state reached COMPUTED_VERIFIED and be swallowed whole
    // by the catch below, which is a hole dressed as a pass.
    if (!closed || BASE_SENSITIVE_BY_DESIGN.has(id) || dataTerminals.has(id)) continue;
    covered.push(id);
    for (const stop of stops) {
      for (const vertical of FIRST_PARTY) {
        const run = (base, baselineSource) =>
          lowerStop({
            armId: 'static-brand-theme',
            controlManifest: manifest,
            stopId: stop.id,
            compile: arms['static-brand-theme'].compile,
            vertical,
            base,
            baselineSource,
          });
        let without;
        try {
          without = JSON.stringify(run({}, null).variables);
        } catch {
          // A stop whose lowering comes back EMPTY is not an invariance
          // violation; it is the H-1 improvement, and there is nothing to
          // compare.
          //
          // The reason is written as the MEASURED message, not the expected one:
          // `lowerStop` has no "needs a baseline" throw at all, and this comment
          // used to name one. What an H-1 case actually surfaces as is "emitted
          // none of the declared channels".
          //
          // The catch stays WIDE by ruling. It is dead code today (measured: 30
          // comparisons, 0 hits), and what closed the real hole was routing DATA
          // terminals out of the selector above: before the amendment raised
          // responsive.posture to COMPUTED_VERIFIED, nine combinations would have
          // been swallowed here while the drill reported green. Narrowing to the
          // message above stays available the day this stops being dead code.
          continue;
        }
        const withBase = JSON.stringify(
          run(baselines[vertical].theme, baselines[vertical].source).variables,
        );
        checked += 1;
        assert.equal(
          withBase,
          without,
          `${id}/${stop.id}/${vertical} changed under H-1 but is not declared base-sensitive. ` +
            'Either the change is a regression, or it belongs in BASE_SENSITIVE_BY_DESIGN with a reason.',
        );
      }
    }
  }
  assert.ok(checked > 0, `the invariance fence must actually check something; covered: ${covered.join(', ')}`);
});

test('H-1 drill 4 [needs dist]: a tenant-selected profile reaches the channel, and OUTRANKS every baseline', async () => {
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  const manifest = readManifest(resolve(CORE_ROOT, 'manifest/controls/experience.profile.json'));
  const stops = manifest.calibration.normalizedStops;
  assert.ok(stops.length >= 1);
  for (const stop of stops) {
    const spacings = new Map();
    for (const vertical of FIRST_PARTY) {
      const run = (base, src) =>
        lowerStop({
          armId: 'static-brand-theme',
          controlManifest: manifest,
          stopId: stop.id,
          compile: arms['static-brand-theme'].compile,
          vertical,
          base,
          baselineSource: src,
        }).variables;
      const withBase = run(baselines[vertical].theme, baselines[vertical].source);
      // AGED_EXPECTATION, re-adjudicated F4B-7. This used to demand
      // `withBase !== without`: under H-1 composing the stop over the baseline
      // was what made the profile observable at all. B-1 changed the law -- the
      // tenant floor is applied AFTER every vertical-authored writer -- so a
      // tenant-selected profile now wins whether or not a baseline is composed,
      // and the two lowerings agree. That is the fix working, not the drill
      // failing, so the drill asserts the CURRENT semantics: the stop arrives on
      // the tenant floor and the channel carries the profile's own value.
      assert.equal(
        typeof withBase['--ds-letter-spacing-heading'],
        'string',
        `${stop.id}/${vertical}: the profile must reach the channel`,
      );
      spacings.set(vertical, withBase['--ds-letter-spacing-heading']);
    }
    // The point of H-1 was: three verticals, three answers, because each
    // baseline reached the compiler and won. Under B-1 a TENANT-selected
    // profile outranks every vertical baseline, so ONE answer across the three
    // is the correct result -- uniformity is now what proves the tenant floor
    // won, and per-vertical divergence would mean it had not. Measured: the
    // technical stop gives 0.01em and the editorial stop 0 on all three.
    assert.equal(
      new Set(spacings.values()).size,
      1,
      `${stop.id}: a tenant-selected profile outranks every baseline, so --ds-letter-spacing-heading must AGREE across verticals, got ${JSON.stringify([...spacings])}`,
    );
  }
  // The second signal the design measured: bithire gains its own canvas texture.
  const bithire = lowerStop({
    armId: 'static-brand-theme',
    controlManifest: manifest,
    stopId: stops[0].id,
    compile: arms['static-brand-theme'].compile,
    vertical: 'bithire',
    base: baselines.bithire.theme,
    baselineSource: baselines.bithire.source,
  }).variables;
  assert.ok(
    typeof bithire['--ds-material-canvas-texture'] === 'string' &&
      bithire['--ds-material-canvas-texture'].length > 0,
    'bithire must carry its authored canvas texture once the baseline is composed',
  );
});

test('H-1 drill 5: the baseline loader fails CLOSED on a vertical it cannot supply', async () => {
  await assert.rejects(
    () =>
      loadStaticBaselines({
        assertFresh: () => ({ ok: true, failures: [] }),
        importModule: async () => ({ rottayBrandTheme: { surfaces: {} } }),
      }),
    /exports no BrandTheme for the "bithire" vertical/,
    'falling back to an empty theme IS the defect H-1 corrects, and it fails silently',
  );
});

test('H-1 drill 6 (V4): the baseline obeys the SAME dist-freshness law as the compilers', async () => {
  await assert.rejects(
    () =>
      loadStaticBaselines({
        assertFresh: () => ({ ok: false, failures: ['dist is STALE: planted'] }),
        importModule: async () => {
          throw new Error('must not import from a stale dist');
        },
      }),
    /baselines are stale or their freshness is unproven[\s\S]*planted/,
    'a fresh compiler composing a stale baseline is a new way to measure a tree nobody has',
  );
});

test('H-1 drill 7 (V5): handing the DB arm a base fails CLOSED', () => {
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: CONTROL_MANIFEST,
        stopId: 'airy',
        compile: () => ({ variables: { '--ds-rhythm-scale': '1.2' } }),
        vertical: 'rottay',
        base: { surfaces: { densityScale: 0.9 } },
        provenance: { schemaVersion: 1 },
      }),
    /must NOT be given a base/,
    'its compiler resolves the vertical itself, so a base here composes the vertical twice',
  );
  // and the empty default is still accepted
  assert.doesNotThrow(() =>
    lowerStop({
      armId: 'db-tenant-theme',
      controlManifest: CONTROL_MANIFEST,
      stopId: 'airy',
      compile: () => ({ variables: { '--ds-rhythm-scale': '1.2' } }),
      vertical: 'rottay',
      provenance: { schemaVersion: 1 },
    }),
  );
});

test('H-1 drill 8 (V1): a static arm with no named baseline fails arm verification', () => {
  const withoutBaseline = {
    module: 'dist/infrastructure/compilers/kernel/runtime/brand-theme/index.js',
    exportName: 'compileBrandTheme',
    input: { path: 'surfaces.density', stopId: 'compact' },
  };
  assert.throws(
    () => assertArmProvenance(withoutBaseline),
    /must record which vertical baseline it composed/,
  );
  assert.throws(
    () => composeStaticArm({ vertical: 'rottay', variables: { '--ds-x': '1' }, producedBy: withoutBaseline }),
    /must record which vertical baseline it composed/,
  );
  // A DB arm has no baseline to name and must NOT be asked for one.
  assert.doesNotThrow(() =>
    composeDbArm({
      vertical: 'rottay',
      variables: { '--ds-x': '1' },
      producedBy: { ...withoutBaseline, exportName: 'compileTenantThemeConfig' },
    }),
  );
  // And the static arm passes once it names one.
  const lowered = lowerStop({
    armId: 'static-brand-theme',
    controlManifest: DENSITY_MANIFEST_H1,
    stopId: 'compact',
    compile: () => ({ variables: { '--ds-density-mode-factor': '0.85' } }),
    vertical: 'rottay',
    base: { surfaces: { densityScale: 1 } },
    baselineSource: 'dist/index.js#rottayBrandTheme',
  });
  assert.equal(lowered.producedBy.input.baseline.source, 'dist/index.js#rottayBrandTheme');
  assert.match(lowered.producedBy.input.baseline.digest, /^[0-9a-f]{64}$/);
  assert.doesNotThrow(() => assertArmProvenance(lowered.producedBy));
});

/* ===================================================================== *
 * H-2 — the stop-discrimination guard.
 *
 * Closes the false-INERT vector shape.radius-scale left recorded open: an arm
 * that emits a declared channel at a CONSTANT default is non-empty, so the
 * empty-lowering guard passes it, while it encodes no stop at all.
 *
 * The predicate is a property of the CHANNEL across the stop set, never of a
 * stop. That is what makes an identity stop free: `suave`=1 lowers exactly `1`
 * both inside a healthy set (0.75/0.9/1/1.15) and inside an anti-doored one
 * (1/1/1/1); only the second is an absence. Drill 3 fences that, and drill 4
 * fences the EXISTS -- if anyone hardened the predicate to FOR-ALL, healthy
 * density would start failing on its structural channel.
 * ===================================================================== */

const RADIUS_H2 = readManifest(resolve(CORE_ROOT, 'manifest/controls/shape.radius-scale.json'));
const TYPO_H2 = readManifest(resolve(CORE_ROOT, 'manifest/controls/typography.scale.json'));

/** The guard, on the real compilers, with the arm's own baseline tuple. */
const discriminate = async (manifest, armId, vertical, overrides = {}) => {
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  return assertStopDiscrimination({
    armId,
    controlManifest: manifest,
    compile: arms[armId].compile,
    vertical,
    provenance: arms[armId].provenance,
    baseline: armId === 'static-brand-theme' ? baselines[vertical] : null,
    /* R-2: the same wiring the CLI does, from the same published BrandTheme.
     * A palette door fails closed without it, which is the guard working -- but
     * a fence that cannot lower the control it is fencing measures nothing. For
     * every non-palette control this is inert: the stamp only reaches documents
     * that already write a palette node. */
    defaultMode: verticalDefaultMode(baselines[vertical], vertical),
    /* FASE-A: the vertical policy envelope resolver, from the SAME arm the
     * compiler came from; inert for `simple` documents (appearance.general.*),
     * required for `advanced` (visualFoundation.*). Same wiring the CLI
     * already does (public/cli/index.mjs, verticalEnvelopeFor: loaded.verticalEnvelopeFor). */
    verticalEnvelopeFor: arms[armId].verticalEnvelopeFor,
    ...overrides,
  });
};

test('H-2 drill 1 [needs dist]: the radius anti-door lowers a CONSTANT and is refused', async () => {
  // The historical mutation, reconstructed in memory: surfaces.borderRadius sets
  // the ramp OPERANDS and is divided by the live scale, so it cancels the dial.
  const antiDoor = {
    ...RADIUS_H2,
    ingress: { ...RADIUS_H2.ingress, staticBrandThemePath: 'surfaces.borderRadius' },
  };
  await assert.rejects(
    () => discriminate(antiDoor, 'static-brand-theme', 'rottay'),
    /encodes NO stop.*lowers a constant across/s,
    'every stop lowering --ds-radius-scale: 1 is the absence of the dial, not a measurement',
  );
});

test('H-2 drill 2 [needs dist]: the density anti-door is refused, and the mechanism is asserted', async () => {
  const antiDoor = {
    ...DENSITY_MANIFEST_H1,
    ingress: {
      ...DENSITY_MANIFEST_H1.ingress,
      staticBrandThemePath: 'surfaces.density / surfaces.densityScale',
    },
  };
  await assert.rejects(() => discriminate(antiDoor, 'static-brand-theme', 'rottay'), /encodes NO stop/);

  // Not just the symptom: the stop's OWN channel is absent entirely, and the
  // arm stayed non-empty on the unconditional seed alone. That is the mechanism.
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  const lowered = lowerStop({
    armId: 'static-brand-theme',
    controlManifest: antiDoor,
    stopId: 'compact',
    compile: arms['static-brand-theme'].compile,
    vertical: 'rottay',
    base: baselines.rottay.theme,
    baselineSource: baselines.rottay.source,
  });
  assert.equal(Object.hasOwn(lowered.variables, '--ds-density-mode-factor'), false);
  assert.equal(lowered.variables['--ds-density-scale'], '1');
});

test('H-2 drill 3 [needs dist]: an IDENTITY stop does not fail the guard', async () => {
  const verdict = await discriminate(RADIUS_H2, 'static-brand-theme', 'rottay');
  assert.equal(verdict.outcome, 'PASS');
  // `suave` = 1 is present among the witnesses and among the observed values.
  assert.ok(verdict.witnesses.includes('suave'), 'the identity stop must be a witness, not an exile');
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  const valueAt = (stopId) =>
    lowerStop({
      armId: 'static-brand-theme',
      controlManifest: RADIUS_H2,
      stopId,
      compile: arms['static-brand-theme'].compile,
      vertical: 'rottay',
      base: baselines.rottay.theme,
      baselineSource: baselines.rottay.source,
    }).variables['--ds-radius-scale'];
  assert.equal(valueAt('suave'), '1', 'the identity stop lowers the identity, and that is fine');
  assert.notEqual(valueAt('sutil'), '1', 'because some OTHER stop moves the channel');
});

test('H-2 drill 4 [needs dist]: the predicate is EXISTS, not FOR-ALL', async () => {
  const verdict = await discriminate(DENSITY_MANIFEST_H1, 'static-brand-theme', 'bithire');
  assert.equal(verdict.outcome, 'PASS');
  assert.deepEqual(verdict.discriminating, ['--ds-density-mode-factor']);
  // The structural scale is CONSTANT within a vertical, by construction. A
  // FOR-ALL predicate would fail this healthy control; this assertion is what
  // reddens if anyone hardens it.
  assert.deepEqual(verdict.constant, ['--ds-density-scale']);
});

test('H-2 drill 5 [needs dist]: every control that carries receipts passes, both arms', async () => {
  const { readdirSync } = await import('node:fs');
  const dir = resolve(CORE_ROOT, 'manifest/controls');
  const dataTerminals = dataTerminalControlIds();
  let checked = 0;
  let routed = 0;
  let seenDataTerminals = 0;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const manifest = readManifest(resolve(dir, file));
    // "Carries receipts" read from the manifest state, not a hardcoded list, so
    // a control closing later is covered the day it closes (the V3 pattern).
    const evidence = [
      ...(manifest.calibration?.staticDbParityEvidenceIds ?? []),
      ...(manifest.calibration?.exactRestoreEvidenceIds ?? []),
    ];
    if (evidence.length === 0) continue;
    if (dataTerminals.has(manifest.controlId)) seenDataTerminals += 1;
    for (const armId of INGRESS_ARM_IDS) {
      for (const vertical of FIRST_PARTY) {
        if (dataTerminals.has(manifest.controlId)) {
          // NOT an exclusion. A DATA terminal is routed to the assertion that
          // actually holds for it, so the fence keeps covering it: the CSS guard
          // must REFUSE it, and refuse it for the structural reason. A silent
          // `continue` would leave a hole exactly where the receipts are, and a
          // hole is worse than the red it replaces -- it reads as coverage.
          await assert.rejects(
            () => discriminate(manifest, armId, vertical),
            /declares no output channels/,
            `${manifest.controlId}/${armId}/${vertical}: a channel-less control must be REFUSED by ` +
              'the CSS guard, never silently passed',
          );
          routed += 1;
          continue;
        }
        const verdict = await discriminate(manifest, armId, vertical);
        assert.ok(
          verdict.outcome.startsWith('PASS'),
          `${manifest.controlId}/${armId}/${vertical} must keep passing: H-2 may not invalidate receipted work`,
        );
        checked += 1;
      }
    }
  }
  assert.ok(checked >= 12, `the invariance fence must cover the receipted catalogue; checked ${checked}`);
  // Both counters are asserted. If the DATA leg ever silently stops selecting
  // anything, this is what says so.
  assert.equal(
    routed,
    seenDataTerminals * INGRESS_ARM_IDS.length * FIRST_PARTY.length,
    'every receipted DATA terminal must be routed on every arm and vertical',
  );
});

test('H-2 drill 6 [needs dist]: the verdict is PER ARM — a broken door on ONE arm proves it', async () => {
  // AGED_EXPECTATION, re-adjudicated F4B-7. This drill used typography.scale as
  // the live example: its static door was the prose `typography (ramp channels)`,
  // so that arm encoded nothing while the DB arm encoded its stops. F4B-7 fixed
  // the door (`capabilities/index.ts:182` -> `typography.scale`) and the static
  // arm now PASSES, which is the point of that fix and the death of this
  // premise.
  //
  // No live control is put in its place. Naming another real control here would
  // mean keeping some door broken to keep a drill green -- the exact inversion
  // this programme exists to kill. The lesson is instead proved on a FIXTURE:
  // the same manifest, its static door broken IN MEMORY, so one arm fails and
  // the other passes in one run. Same anti-door shape as drills 1 and 2.
  const brokenStaticDoor = {
    ...TYPO_H2,
    ingress: { ...TYPO_H2.ingress, staticBrandThemePath: 'typography (ramp channels)' },
  };
  for (const vertical of FIRST_PARTY) {
    await assert.rejects(
      () => discriminate(brokenStaticDoor, 'static-brand-theme', vertical),
      /encodes NO stop/,
      `the prose door lands the stop where nothing reads it, so --ds-type-scale stays the seed on ${vertical}`,
    );
    // ...while the DB arm of the SAME manifest, whose door was never broken,
    // passes in the same run. One control, two verdicts.
    const db = await discriminate(brokenStaticDoor, 'db-tenant-theme', vertical);
    assert.equal(db.outcome, 'PASS', `typography.scale/db/${vertical} does encode its stops`);
  }

  // And the fix is pinned: the REAL manifest passes on both arms now. If the
  // door ever regresses to prose, this is the assertion that says so.
  for (const vertical of FIRST_PARTY) {
    const live = await discriminate(TYPO_H2, 'static-brand-theme', vertical);
    assert.equal(live.outcome, 'PASS', `typography.scale/static/${vertical} must keep encoding its stops`);
  }
});

test('H-2 drill 7 [needs dist]: fewer than two witnesses is NOT DECIDABLE, not a pass', async () => {
  // A control whose stop set collapses to one lowerable stop cannot show that
  // its arm encodes anything. Built by keeping a single stop.
  const oneStop = {
    ...RADIUS_H2,
    calibration: {
      ...RADIUS_H2.calibration,
      normalizedStops: RADIUS_H2.calibration.normalizedStops.slice(0, 1),
    },
  };
  await assert.rejects(
    () => discriminate(oneStop, 'static-brand-theme', 'rottay'),
    /NOT DECIDABLE below two/,
    'a silent pass on one witness is exactly the failure mode this guard removes',
  );
});

test('H-2 drill 8 (W-B): an adjudicated exception turns the refusal into a VISIBLE pass', async () => {
  const oneStop = {
    ...RADIUS_H2,
    calibration: {
      ...RADIUS_H2.calibration,
      normalizedStops: RADIUS_H2.calibration.normalizedStops.slice(0, 1),
    },
  };
  // Absent -> refused (drill 7). Present and complete -> PASS_WITH_EXCEPTION,
  // and the exception is published in the verdict rather than swallowed.
  const excepted = {
    ...oneStop,
    calibration: {
      ...oneStop.calibration,
      stopDiscriminationException: {
        armId: 'static-brand-theme',
        reason: 'drill fixture: a control that legitimately exhibits one witness on this arm',
        adjudicatedBy: 'drill',
      },
    },
  };
  const verdict = await discriminate(excepted, 'static-brand-theme', 'rottay');
  assert.equal(verdict.outcome, 'PASS_WITH_EXCEPTION');
  assert.equal(verdict.exception.adjudicatedBy, 'drill');
  // An exception for the OTHER arm must not rescue this one.
  const wrongArm = {
    ...oneStop,
    calibration: {
      ...oneStop.calibration,
      stopDiscriminationException: {
        armId: 'db-tenant-theme',
        reason: 'wrong arm',
        adjudicatedBy: 'drill',
      },
    },
  };
  await assert.rejects(() => discriminate(wrongArm, 'static-brand-theme', 'rottay'), /NOT DECIDABLE/);
  // An incomplete exception is not an exception.
  const incomplete = {
    ...oneStop,
    calibration: {
      ...oneStop.calibration,
      stopDiscriminationException: { armId: 'static-brand-theme', reason: 'no adjudicator' },
    },
  };
  await assert.rejects(() => discriminate(incomplete, 'static-brand-theme', 'rottay'), /NOT DECIDABLE/);
});

test('H-2 drill 9 (W-C): the guard stands on the ARM\'s baseline, and proves it', async () => {
  const baselines = await loadStaticBaselines();

  // The shape is enforced, because getting it wrong is SILENT: passing the
  // wrapper where the theme belongs lowers bithire's --ds-density-scale as 1
  // instead of 0.9, with no error, and this guard runs outside the
  // composeStaticArm path where assertArmProvenance would have caught it.
  await assert.rejects(
    () => discriminate(DENSITY_MANIFEST_H1, 'static-brand-theme', 'bithire', { baseline: baselines.bithire.theme }),
    /baseline TUPLE \{ theme, source \}/,
    'a bare theme is not the tuple, and the difference is invisible at run time',
  );

  // Same-digest cross-check: the arm's digest and the guard's must agree.
  const arms = await loadCompilerArms();
  const armLowered = lowerStop({
    armId: 'static-brand-theme',
    controlManifest: DENSITY_MANIFEST_H1,
    stopId: 'compact',
    compile: arms['static-brand-theme'].compile,
    vertical: 'bithire',
    base: baselines.bithire.theme,
    baselineSource: baselines.bithire.source,
  });
  const armDigest = armLowered.producedBy.input.baseline.digest;
  const ok = await discriminate(DENSITY_MANIFEST_H1, 'static-brand-theme', 'bithire', {
    armBaselineDigest: armDigest,
  });
  assert.equal(ok.outcome, 'PASS');

  // A DIFFERENT baseline than the arm's is refused rather than measured.
  await assert.rejects(
    () =>
      discriminate(DENSITY_MANIFEST_H1, 'static-brand-theme', 'bithire', {
        armBaselineDigest: 'a'.repeat(64),
      }),
    /is not the arm's baseline/,
    'the guard must not certify a scene the scenario does not compile',
  );

  // And the DB arm refuses a baseline outright: its compiler resolves one itself.
  await assert.rejects(
    () => discriminate(DENSITY_MANIFEST_H1, 'db-tenant-theme', 'rottay', { baseline: baselines.rottay }),
    /only the static arm takes a baseline/,
  );
});

const EXPRESSIVE_H2 = readManifest(resolve(CORE_ROOT, 'manifest/controls/profiles.expressive.json'));

test('H-2 drill 10 (profiles.expressive): the flat enumValues union cannot catch a cross-axis value, and the compiler is the real gate', async () => {
  // The union check (`enumValues.includes(stop.id)`, runtime/ingress/index.mjs)
  // is role-blind: 'flat' is a REAL value, just for material/elevation, not
  // geometry. A stop naming it for `role: 'geometry'` passes the union check
  // and reaches the real compiler -- which is exactly the scene this drill
  // proves is caught somewhere, not silently painted as a measurement.
  const crossAxisManifest = {
    ...EXPRESSIVE_H2,
    calibration: {
      ...EXPRESSIVE_H2.calibration,
      // The closed-enum branch of ingressValueForStop returns stop.id itself
      // (not stop.value) -- the id IS the value the harness lowers. 'flat'
      // must be the id directly, matching every other closed-enum stop in
      // this control (F4B-16 fix: the manifest's own regular stops made this
      // exact mistake first and were corrected the same way).
      normalizedStops: [
        { id: 'flat', role: 'geometry' },
      ],
    },
  };

  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  const baselineVars = arms['static-brand-theme'].compile({
    brandTheme: baselines.rottay.theme,
    tenantSlug: 'h2-drill-10-baseline',
    tenantPatch: {},
    tenantAuthoredPaths: new Set(),
  }).cssVariables;

  const lowered = lowerStop({
    armId: 'static-brand-theme',
    controlManifest: crossAxisManifest,
    stopId: 'flat',
    compile: arms['static-brand-theme'].compile,
    vertical: 'rottay',
    base: baselines.rottay.theme,
    baselineSource: baselines.rottay.source,
  });

  // The real, product-owned sanitizer drops the value: geometry's own
  // channels (radius/button-style cascade) stay byte-identical to baseline.
  assert.equal(lowered.variables['--ds-radius-scale'], baselineVars['--ds-radius-scale']);
  assert.equal(lowered.variables['--ds-radius-button'], baselineVars['--ds-radius-button']);

  // And the discrimination guard -- the evidence pipeline's own EXISTS check
  // -- must not accept this as a witness for geometry: only ONE stop exists
  // in this manifest, so `assertStopDiscrimination` has nothing to compare
  // against and must refuse to certify a verdict, not report a false PASS.
  await assert.rejects(
    () => discriminate(crossAxisManifest, 'static-brand-theme', 'rottay'),
    /fewer than two|NOT DECIDABLE/i,
    'a single cross-axis-invalid stop must not be certified as a discriminating measurement',
  );
});

test('H-2 drill 11 (profiles.expressive): the declared per-axis catalog is exactly the real vocabulary', async () => {
  // Fails closed if the manifest's calibration.catalog drifts from the
  // product's own closed vocabularies -- the other half of "desincroniza del
  // real": not just a bad stop, but a stale catalog nobody caught.
  // Read from the SAME dist/ this whole suite already trusts (loadCompilerArms
  // proves it fresh before any drill runs) -- never a second, hand-built copy
  // of the vocabulary that could quietly drift from the one the compiler uses.
  const {
    EXPRESSIVE_TYPE_PROFILES,
    EXPRESSIVE_GEOMETRY_PROFILES,
    EXPRESSIVE_EDGE_PROFILES,
    EXPRESSIVE_MATERIAL_PROFILES,
    EXPRESSIVE_ELEVATION_PROFILES,
    EXPRESSIVE_MOTIF_PROFILES,
  } = await import(
    pathToFileURL(resolve(CORE_ROOT, 'dist/foundation/tokens/ts/presentation/expressive-profiles/index.js')).href
  );

  const catalog = EXPRESSIVE_H2.calibration.catalog;
  assert.deepEqual(catalog.type, [...EXPRESSIVE_TYPE_PROFILES]);
  assert.deepEqual(catalog.geometry, [...EXPRESSIVE_GEOMETRY_PROFILES]);
  assert.deepEqual(catalog.edge, [...EXPRESSIVE_EDGE_PROFILES]);
  assert.deepEqual(catalog.material, [...EXPRESSIVE_MATERIAL_PROFILES]);
  assert.deepEqual(catalog.elevation, [...EXPRESSIVE_ELEVATION_PROFILES]);
  assert.deepEqual(catalog.motif, [...EXPRESSIVE_MOTIF_PROFILES]);
});

// ---------------------------------------------------------------------------
// H3C — the DB arm delivers its write on a FRESH page
//
// These assert the CONTRACT of the arm, not the browser. What a browser does
// with a live mutation is measured in
// test-artifacts/quality-evidence/wo-cra-23/H3/residual-isolation.MEASURED-NOT-RECEIPTED.json;
// what belongs in a drill is that the arm kept its position and its restore law
// while changing only WHEN the write lands.
// ---------------------------------------------------------------------------

test('H3C drill 1 [re-legislated by H-3 phase (a)]: the position changed BY THE FRONT DOOR', async () => {
  /* AGED EXPECTATION, and the good kind: this drill did its job.
   *
   * It read "the DB arm keeps root-inline-style", and its comment said that if
   * it ever read `tenant-artifact-stylesheet`, phase (a) had been adopted by the
   * back door and the packet adopting it must say so. Phase (a) was adopted, by
   * the FRONT door, with a design, a preaudit and this packet -- so the fence
   * is satisfied by being inverted, not removed. What it now guards is the
   * reverse: a silent slide BACK to inline would mean the artifact position was
   * abandoned without an acta. */
  const arms = await loadCompilerArms();
  const lowered = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: TYPO_H2,
    stopId: 'compacta',
    compile: arms['db-tenant-theme'].compile,
    vertical: 'rottay',
    provenance: arms['db-tenant-theme'].provenance,
  });
  const arm = composeDbArm({
    vertical: 'rottay',
    variables: lowered.variables,
    producedBy: lowered.producedBy,
    modeVariables: lowered.modeVariables,
    themeModeSelector: arms['db-tenant-theme'].themeModeSelector,
  });
  assert.equal(arm.position, 'tenant-artifact-stylesheet');
  assert.equal(
    INGRESS_ARMS['db-tenant-theme'].position,
    'tenant-artifact-stylesheet',
    'the contract and the composed arm must agree on the position',
  );
});

test('H3C drill 2 [re-legislated]: the BASELINE bytes are identical in every phase', async () => {
  /* AGED EXPECTATION. Under H3C the DB arm served the baseline verbatim in all
   * three phases, and that was the falsifiability condition: a zero-divergence
   * result could not be blamed on a different stylesheet. Phase (a) makes the
   * arm carry CSS, so `mutateCss(css) === css` is no longer true -- but the
   * condition it protected survives in the form the STATIC arm has always used:
   * the arm APPENDS, so the baseline prefix is byte-identical in every phase and
   * the removal phase re-serves that string untouched. */
  const arms = await loadCompilerArms();
  const lowered = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: TYPO_H2,
    stopId: 'amplia',
    compile: arms['db-tenant-theme'].compile,
    vertical: 'bithire',
    provenance: arms['db-tenant-theme'].provenance,
  });
  const arm = composeDbArm({
    vertical: 'bithire',
    variables: lowered.variables,
    producedBy: lowered.producedBy,
    modeVariables: lowered.modeVariables,
    themeModeSelector: arms['db-tenant-theme'].themeModeSelector,
  });
  const css = 'html { color: red }';
  const mutated = arm.mutateCss(css);
  for (const phase of ['baseline', 'mutation', 'removal']) {
    assert.equal(
      mutated.slice(0, css.length),
      css,
      `phase ${phase} must see the baseline bytes unchanged`,
    );
  }
  // Removal is the baseline itself, not a re-composition of it.
  assert.equal(css, 'html { color: red }');
});

test('H3C drill 3: the inline plan still names what it introduced, so restore stays decidable', async () => {
  // Fresh delivery removes the NEED to unwrite -- a navigation without the
  // marker carries no inline declaration at all -- but the memo and the plan
  // are still recorded. A run whose restore could not be described would be a
  // run nobody can check, whatever it measured.
  const { planInlinePhase } = await import('../../../foundation/causality/index.mjs');
  const plan = planInlinePhase({
    memo: { '--ds-type-scale': { present: false }, '#attribute': { present: false } },
    properties: { '--ds-type-scale': '0.94' },
  });
  assert.deepEqual(plan.write, [
    { op: 'set', name: '--ds-type-scale', value: '0.94', priority: '' },
  ]);
  assert.ok(
    plan.restore.some((op) => op.op === 'remove' && op.name === '--ds-type-scale'),
    'a property the harness introduced is removed, never zeroed to a default',
  );
  // And the element that carried no `style` attribute gets none back.
  assert.ok(plan.restore.some((op) => op.op === 'remove-attribute' && op.name === 'style'));

  // The other half of the law, which fresh delivery must not erase: a
  // PREEXISTING inline declaration comes back byte-identical with its priority.
  const withPrior = planInlinePhase({
    memo: { '--ds-type-scale': { present: true, value: '1.02', priority: 'important' } },
    properties: { '--ds-type-scale': '0.94' },
  });
  assert.deepEqual(withPrior.restore, [
    { op: 'set', name: '--ds-type-scale', value: '1.02', priority: 'important' },
  ]);
});

/* ===================================================================== *
 * F4B-8 — palette.seeds: the color-set domain and the brace-set door.
 *
 * Two shapes this harness had never been asked for, and they are independent:
 * a door that names FOUR real fields, and a domain kind the value writer had no
 * branch for. Each of these drills is about ONE of them; the pair only meets in
 * `buildIngressInput`.
 *
 * The compiler measurements below run against `dist/` deliberately. What they
 * fence is not the harness but the LAW the harness is calibrating against — a
 * seed moves ten channels, a ground moves seven roles, a non-hex seed goes grey
 * — and a drill that restated those numbers from memory would go stale the
 * first time the ramp math changed.
 * ===================================================================== */

const PALETTE_MANIFEST = readManifest(resolve(CORE_ROOT, 'manifest/controls/palette.seeds.json'));
const STATIC_SET = 'palette.{primaryColor,secondaryColor,accentColor,backgroundColor}';
const DB_SET = 'appearance.general.palette.{primary,secondary,accent,background}';

/** A color-set manifest with the stops a drill needs, over the real doors. */
const colorSetManifest = (stops) => ({
  controlId: 'palette.seeds',
  domain: { kind: 'color-set', enumValues: [], bounds: null },
  ingress: { staticBrandThemePath: STATIC_SET, dbTenantThemePath: DB_SET },
  declaredOutputs: { channels: ['--ds-color-primary'] },
  calibration: { normalizedStops: stops },
});

test('F4B-8 drill 1: a color-set stop writes its HEX at the keypath its ROLE selects', () => {
  const manifest = colorSetManifest([{ id: 'primary/crimson', role: 'primary', value: '#DC2626' }]);
  const staticInput = buildIngressInput({
    armId: 'static-brand-theme',
    controlManifest: manifest,
    stopId: 'primary/crimson',
  });
  assert.equal(staticInput.path, 'palette.primaryColor');
  assert.equal(staticInput.declaredPath, STATIC_SET, 'the SET is still recorded, not lost');
  assert.equal(staticInput.ingressValue, '#DC2626');
  assert.deepEqual(staticInput.patch, { palette: { primaryColor: '#DC2626' } });

  // The same stop, the OTHER door: same role, different spelling, one member.
  const dbInput = buildIngressInput({
    armId: 'db-tenant-theme',
    controlManifest: manifest,
    stopId: 'primary/crimson',
  });
  assert.equal(dbInput.path, 'appearance.general.palette.primary');
  assert.deepEqual(dbInput.patch, { appearance: { general: { palette: { primary: '#DC2626' } } } });
});

test('F4B-8 drill 2: the set is RESOLVED, never expanded — one run writes one member', () => {
  assert.deepEqual(ingressPathMembers(STATIC_SET), [
    'palette.primaryColor',
    'palette.secondaryColor',
    'palette.accentColor',
    'palette.backgroundColor',
  ]);
  assert.deepEqual(ingressPathMembers('typography.scale'), ['typography.scale']);
  for (const [role, member] of [
    ['primary', 'palette.primaryColor'],
    ['secondary', 'palette.secondaryColor'],
    ['accent', 'palette.accentColor'],
    ['background', 'palette.backgroundColor'],
  ]) {
    assert.equal(resolveIngressMember(STATIC_SET, role), member);
  }
  // A stop with NO role cannot select a member, and the harness must not pick one.
  assert.throws(() => resolveIngressMember(STATIC_SET, undefined), /a stop must name which role/);
  assert.throws(() => resolveIngressMember(STATIC_SET, 'tertiary'), /selects 0 members/);
  // A set this harness cannot enumerate fails closed rather than being skipped.
  assert.throws(() => ingressPathMembers('palette.{a,b'), /unbalanced or nested brace set/);
  assert.throws(() => ingressPathMembers('palette.{}'), /EMPTY brace set/);
});

test('F4B-8 drill 3: THE ANTI-DOOR — a non-hex seed is refused, and the measurement says why', async () => {
  const manifest = colorSetManifest([
    { id: 'primary/named', role: 'primary', value: 'rebeccapurple' },
    { id: 'primary/functional', role: 'primary', value: 'rgb(220, 38, 38)' },
    { id: 'primary/garbage', role: 'primary', value: 'not-a-color' },
    { id: 'primary/ok', role: 'primary', value: '#DC2626' },
  ]);
  for (const stopId of ['primary/named', 'primary/functional', 'primary/garbage']) {
    assert.throws(
      () => buildIngressInput({ armId: 'static-brand-theme', controlManifest: manifest, stopId }),
      /is not a hex colour/,
      `${stopId} must be refused`,
    );
  }
  assert.doesNotThrow(() =>
    buildIngressInput({ armId: 'static-brand-theme', controlManifest: manifest, stopId: 'primary/ok' }),
  );

  /* And the reason, measured rather than asserted: the refused values do not
   * fail downstream — they go GREY and the channel MOVES, which is what makes
   * the guard load-bearing instead of fussy. The exact grey depends on the
   * ground, so this asserts the CLASS (achromatic, and different from the valid
   * seed's ramp), never a pinned hex. */
  const { deriveTenantColorRamps } = await import(`${CORE_ROOT}/dist/index.js`);
  const palette = { primaryColor: '#DC2626', backgroundColor: '#FFFFFF' };
  const good = deriveTenantColorRamps(palette, 'light')['--ds-color-primary-500'];
  for (const seed of ['rebeccapurple', 'rgb(220, 38, 38)', 'not-a-color']) {
    const grey = deriveTenantColorRamps({ ...palette, primaryColor: seed }, 'light')['--ds-color-primary-500'];
    assert.notEqual(grey, good, `"${seed}" must not derive the valid seed's ramp`);
    const [, r, g, b] = /^#(..)(..)(..)$/.exec(grey) ?? [];
    assert.equal(r, g, `"${seed}" derives an achromatic step (r=g), got ${grey}`);
    assert.equal(g, b, `"${seed}" derives an achromatic step (g=b), got ${grey}`);
  }
});

test('F4B-8 drill 4: manifest agreement accepts a MEMBER and still refuses a non-member', () => {
  const armLike = (path) => ({
    armId: 'static-brand-theme',
    provenance: {
      module: INGRESS_ARMS['static-brand-theme'].compilerModule,
      exportName: INGRESS_ARMS['static-brand-theme'].compilerExport,
      input: { path },
    },
  });
  const check = (path) =>
    assertArmsMatchManifest({ controlManifest: PALETTE_MANIFEST, arms: [armLike(path)] });
  for (const member of ingressPathMembers(PALETTE_MANIFEST.ingress.staticBrandThemePath)) {
    assert.equal(check(member).ok, true, `${member} is a declared member`);
  }
  // The half that makes the widening safe: not-a-member is still a failure.
  const bad = check('palette.tertiaryColor');
  assert.equal(bad.ok, false);
  assert.match(bad.failures[0].reason, /but the manifest declares/);
  assert.match(bad.failures[0].reason, /members: /);
  // And the whole SET is not itself a member: an arm that never resolved fails.
  assert.equal(check(PALETTE_MANIFEST.ingress.staticBrandThemePath).ok, false);
});

test('F4B-8 drill 5: each role seed moves its OWN ten steps and CROSSES ZERO', async () => {
  const { deriveTenantColorRamps } = await import(`${CORE_ROOT}/dist/index.js`);
  // The palette is fixed here (n3): the counts below are properties of THIS
  // palette, not of the derivation in general.
  const palette = {
    primaryColor: '#3B82F6', secondaryColor: '#8B5CF6', accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF', successColor: '#16A34A', warningColor: '#F59E0B',
    errorColor: '#DC2626', infoColor: '#0EA5E9',
  };
  const before = deriveTenantColorRamps(palette, 'light');
  for (const [field, role] of [['primaryColor', 'primary'], ['secondaryColor', 'secondary'], ['accentColor', 'accent']]) {
    const after = deriveTenantColorRamps({ ...palette, [field]: '#DC2626' }, 'light');
    const moved = Object.keys(before).filter((key) => before[key] !== after[key]);
    const own = moved.filter((key) => key.startsWith(`--ds-color-${role}-`));
    assert.equal(own.length, 10, `${role} must move its ten steps`);
    assert.equal(
      moved.length - own.length,
      0,
      `${role} must cross ZERO into another role; crossed: ${moved.filter((k) => !own.includes(k)).join(', ')}`,
    );
  }
});

test('F4B-8 drill 6: the GROUND is not a fourth seed — it moves every role and no seed', async () => {
  const { deriveTenantColorRamps } = await import(`${CORE_ROOT}/dist/index.js`);
  const palette = {
    primaryColor: '#3B82F6', secondaryColor: '#8B5CF6', accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF', successColor: '#16A34A', warningColor: '#F59E0B',
    errorColor: '#DC2626', infoColor: '#0EA5E9',
  };
  const seededRoles = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'];
  const before = deriveTenantColorRamps(palette, 'light');
  const after = deriveTenantColorRamps({ ...palette, backgroundColor: '#123456' }, 'light');
  const moved = Object.keys(before).filter((key) => before[key] !== after[key]);
  const touched = new Set(moved.map((key) => key.replace('--ds-color-', '').replace(/-\d+$/, '')));
  assert.deepEqual([...touched].sort(), [...seededRoles].sort(), 'the ground reaches every seeded role');
  // Derived, not pinned (n3): nine of ten steps per role move; the far endpoint
  // is fixed by the ramp law and does not track the ground.
  assert.equal(moved.length, 9 * seededRoles.length);
  // And the seeds themselves are untouched: this is a ground change, not a reseed.
  for (const field of ['primaryColor', 'secondaryColor', 'accentColor']) {
    assert.equal(palette[field], { ...palette, backgroundColor: '#123456' }[field]);
  }
});

test('W-A drill 7: an IDENTITY stop resolves against the arm own baseline, per vertical', async () => {
  const manifest = colorSetManifest([{ id: 'primary/identity', role: 'primary', identity: true }]);
  const { rottayBrandTheme, bithireBrandTheme, evntoBrandTheme } = await import(`${CORE_ROOT}/dist/index.js`);
  // The first identity in this programme that DIFFERS BY VERTICAL: radius
  // `suave` and density `normal` are constant enum ids; a colour identity is
  // "whatever this vertical already authors".
  for (const theme of [rottayBrandTheme, bithireBrandTheme, evntoBrandTheme]) {
    const input = buildIngressInput({
      armId: 'static-brand-theme',
      controlManifest: manifest,
      stopId: 'primary/identity',
      base: theme,
    });
    assert.equal(input.ingressValue, theme.palette.primaryColor);
    assert.deepEqual(input.patch, { palette: { primaryColor: theme.palette.primaryColor } });
  }
  const distinct = new Set([
    rottayBrandTheme.palette.primaryColor,
    bithireBrandTheme.palette.primaryColor,
    evntoBrandTheme.palette.primaryColor,
  ]);
  assert.equal(distinct.size, 3, 'the three identities really are three different values');
});

test('W-A drill 8: an identity with NO baseline to read fails CLOSED, on either arm', () => {
  const manifest = colorSetManifest([{ id: 'primary/identity', role: 'primary', identity: true }]);
  // No base at all.
  assert.throws(
    () => buildIngressInput({ armId: 'static-brand-theme', controlManifest: manifest, stopId: 'primary/identity' }),
    /authors nothing there/,
  );
  // A baseline that authors OTHER roles but not this one.
  assert.throws(
    () =>
      buildIngressInput({
        armId: 'static-brand-theme',
        controlManifest: manifest,
        stopId: 'primary/identity',
        base: { palette: { secondaryColor: '#315F86' } },
      }),
    /authors nothing there/,
  );
  // The DB arm takes no baseline by law (H-1 V5), so an identity stop is a
  // static-arm claim and refuses rather than inventing the vertical's value.
  assert.throws(
    () => buildIngressInput({ armId: 'db-tenant-theme', controlManifest: manifest, stopId: 'primary/identity' }),
    /identity stop is a static-arm claim/,
  );
});

/* ===================================================================== *
 * M-1 — the arm learns the MODE BLOCKS.
 *
 * `compileBrandTheme` writes a base block plus one block per authored
 * non-default mode, under `<tenant>[data-theme='X'], <tenant>.X` -- one
 * attribute more, so in that mode it OUTRANKS the base. The arm used to append
 * only the base block, which made it silent in exactly the scope that governs
 * there.
 *
 * What these drills do NOT claim: that the tenant's seed SHOULD reach the mode
 * block. Measured, it does not -- the vertical's overlay restates it, and the
 * DB compiler even adds a delta to hold that line. Whether that is the right
 * product behaviour is a separate adjudication; the arm's job is to serve what
 * the compiler wrote, and these fence that it now does.
 * ===================================================================== */

/** A provenance that satisfies H-1: the static arm must name the baseline it composed onto. */
const STATIC_PROVENANCE_FIXTURE = Object.freeze({
  module: 'dist/infrastructure/compilers/kernel/runtime/brand-theme/index.js',
  exportName: 'compileBrandTheme',
  input: {
    path: 'palette.primaryColor',
    stopId: 'fixture',
    baseline: { source: 'dist/index.js#fixtureBrandTheme', digest: 'a'.repeat(64) },
  },
});

const M1_PALETTE = readManifest(resolve(CORE_ROOT, 'manifest/controls/palette.seeds.json'));
const M1_CLOSED = [
  'density.mode',
  'spacing.rhythm',
  'shape.radius-scale',
  'surfaces.effect-intensity',
  'typography.scale',
].map((id) => readManifest(resolve(CORE_ROOT, `manifest/controls/${id}.json`)));

/** One real static lowering, arms and baselines loaded from dist. */
async function m1Lower(controlManifest, stopId, vertical) {
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  const spec = arms['static-brand-theme'];
  const lowered = lowerStop({
    armId: 'static-brand-theme',
    controlManifest,
    stopId,
    compile: spec.compile,
    vertical,
    provenance: spec.provenance,
    base: baselines[vertical].theme,
    baselineSource: baselines[vertical].source,
  });
  return { lowered, spec };
}

test('M-1 drill 1 [needs dist]: the static arm emits ONE BLOCK PER SCOPE the compiler writes', async () => {
  const { lowered, spec } = await m1Lower(M1_PALETTE, 'primary/crimson', 'bithire');
  const arm = composeStaticArm({
    vertical: 'bithire',
    variables: lowered.variables,
    producedBy: lowered.producedBy,
    modeVariables: lowered.modeVariables,
    themeModeSelector: spec.themeModeSelector,
  });
  assert.deepEqual(Object.keys(arm.modeSelectors), ['dark'], 'bithire authors a dark overlay');
  assert.equal((arm.cssBlock.match(/\{/g) ?? []).length, 2, 'base block + one mode block');
  assert.ok(arm.cssBlock.includes(arm.selector), 'the base scope is still written');
  assert.ok(arm.cssBlock.includes(arm.modeSelectors.dark), 'and the mode scope now is too');
  // The mode block carries the DECLARED channels the compiler put in it.
  assert.deepEqual(
    Object.keys(arm.modeVariables.dark).sort(),
    lowered.producedBy.modeChannels.dark,
  );
});

test('M-1 drill 2 [needs dist]: BOTH halves — the overlay governs its mode, and only its mode', async () => {
  const { lowered } = await m1Lower(M1_PALETTE, 'primary/crimson', 'bithire');
  // (a) the base scope carries the STOP: this is the tenant's decision landing.
  assert.equal(lowered.variables['--ds-color-primary'], '#DC2626');
  // (b) the mode scope carries the VERTICAL'S OWN dark value, not the stop --
  //     bithire's overlay restates primaryColor, so the seed does not reach dark.
  //     Only the second half distinguishes a real extraction from one that
  //     copied the base map into the mode block (drill 7's failure mode).
  assert.equal(lowered.modeVariables.dark['--ds-color-primary'], '#1e84e6');
  assert.notEqual(
    lowered.modeVariables.dark['--ds-color-primary'],
    lowered.variables['--ds-color-primary'],
  );
});

test('M-1 drill 3 [needs dist]: the CLOSED controls have nothing in any mode block — the fence', async () => {
  // The invariance argument, in code: five closed controls, three verticals,
  // zero declared channels in any compiled mode block. Their arm CSS therefore
  // cannot change under M-1, and this says so before anyone re-measures.
  for (const manifest of M1_CLOSED) {
    const stopId = manifest.calibration.normalizedStops[0]?.id;
    if (!stopId) continue;
    for (const vertical of ['rottay', 'bithire', 'evnto']) {
      let lowered;
      try {
        ({ lowered } = await m1Lower(manifest, stopId, vertical));
      } catch {
        continue; // a stop this arm legitimately cannot lower is not this drill's subject
      }
      for (const [mode, channels] of Object.entries(lowered.producedBy.modeChannels)) {
        assert.deepEqual(
          channels,
          [],
          `${manifest.controlId} on ${vertical} put ${channels.join(', ')} in the ${mode} block`,
        );
      }
    }
  }
});

test('M-1 drill 4: a theme with NO mode overlay yields exactly one block', () => {
  const arm = composeStaticArm({
    vertical: 'rottay',
    variables: { '--ds-x': '1' },
    producedBy: STATIC_PROVENANCE_FIXTURE,
    modeVariables: {},
    themeModeSelector: null,
  });
  assert.deepEqual(arm.modeSelectors, {});
  assert.equal((arm.cssBlock.match(/\{/g) ?? []).length, 1);
  // An EMPTY mode block is not a block either: a control with no declared
  // channel in the overlay must not emit `selector[data-theme=dark] { }`.
  const empty = composeStaticArm({
    vertical: 'rottay',
    variables: { '--ds-x': '1' },
    producedBy: STATIC_PROVENANCE_FIXTURE,
    modeVariables: { light: {} },
    themeModeSelector: null,
  });
  assert.equal((empty.cssBlock.match(/\{/g) ?? []).length, 1);
});

test('M-1 drill 5: the baseline is still untouched, so removal stays byte-identical', () => {
  const arm = composeStaticArm({
    vertical: 'bithire',
    variables: { '--ds-x': '1' },
    producedBy: STATIC_PROVENANCE_FIXTURE,
    modeVariables: { dark: { '--ds-x': '2' } },
    themeModeSelector: (base, mode) => `${base}[data-theme='${mode}']`,
  });
  const baseline = '/* baseline */\nhtml { color: red }';
  const mutated = arm.mutateCss(baseline);
  assert.ok(mutated.startsWith(baseline), 'the arm APPENDS; the baseline string is never rewritten');
  assert.equal(mutated.slice(0, baseline.length), baseline);
  // Two scopes now, and the removal phase still re-serves `baseline` itself.
  assert.equal((mutated.slice(baseline.length).match(/\{/g) ?? []).length, 2);
});

test('M-1 drill 6 [needs dist]: the mode grammar is the COMPILER\'s, imported, not spelled here', async () => {
  const arms = await loadCompilerArms();
  const spec = arms['static-brand-theme'];
  assert.equal(typeof spec.themeModeSelector, 'function', 'the arm hands out the compiler grammar');
  const { lowered } = await m1Lower(M1_PALETTE, 'primary/crimson', 'evnto');
  const arm = composeStaticArm({
    vertical: 'evnto',
    variables: lowered.variables,
    producedBy: lowered.producedBy,
    modeVariables: lowered.modeVariables,
    themeModeSelector: spec.themeModeSelector,
  });
  assert.equal(arm.modeSelectors.dark, spec.themeModeSelector(arm.selector, 'dark'));
  // And a grammar-less compose with mode blocks REFUSES rather than inventing one.
  assert.throws(
    () =>
      composeStaticArm({
        vertical: 'evnto',
        variables: lowered.variables,
        producedBy: lowered.producedBy,
        modeVariables: lowered.modeVariables,
        themeModeSelector: null,
      }),
    /was handed no themeModeSelector/,
  );
});

test('M-1 drill 7 [needs dist]: the mode block must carry the OVERLAY, never the base map', async () => {
  // THE ERROR THIS EXISTS FOR: wiring `variables` in as `modeVariables`. It
  // compiles, it emits two blocks, and it makes every control look live in the
  // non-default mode — by overwriting the vertical's own overlay, which is the
  // opposite defect and a worse one.
  const { lowered, spec } = await m1Lower(M1_PALETTE, 'primary/crimson', 'bithire');
  const correct = composeStaticArm({
    vertical: 'bithire',
    variables: lowered.variables,
    producedBy: lowered.producedBy,
    modeVariables: lowered.modeVariables,
    themeModeSelector: spec.themeModeSelector,
  });
  const wrong = composeStaticArm({
    vertical: 'bithire',
    variables: lowered.variables,
    producedBy: lowered.producedBy,
    modeVariables: { dark: lowered.variables },
    themeModeSelector: spec.themeModeSelector,
  });
  assert.notEqual(
    correct.cssBlock,
    wrong.cssBlock,
    'the extraction must not be the base map under another selector',
  );
  assert.equal(correct.modeVariables.dark['--ds-color-primary'], '#1e84e6');
  assert.equal(wrong.modeVariables.dark['--ds-color-primary'], '#DC2626');
  // And the real lowering is the correct one: the extraction reads the compiled
  // mode block, so this cannot pass by both sides being the same.
  assert.notDeepEqual(lowered.modeVariables.dark, lowered.variables);
});

/* ===================================================================== *
 * H-3 PHASE (a) — the DB arm serves the compiled artifact.
 *
 * M-1 fixed the static arm and, in doing so, proved which arm was lying: the
 * compilers AGREE in the non-default mode, and the inline DB write was the only
 * thing that made them look like they disagreed. These drills fence the new
 * transport and, above all, the two ways of getting it wrong -- flattening the
 * deltas into the base, and spelling the mode grammar in the harness.
 * ===================================================================== */

const H3A2_PALETTE = readManifest(resolve(CORE_ROOT, 'manifest/controls/palette.seeds.json'));

/** Both arms, lowered for the same stop on the same vertical, from dist. */
async function h3a2Arms(vertical, stopId = 'primary/crimson') {
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  const lowerFor = (armId, extra) =>
    lowerStop({
      armId,
      controlManifest: H3A2_PALETTE,
      stopId,
      compile: arms[armId].compile,
      vertical,
      provenance: arms[armId].provenance,
      // R-2: a palette door must declare the mode scope it is measured in, or
      // fail closed. These drills lower the real DB compiler, so they declare it.
      defaultMode: verticalDefaultMode(baselines[vertical], vertical),
      ...extra,
    });
  return {
    arms,
    staticLowered: lowerFor('static-brand-theme', {
      base: baselines[vertical].theme,
      baselineSource: baselines[vertical].source,
    }),
    dbLowered: lowerFor('db-tenant-theme', {}),
  };
}

test('H-3(a) drill 1 [needs dist]: the DB arm emits 1+n blocks, re-scoped to the SCENE', async () => {
  const { arms, dbLowered } = await h3a2Arms('bithire');
  const arm = composeDbArm({
    vertical: 'bithire',
    variables: dbLowered.variables,
    producedBy: dbLowered.producedBy,
    modeVariables: dbLowered.modeVariables,
    themeModeSelector: arms['db-tenant-theme'].themeModeSelector,
  });
  assert.equal(arm.selector, tenantArmSelector('bithire'));
  assert.deepEqual(Object.keys(arm.modeSelectors), ['dark']);
  assert.equal((arm.cssBlock.match(/\{/g) ?? []).length, 2);
  // Re-scoped, NEVER the artifact's own probe-tenant selector: the scene cannot
  // carry that slug, which is the measured reason the arm used to write inline.
  assert.equal(arm.cssBlock.includes('probe-tenant-'), false);
});

test('H-3(a) drill 2 [needs dist]: the extraction reads the DB shape, named per arm', async () => {
  // M-1 read only `modeBlocks`; the DB compiler returns `modeDeltas`. Before
  // this packet `db.modeVariables` was `{}` while its compiler had produced a
  // full dark delta -- measured, and the reason the DB half survived M-1.
  const { staticLowered, dbLowered } = await h3a2Arms('bithire');
  assert.ok(Object.keys(staticLowered.modeVariables.dark ?? {}).length > 0, 'static reads modeBlocks');
  assert.ok(Object.keys(dbLowered.modeVariables.dark ?? {}).length > 0, 'db reads modeDeltas');
  // And a compiler that returns the OTHER arm's shape yields nothing rather than
  // being accepted by a `??` chain that would take whatever was there.
  const arms = await loadCompilerArms();
  const wrongShape = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: H3A2_PALETTE,
    stopId: 'primary/crimson',
    compile: () => ({
      variables: { '--ds-color-primary': '#DC2626' },
      modeBlocks: [{ mode: 'dark', cssVariables: { '--ds-color-primary': '#000000' } }],
    }),
    vertical: 'bithire',
    provenance: arms['db-tenant-theme'].provenance,
    defaultMode: 'light',
  });
  assert.deepEqual(wrongShape.modeVariables, {}, 'the DB arm does not read modeBlocks');
});

test('H-3(a) drill 3 [needs dist]: the two arms carry the SAME dark values', async () => {
  // The measurement the whole packet rests on, asserted against both real
  // compilers rather than against literals.
  const { staticLowered, dbLowered } = await h3a2Arms('bithire');
  const s = staticLowered.modeVariables.dark;
  const d = dbLowered.modeVariables.dark;
  assert.deepEqual(Object.keys(d).sort(), Object.keys(s).sort());
  for (const channel of Object.keys(d)) {
    assert.equal(d[channel], s[channel], `${channel} must agree across arms in dark`);
  }
  // ...and the dark value is NOT the stop: the vertical overlay governs its mode.
  assert.notEqual(d['--ds-color-primary'], staticLowered.variables['--ds-color-primary']);
});

test('H-3(a) drill 4: restore is the static arm law — append only', () => {
  const arm = composeDbArm({
    vertical: 'bithire',
    variables: { '--ds-x': '1' },
    producedBy: { ...PRODUCED_BY, exportName: 'compileTenantThemeConfig' },
    modeVariables: { dark: { '--ds-x': '2' } },
    themeModeSelector: (base, mode) => `${base}[data-theme='${mode}']`,
  });
  const baseline = '/* baseline */\nhtml { color: red }';
  const mutated = arm.mutateCss(baseline);
  assert.equal(mutated.slice(0, baseline.length), baseline);
  assert.equal((mutated.slice(baseline.length).match(/\{/g) ?? []).length, 2);
});

test('H-3(a) drill 5 [needs dist]: the H-1 baseline law is untouched by the move', async () => {
  const { dbLowered } = await h3a2Arms('bithire');
  // V5: the DB arm takes no base, so it names no baseline. Changing its position
  // must not have quietly given it one.
  assert.equal(dbLowered.producedBy.input.baseline, null);
  assert.doesNotThrow(() => assertArmProvenance(dbLowered.producedBy));
});

test('H-3(a) drill 6: the inline path is NOT retired', async () => {
  // The acta, in code. The position the branch models is real (the provider
  // preview), the `dial` command still writes inline through measureScope, and
  // the H3C law stays under test.
  const measure = await import('../../measure/index.mjs');
  assert.equal(typeof measure.deliverInlineOnFreshDocument, 'function');
  assert.equal(measure.FRESH_DELIVERY_MARKER, 'inline=1');
  const source = readFileSync(
    resolve(CORE_ROOT, 'src/tooling/resolution-probe/runtime/measure/index.mjs'),
    'utf8',
  );
  assert.ok(source.includes("arm.position === 'root-inline-style'"), 'the branch is still there');
  assert.ok(source.includes('NO CAUSAL ARM TAKES THIS BRANCH TODAY, AND IT STAYS'), 'and it says why');
});

test('H-3(a) drill 7 [needs dist]: an arm with no mode delta yields exactly one block', async () => {
  // typography.scale has no declared channel in any mode block (the M-1 fence
  // table), so its DB arm must be a single block -- and an empty delta must not
  // emit an empty rule.
  const arms = await loadCompilerArms();
  const lowered = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: TYPO_H2,
    stopId: 'compacta',
    compile: arms['db-tenant-theme'].compile,
    vertical: 'bithire',
    provenance: arms['db-tenant-theme'].provenance,
  });
  const arm = composeDbArm({
    vertical: 'bithire',
    variables: lowered.variables,
    producedBy: lowered.producedBy,
    modeVariables: lowered.modeVariables,
    themeModeSelector: arms['db-tenant-theme'].themeModeSelector,
  });
  assert.deepEqual(arm.modeSelectors, {});
  assert.equal((arm.cssBlock.match(/\{/g) ?? []).length, 1);
});

test('H-3(a) drill 8 [needs dist]: FLATTENING the deltas into the base must not pass', async () => {
  /* THE ERROR THIS EXISTS FOR, and it is the mirror of M-1's drill 7. Merging
   * `modeDeltas` into the base map instead of scoping them makes "dark agree" by
   * ERASING the distinction between modes: the dark value would then paint in
   * BOTH modes. It compiles, it emits one tidy block, and it would make this
   * packet look like a success. */
  const { arms, dbLowered } = await h3a2Arms('bithire');
  const correct = composeDbArm({
    vertical: 'bithire',
    variables: dbLowered.variables,
    producedBy: dbLowered.producedBy,
    modeVariables: dbLowered.modeVariables,
    themeModeSelector: arms['db-tenant-theme'].themeModeSelector,
  });
  const flattened = composeDbArm({
    vertical: 'bithire',
    variables: { ...dbLowered.variables, ...dbLowered.modeVariables.dark },
    producedBy: dbLowered.producedBy,
    modeVariables: {},
    themeModeSelector: arms['db-tenant-theme'].themeModeSelector,
  });
  assert.notEqual(correct.cssBlock, flattened.cssBlock);
  // The base scope must carry the STOP, never the mode's value.
  assert.equal(correct.variables['--ds-color-primary'], '#DC2626');
  assert.equal(flattened.variables['--ds-color-primary'], dbLowered.modeVariables.dark['--ds-color-primary']);
  assert.equal((correct.cssBlock.match(/\{/g) ?? []).length, 2, 'two scopes');
  assert.equal((flattened.cssBlock.match(/\{/g) ?? []).length, 1, 'the flattened one has lost a scope');
});

test('H-3(a) drill 9 [needs dist]: the mode grammar has a NAMED source and is never spelled here', async () => {
  // W-A. The tenant-theme module does not export the grammar; the arm borrows
  // brand-theme's, and the lender is recorded rather than assumed.
  const arms = await loadCompilerArms();
  const brandTheme = INGRESS_ARMS['static-brand-theme'].compilerModule;
  for (const id of INGRESS_ARM_IDS) {
    assert.equal(typeof arms[id].themeModeSelector, 'function', `${id} has a grammar`);
    assert.equal(arms[id].themeModeSelectorSource, brandTheme, `${id} records where it came from`);
  }
  // Both arms therefore produce the SAME mode selector for the same scope.
  const selector = tenantArmSelector('bithire');
  assert.equal(
    arms['static-brand-theme'].themeModeSelector(selector, 'dark'),
    arms['db-tenant-theme'].themeModeSelector(selector, 'dark'),
  );
  // And an arm that lowered modes with no grammar REFUSES.
  const { dbLowered } = await h3a2Arms('bithire');
  assert.throws(
    () =>
      composeDbArm({
        vertical: 'bithire',
        variables: dbLowered.variables,
        producedBy: dbLowered.producedBy,
        modeVariables: dbLowered.modeVariables,
        themeModeSelector: null,
      }),
    /was handed no themeModeSelector/,
  );
});

test('H-3(a) drill 10 [needs dist]: no probe artifact carries a prefers-color-scheme rule TODAY', async () => {
  /* Fable note 1. `renderArtifactCss` adds an `@media (prefers-color-scheme: dark)`
   * rule when the tenant's `backgroundMode` is `auto`, and the probe scene sets
   * `colorScheme` by context, so such a rule WOULD apply. No probe envelope
   * produces one today -- asserted here rather than assumed, so the day one
   * does, this drill names the obligation instead of the arm silently serving
   * less than production. */
  const arms = await loadCompilerArms();
  const db = arms['db-tenant-theme'];
  for (const vertical of ['rottay', 'bithire', 'evnto']) {
    const compiled = db.compile({
      schemaVersion: db.provenance.schemaVersion,
      mode: 'simple',
      appearance: { palette: { primary: '#DC2626' } },
      ...dbTenantIdentity(vertical),
    });
    assert.equal(
      /@media[^{]*prefers-color-scheme/.test(compiled.css ?? ''),
      false,
      `${vertical}: a prefers-color-scheme rule appeared; the arm must now serve it too`,
    );
  }
});

/* ===================================================================== *
 * B-2 — the static arm declares the PATCH'S AUTHORSHIP.
 *
 * Since B-1 this arm composes a tenant patch over the vertical baseline. That
 * is the same two-floor composition the DB transport performs, and the DB
 * transport declares its authorship every time
 * (`composition/tenant-theme:1941-1950`). Measured for this packet's gate:
 * baseline+patch is the ONLY such composition production performs, and
 * production never performs it without a set — so an arm that composed both
 * floors and said nothing was lowering a tenant patch while telling the
 * compiler no tenant existed.
 *
 * The one exception is a RULING, not an omission: an IDENTITY stop writes the
 * value the vertical itself authors, so it is a static-arm claim about what
 * the vertical ships rather than an act of tenant authorship. Drill 7 fences
 * it, and measures what would happen if it did not.
 * ===================================================================== */

const B2_PALETTE = readManifest(resolve(CORE_ROOT, 'manifest/controls/palette.seeds.json'));

/** The three first-party baselines, from the same dist the arms bind. */
async function b2Baselines() {
  const { rottayBrandTheme, bithireBrandTheme, evntoBrandTheme } = await import(
    `${CORE_ROOT}/dist/index.js`
  );
  return { rottay: rottayBrandTheme, bithire: bithireBrandTheme, evnto: evntoBrandTheme };
}

/** Channels whose value differs between two compiles, sorted. */
const movedChannels = (before, after) =>
  Object.keys(after.cssVariables)
    .filter((name) => before.cssVariables[name] !== after.cssVariables[name])
    .sort();

test('B-2 drill 1 [needs dist]: the authorship IS the stop path, read back from the record', async () => {
  const { lowered } = await m1Lower(B2_PALETTE, 'primary/crimson', 'bithire');
  const declared = lowered.producedBy.input.tenantAuthoredPaths;
  // Compared against what the arm RECORDED as the path it wrote, never against
  // a literal: a drill that pasted 'palette.primaryColor' would keep passing
  // the day the manifest moved the door, which is the one thing it exists to
  // notice.
  assert.deepEqual(declared, [lowered.producedBy.input.path]);
  assert.equal(declared.length, 1, 'one leaf, not its containers');
  // And the two halves of the record agree: what was declared is what was
  // handed to the compiler.
  assert.deepEqual(lowered.producedBy.input.compilerInput.tenantAuthoredPaths, declared);
  assert.deepEqual(
    Object.keys(lowered.producedBy.input.compilerInput).sort(),
    ['brandTheme', 'tenantAuthoredPaths', 'tenantPatch', 'tenantSlug'],
  );
  // The DB arm declares nothing HERE, and that is honest rather than missing:
  // `compileTenantThemeConfig` collects its own authorship inside itself.
  const { dbLowered } = await h3a2Arms('bithire');
  assert.equal(dbLowered.producedBy.input.tenantAuthoredPaths, null);
});

test('B-2 drill 2 [needs dist]: a BASELINE compile is untouched — production invariance', async () => {
  const { compileBrandTheme, renderFirstPartyArtifact, FIRST_PARTY_ARTIFACT_SPECS } = await import(
    `${CORE_ROOT}/dist/index.js`
  );
  const baselines = await b2Baselines();
  for (const spec of FIRST_PARTY_ARTIFACT_SPECS) {
    const brandTheme = baselines[spec.slug];
    assert.ok(brandTheme, `no baseline for ${spec.slug}`);
    // The production shape, exactly as `renderFirstPartyArtifact:213` calls it.
    const bare = compileBrandTheme({ brandTheme, tenantSlug: spec.slug });
    const explicitlyAbsent = compileBrandTheme({
      brandTheme,
      tenantSlug: spec.slug,
      tenantAuthoredPaths: undefined,
    });
    assert.deepEqual(explicitlyAbsent.cssVariables, bare.cssVariables);
    // ... and the production entry point takes that same no-provenance path.
    const { compiled } = renderFirstPartyArtifact({ spec, brandTheme });
    assert.deepEqual(compiled.cssVariables, bare.cssVariables);
    // The vertical's OWN authored button bg survives, read from the theme
    // rather than pasted: a leaked provenance would replace it with the alias.
    const authored = brandTheme.chrome?.controls?.buttonPrimary?.bg;
    if (authored !== undefined) {
      assert.equal(bare.cssVariables['--ds-button-primary-bg'], authored);
    }
    // This cannot pass by the field being inert: the SAME theme with a tenant
    // floor and a declared path compiles differently.
    const withTenant = compileBrandTheme({
      brandTheme,
      tenantPatch: { palette: { primaryColor: '#DC2626' } },
      tenantSlug: spec.slug,
      tenantAuthoredPaths: new Set(['palette.primaryColor']),
    });
    assert.notDeepEqual(withTenant.cssVariables, bare.cssVariables);
  }
});

test('B-2 drill 3 [needs dist]: bithire\'s button follows the seed on BOTH arms', async () => {
  const { staticLowered, dbLowered } = await h3a2Arms('bithire');
  const channel = '--ds-button-primary-bg';
  // Asserted BETWEEN the two real compilers, not against a literal: the claim
  // is equivalence, so a pasted expectation would let both arms drift together
  // and still pass.
  assert.equal(staticLowered.variables[channel], dbLowered.variables[channel]);
  // And it really is the alias, not two copies of bithire's baked hex — which
  // is what this arm carried before B-2.
  assert.equal(staticLowered.variables[channel], 'var(--ds-color-primary)');
  const baselines = await b2Baselines();
  assert.equal(baselines.bithire.chrome.controls.buttonPrimary.bg, '#3A6FB0');
  assert.notEqual(staticLowered.variables[channel], '#3A6FB0');
});

test('B-2 drill 4 [needs dist]: a VERTICAL editing its own theme still does not move the button', async () => {
  /* The behaviour `applyTenantSeedDerivations` documents as intended: "No
   * provenance, or a seed this block did not get from the tenant, and the
   * function returns without touching a byte. Every static first-party compile
   * takes this path." B-2 must not make a vertical's own palette edit look
   * like a tenant selection. */
  const { compileBrandTheme } = await import(`${CORE_ROOT}/dist/index.js`);
  const baselines = await b2Baselines();
  const edited = {
    ...baselines.bithire,
    palette: { ...baselines.bithire.palette, primaryColor: '#DC2626' },
  };
  const compiled = compileBrandTheme({ brandTheme: edited, tenantSlug: 'bithire' });
  assert.equal(compiled.cssVariables['--ds-color-primary'], '#DC2626', 'the seed itself moved');
  assert.equal(
    compiled.cssVariables['--ds-button-primary-bg'],
    baselines.bithire.chrome.controls.buttonPrimary.bg,
    'but the leaf the vertical bakes did NOT follow it',
  );
});

test('B-2 drill 5: authorship over a path the patch does not write THROWS', () => {
  const patch = { palette: { primaryColor: '#DC2626' } };
  assert.deepEqual([...staticTenantAuthoredPaths({ patch, authoredPath: 'palette.primaryColor' })], [
    'palette.primaryColor',
  ]);
  /* THE LAW IS A THROW, not "no measurable effect". A set that does not
   * correspond to the patch is a false statement about who wrote what. That
   * `palette.secondaryColor` happens to be outside the consulted vocabulary
   * today is a property of that vocabulary, not of this arm. */
  assert.throws(
    () => staticTenantAuthoredPaths({ patch, authoredPath: 'palette.secondaryColor' }),
    /writes nothing there/,
  );
  // A consulted path the patch does not write is the same refusal — this is
  // the spelling that WOULD have had an effect.
  assert.throws(
    () => staticTenantAuthoredPaths({ patch, authoredPath: 'chrome.controls.buttonPrimary.bg' }),
    /writes nothing there/,
  );
  // No patch at all: the H-1 "lowered in isolation" compile has no writer to
  // attribute a claim to, and an empty patch writes nothing anywhere.
  assert.throws(
    () => staticTenantAuthoredPaths({ patch: {}, authoredPath: 'palette.primaryColor' }),
    /writes nothing there/,
  );
  // An EMPTY claim is not the same thing as no claim.
  assert.throws(() => staticTenantAuthoredPaths({ patch, authoredPath: '' }), /must NAME a keypath/);
  // And no claim is exactly that: a compile that is not a tenant.
  assert.equal(staticTenantAuthoredPaths({ patch, authoredPath: null }), undefined);
  assert.equal(staticTenantAuthoredPaths({ patch, authoredPath: undefined }), undefined);
});

test('B-2 drill 6: the CLOSED consulted vocabulary is what bounds the blast radius', () => {
  /* THE RISK THIS FENCES is not today; it is the day the vocabulary grows and
   * nobody re-reads this arm. The set is read from the CONTRACT SOURCE — the
   * compiler does not publish it through any package entrypoint — and never
   * copied, so a control whose stop starts writing a consulted field turns
   * this drill red instead of quietly changing what the arm measures. */
  const isoSource = readFileSync(
    resolve(CORE_ROOT, 'src/foundation/contracts/composition/tenants/themes/iso/index.ts'),
    'utf8',
  );
  const marker = 'export const CONSULTED_PROVENANCE_FIELDS: ReadonlySet<string> = new Set([';
  const open = isoSource.indexOf(marker);
  assert.notEqual(open, -1, 'the contract no longer declares CONSULTED_PROVENANCE_FIELDS this way');
  const close = isoSource.indexOf(']);', open);
  assert.notEqual(close, -1);
  const consulted = new Set(
    [...isoSource.slice(open + marker.length, close).matchAll(/"([^"]+)"/g)].map((m) => m[1]),
  );
  // A parse that silently returned nothing would make every assertion below
  // vacuous, so the reader proves itself first.
  assert.ok(consulted.size >= 12, `parsed only ${consulted.size} consulted fields`);
  assert.ok(consulted.has('palette.primaryColor'), 'the primary seed must be in the vocabulary');

  const controlDir = resolve(CORE_ROOT, 'manifest/controls');
  const intersections = [];
  for (const file of readdirSync(controlDir).filter((name) => name.endsWith('.json')).sort()) {
    const manifest = readManifest(resolve(controlDir, file));
    const declared = manifest?.ingress?.staticBrandThemePath;
    if (typeof declared !== 'string' || declared.length === 0) continue;
    for (const member of ingressPathMembers(declared)) {
      if (consulted.has(member)) intersections.push(`${manifest.controlId} -> ${member}`);
    }
  }
  /* Measured across EVERY control the registry declares a static door for, not
   * just the eight that carry stops today: two doors land on a field the
   * compiler consults -- the primary seed of palette.seeds, and (F4B-12,
   * 2026-08-24) navigation.sidebar-tone's own field, `chrome.sidebar.tone`
   * (SIDEBAR_TONE_FIELD), which `assignToneUnderTenantLeaves`
   * (chrome-variables/index.ts:213-230) consults via `isTenantAuthoredField`
   * to rank a tenant's tone recipe against that SAME tenant's own explicit
   * sidebar leaves. This second intersection only became VISIBLE once the
   * registry's keypath was fixed from the broken wildcard `chrome.sidebar.*`
   * to the real field -- the wildcard never matched anything here either, so
   * the consultation was silently invisible before. It does not change what
   * F4B-12's own 9 receipted scenarios measured, but NOT for the reason an
   * earlier draft of this comment gave: all 3 first-party verticals DO
   * author the six tone leaves literally (rottay/bithire/evnto's own
   * `chrome.sidebar.{bg,text,textMuted,itemBgHover,itemBgActive,itemColorActive}`
   * -- rottay's `bg` even carries its own `@governor dial:
   * navigation.sidebar-tone` doc comment). `isTenantAuthoredField` is not
   * about whether a vertical's BASELINE theme happens to write a field --
   * it is about whether `context.tenantAuthoredPaths` (built by
   * `toCompilerInput`/`buildIngressInput` from the causal harness's own
   * `tenantPatch`) contains that field's path. A causal stop patches ONLY
   * `chrome.sidebar.tone` on top of the vertical's published baseline, so
   * `tenantAuthoredPaths` carries exactly that one path -- the vertical's
   * own baseline-authored leaves are on a DIFFERENT plane (vertical baseline,
   * not tenant patch) and never enter `authoredPaths` at all, so every leaf's
   * `leafRank` falls through to `baselineLeaf(1)` regardless of how the
   * vertical wrote it. That is why `assignToneUnderTenantLeaves`'s own rank
   * table collapses to `tone(3) > leaf(1)` (B-2's own law, not an absence of
   * authorship) on every one of the 9 scenarios -- the tone wins because the
   * causal harness's own patch never contests a vertical's baseline leaf,
   * which is exactly the clean 6/6-moved result every receipt records. */
  assert.deepEqual(intersections, [
    'navigation.sidebar-tone -> chrome.sidebar.tone',
    'palette.seeds -> palette.primaryColor',
  ]);
});

test('F4B-12 drill: the registry keypath is exactly SIDEBAR_TONE_FIELD, read from its one authority', () => {
  /* DT ruling (F4B-12): the registry (capabilities/index.ts) is a purely
   * declarative contract and does not import the compiler's own
   * SIDEBAR_TONE_FIELD constant -- that would be the first infrastructure
   * import in a foundation-layer file and would cross the
   * foundation<-infrastructure direction. The registry instead states the
   * literal string `chrome.sidebar.tone` with a comment citing this exact
   * authority. This drill is what fences the derivation without the import:
   * it reads the compiler's OWN source (never a copy, never a deep-import
   * the package boundary would reject) and asserts the registry's declared
   * path is byte-identical to it. Same technique as B-2 drill 6 above
   * (CONSULTED_PROVENANCE_FIELDS), applied to a single exported literal
   * instead of a Set. */
  const chromeVariablesSource = readFileSync(
    resolve(
      CORE_ROOT,
      'src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts',
    ),
    'utf8',
  );
  const fieldMatch = chromeVariablesSource.match(
    /export const SIDEBAR_TONE_FIELD = "([^"]+)";/,
  );
  assert.ok(
    fieldMatch,
    'chrome-variables/index.ts no longer declares SIDEBAR_TONE_FIELD this way',
  );
  const [, sidebarToneField] = fieldMatch;
  assert.equal(sidebarToneField, 'chrome.sidebar.tone');

  const manifest = readManifest(
    resolve(CORE_ROOT, 'manifest/controls/navigation.sidebar-tone.json'),
  );
  assert.equal(manifest.ingress.staticBrandThemePath, sidebarToneField);

  // The closed six-channel leaf table is the other half of this control's
  // authority; pin its membership the same way so a future rename of the
  // table cannot silently drift the registry's declaredOutputs.channels
  // without this drill noticing.
  const leafFieldsMatch = chromeVariablesSource.match(
    /export const SIDEBAR_TONE_LEAF_FIELDS: Readonly<Record<string, string>> = \{([\s\S]*?)\n\};/,
  );
  assert.ok(
    leafFieldsMatch,
    'chrome-variables/index.ts no longer declares SIDEBAR_TONE_LEAF_FIELDS this way',
  );
  const leafChannels = new Set(
    [...leafFieldsMatch[1].matchAll(/"(--ds-[a-z0-9-]+)":/g)].map((m) => m[1]),
  );
  assert.ok(leafChannels.size >= 6, `parsed only ${leafChannels.size} sidebar tone leaf channels`);
  for (const channel of manifest.declaredOutputs.channels) {
    assert.ok(
      leafChannels.has(channel),
      `${channel} is not one of the six SIDEBAR_TONE_LEAF_FIELDS members`,
    );
  }
});

test('B-2 drill 7 [needs dist]: W-B — an IDENTITY stop declares NO authorship', async () => {
  const identityManifest = {
    ...B2_PALETTE,
    calibration: {
      ...B2_PALETTE.calibration,
      normalizedStops: [{ id: 'primary/identity', role: 'primary', identity: true }],
    },
  };
  const baselines = await b2Baselines();

  // The mechanics: the identity branch names no authored path, so the arm has
  // nothing to declare and the set never reaches the compiler.
  const built = buildIngressInput({
    armId: 'static-brand-theme',
    controlManifest: identityManifest,
    stopId: 'primary/identity',
    base: baselines.bithire,
  });
  assert.equal(built.identity, true);
  assert.equal(built.tenantAuthoredPath, null);
  assert.equal(built.ingressValue, baselines.bithire.palette.primaryColor);
  assert.equal(staticTenantAuthoredPaths({ patch: built.patch, authoredPath: built.tenantAuthoredPath }), undefined);

  // End to end, through the real compiler: the identity stop stays an identity.
  const { lowered } = await m1Lower(identityManifest, 'primary/identity', 'bithire');
  assert.equal(lowered.producedBy.input.tenantAuthoredPaths, null);
  assert.equal(lowered.producedBy.input.compilerInput.tenantAuthoredPaths, undefined);

  const { compileBrandTheme } = await import(`${CORE_ROOT}/dist/index.js`);
  for (const [vertical, theme] of Object.entries(baselines)) {
    const patch = { palette: { primaryColor: theme.palette.primaryColor } };
    const baseline = compileBrandTheme({ brandTheme: theme, tenantSlug: vertical });
    const asLowered = compileBrandTheme({ brandTheme: theme, tenantPatch: patch, tenantSlug: vertical });
    assert.deepEqual(
      movedChannels(baseline, asLowered),
      [],
      `${vertical}: the identity stop must be byte-identical to the baseline`,
    );
    /* AND THE RULING IS LOAD-BEARING, measured rather than assumed: declaring
     * authorship of the vertical's OWN value moves real channels, because the
     * seed derivation reads the CLAIM and not the value. On bithire that is
     * exactly the leaf this control is about. */
    const asAuthored = compileBrandTheme({
      brandTheme: theme,
      tenantPatch: patch,
      tenantSlug: vertical,
      tenantAuthoredPaths: new Set(['palette.primaryColor']),
    });
    assert.ok(
      movedChannels(baseline, asAuthored).length > 0,
      `${vertical}: declaring authorship of the identity value must NOT be a no-op`,
    );
  }
  const bithire = baselines.bithire;
  const authoredIdentity = compileBrandTheme({
    brandTheme: bithire,
    tenantPatch: { palette: { primaryColor: bithire.palette.primaryColor } },
    tenantSlug: 'bithire',
    tenantAuthoredPaths: new Set(['palette.primaryColor']),
  });
  assert.equal(
    authoredIdentity.cssVariables['--ds-button-primary-bg'],
    'var(--ds-color-primary)',
    'bithire: with the flag, the identity stop stops being an identity',
  );
  assert.equal(bithire.chrome.controls.buttonPrimary.bg, '#3A6FB0');

  // The ruling is WRITTEN beside the branch that resolves identity, so a
  // future reader meets the reason before the code.
  const armSource = readFileSync(resolve(CORE_ROOT, 'src/tooling/resolution-probe/runtime/ingress/index.mjs'), 'utf8');
  const ruling = armSource.indexOf('AN IDENTITY STOP DECLARES NO AUTHORSHIP');
  const branch = armSource.indexOf('const tenantAuthoredPath = isIdentityStop');
  assert.notEqual(ruling, -1, 'the W-B ruling is not written in the arm');
  assert.notEqual(branch, -1);
  assert.ok(ruling < branch, 'the ruling must sit above the branch it governs');
});

/* ==========================================================================
 * R-2 — the emptiness question is asked over EVERY scope, and the DB document
 * declares the mode scope it is measured in.
 * ======================================================================== */

/**
 * The exact shape `compileTenantThemeConfig` returns for rottay +
 * `primary/crimson` when the document declares no `backgroundMode` — measured
 * in R-1, reproduced by Fable, and frozen here as a fixture rather than
 * recomputed, so this drill states the defect even if the compiler later stops
 * producing it.
 */
const R2_ROTTAY_NON_DEFAULT_MODE_SHAPE = Object.freeze({
  variables: {},
  modeDeltas: [
    {
      mode: 'light',
      variables: {
        '--ds-color-primary': '#DC2626',
        '--ds-chart-series-1': '#B33831',
        '--ds-color-link': '#DC2626',
        '--ds-color-primary-rgb': '220, 38, 38',
      },
    },
  ],
});

test('R-2 drill 1: a lowering empty in BASE but alive in a mode block IS an arm, not a finding', () => {
  const lowered = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: M1_PALETTE,
    stopId: 'primary/crimson',
    compile: () => R2_ROTTAY_NON_DEFAULT_MODE_SHAPE,
    vertical: 'rottay',
    defaultMode: 'dark',
    provenance: { schemaVersion: 1 },
  });
  // The base map is legitimately empty — that is the fact the old guard read.
  assert.deepEqual(lowered.variables, {});
  // And the lowering is real: two of the five declared channels, in `light`.
  assert.deepEqual(Object.keys(lowered.modeVariables), ['light']);
  assert.deepEqual(lowered.modeVariables.light, {
    '--ds-color-primary': '#DC2626',
    '--ds-chart-series-1': '#B33831',
  });
  // WHICH scope carried what is on the record, per channel (M-1's `modeChannels`).
  assert.deepEqual(lowered.producedBy.modeChannels, {
    light: ['--ds-chart-series-1', '--ds-color-primary'],
  });
  assert.deepEqual(lowered.producedBy.emittedChannels, []);
  // And the arm composes: `assertVariables` no longer refuses an empty base.
  const arm = composeDbArm({
    vertical: 'rottay',
    variables: lowered.variables,
    producedBy: lowered.producedBy,
    modeVariables: lowered.modeVariables,
    themeModeSelector: (base, mode) => `${base}[data-theme='${mode}']`,
  });
  assert.deepEqual(Object.keys(arm.modeSelectors), ['light']);
  assert.ok(arm.cssBlock.includes('--ds-color-primary: #DC2626'));
});

test('R-2 drill 2: empty in EVERY scope is still the finding, and the message names the scopes', () => {
  // (a) no mode block at all — the pre-R-2 case, unchanged.
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: M1_PALETTE,
        stopId: 'primary/crimson',
        compile: () => ({ variables: { '--ds-something-else': '1' } }),
        vertical: 'rottay',
        defaultMode: 'dark',
        provenance: { schemaVersion: 1 },
      }),
    /emitted none of the declared channels[\s\S]*in ANY scope[\s\S]*no mode block/,
  );
  // (b) mode blocks present but carrying none of the DECLARED channels.
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: M1_PALETTE,
        stopId: 'primary/crimson',
        compile: () => ({
          variables: {},
          modeDeltas: [{ mode: 'light', variables: { '--ds-unrelated': '1' } }],
        }),
        vertical: 'rottay',
        defaultMode: 'dark',
        provenance: { schemaVersion: 1 },
      }),
    /in ANY scope[\s\S]*not in any mode block \(light\)/,
  );
  // (c) and the composer agrees: every scope empty is refused.
  assert.throws(
    () =>
      composeDbArm({
        vertical: 'rottay',
        variables: {},
        producedBy: { ...PRODUCED_BY, module: INGRESS_ARMS['db-tenant-theme'].compilerModule, exportName: 'compileTenantThemeConfig', input: { path: 'appearance.general.palette.primary', stopId: 'x' } },
        modeVariables: { light: {} },
      }),
    /carries no variable in ANY scope/,
  );
});

test('R-2 drill 3: the DB document declares the vertical\'s OWN default mode, from the published BrandTheme', async () => {
  const baselines = await loadStaticBaselines();
  /* W-A ASKED FOR THIS TO BE VERIFIED, AND THE VERIFICATION CORRECTED ITS
   * EVIDENCE. The preaudit's reason for reading the BrandTheme was that
   * `FIRST_PARTY_THEMES.<v>.appearance.defaultMode` is `undefined`. Measured: it
   * is `"dark"` -- the Theme projection DOES carry the field. The prescription
   * is right anyway, and for a stronger reason: `FIRST_PARTY_THEMES` is not on
   * the PUBLISHED entrypoint at all, so reaching it would need a deep import --
   * exactly what this harness refuses for its compilers, because a deep path can
   * be tree-shaken out from under it with no gate noticing. The BrandTheme is
   * published, and `loadStaticBaselines()` already loads it under the freshness
   * law. Both halves are asserted so neither claim can rot silently. */
  const published = await import(`${CORE_ROOT}/dist/index.js`);
  assert.equal(
    'FIRST_PARTY_THEMES' in published,
    false,
    'the Theme projection is not reachable from the published entrypoint',
  );
  assert.equal('rottayBrandTheme' in published, true);
  const { FIRST_PARTY_THEMES } = await import(
    `${CORE_ROOT}/dist/foundation/tokens/ts/presentation/brand-themes/index.js`
  );
  assert.equal(FIRST_PARTY_THEMES.rottay.appearance?.defaultMode, 'dark');
  assert.equal(verticalDefaultMode(baselines.rottay, 'rottay'), 'dark');
  assert.equal(verticalDefaultMode(baselines.bithire, 'bithire'), 'light');
  assert.equal(verticalDefaultMode(baselines.evnto, 'evnto'), 'light');

  // Fail-closed: a theme with no usable defaultMode refuses rather than assuming light.
  for (const bad of [{ theme: {}, source: 's' }, { theme: { appearance: { defaultMode: 'auto' } }, source: 's' }, null]) {
    assert.throws(() => verticalDefaultMode(bad, 'rottay'), /declares no usable[\s\S]*defaultMode/);
  }

  // The declared scope reaches the compiler input, and is NAMED on the record.
  const built = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: M1_PALETTE,
    stopId: 'primary/crimson',
    compile: (input) => {
      assert.equal(input.appearance.palette.backgroundMode, 'dark');
      return R2_ROTTAY_NON_DEFAULT_MODE_SHAPE;
    },
    vertical: 'rottay',
    defaultMode: verticalDefaultMode(baselines.rottay, 'rottay'),
    provenance: { schemaVersion: 1 },
  });
  assert.equal(built.producedBy.input.modeScope, 'dark');
  assert.equal(built.producedBy.input.compilerInput.appearance.palette.backgroundMode, 'dark');
  // W-A verified rather than restated: it does NOT travel in `document`, which is
  // the pre-reshape manifest-path-relative shape.
  assert.equal(built.producedBy.input.document.appearance.general.palette.backgroundMode, undefined);
});

test('R-2 drill 4: the scope stamp lands ONLY on a document that already writes a palette node', () => {
  // A palette door with no declared scope fails closed rather than assuming light.
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: M1_PALETTE,
        stopId: 'primary/crimson',
        compile: () => R2_ROTTAY_NON_DEFAULT_MODE_SHAPE,
        vertical: 'rottay',
        provenance: { schemaVersion: 1 },
      }),
    /writes a palette node[\s\S]*no vertical defaultMode/,
  );
  /* AND THE NON-PALETTE DOORS ARE UNTOUCHED — the half that protects the 46
   * receipted scenarios. `backgroundMode` lives INSIDE `palette`, so stamping it
   * unconditionally would MATERIALISE a palette node on a density document;
   * `migratePalette` would then emit ten all-undefined seed fields that
   * `collectPatchAuthoredPaths` collects as authored keypaths, including
   * `palette.primaryColor` (a CONSULTED_PROVENANCE_FIELDS member), firing the
   * governed seed-derivation ladder. Measured: 24 of the 36 receipted DB-arm
   * compiles change VALUE that way. */
  let seen = null;
  lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: CONTROL_MANIFEST, // spacing.rhythm — door is appearance.general.rhythm
    stopId: 'airy',
    compile: (input) => {
      seen = input;
      return { variables: { '--ds-rhythm-scale': '1.2' } };
    },
    vertical: 'rottay',
    defaultMode: 'dark',
    provenance: { schemaVersion: 1 },
  });
  assert.deepEqual(seen.appearance, { rhythm: 'airy' }, 'no palette node is materialised');
  assert.equal(Object.hasOwn(seen.appearance, 'palette'), false);
});

test('R-2 drill 5 [needs dist]: crimson through the DB door on rottay-dark is REFUSED by the APCA floor', async () => {
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  const spec = arms['db-tenant-theme'];
  /* The exclusion this control asserts is not a preference: the vertical
   * envelope rejects the stop. rottay's dark identity pairs
   * `--ds-color-primary: #FFFFFF` with near-black on-primary ink, so a mid
   * chromatic seed drops the pair below the governed contrast floor. Citing the
   * REAL message (P3): the compiler names the BUTTON pair. */
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: M1_PALETTE,
        stopId: 'primary/crimson',
        compile: spec.compile,
        vertical: 'rottay',
        defaultMode: verticalDefaultMode(baselines.rottay, 'rottay'),
        provenance: spec.provenance,
      }),
    /dark --ds-button-primary-color has APCA Lc 32\.2 against --ds-button-primary-bg/,
  );
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: M1_PALETTE,
        stopId: 'primary/indigo',
        compile: spec.compile,
        vertical: 'rottay',
        defaultMode: verticalDefaultMode(baselines.rottay, 'rottay'),
        provenance: spec.provenance,
      }),
    /dark --ds-button-primary-color has APCA Lc 23\.2 against --ds-button-primary-bg/,
  );
  // The same two stops lower fine on the light-default verticals: the exclusion
  // is a property of rottay's dark identity, not of the stop.
  for (const vertical of ['bithire', 'evnto']) {
    const lowered = lowerStop({
      armId: 'db-tenant-theme',
      controlManifest: M1_PALETTE,
      stopId: 'primary/crimson',
      compile: spec.compile,
      vertical,
      defaultMode: verticalDefaultMode(baselines[vertical], vertical),
      provenance: spec.provenance,
    });
    assert.equal(lowered.variables['--ds-color-primary'], '#DC2626');
  }
});

test('R-2 drill 6 [needs dist]: the scope-matched door puts rottay\'s seed in the BODY, and H-2 stays decidable', async () => {
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  const spec = arms['db-tenant-theme'];
  const staticSpec = arms['static-brand-theme'];

  /* THE ROSTER IS PER VERTICAL, and measured to be a partition rather than a
   * preference: the governed floor is evaluated against the DEFAULT mode's
   * on-primary ink, which is near-black on rottay and white on bithire/evnto.
   * A 216-seed sweep of the RGB cube found ZERO seeds admissible on all three
   * (79 rottay-only, 122 bithire+evnto-only, 15 nowhere, mixed-other EMPTY). */
  const DB_STOPS = {
    rottay: ['primary/warm-sand', 'primary/pale-mint'],
    bithire: ['primary/crimson', 'primary/indigo'],
    evnto: ['primary/crimson', 'primary/indigo'],
  };
  for (const vertical of ['rottay', 'bithire', 'evnto']) {
    const defaultMode = verticalDefaultMode(baselines[vertical], vertical);
    for (const stopId of DB_STOPS[vertical]) {
      const db = lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: M1_PALETTE,
        stopId,
        compile: spec.compile,
        vertical,
        defaultMode,
        provenance: spec.provenance,
      });
      // The seed lands in the BASE map on every vertical now — the scope the
      // static arm writes by construction.
      assert.ok(
        Object.hasOwn(db.variables, '--ds-color-primary'),
        `${vertical}/${stopId}: the DB seed must land in the body, not an overlay`,
      );
      const stat = lowerStop({
        armId: 'static-brand-theme',
        controlManifest: M1_PALETTE,
        stopId,
        compile: staticSpec.compile,
        vertical,
        provenance: staticSpec.provenance,
        base: baselines[vertical].theme,
        baselineSource: baselines[vertical].source,
      });
      assert.equal(
        stat.variables['--ds-color-primary'],
        db.variables['--ds-color-primary'],
        `${vertical}/${stopId}: both doors must write the same scope`,
      );
    }
    // H-2, per arm, on the same scope the arm measures.
    for (const [armId, loaded] of [
      ['db-tenant-theme', spec],
      ['static-brand-theme', staticSpec],
    ]) {
      const verdict = assertStopDiscrimination({
        armId,
        controlManifest: M1_PALETTE,
        compile: loaded.compile,
        vertical,
        provenance: loaded.provenance,
        defaultMode,
        ...(armId === 'static-brand-theme' ? { baseline: baselines[vertical] } : {}),
      });
      assert.equal(verdict.outcome, 'PASS', `${vertical}/${armId}: H-2 must be decidable`);
      assert.ok(verdict.witnesses.length >= 2, `${vertical}/${armId}: two witnesses minimum`);
      assert.ok(
        verdict.discriminating.includes('--ds-color-primary'),
        `${vertical}/${armId}: the direct witness must discriminate`,
      );
    }
  }
});

test('R-2 drill 7: widening the guard cannot re-adjudicate a receipted arm', () => {
  /* The invariance the 46 rest on, asserted rather than argued: the new law only
   * ADMITS lowerings the old one refused. Any arm with a non-empty base map —
   * which every receipted arm has — takes exactly the same path it took before,
   * and its `variables` are byte-identical. */
  const compile = () => ({
    variables: { '--ds-rhythm-scale': '1.2', '--ds-unrelated': 'x' },
    modeDeltas: [{ mode: 'dark', variables: { '--ds-rhythm-scale': '1.2' } }],
  });
  const lowered = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: CONTROL_MANIFEST,
    stopId: 'airy',
    compile,
    vertical: 'rottay',
    defaultMode: 'dark',
    provenance: { schemaVersion: 1 },
  });
  assert.deepEqual(lowered.variables, { '--ds-rhythm-scale': '1.2' });
  assert.deepEqual(lowered.producedBy.emittedChannels, ['--ds-rhythm-scale']);
  assert.deepEqual(lowered.producedBy.omittedChannels, ['--ds-rhythm-effective-scale']);
  // A non-palette door declares no mode scope, and says so rather than inventing one.
  assert.equal(lowered.producedBy.input.modeScope, null);
});

/* ==========================================================================
 * R-2 hardening — the exclusion path is a CLOSED set, decided by type.
 * ======================================================================== */

test('R-2 drill 8: an unexpected throw is RE-THROWN, never published as an exclusion', async () => {
  const baselines = await loadStaticBaselines();
  /* The shape this closes: a broken double (or a renamed field, or a wiring
   * mistake) used to become a legitimate-looking "this stop cannot lower". The
   * witness set shrank and the guard reported the shrunken set as a
   * measurement -- the guard's own false green. */
  const brokenDouble = () => {
    throw new TypeError("Cannot read properties of undefined (reading 'cssVariables')");
  };
  await assert.rejects(
    async () =>
      assertStopDiscrimination({
        armId: 'db-tenant-theme',
        controlManifest: M1_PALETTE,
        compile: brokenDouble,
        vertical: 'rottay',
        provenance: { schemaVersion: 1 },
        defaultMode: verticalDefaultMode(baselines.rottay, 'rottay'),
      }),
    (error) =>
      error instanceof TypeError &&
      /NOT allowed to publish as an exclusion \(TypeError\)/.test(error.message) &&
      /publishable set is closed: COMPILER_ELIDES_VERTICAL_DEFAULT/.test(error.message) &&
      /Cannot read properties of undefined/.test(error.message),
    'a TypeError from a broken double must surface, not become an exclusion reason',
  );
  // And the same for a plain Error: it is the CLASS that admits, not the shape.
  await assert.rejects(
    async () =>
      assertStopDiscrimination({
        armId: 'db-tenant-theme',
        controlManifest: M1_PALETTE,
        compile: () => {
          throw new Error('some future refactor renamed a field');
        },
        vertical: 'rottay',
        provenance: { schemaVersion: 1 },
        defaultMode: verticalDefaultMode(baselines.rottay, 'rottay'),
      }),
    /NOT allowed to publish as an exclusion/,
  );
});

test('R-2 drill 9: each KNOWN class publishes, with its class and its reason', async () => {
  // The class is carried on the error, so this is a type test end to end.
  assert.equal(
    classifyStopExclusion(
      new StopExclusionError(STOP_EXCLUSION_CLASSES.DOMAIN_KIND_NOT_LOWERED, 'x'),
    ),
    'DOMAIN_KIND_NOT_LOWERED',
  );
  // The product compiler's throw is classified by TYPE plus its own issue
  // payload -- the only place the APCA/envelope distinction exists.
  const validationError = (issues) => Object.assign(new Error('v'), {
    name: 'TenantThemeValidationError',
    issues,
  });
  assert.equal(
    classifyStopExclusion(
      validationError([{ message: 'dark --ds-button-primary-color has APCA Lc 32.2 against x' }]),
    ),
    'GOVERNED_CONTRAST_FLOOR',
  );
  assert.equal(
    classifyStopExclusion(validationError([{ message: 'Number must be between 0.75 and 1.25' }])),
    'VERTICAL_ENVELOPE_REJECTS_STOP',
  );
  assert.equal(classifyStopExclusion(new TypeError('boom')), null);
  // A class outside the closed set cannot even be constructed.
  assert.throws(
    () => new StopExclusionError('INVENTED_CLASS', 'x'),
    /is not a declared stop-exclusion class/,
  );

  // End to end on the real compilers: every exclusion the six R-2 scenarios
  // produce carries a class from the closed set, and the APCA ones carry the
  // compiler's own message.
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  const seen = new Set();
  for (const vertical of ['rottay', 'bithire', 'evnto']) {
    const verdict = assertStopDiscrimination({
      armId: 'db-tenant-theme',
      controlManifest: M1_PALETTE,
      compile: arms['db-tenant-theme'].compile,
      vertical,
      provenance: arms['db-tenant-theme'].provenance,
      defaultMode: verticalDefaultMode(baselines[vertical], vertical),
    });
    assert.equal(verdict.excluded.length, 3, `${vertical}: three stops are inadmissible on the DB arm`);
    for (const entry of verdict.excluded) {
      assert.ok(
        Object.hasOwn(STOP_EXCLUSION_CLASSES, entry.exclusionClass),
        `${vertical}/${entry.stopId}: exclusion class ${entry.exclusionClass} is not in the closed set`,
      );
      assert.ok(entry.reason.length > 0);
      seen.add(entry.exclusionClass);
      if (entry.exclusionClass === STOP_EXCLUSION_CLASSES.GOVERNED_CONTRAST_FLOOR) {
        assert.match(entry.reason, /APCA Lc -?\d+\.\d+ against --ds-button-primary-bg/);
      }
    }
  }
  assert.deepEqual(
    [...seen].sort(),
    ['GOVERNED_CONTRAST_FLOOR', 'IDENTITY_NEEDS_A_BASELINE'],
    'the two classes this control actually exhibits, named rather than assumed',
  );
});

test('R-2 drill 10: the hardening did not change WHAT is excluded, only how it is admitted', async () => {
  /* Point (3) of the hardening ruling, as an executable fence rather than a
   * claim in a report.
   *
   * The comparison is against a FROZEN fixture of the exclusion records as they
   * stood BEFORE the hardening -- captured from the six R-2 scenarios while the
   * catch was still untyped -- and not against the committed artifacts. Two
   * reasons, and the second is the load-bearing one: the artifacts are re-run
   * whenever the instrument changes (W-B), so comparing to them would decay
   * into post-versus-post the moment they are refreshed, and the pre/post claim
   * would quietly stop being tested. A frozen fixture cannot decay.
   *
   * What it proves: every exclusion the six scenarios produce was ALREADY a
   * known class, so the hardening admits exactly the same set. It adds
   * `exclusionClass` and it re-throws everything else; it excludes nothing new
   * and it swallows nothing it used to publish. */
  const { readFileSync } = await import('node:fs');
  const PRE = JSON.parse(
    readFileSync(new URL('./r2-pre-hardening-exclusions.json', import.meta.url), 'utf8'),
  );
  const arms = await loadCompilerArms();
  const baselines = await loadStaticBaselines();
  let compared = 0;
  for (const vertical of ['rottay', 'bithire', 'evnto']) {
    for (const armId of ['static-brand-theme', 'db-tenant-theme']) {
      const verdict = assertStopDiscrimination({
        armId,
        controlManifest: M1_PALETTE,
        compile: arms[armId].compile,
        vertical,
        provenance: arms[armId].provenance,
        defaultMode: verticalDefaultMode(baselines[vertical], vertical),
        ...(armId === 'static-brand-theme' ? { baseline: baselines[vertical] } : {}),
      });
      assert.deepEqual(
        verdict.excluded.map((e) => ({ stopId: e.stopId, reason: e.reason })),
        PRE[vertical][armId],
        `${vertical}/${armId}: the hardening must not move a single exclusion`,
      );
      // And every one of them now carries a class from the closed set.
      for (const entry of verdict.excluded) {
        assert.ok(
          Object.hasOwn(STOP_EXCLUSION_CLASSES, entry.exclusionClass),
          `${vertical}/${armId}/${entry.stopId}: ${entry.exclusionClass} is not in the closed set`,
        );
      }
      compared += 1;
    }
  }
  assert.equal(compared, 6, 'three verticals x two arms');
});


/* ==========================================================================
 * FASE-A — the advanced-envelope branch. A2..A7.
 * ========================================================================== */

test('A2: R-2 drill 4, advanced half -- no palette node means no stamp and no materialised general', () => {
  let seen = null;
  lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: ADVANCED_MANIFEST,
    stopId: ADVANCED_STOP,
    compile: (input) => {
      seen = input;
      return { variables: { '--ds-rhythm-scale': '1.2' }, verticalEnvelopeDigest: FAKE_DIGEST };
    },
    vertical: 'rottay',
    provenance: { schemaVersion: 1 },
    verticalEnvelopeFor: () => ({ verticalKey: 'rottay' }),
  });
  // The seal's condition is unchanged word for word: it fires only on a
  // document that ALREADY writes a palette node. This one does not, so nothing
  // is stamped and no `general` is invented -- the same protection the simple
  // half gives the receipted scenarios.
  assert.equal(seen.visualFoundation.general, undefined);
  assert.equal(seen.mode, 'advanced');
  assert.equal(seen.appearance, undefined);
});

test('A3: the vertical envelope comes from the PUBLISHED module, and fails closed', async () => {
  // No resolver at all: the run breaks rather than compiling ungoverned.
  assert.throws(
    () => advancedCompileOptions({ armId: 'db-tenant-theme', mode: 'advanced', vertical: 'rottay' }),
    /no resolver was handed to lowerStop/,
  );
  // A resolver that cannot resolve THIS vertical: same refusal, different half.
  assert.throws(
    () =>
      advancedCompileOptions({
        armId: 'db-tenant-theme',
        mode: 'advanced',
        vertical: 'rottay',
        verticalEnvelopeFor: () => undefined,
      }),
    /resolves no vertical policy envelope/,
  );
  // And the real arm carries the real export, from the module the compiler
  // itself came from.
  const arms = await loadCompilerArms();
  assert.equal(typeof arms['db-tenant-theme'].verticalEnvelopeFor, 'function');
  const envelope = arms['db-tenant-theme'].verticalEnvelopeFor('bithire');
  assert.equal(envelope.verticalKey, 'bithire');
});

test('A4/A5: compile takes TWO arguments -- {} in simple, the envelope in advanced', () => {
  const calls = [];
  lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: CONTROL_MANIFEST,
    stopId: 'airy',
    compile: (...args) => {
      calls.push(args);
      return { variables: { '--ds-rhythm-scale': '1.2' } };
    },
    vertical: 'rottay',
    provenance: { schemaVersion: 1 },
  });
  assert.equal(calls[0].length, 2, 'arity is stable');
  assert.deepEqual(calls[0][1], {}, 'simple hands over nothing -- and says so with {}');

  const envelope = { verticalKey: 'rottay', ranges: {} };
  const advCalls = [];
  lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: ADVANCED_MANIFEST,
    stopId: ADVANCED_STOP,
    compile: (...args) => {
      advCalls.push(args);
      return { variables: { '--ds-rhythm-scale': '1.2' }, verticalEnvelopeDigest: FAKE_DIGEST };
    },
    vertical: 'rottay',
    provenance: { schemaVersion: 1 },
    verticalEnvelopeFor: () => envelope,
  });
  assert.equal(advCalls[0].length, 2);
  assert.equal(advCalls[0][1].verticalEnvelope, envelope, 'the SAME object, not a rebuild');
});

test('A6 (W-A.1): the second argument is in the provenance, digest read off the artifact', () => {
  const simple = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: CONTROL_MANIFEST,
    stopId: 'airy',
    compile: () => ({ variables: { '--ds-rhythm-scale': '1.2' } }),
    vertical: 'rottay',
    provenance: { schemaVersion: 1 },
  });
  assert.deepEqual(simple.producedBy.input.compileOptions, {}, 'honest: nothing was handed over');

  const advanced = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: ADVANCED_MANIFEST,
    stopId: ADVANCED_STOP,
    compile: () => ({ variables: { '--ds-rhythm-scale': '1.2' }, verticalEnvelopeDigest: FAKE_DIGEST }),
    vertical: 'rottay',
    provenance: { schemaVersion: 1 },
    verticalEnvelopeFor: () => ({ verticalKey: 'rottay' }),
  });
  assert.deepEqual(advanced.producedBy.input.compileOptions, {
    verticalEnvelope: { verticalKey: 'rottay', digest: FAKE_DIGEST },
  });
  // The two halves of the record cannot disagree, because the digest is READ
  // from the artifact rather than recomputed here (B-2's law).
  assert.equal(advanced.producedBy.input.compileOptions.verticalEnvelope.digest, FAKE_DIGEST);
  // And an advanced compile that names no envelope cannot be recorded at all.
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: ADVANCED_MANIFEST,
        stopId: ADVANCED_STOP,
        compile: () => ({ variables: { '--ds-rhythm-scale': '1.2' } }),
        vertical: 'rottay',
        provenance: { schemaVersion: 1 },
        verticalEnvelopeFor: () => ({ verticalKey: 'rottay' }),
      }),
    /no well-formed verticalEnvelopeDigest/,
  );
});

test('A7 (W-A.2): the seal reaches the advanced space too -- synthetic palette door', () => {
  /* No advanced control writes a palette today, so the fence for "the day one
   * does" has to be synthetic. The door is declared under the advanced space
   * and lands on `visualFoundation.general.palette.*`, which is the SAME
   * TenantAppearanceGeneral the simple space puts at `appearance`. */
  const synthetic = {
    ...M1_PALETTE,
    ingress: {
      ...M1_PALETTE.ingress,
      dbTenantThemePath: 'visualFoundation.general.palette.primaryColor',
    },
  };
  const stopId = M1_PALETTE.calibration.normalizedStops[0].id;
  // Fail-closed half: a palette node with no declared mode scope refuses.
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: synthetic,
        stopId,
        compile: () => ({ variables: { '--ds-color-primary': '#B3123C' }, verticalEnvelopeDigest: FAKE_DIGEST }),
        vertical: 'rottay',
        provenance: { schemaVersion: 1 },
        verticalEnvelopeFor: () => ({ verticalKey: 'rottay' }),
      }),
    /writes a palette node[\s\S]*no vertical defaultMode/,
  );
  // Stamped half: with the scope declared, the seal lands on the general the
  // advanced space carries -- and the provenance reads it back from there.
  let seen = null;
  const lowered = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: synthetic,
    stopId,
    compile: (input) => {
      seen = input;
      return { variables: { '--ds-color-primary': '#B3123C' }, verticalEnvelopeDigest: FAKE_DIGEST };
    },
    vertical: 'rottay',
    provenance: { schemaVersion: 1 },
    defaultMode: 'dark',
    verticalEnvelopeFor: () => ({ verticalKey: 'rottay' }),
  });
  assert.equal(seen.mode, 'advanced');
  assert.equal(seen.visualFoundation.general.palette.backgroundMode, 'dark');
  assert.ok(seen.visualFoundation.general.palette.primaryColor, 'the seed travelled into general');
  assert.equal(lowered.producedBy.input.modeScope, 'dark', 'modeScope finds it in either space');
});


/* ==========================================================================
 * FASE-B — the font-stack branch and the brace-in-the-middle law. B1..B4.
 * ========================================================================== */

/** The eight stops of the design's Q2.a table, with the verdict each arm gives. */
const B1_STOPS = [
  { value: 'Inter, system-ui, sans-serif', lowerable: true },
  { value: '"IBM Plex Sans", Helvetica, sans-serif', lowerable: true },
  { value: "'Fira Sans', Arial, sans-serif", lowerable: true },
  // A font-pack id that does not exist: the real ids end in -display/-text/-mono.
  { value: 'var(--ds-font-pack-grotesk), sans-serif', lowerable: false },
  { value: '  Inter, sans-serif  ', lowerable: false },
  { value: '', lowerable: false },
  { value: 'url(https://evil/x.woff2)', lowerable: false },
  { value: 'Inter; } html { display:none } /*', lowerable: false },
];

test('B1: the font-stack branch lowers exactly what the product contract admits', () => {
  const manifest = {
    ...CONTROL_MANIFEST,
    controlId: 'typography.families',
    domain: { kind: 'font-stack', enumValues: [] },
    ingress: { dbTenantThemePath: 'appearance.general.typography.fontFamilyBase' },
    declaredOutputs: { channels: ['--ds-font-family-base'] },
  };
  for (const { value, lowerable } of B1_STOPS) {
    const stops = [{ id: 'stack', value, role: 'fontFamilyBase' }];
    const run = () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: { ...manifest, calibration: { normalizedStops: stops } },
        stopId: 'stack',
        compile: () => ({ variables: { '--ds-font-family-base': value } }),
        vertical: 'rottay',
        provenance: { schemaVersion: 1 },
      });
    if (lowerable) {
      assert.equal(isLowerableFontStack(value), true, `${JSON.stringify(value)} must lower`);
      assert.doesNotThrow(run);
    } else {
      assert.equal(isLowerableFontStack(value), false, `${JSON.stringify(value)} must be refused`);
      let thrown = null;
      try {
        run();
      } catch (error) {
        thrown = error;
      }
      assert.ok(thrown instanceof StopExclusionError, `${JSON.stringify(value)} refuses by class`);
      // Same class `color-set` uses for a value this harness will not lower.
      assert.equal(thrown.exclusionClass, STOP_EXCLUSION_CLASSES.DOMAIN_KIND_NOT_LOWERED);
      assert.match(thrown.message, /font-stack domain/);
    }
  }
});

test('B1b: the replica does not drift from the PUBLISHED product contract', async () => {
  // The three constants are COPIED into the pure module on purpose (no dist on
  // the ingress path). This is the drill that keeps the copy honest.
  const server = await import(
    pathToFileURL(resolve(CORE_ROOT, 'dist/server.js')).href
  );
  assert.deepEqual(
    [...server.TENANT_THEME_FONT_PACK_IDS].sort(),
    ['editorial-display', 'editorial-text', 'geometric-display', 'grotesk-display', 'humanist-text', 'plex-mono'],
    'the pack id set the replica encodes is the published one',
  );
  assert.equal(server.TENANT_THEME_CONFIG_SCHEMA.limits.maxFontFamilyLength, 200);
  // And the replica agrees with the product validator stop for stop, through
  // the real DB door.
  for (const { value, lowerable } of B1_STOPS) {
    let dbAccepts = true;
    try {
      server.compileTenantThemeConfig({
        schemaVersion: server.TENANT_THEME_SCHEMA_VERSION,
        mode: 'simple',
        appearance: { typography: { fontFamilyBase: value } },
        tenantId: 'probe-tenant-bithire',
        slug: 'probe-tenant-bithire',
        verticalKey: 'bithire',
        rowVersion: 1,
      });
    } catch {
      dbAccepts = false;
    }
    assert.equal(dbAccepts, lowerable, `replica and product disagree on ${JSON.stringify(value)}`);
    assert.equal(isLowerableFontStack(value), dbAccepts);
  }
});

test('B2: the emitted channel is NOT the written string -- assert discrimination, never equality', async () => {
  const main = await import(pathToFileURL(resolve(CORE_ROOT, 'dist/index.js')).href);
  const written = 'Inter, system-ui, sans-serif';
  const compiled = main.compileBrandTheme({
    brandTheme: main.bithireBrandTheme,
    tenantSlug: 'bithire',
    tenantPatch: { typography: { fontFamilyBase: written } },
    tenantAuthoredPaths: new Set(['typography.fontFamilyBase']),
  });
  const emitted = compiled.cssVariables['--ds-font-family-base'];
  // The compiler INSERTS a script fallback, so equality is red by design.
  assert.notEqual(emitted, written, 'the compiler adds a script fallback');
  assert.match(emitted, /"Noto Sans Arabic"/);
  // The two assertions that ARE correct: it carries the leading family, and it
  // discriminates between stops.
  assert.ok(emitted.startsWith('Inter,'), 'contains the leading family');
  const other = main.compileBrandTheme({
    brandTheme: main.bithireBrandTheme,
    tenantSlug: 'bithire',
    tenantPatch: { typography: { fontFamilyBase: "'Fira Sans', Arial, sans-serif" } },
    tenantAuthoredPaths: new Set(['typography.fontFamilyBase']),
  }).cssVariables['--ds-font-family-base'];
  assert.notEqual(emitted, other, 'different stops discriminate');
});

test('B4: the asymmetry is of EMISSION, not of movement (all three verticals)', async () => {
  const main = await import(pathToFileURL(resolve(CORE_ROOT, 'dist/index.js')).href);
  const server = await import(pathToFileURL(resolve(CORE_ROOT, 'dist/server.js')).href);
  const themes = {
    rottay: main.rottayBrandTheme,
    bithire: main.bithireBrandTheme,
    evnto: main.evntoBrandTheme,
  };
  const stack = 'Inter, system-ui, sans-serif';
  for (const [vertical, brandTheme] of Object.entries(themes)) {
    const before = main.compileBrandTheme({ brandTheme, tenantSlug: vertical }).cssVariables;
    const after = main.compileBrandTheme({
      brandTheme,
      tenantSlug: vertical,
      tenantPatch: { typography: { fontFamilyBase: stack } },
      tenantAuthoredPaths: new Set(['typography.fontFamilyBase']),
    }).cssVariables;
    // Base moves on the static arm.
    assert.notEqual(after['--ds-font-family-base'], before['--ds-font-family-base'], vertical);
    /* AND THE HEADING DOES NOT MOVE. The design said the static arm "moves both,
     * the heading re-derived from the pairing"; measured on all three verticals
     * that is FALSE. The theme's own literal survives the per-field merge (the
     * base-only patch never touches `fontFamilyHeading`), so the static arm
     * EMITS the heading without moving it. */
    assert.equal(after['--ds-font-family-heading'], before['--ds-font-family-heading'], vertical);
    assert.notEqual(after['--ds-font-family-heading'], undefined, `${vertical} static EMITS heading`);
    // The DB door does not emit it at all: its document is a pure delta.
    const artifact = server.compileTenantThemeConfig({
      schemaVersion: server.TENANT_THEME_SCHEMA_VERSION,
      mode: 'simple',
      appearance: { typography: { fontFamilyBase: stack } },
      tenantId: `probe-tenant-${vertical}`,
      slug: `probe-tenant-${vertical}`,
      verticalKey: vertical,
      rowVersion: 1,
    });
    assert.equal(artifact.variables['--ds-font-family-heading'], undefined, `${vertical} DB blind`);
    // The parity that CAN be claimed: base, on both arms, identical.
    assert.equal(artifact.variables['--ds-font-family-base'], after['--ds-font-family-base'], vertical);
  }
});

test('B3: a brace-set whose discriminator sits mid-path is refused, by BOTH of its doors', () => {
  const chromeAnatomyStatic = 'chrome.{cardComponent,table,sidebar,layout}.anatomy';
  const chromeAnatomyDb = 'visualFoundation.advanced.chrome.{cardComponent,table,sidebar,layout}.anatomy';
  for (const declared of [chromeAnatomyStatic, chromeAnatomyDb]) {
    let thrown = null;
    try {
      resolveIngressMember(declared, 'sidebar');
    } catch (error) {
      thrown = error;
    }
    assert.match(thrown.message, /all 4 members end in the same segment \("anatomy"\)/);
    assert.match(thrown.message, /needs a different ingress shape, not a different stop/);
    // A manifest defect is NOT publishable as an exclusion: unclassified, so the
    // R-2 hardening re-throws and the run breaks.
    assert.ok(!(thrown instanceof StopExclusionError));
    assert.equal(classifyStopExclusion(thrown), null);
  }
  // And nothing functional is caught by it.
  assert.equal(resolveIngressMember('palette.{primaryColor,secondaryColor}', 'primary'), 'palette.primaryColor');
  assert.equal(
    resolveIngressMember('typography.{fontFamilyBase,fontFamilyHeading}', 'fontFamilyHeading'),
    'typography.fontFamilyHeading',
  );
  assert.equal(resolveIngressMember('appearance.general.rhythm'), 'appearance.general.rhythm');
});

test('B: the font-family door does not intersect CONSULTED_PROVENANCE_FIELDS', () => {
  /* Read from the CONTRACT SOURCE, exactly as B-2 drill 6 does: the compiler
   * publishes this set through no package entrypoint (verified: absent from
   * both dist/index.js and dist/server.js), and copying it here would be the
   * second authority that drill exists to prevent. */
  const isoSource = readFileSync(
    resolve(CORE_ROOT, 'src/foundation/contracts/composition/tenants/themes/iso/index.ts'),
    'utf8',
  );
  const marker = 'export const CONSULTED_PROVENANCE_FIELDS: ReadonlySet<string> = new Set([';
  const open = isoSource.indexOf(marker);
  assert.notEqual(open, -1, 'the contract no longer declares CONSULTED_PROVENANCE_FIELDS this way');
  const close = isoSource.indexOf(']);', open);
  const fields = [...isoSource.slice(open + marker.length, close).matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  // The reader proves itself before anything is concluded from it.
  assert.ok(fields.length >= 12, `parsed only ${fields.length} consulted fields`);
  assert.ok(fields.includes('palette.primaryColor'));
  const doors = [
    'typography.fontFamilyBase',
    'typography.fontFamilyHeading',
    'typography.fontFamilyMono',
    'typography.fontFamilyDisplay',
  ];
  for (const door of doors) assert.ok(!fields.includes(door), `${door} must not be consulted`);
  assert.equal(fields.filter((f) => f.startsWith('typography.')).length, 0, 'no typography.* at all');
});
