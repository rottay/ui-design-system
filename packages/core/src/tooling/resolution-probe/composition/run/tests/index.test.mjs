/**
 * @fileoverview Negative drills for the causal report — the whole assembly, on
 * fabricated readings, with no browser.
 *
 * Run: node --test src/tooling/resolution-probe/composition/run/tests/index.test.mjs
 *
 * `buildCausalReport` is pure, which is the only reason these drills can exist:
 * every decision the causal run makes is fed the exact broken input it must
 * reject, and each rejection is checked for the ROW IT NAMES rather than for a
 * boolean. The browser half (`runCausalProbe`) only gathers readings and hands
 * them here, so a green suite means the judgement is right even though no
 * Chromium was opened.
 *
 * The declared negative controls come from the REAL modern-rescue manifest, so
 * these drills fail when the contract changes and the harness does not.
 *
 * @module Tooling/ResolutionProbe/Composition/Run/Tests
 */

import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';

import { readManifest } from '../../../foundation/negative-controls/index.mjs';
import { CORE_ROOT } from '../../../foundation/paths/index.mjs';
import { assertKnownTargetKeys } from '../../../foundation/roster/index.mjs';
import { composeDbArm, composeStaticArm } from '../../../runtime/ingress/index.mjs';
import {
  buildCausalReport,
  buildMovements,
  CAUSAL_ARTIFACT_VERSION,
  runCausalProbe,
} from '../index.mjs';

const CONTROL_MANIFEST = readManifest(
  resolve(
    CORE_ROOT,
    'scripts/quality-evidence/programs/modern-rescue/manifest/controls/spacing.rhythm.json',
  ),
);

const SCOPE = 'rottay/light/modern/both';
const STOP = { id: 'airy', value: 1.2 };
// The REAL synthetic control fixture (foundation/roster/fixtures.json),
// extended 2026-08-11 with the rhythm pair so a rhythm causal run has a
// direct-read control on the same element the radius dial already uses.
const CONTROL_FIXTURES = ['token-readout'];

// Every target below MUST belong to FIXTURE_IDS (foundation/roster) --
// enforced mechanically by 'every binding target names a real fixture/target
// pair' below. `button-modern-md/hitbox` stands in for BOTH
// `control-height-fixed`/`touch-target-fixed` (it IS the button's own hit
// area -- no separate expanded touch wrapper exists in the modern engine's
// markup) and, for now, `icon-size-fixed`: no fixture in this checkpoint
// renders a real icon (see foundation/roster/fixtures.json's button-modern-md
// entry), so this is a MECHANICS stand-in that exercises the code path with a
// real, resolvable target rather than a fabricated one. It is not a semantic
// claim about icon geometry; replace it the day a real icon-bearing fixture
// exists.
const BINDINGS = {
  'numeric-instance-gaps-exact': ['flex-modern-numeric-gap/root'],
  'control-height-fixed': ['button-modern-md/hitbox'],
  'touch-target-fixed': ['button-modern-md/hitbox'],
  'icon-size-fixed': ['button-modern-md/hitbox'],
};

/**
 * One scene, built ONLY from real roster fixture/target pairs: a preset-gap
 * Flex that must move, a numeric-gap Flex that must not, a control whose
 * hitbox must not, and the token-readout that reads the control directly so
 * the run can prove it observes movement.
 */
function scene({ rhythm }) {
  const airy = rhythm === 'airy';
  return {
    'flex-modern-preset-gap/root': {
      gap: airy ? '19.2px' : '16px',
      'column-gap': airy ? '19.2px' : '16px',
      'row-gap': airy ? '19.2px' : '16px',
    },
    'flex-modern-numeric-gap/root': { gap: '8px', 'column-gap': '8px', 'row-gap': '8px' },
    'button-modern-md/root': {
      'border-top-left-radius': '10px',
      'background-color': 'rgb(20, 20, 20)',
      color: 'rgb(255, 255, 255)',
      'border-top-color': 'rgb(20, 20, 20)',
      'border-top-width': '0px',
      'box-shadow': 'none',
      'font-family': 'inherit',
      'font-size': '16px',
      'font-weight': '600',
    },
    'button-modern-md/hitbox': {
      'block-size': '40px',
      height: '40px',
      'min-block-size': '40px',
      'min-height': '40px',
      'max-block-size': 'none',
      'max-height': 'none',
      'inline-size': '96px',
      width: '96px',
      'min-inline-size': '96px',
      'max-inline-size': 'none',
      'min-width': '96px',
      'max-width': 'none',
      'aspect-ratio': 'auto',
      scale: 'none',
      zoom: '1',
      'contain-intrinsic-size': 'none',
      '@rect-inline-size': '96',
      '@rect-block-size': '40',
    },
    'token-readout/tokens': {
      '--ds-rhythm-effective-scale': airy ? 'clamp(0.8, 1.2, 1.25)' : 'clamp(0.8, 1, 1.25)',
    },
  };
}

function planFor(values) {
  return Object.entries(values).map(([key, properties]) => {
    const [fixtureId, targetId] = key.split('/');
    return {
      fixtureId,
      targetId,
      selector: `[data-probe='${fixtureId}']`,
      properties: Object.keys(properties),
    };
  });
}

/**
 * One scope's observation, in the shape `measureCausalScope` returns it:
 * target-keyed, NOT scope-keyed. The scope key is added by the report builder,
 * which is what lets one arm carry many scopes.
 */
function phase(values) {
  return {
    readings: Object.fromEntries(
      Object.entries(values).map(([key, properties]) => [
        key,
        { present: true, values: { ...properties } },
      ]),
    ),
    rootAttributes: { 'data-theme': 'light', 'data-tenant': 'rottay' },
    canaryReadings: Object.fromEntries(
      Object.keys(values).map((key) => [
        key,
        { '--ds-radius-md': 'calc(8px * 1)', '--ds-radius-scale': '1' },
      ]),
    ),
  };
}

function observationFor({ removalValues = null } = {}) {
  const baselineValues = scene({ rhythm: 'normal' });
  const mutationValues = scene({ rhythm: 'airy' });
  // The default removal is NOT the `baselineValues` object reused: reusing it
  // would make the positive-control run assert exactly what it just wrote,
  // rather than exercise anything about restore. `recomputedRemoval` instead
  // starts from the (independently constructed) MUTATED scene and writes back
  // only the two fields rhythm actually touches, each one read off
  // `baselineValues` -- the same "recompute the undo from what changed" shape
  // `planInlinePhase` uses for a real inline style, so a positive control here
  // proves the same thing a real removal phase would have to prove.
  const recomputedRemoval = structuredClone(mutationValues);
  recomputedRemoval['flex-modern-preset-gap/root'].gap =
    baselineValues['flex-modern-preset-gap/root'].gap;
  recomputedRemoval['flex-modern-preset-gap/root']['column-gap'] =
    baselineValues['flex-modern-preset-gap/root']['column-gap'];
  recomputedRemoval['flex-modern-preset-gap/root']['row-gap'] =
    baselineValues['flex-modern-preset-gap/root']['row-gap'];
  recomputedRemoval['token-readout/tokens']['--ds-rhythm-effective-scale'] =
    baselineValues['token-readout/tokens']['--ds-rhythm-effective-scale'];
  return {
    plan: planFor(baselineValues),
    unmatched: [],
    scopes: {
      [SCOPE]: {
        inline: {
          clobbered: [],
          introduced: ['--ds-rhythm-scale'],
          restore: [{ op: 'remove', name: '--ds-rhythm-scale' }],
        },
        phases: {
          baseline: phase(baselineValues),
          mutation: phase(mutationValues),
          removal: phase(removalValues ?? recomputedRemoval),
        },
      },
    },
  };
}

const STATIC_ARM = composeStaticArm({
  vertical: 'rottay',
  variables: { '--ds-rhythm-scale': '1.2' },
  producedBy: {
    module: 'dist/infrastructure/compilers/kernel/runtime/brand-theme/index.js',
    exportName: 'compileBrandTheme',
    input: { path: 'surfaces.rhythm', stopId: 'airy' },
  },
});

const DB_ARM = composeDbArm({
  variables: { '--ds-rhythm-scale': '1.2' },
  producedBy: {
    module: 'dist/infrastructure/compilers/kernel/runtime/appearance/index.js',
    exportName: 'compileAppearanceVariables',
    input: { path: 'appearance.general.rhythm', stopId: 'airy' },
  },
});

function report(overrides = {}) {
  return buildCausalReport({
    controlId: 'spacing.rhythm',
    stop: STOP,
    controlManifest: CONTROL_MANIFEST,
    familyManifest: null,
    negativeControlBindings: BINDINGS,
    arms: [STATIC_ARM, DB_ARM],
    observations: {
      'static-brand-theme': observationFor(),
      'db-tenant-theme': observationFor(),
    },
    controlFixtures: CONTROL_FIXTURES,
    ...overrides,
  });
}

test('positive control: a healthy three-phase run passes and says why', () => {
  const result = report();
  assert.equal(result.artifactVersion, CAUSAL_ARTIFACT_VERSION);
  assert.deepEqual(result.phases, ['baseline', 'mutation', 'removal']);
  assert.equal(result.selfCheck.verdict, 'harness-live', JSON.stringify(result.selfCheck, null, 2));
  assert.equal(result.verdict.pass, true);
  assert.equal(result.arms['static-brand-theme'].restore.exact, true);
  assert.equal(result.arms['db-tenant-theme'].negativeControls.held, true);
  assert.ok(result.arms['static-brand-theme'].totals.movedProperties >= 2, 'the control moved');
  assert.equal(result.ingressEquivalence.equivalent, true);
});

test('positive control: the two ingress doors are compared on ONE scene', () => {
  const result = report();
  assert.deepEqual(result.ingressEquivalence.arms, ['static-brand-theme', 'db-tenant-theme']);
  assert.notEqual(
    result.arms['static-brand-theme'].position,
    result.arms['db-tenant-theme'].position,
    'the doors must land in different cascade positions or the comparison is vacuous',
  );
  assert.match(result.ingressEquivalence.meaning, /same DOM/);
});

test('negative drill: a NON-RESTORING variable fails the run and names the row', () => {
  const removalValues = scene({ rhythm: 'normal' });
  removalValues['token-readout/tokens']['--ds-rhythm-effective-scale'] = 'clamp(0.8, 1.2, 1.25)';
  const result = report({
    observations: {
      'static-brand-theme': observationFor({ removalValues }),
      'db-tenant-theme': observationFor(),
    },
  });
  const restore = result.arms['static-brand-theme'].restore;
  assert.equal(restore.exact, false);
  assert.equal(result.verdict.pass, false);
  assert.equal(result.verdict.restoreExactEverywhere, false);
  assert.equal(restore.rows[0].property, '--ds-rhythm-effective-scale');
  assert.equal(restore.rows[0].propertyKind, 'custom-property');
  assert.match(restore.meaning, /did NOT reproduce the baseline/);
});

test('negative drill: a MOVED negative control fails the run and names control and property', () => {
  const mutationValues = scene({ rhythm: 'airy' });
  mutationValues['button-modern-md/hitbox']['block-size'] = '48px';
  const observation = observationFor();
  observation.scopes[SCOPE].phases.mutation = phase(mutationValues);
  const result = report({
    observations: { 'static-brand-theme': observation, 'db-tenant-theme': observationFor() },
  });
  const held = result.arms['static-brand-theme'].negativeControls;
  assert.equal(held.held, false);
  assert.equal(result.verdict.pass, false);
  assert.equal(held.violations[0].negativeControl, 'control-height-fixed');
  assert.equal(held.violations[0].target, 'button-modern-md/hitbox');
  assert.equal(held.violations[0].property, 'block-size');
});

test('negative drill: a ZERO-MATCH target voids the artifact, including its inert verdicts', () => {
  const observation = observationFor();
  observation.scopes[SCOPE].phases.baseline.readings['button-modern-md/hitbox'] = {
    present: false,
    values: {},
  };
  const result = report({
    observations: { 'static-brand-theme': observation, 'db-tenant-theme': observationFor() },
  });
  assert.equal(result.selfCheck.verdict, 'harness-suspect');
  assert.equal(result.selfCheck.voidsInertVerdicts, true);
  assert.equal(result.verdict.pass, false);
  assert.match(result.selfCheck.meaning, /EVERY inert and unchanged verdict/);
  assert.equal(result.selfCheck.guardFailures[0].guard, 'zero-match-selector');
  assert.equal(result.selfCheck.guardFailures[0].phase, 'baseline');
});

test('negative drill: an ABSENT reading is never reported as inert', () => {
  const observation = observationFor();
  delete observation.scopes[SCOPE].phases.mutation.readings['flex-modern-preset-gap/root'].values.gap;
  const result = report({
    observations: { 'static-brand-theme': observation, 'db-tenant-theme': observationFor() },
  });
  const failures = result.selfCheck.guardFailures.filter(
    (entry) => entry.guard === 'absent-measurement',
  );
  assert.equal(failures.length, 1);
  assert.equal(failures[0].property, 'gap');
  assert.equal(failures[0].phase, 'mutation');
  assert.equal(result.verdict.pass, false);
});

test('negative drill: an UNHYDRATED element voids the run rather than reporting initial values', () => {
  const observation = observationFor();
  observation.scopes[SCOPE].phases.mutation.canaryReadings['flex-modern-preset-gap/root'] = {
    '--ds-radius-md': '',
    '--ds-radius-scale': '',
  };
  const result = report({
    observations: { 'static-brand-theme': observation, 'db-tenant-theme': observationFor() },
  });
  const failures = result.selfCheck.guardFailures.filter(
    (entry) => entry.guard === 'unhydrated-target',
  );
  assert.equal(failures.length, 1);
  assert.equal(failures[0].signal, 'canary-empty-on-element');
  assert.equal(result.verdict.pass, false);
});

test('negative drill: a STALE source digest voids the run', () => {
  const result = report({
    sourceFreshness: {
      declaredDigest: 'a'.repeat(64),
      observedDigest: 'b'.repeat(64),
      sourceFiles: ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'],
    },
  });
  const failures = result.selfCheck.guardFailures.filter((entry) => entry.guard === 'stale-source');
  assert.equal(failures.length, 2, 'once per arm, asked on the baseline phase only');
  assert.equal(result.verdict.pass, false);
});

test('negative drill: a run that declares NO direct-read control fixture is suspect', () => {
  const result = report({ controlFixtures: null });
  assert.equal(result.selfCheck.controlLiveness.verdict, 'no-controls');
  assert.equal(result.selfCheck.verdict, 'harness-suspect');
  assert.equal(result.verdict.pass, false);
});

test('negative drill: a run whose control fixture did NOT move is suspect', () => {
  const flat = scene({ rhythm: 'normal' });
  const observation = observationFor();
  observation.scopes[SCOPE].phases.mutation = phase(flat);
  const result = report({
    observations: { 'static-brand-theme': observation, 'db-tenant-theme': observationFor() },
  });
  assert.equal(result.selfCheck.controlLiveness.verdict, 'harness-suspect');
  assert.equal(result.verdict.pass, false);
});

test('negative drill: the DB arm alone can be dead while the static arm is live, and the run now fails', () => {
  // Before this fix, `controlLiveness` only ever inspected `arms[0]` (always
  // the static arm here). A static arm that moves and a DB arm that does not
  // used to read `harness-live` and PASS -- the exact DB-specific wiring
  // failure this drill now catches.
  const deadDbObservation = observationFor();
  deadDbObservation.scopes[SCOPE].phases.mutation = phase(scene({ rhythm: 'normal' }));
  const result = report({
    observations: {
      'static-brand-theme': observationFor(), // normal rhythm mutation: control moves
      'db-tenant-theme': deadDbObservation, // flat mutation: control does NOT move
    },
  });
  assert.equal(result.selfCheck.controlLiveness.perArm['static-brand-theme'].verdict, 'harness-live');
  assert.equal(result.selfCheck.controlLiveness.perArm['db-tenant-theme'].verdict, 'harness-suspect');
  assert.deepEqual(result.selfCheck.controlLiveness.deadArms, ['db-tenant-theme']);
  assert.equal(
    result.selfCheck.controlLiveness.verdict,
    'harness-suspect',
    'a run is only as live as its least live arm',
  );
  assert.equal(result.selfCheck.verdict, 'harness-suspect');
  assert.equal(result.verdict.pass, false);
});

test('negative drill: STATIC and DB disagreeing on the same scene is named row by row', () => {
  const divergent = scene({ rhythm: 'airy' });
  divergent['flex-modern-preset-gap/root'].gap = '16px';
  const observation = observationFor();
  observation.scopes[SCOPE].phases.mutation = phase(divergent);
  const result = report({
    observations: { 'static-brand-theme': observationFor(), 'db-tenant-theme': observation },
  });
  assert.equal(result.ingressEquivalence.equivalent, false);
  const row = result.ingressEquivalence.rows.find((entry) => entry.property === 'gap');
  assert.ok(row, JSON.stringify(result.ingressEquivalence.rows));
  assert.equal(row.target, 'flex-modern-preset-gap/root');
  assert.equal(row['static-brand-theme'].moved, true);
  assert.equal(row['db-tenant-theme'].moved, false);
  assert.match(result.ingressEquivalence.meaning, /different product/);
  // A divergent ingress comparison must sink the verdict even when every
  // other conjunct (restore, negative controls, manifest agreement, guards)
  // is healthy -- ingress equivalence used to be reported but not counted.
  assert.equal(result.verdict.ingressEquivalenceHeld, false);
  assert.equal(result.verdict.pass, false);
});

test('negative drill: an unresolvable manifest phrase fails the run instead of being dropped', () => {
  const manifest = structuredClone(CONTROL_MANIFEST);
  manifest.calibration.negativeControls = [...manifest.calibration.negativeControls, 'the vibe stays premium'];
  const result = report({ controlManifest: manifest });
  assert.equal(result.negativeControlResolution.complete, false);
  assert.equal(result.selfCheck.negativeControlGate.ok, false);
  assert.equal(
    result.selfCheck.negativeControlGate.failures[0].kind,
    'unresolved-negative-control-phrase',
  );
  assert.equal(result.selfCheck.verdict, 'harness-suspect');
});

test('negative drill: an ARM THAT WAS DECLARED AND NOT MEASURED is refused, not reported as agreeing', () => {
  assert.throws(
    () =>
      buildCausalReport({
        controlId: 'spacing.rhythm',
        stop: STOP,
        controlManifest: CONTROL_MANIFEST,
        negativeControlBindings: BINDINGS,
        arms: [STATIC_ARM, DB_ARM],
        observations: { 'static-brand-theme': observationFor() },
        controlFixtures: CONTROL_FIXTURES,
      }),
    /no observation for ingress arm db-tenant-theme/,
  );
});

test('negative drill: one arm alone cannot certify static/DB equivalence', () => {
  const result = buildCausalReport({
    controlId: 'spacing.rhythm',
    stop: STOP,
    controlManifest: CONTROL_MANIFEST,
    negativeControlBindings: BINDINGS,
    arms: [DB_ARM],
    observations: { 'db-tenant-theme': observationFor() },
    controlFixtures: CONTROL_FIXTURES,
  });
  assert.equal(result.ingressEquivalence.comparable, false);
  assert.match(result.ingressEquivalence.reason, /must not be inferred/);
});

/**
 * The one browser-path assertion in this file, and it never reaches a browser:
 * the refusal is evaluated before any bundle is composed or any Chromium is
 * launched, which is what makes it testable here at all.
 */
test('negative drill: a tenant-scoped static arm run against another vertical is REFUSED', async () => {
  await assert.rejects(
    () =>
      runCausalProbe({
        controlId: 'spacing.rhythm',
        stop: STOP,
        controlManifest: CONTROL_MANIFEST,
        arms: [STATIC_ARM],
        verticals: ['rottay', 'bithire'],
      }),
    /cannot match another tenant/,
    'a block that matches nothing reads exactly like a control that reaches nothing',
  );
  await assert.rejects(
    () =>
      runCausalProbe({
        controlId: 'spacing.rhythm',
        stop: STOP,
        controlManifest: CONTROL_MANIFEST,
        arms: [STATIC_ARM],
        verticals: ['bithire'],
      }),
    /composed for "rottay"/,
  );
});

test('every BINDINGS target names a real fixture/target pair, not a fabricated one', () => {
  // Mechanical enforcement, not a convention: this file used to bind
  // negative controls to `flex-numeric/root`, `button/root` and `icon/root`,
  // none of which the roster ever declared. `assertKnownTargetKeys` throws
  // naming the offending key instead of leaving a fabricated string that
  // merely happens to produce no rows and look inert.
  assert.doesNotThrow(() => assertKnownTargetKeys(Object.values(BINDINGS).flat(), { context: 'BINDINGS' }));
});

test('negative drill: assertKnownTargetKeys refuses a fabricated fixture/target pair', () => {
  assert.throws(
    () => assertKnownTargetKeys(['button/root'], { context: 'BINDINGS' }),
    /does not declare: button\/root/,
  );
});

test('buildMovements is one definition of "moved", shared by the dial and causal reports', () => {
  const { movements, moved, inert } = buildMovements(
    { s: { 't/root': { present: true, values: { a: '1px', b: '2px' } } } },
    { s: { 't/root': { present: true, values: { a: '3px', b: '2px' } } } },
  );
  assert.equal(moved, 1);
  assert.equal(inert, 1);
  assert.deepEqual(movements.s['t/root'].a, { moved: true, from: '1px', to: '3px' });
  assert.deepEqual(movements.s['t/root'].b, { moved: false, value: '2px' });
});
