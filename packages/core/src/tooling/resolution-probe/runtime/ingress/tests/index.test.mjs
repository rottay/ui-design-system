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
  ingressPathMembers,
  resolveIngressMember,
  composeStaticArm,
  INGRESS_ARM_IDS,
  INGRESS_ARMS,
  loadCompilerArms,
  assertStopDiscrimination,
  loadStaticBaselines,
  lowerStop,
  RETIRED_DB_COMPILER_EXPORTS,
  tenantArmSelector,
} from '../index.mjs';

const CONTROL_MANIFEST = readManifest(
  resolve(CORE_ROOT, 'manifest/controls/spacing.rhythm.json'),
);

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

test('positive control: a DB arm carries no CSS, because it writes inline on the root', () => {
  const arm = composeDbArm({
    variables: { '--ds-rhythm-scale': '1.2' },
    producedBy: { ...PRODUCED_BY, exportName: 'compileTenantThemeConfig' },
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
  assert.deepEqual(staticSeen, {
    brandTheme: {},
    tenantPatch: { surfaces: { rhythm: 'airy' } },
    tenantSlug: 'rottay',
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
});

test('negative drill: the db arm refuses a document with no "appearance.general"', () => {
  assert.throws(
    () =>
      lowerStop({
        armId: 'db-tenant-theme',
        controlManifest: { ...CONTROL_MANIFEST, ingress: { dbTenantThemePath: 'general.rhythm' } },
        stopId: 'airy',
        compile: () => ({ variables: { '--ds-rhythm-scale': '1.2' } }),
        vertical: 'rottay',
        provenance: { schemaVersion: 1 },
      }),
    /has no "appearance\.general" object/,
  );
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

// ---------------------------------------------------------------------------
// H3C — the DB arm delivers its write on a FRESH page
//
// These assert the CONTRACT of the arm, not the browser. What a browser does
// with a live mutation is measured in
// test-artifacts/quality-evidence/wo-cra-23/H3/residual-isolation.MEASURED-NOT-RECEIPTED.json;
// what belongs in a drill is that the arm kept its position and its restore law
// while changing only WHEN the write lands.
// ---------------------------------------------------------------------------

test('H3C drill 1: the DB arm keeps the root-inline-style POSITION', async () => {
  // The whole point of H3C is that it is NOT a serving change in disguise. If
  // this ever reads `tenant-artifact-stylesheet`, phase (a) was adopted by the
  // back door and the packet that adopts it must say so.
  const arms = await loadCompilerArms();
  const lowered = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: TYPO_H2,
    stopId: 'compacta',
    compile: arms['db-tenant-theme'].compile,
    vertical: 'rottay',
    provenance: arms['db-tenant-theme'].provenance,
  });
  const arm = composeDbArm({ variables: lowered.variables, producedBy: lowered.producedBy });
  assert.equal(arm.position, 'root-inline-style');
  // ...and it still carries no CSS of its own: the serving model is what makes
  // a zero-divergence result attributable to delivery rather than to a
  // different stylesheet.
  const baseline = '/* baseline */';
  assert.equal(arm.mutateCss(baseline), baseline, 'the DB arm must not mutate the served CSS');
});

test('H3C drill 2: every phase of the DB arm is served the SAME bytes', async () => {
  // The falsifiability condition, asserted rather than trusted. Both arms are
  // compared on one scene; if the DB arm ever served different CSS per phase,
  // "0 divergent rows" would stop being evidence about delivery.
  const arms = await loadCompilerArms();
  const lowered = lowerStop({
    armId: 'db-tenant-theme',
    controlManifest: TYPO_H2,
    stopId: 'amplia',
    compile: arms['db-tenant-theme'].compile,
    vertical: 'bithire',
    provenance: arms['db-tenant-theme'].provenance,
  });
  const arm = composeDbArm({ variables: lowered.variables, producedBy: lowered.producedBy });
  const css = 'html { color: red }';
  for (const phase of ['baseline', 'mutation', 'removal']) {
    assert.equal(arm.mutateCss(css), css, `phase ${phase} must be served the baseline verbatim`);
  }
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
