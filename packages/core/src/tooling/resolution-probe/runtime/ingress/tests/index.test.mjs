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
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

import { readManifest } from '../../../foundation/negative-controls/index.mjs';
import { CORE_ROOT } from '../../../foundation/paths/index.mjs';
import {
  assertArmProvenance,
  assertArmsMatchManifest,
  assertNoRetiredCompilerBinding,
  buildIngressInput,
  composeDbArm,
  composeStaticArm,
  INGRESS_ARM_IDS,
  INGRESS_ARMS,
  loadCompilerArms,
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
  assert.deepEqual(staticSeen, { brandTheme: { surfaces: { rhythm: 'airy' } }, tenantSlug: 'rottay' });
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

test('negative drill: a domain kind this harness cannot write fails closed', () => {
  for (const kind of ['profile-id', 'token-map', 'color-set', 'scale', undefined]) {
    assert.throws(
      () =>
        buildIngressInput({
          armId: 'static-brand-theme',
          controlManifest: { ...BOUNDED_CONTROL_MANIFEST, domain: { kind } },
          stopId: 'sobrio',
        }),
      /only knows how to write a closed-enum stop id or a bounded stop value/,
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
