/**
 * @fileoverview One run: bundles × scopes × fixtures → one diffable artifact.
 *
 * THE ARTIFACT IS THE PRODUCT, not the console output. Two runs must be
 * comparable byte for byte so a lane can say "this change moved these N
 * properties, for these tenants, and nothing else" — which is a stronger claim
 * than any single absolute reading, and the one a reviewer actually needs.
 * Everything that could make two identical trees disagree is therefore either
 * pinned (viewport, colour scheme, reduced motion, fixture order) or recorded
 * (browser version, bundle sha256, bundle mode, drift against the shipped
 * bundle).
 *
 * EVERY NUMBER CARRIES ITS SCOPE. Readings are keyed
 * `vertical/theme/engine/arm` → `fixture/target` → property. There is no
 * top-level total anywhere in the artifact that a reader could quote without
 * the scope coming with it. A count of "properties that moved" is meaningless
 * until you know across which tenants and which themes it was counted.
 *
 * THE CONTROLS ARE INSIDE THE RUN. Two roster fixtures read the dial with no
 * indirection. `controls` reports whether they moved. If they did not, the
 * harness — not the design system — is what failed, and every "inert" verdict
 * in the same artifact is void. That verdict is written into the artifact
 * rather than left to a reader's goodwill.
 *
 * @module Tooling/ResolutionProbe/Composition/Run
 */

import {
  compareExact,
  describeRestore,
  planInlinePhase,
  RESTORE_LAW,
} from '../../foundation/causality/index.mjs';
import { evaluateMeasurementGuards } from '../../foundation/guards/index.mjs';
import {
  assertNegativeControlsHeld,
  declaredPhrasesFor,
  expandFixturesForNegativeControls,
  requireResolvedNegativeControls,
  resolveNegativeControls,
} from '../../foundation/negative-controls/index.mjs';
import { resolveBundle, sha256 } from '../../runtime/bundle/index.mjs';
import {
  directControlFixtureIds,
  getFixtures,
  ROSTER_NOTE,
} from '../../foundation/roster/index.mjs';
import { scopeId, THEMES, VERTICAL_KEYS } from '../../foundation/scope/index.mjs';
import { launchBrowser } from '../../runtime/browser/index.mjs';
import { assertArmsMatchManifest } from '../../runtime/ingress/index.mjs';
import { measureCausalScope, measureScope, VIEWPORT } from '../../runtime/measure/index.mjs';
import {
  computeSourceDigest,
  REPOSITORY_ROOT,
} from '../receipt/index.mjs';

export const ARTIFACT_VERSION = 1;

/** A causal artifact is a different shape from a reading/dial artifact, so it versions separately. */
export const CAUSAL_ARTIFACT_VERSION = 1;

/** Fixtures that read a dial with no derived token in between. */
const CONTROL_FIXTURES = Object.freeze(['skeleton-card-line', 'skeleton-form-action']);

/**
 * @param {object} options
 * @param {string[]} [options.verticals]
 * @param {string[]} [options.themes]
 * @param {string[]} [options.fixtures]
 * @param {'fresh'|'dist'|'styles'} [options.bundleMode]
 * @param {string} [options.engine]
 * @param {Record<string,string>|null} [options.dial]
 * @param {'root'|'fixture'} [options.dialTarget]
 */
export async function runProbe({
  verticals = VERTICAL_KEYS,
  themes = THEMES,
  fixtures: fixtureIds = null,
  bundleMode = 'fresh',
  engine = 'modern',
  dial = null,
  dialTarget = 'root',
} = {}) {
  const fixtures = getFixtures(fixtureIds);
  const bundles = {};
  for (const vertical of verticals) {
    bundles[vertical] = await resolveBundle({ vertical, mode: bundleMode });
  }

  const { browser, close, provenance: browserProvenance } = await launchBrowser();
  const readings = {};
  const dialled = {};
  const witnesses = {};
  const unmatched = [];
  try {
    for (const vertical of verticals) {
      for (const theme of themes) {
        const scope = { vertical, theme, engine, arm: 'both' };
        const id = scopeId(scope);
        const result = await measureScope({
          browser,
          css: bundles[vertical].css,
          scope,
          fixtures,
          dial,
          dialTarget,
        });
        readings[id] = result.readings;
        if (result.dialled) dialled[id] = result.dialled;
        if (result.witness) witnesses[id] = result.witness;
        for (const row of result.unmatched) unmatched.push({ scope: id, ...row });
      }
    }
  } finally {
    await close();
  }

  const artifact = {
    instrument: 'resolution-probe',
    artifactVersion: ARTIFACT_VERSION,
    question:
      'What does the browser actually paint for this tenant? (Not: is a channel connected.)',
    scopeOfRun: {
      verticals: [...verticals],
      themes: [...themes],
      engine,
      arm: 'both',
      fixtures: fixtures.map((fixture) => fixture.id),
      viewport: VIEWPORT,
      note: ROSTER_NOTE,
    },
    provenance: {
      browser: browserProvenance,
      bundleMode,
      bundles: Object.fromEntries(
        Object.entries(bundles).map(([vertical, bundle]) => [vertical, bundle.provenance]),
      ),
    },
    readings,
    unmatched,
  };

  if (dial) {
    artifact.dial = buildDialReport({ dial, dialTarget, readings, dialled, witnesses, fixtures });
  }
  return artifact;
}

/**
 * Before/after, per scope, per target, per property.
 *
 * Extracted so the dial report and the causal report cannot drift into two
 * definitions of the word "moved". A target missing from either side is skipped
 * here and is caught by the measurement guards instead: this function's job is
 * comparison, and inventing a movement row for an element nobody measured would
 * be exactly the conflation the guards exist to prevent.
 */
export function buildMovements(beforeByScope, afterByScope) {
  const movements = {};
  let moved = 0;
  let inert = 0;
  for (const [scope, beforeTargets] of Object.entries(beforeByScope ?? {})) {
    const afterTargets = afterByScope?.[scope] ?? {};
    const perScope = {};
    for (const [targetKey, before] of Object.entries(beforeTargets)) {
      const after = afterTargets[targetKey];
      if (!before.present || !after?.present) continue;
      const perTarget = {};
      for (const [property, was] of Object.entries(before.values)) {
        const now = after.values[property];
        const didMove = was !== now;
        if (didMove) moved += 1;
        else inert += 1;
        perTarget[property] = didMove
          ? { moved: true, from: was, to: now }
          : { moved: false, value: was };
      }
      perScope[targetKey] = perTarget;
    }
    movements[scope] = perScope;
  }
  return { movements, moved, inert };
}

function buildDialReport({ dial, dialTarget, readings, dialled, witnesses, fixtures }) {
  const { movements, moved, inert } = buildMovements(readings, dialled);

  const controlIds = fixtures
    .map((fixture) => fixture.id)
    .filter((id) => CONTROL_FIXTURES.includes(id));
  const controls = evaluateControls(movements, controlIds);

  return {
    applied: dial,
    target: dialTarget,
    targetMeaning:
      dialTarget === 'root'
        ? 'Written inline on the document element — where the tenant scope and a compiled ' +
          'tenant artifact land. This is the position a real tenant occupies, so verdicts ' +
          'from this target transfer to a consumer.'
        : 'Written inline on the measured element itself. NOT a stronger position than root — ' +
          'for a token derived at :root it is strictly WEAKER, because var() is substituted ' +
          'where the declaration applies and descendants inherit the substituted stream. An ' +
          'inert verdict from this target is evidence about this element\'s own declared ' +
          'value and about nothing else; it must never be quoted as "no tenant can move this".',
    totals: {
      scope: 'across every (vertical × theme × fixture × property) row in this artifact',
      movedProperties: moved,
      inertProperties: inert,
    },
    witness: {
      perScope: witnesses,
      meaning:
        'What the dialled properties read back as, at the position they were written. This ' +
        'separates "the design system ignored the input" from "the input never landed" — an ' +
        'inert verdict is only meaningful where the witness shows the requested value.',
      landedEverywhere: Object.values(witnesses).every((scopeWitness) =>
        Object.entries(dial).every(([name, value]) => scopeWitness[name] === value),
      ),
    },
    controls,
    movements,
  };
}

/**
 * A run whose controls did not move measured nothing.
 *
 * The verdict is written into the artifact so a later reader cannot quote an
 * "inert" number out of a run that had already failed its own sanity check.
 */
function evaluateControls(movements, controlIds, controlProperties = []) {
  if (controlIds.length === 0) {
    return {
      present: false,
      verdict: 'no-controls',
      meaning:
        'This run excluded the direct-dial control fixtures, so it cannot distinguish "the ' +
        'design system is inert" from "the harness is broken". Inert verdicts here are NOT ' +
        'evidence.',
    };
  }
  const results = {};
  let anyMoved = false;
  for (const [scope, targets] of Object.entries(movements)) {
    for (const [targetKey, properties] of Object.entries(targets)) {
      const fixtureId = targetKey.split('/')[0];
      if (!controlIds.includes(fixtureId)) continue;
      const movedProperties = Object.entries(properties)
        .filter(([property, row]) =>
          row.moved && (controlProperties.length === 0 || controlProperties.includes(property)),
        )
        .map(([property]) => property);
      results[`${scope}/${targetKey}`] = movedProperties;
      if (movedProperties.length > 0) anyMoved = true;
    }
  }
  return {
    present: true,
    controlFixtures: controlIds,
    verdict: anyMoved ? 'harness-live' : 'harness-suspect',
    meaning: anyMoved
      ? 'At least one control moved under the dial, so the harness demonstrably observes ' +
        'movement. Inert verdicts in this artifact are about the CSS, not the instrument.'
      : 'NO control moved. The harness cannot be shown to observe movement at all, so every ' +
        'inert verdict in this artifact is void. Fix the harness before quoting any number here.',
    perControl: results,
  };
}

/**
 * Control liveness, evaluated independently for EVERY ingress arm.
 *
 * `evaluateControls` alone answers "did a control fixture move, for ONE set of
 * movements". A causal run has one such set PER ARM, and a self-check that
 * only ever inspects the first arm's movements (which is always the static
 * arm when both are present) makes a DB-arm-specific wiring failure
 * invisible: the compiler can run and the variable can land while the
 * direct-dial fixture never moves on THAT arm, and the static arm alone would
 * still read `harness-live`. The aggregate verdict is `harness-live` only
 * when every arm's own control moved; `perArm` names each arm's own result
 * and `deadArms` names which ones did not, so a reader is not left guessing
 * which door the wiring failure is behind.
 */
function evaluateControlLiveness(perArm, armIds, controlIds, controlProperties = []) {
  const perArmResults = {};
  for (const armId of armIds) {
    perArmResults[armId] = evaluateControls(
      perArm[armId]?.movements ?? {},
      controlIds,
      controlProperties,
    );
  }
  const verdicts = armIds.map((armId) => perArmResults[armId].verdict);
  const verdict =
    verdicts.length > 0 && verdicts.every((entry) => entry === 'harness-live')
      ? 'harness-live'
      : verdicts.every((entry) => entry === 'no-controls')
        ? 'no-controls'
        : 'harness-suspect';
  const deadArms = armIds.filter((armId) => perArmResults[armId].verdict !== 'harness-live');
  return {
    verdict,
    perArm: perArmResults,
    deadArms,
    meaning:
      verdict === 'harness-live'
        ? "Every arm demonstrated a live control: each arm's own direct-dial fixture moved, " +
          'checked independently rather than inferred from one arm to the other.'
        : verdict === 'no-controls'
          ? 'This run excluded the direct-dial control fixtures, so no arm can be shown to ' +
            'observe movement. Inert verdicts here are NOT evidence.'
          : `At least one arm's own control did not move (${deadArms.join(', ')}), so that arm ` +
            'cannot be shown to observe movement. A run is only as live as its least live arm ' +
            '-- checking only one would hide a wiring failure specific to the other.',
  };
}

/**
 * The causal report, as a PURE function of fabricated or measured readings.
 *
 * Everything that decides anything lives here, and nothing here needs a
 * browser. That split is the point: the restore comparator, the guards, the
 * negative-control resolver and the self-check are unit-testable against
 * hand-written readings, so each of them can be SEEN TO FAIL on the exact
 * broken input it exists to reject. A decision that only runs inside Chromium
 * is a decision nobody has watched fail.
 *
 * SELF-CHECK, AND WHAT A FAILED ONE COSTS. The artifact states its own verdict
 * in its own text, exactly as the dial report's `controls: harness-suspect`
 * does, and a suspect verdict VOIDS EVERY INERT ROW IN THE SAME ARTIFACT. Three
 * independent things can make it suspect: a measurement guard fired, the
 * negative controls could not be resolved from the manifest, or a declared
 * control fixture failed to move. Any one of them means the run cannot tell an
 * inert channel from an unmeasured one.
 *
 * @param {object} input
 * @param {string} input.controlId
 * @param {{id: string, value: number|string}} input.stop
 * @param {object} input.controlManifest    manifest/controls/<control-id>.json
 * @param {object|null} [input.familyManifest]
 * @param {Record<string, string[]>} [input.negativeControlBindings]
 * @param {object[]} input.arms             from runtime/ingress
 * @param {Record<string, object>} input.observations  armId -> {plan, scopes, unmatched}
 * @param {object|null} [input.sourceFreshness]  {declaredDigest, observedDigest, sourceFiles}
 * @param {string[]|null} [input.controlFixtures]
 *   Fixtures that read THIS control with no derived token in between. It has no
 *   default and defaults to none on purpose: `CONTROL_FIXTURES` reads the radius
 *   scale, so inheriting it here would certify a rhythm run as live on the
 *   strength of a channel the run never turned. A causal run that declares no
 *   direct-read control fixture is `harness-suspect`, which is the honest state
 *   of a run that cannot be shown to observe the movement it is looking for.
 */
export function buildCausalReport({
  controlId,
  stop,
  controlManifest,
  familyManifest = null,
  negativeControlBindings = {},
  arms,
  observations,
  sourceFreshness = null,
  controlFixtures = null,
}) {
  const declared = declaredPhrasesFor({ controlManifest, familyManifest, controlId });
  const resolution = resolveNegativeControls({
    phrases: declared.effective,
    bindings: negativeControlBindings,
  });
  const negativeControlGate = requireResolvedNegativeControls({ declared, resolution });
  const manifestAgreement = assertArmsMatchManifest({ controlManifest, arms });

  const perArm = {};
  const unmatched = [];
  for (const arm of arms) {
    const observation = observations?.[arm.armId];
    if (!observation) {
      throw new Error(
        `resolution-probe: no observation for ingress arm ${arm.armId}. An arm that was declared ` +
          'and not measured must not be reported as an arm that agreed.',
      );
    }
    const { plan, scopes } = observation;
    for (const row of observation.unmatched ?? []) unmatched.push({ armId: arm.armId, ...row });

    const byPhase = {};
    for (const phase of ['baseline', 'mutation', 'removal']) {
      byPhase[phase] = {
        readings: mapScopes(scopes, (entry) => entry.phases[phase]?.readings ?? {}),
        rootAttributes: mapScopes(scopes, (entry) => entry.phases[phase]?.rootAttributes ?? {}),
        canaryReadings: mapScopes(scopes, (entry) => entry.phases[phase]?.canaryReadings ?? {}),
      };
    }

    const guards = {};
    for (const phase of ['baseline', 'mutation', 'removal']) {
      guards[phase] = evaluateMeasurementGuards({
        plan,
        readings: byPhase[phase].readings,
        canaryReadings: byPhase[phase].canaryReadings,
        // The stale-source guard is about the run, not about one phase, so it
        // is asked once — on the baseline — rather than counted three times.
        sourceFreshness: phase === 'baseline' ? sourceFreshness : null,
      });
    }

    const { movements, moved, inert } = buildMovements(
      byPhase.baseline.readings,
      byPhase.mutation.readings,
    );
    const restoreComparison = compareExact({
      before: { readings: byPhase.baseline.readings, rootAttributes: byPhase.baseline.rootAttributes },
      after: { readings: byPhase.removal.readings, rootAttributes: byPhase.removal.rootAttributes },
      beforeLabel: 'baseline',
      afterLabel: 'removal',
    });
    const negativeControls = assertNegativeControlsHeld({
      resolved: resolution.resolved,
      movements,
      // The measurement plan, expanded BEFORE any browser read happened (see
      // `runCausalProbe`'s `planByKey`, the union across every scope this arm
      // measured). This is what lets `every-measured-target` widen to a real
      // completeness check — a property this target's own plan declares but
      // that produced no row is `unmeasured`, not silently skipped — without
      // demanding every fixture read every font/color/border/motion property.
      plan,
    });

    perArm[arm.armId] = {
      armId: arm.armId,
      position: arm.position,
      positionMeaning: arm.positionMeaning,
      applied: arm.variables,
      provenance: arm.provenance,
      inline: mapScopes(scopes, (entry) =>
        entry.inline
          ? {
              clobbered: entry.inline.clobbered ?? [],
              introduced: entry.inline.introduced ?? [],
              restoreOps: entry.inline.restore ?? [],
            }
          : null,
      ),
      totals: {
        scope: 'across every (vertical x theme x fixture x property) row measured for this arm',
        movedProperties: moved,
        inertProperties: inert,
      },
      guards,
      movements,
      negativeControls,
      restore: {
        exact: restoreComparison.exact,
        law: RESTORE_LAW,
        meaning: describeRestore(restoreComparison),
        counts: restoreComparison.counts,
        comparedRows: restoreComparison.comparedRows,
        rows: restoreComparison.rows,
      },
    };
  }

  const armIds = arms.map((arm) => arm.armId);

  // Every arm's OWN control liveness, not just the first arm's. See
  // `evaluateControlLiveness` for why checking only `arms[0]` (always the
  // static arm when both are present) hides a DB-arm-specific wiring failure.
  const controlLiveness = evaluateControlLiveness(
    perArm,
    armIds,
    controlFixtures ?? [],
    controlManifest?.declaredOutputs?.channels ?? [],
  );

  const guardFailures = Object.values(perArm).flatMap((arm) =>
    Object.entries(arm.guards).flatMap(([phase, result]) =>
      result.failures.map((failure) => ({ armId: arm.armId, phase, ...failure })),
    ),
  );
  // Anything other than a demonstrated live control is suspect. `no-controls`
  // is not a middle state: a run that never turned a channel it could watch
  // cannot distinguish an inert design system from a broken harness.
  const suspect =
    guardFailures.length > 0 ||
    !negativeControlGate.ok ||
    controlLiveness.verdict !== 'harness-live';

  const selfCheck = {
    verdict: suspect ? 'harness-suspect' : 'harness-live',
    voidsInertVerdicts: suspect,
    guardFailures,
    negativeControlGate,
    controlLiveness,
    meaning: suspect
      ? 'This run failed its own self-check. EVERY inert and unchanged verdict in this ' +
        'artifact is void, including the negative controls that appear to have held: a run ' +
        'that cannot be shown to measure movement cannot be shown to measure its absence ' +
        'either.'
      : 'Every declared target matched and produced readings, the manifest negative controls ' +
        'resolved, and a direct-dial control moved independently on every arm. Inert verdicts ' +
        'in this artifact are about the design system.',
  };

  // "Static and DB are equivalent" is part of the VERDICT, not a side note
  // reported alongside it. `compareArms` returns `comparable: false` when
  // fewer than two arms ran, and that must not read as a pass: a claim that
  // was never tested is not a claim that held. `ingressEquivalenceHeld` is
  // false whenever equivalence was not actually established, whether because
  // it was not comparable at all or because it was comparable and diverged.
  const ingressEquivalence = compareArms(perArm, armIds);
  const ingressEquivalenceHeld = ingressEquivalence.comparable && ingressEquivalence.equivalent;

  const restoreExactEverywhere = Object.values(perArm).every((arm) => arm.restore.exact);
  const negativeControlsHeld = Object.values(perArm).every((arm) => arm.negativeControls.held);

  return {
    instrument: 'resolution-probe',
    artifactVersion: CAUSAL_ARTIFACT_VERSION,
    question:
      'Does this control CAUSE the intended change, leave the declared negative controls ' +
      'untouched, and restore the baseline exactly when removed - through both tenant ingress ' +
      'doors on one scene?',
    controlId,
    stop,
    phases: ['baseline', 'mutation', 'removal'],
    declaredNegativeControls: declared,
    negativeControlResolution: resolution,
    manifestAgreement,
    arms: perArm,
    ingressEquivalence,
    unmatched,
    selfCheck,
    verdict: {
      pass:
        !suspect &&
        restoreExactEverywhere &&
        negativeControlsHeld &&
        manifestAgreement.ok &&
        unmatched.length === 0 &&
        ingressEquivalenceHeld,
      restoreExactEverywhere,
      negativeControlsHeld,
      manifestAgreement: manifestAgreement.ok,
      ingressEquivalenceHeld,
      selfCheck: selfCheck.verdict,
    },
  };
}

function mapScopes(scopes, project) {
  return Object.fromEntries(
    Object.entries(scopes ?? {}).map(([scope, entry]) => [scope, project(entry)]),
  );
}

/**
 * Static versus DB, on the same scene.
 *
 * Two arms of ONE run, so a divergence here is a cascade fact rather than an
 * artefact of two separately taken runs. Every differing row is named; a count
 * alone would let "they mostly agree" stand in for equivalence.
 */
function compareArms(perArm, armIds) {
  if (armIds.length < 2) {
    return {
      comparable: false,
      reason:
        'fewer than two ingress arms were measured, so static/DB equivalence was not tested by ' +
        'this run and must not be inferred from it',
      rows: [],
    };
  }
  const [leftId, rightId] = armIds;
  const left = perArm[leftId].movements;
  const right = perArm[rightId].movements;
  const rows = [];
  const scopes = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  for (const scope of scopes) {
    const leftTargets = left[scope] ?? {};
    const rightTargets = right[scope] ?? {};
    const targets = [
      ...new Set([...Object.keys(leftTargets), ...Object.keys(rightTargets)]),
    ].sort();
    for (const target of targets) {
      const leftProperties = leftTargets[target] ?? {};
      const rightProperties = rightTargets[target] ?? {};
      const properties = [
        ...new Set([...Object.keys(leftProperties), ...Object.keys(rightProperties)]),
      ].sort();
      for (const property of properties) {
        const a = leftProperties[property];
        const b = rightProperties[property];
        const aValue = a ? (a.moved ? a.to : a.value) : undefined;
        const bValue = b ? (b.moved ? b.to : b.value) : undefined;
        if (aValue === bValue && Boolean(a?.moved) === Boolean(b?.moved)) continue;
        rows.push({
          scope,
          target,
          property,
          [leftId]: a ?? null,
          [rightId]: b ?? null,
        });
      }
    }
  }
  return {
    comparable: true,
    arms: [leftId, rightId],
    equivalent: rows.length === 0,
    meaning:
      rows.length === 0
        ? 'Both ingress doors produced the same painted result on the same DOM. Static/DB ' +
          'equivalence is a measured diff here, not an inference from two separate runs.'
        : 'The two ingress doors did NOT produce the same painted result on the same DOM. Each ' +
          'differing row is named below; a tenant reaching this control through one door gets a ' +
          'different product from a tenant reaching it through the other.',
    rows,
  };
}

/**
 * The browser half: gather three phases for every arm and scope, then hand the
 * readings to the pure builder above.
 *
 * @param {object} options
 * @param {object[]} options.arms  composed by runtime/ingress
 */
export async function runCausalProbe({
  controlId,
  stop,
  controlManifest,
  familyManifest = null,
  negativeControlBindings = {},
  arms,
  verticals = VERTICAL_KEYS,
  themes = THEMES,
  fixtures: fixtureIds = null,
  bundleMode = 'fresh',
  engine = 'modern',
  sourceFreshness = null,
  controlFixtures = null,
}) {
  // A static arm is TENANT-SPECIFIC: its selector names one tenant slug, so
  // serving it to another vertical would append a block that matches nothing
  // and report the control as inert everywhere. That is a false negative of the
  // most convincing kind, so it is refused rather than warned about.
  const staticArm = arms.find((arm) => arm.position === 'tenant-scoped-stylesheet-block');
  if (staticArm && (verticals.length !== 1 || verticals[0] !== staticArm.vertical)) {
    throw new Error(
      `resolution-probe: the static ingress arm is composed for "${staticArm.vertical}" and this ` +
        `run asked for [${verticals.join(', ')}]. A tenant-scoped block cannot match another ` +
        'tenant, and an arm that matches nothing reads exactly like a control that reaches ' +
        'nothing. Run one vertical per static arm.',
    );
  }

  const selectedFixtures = getFixtures(fixtureIds);
  const declared = declaredPhrasesFor({ controlManifest, familyManifest, controlId });
  const negativeResolution = resolveNegativeControls({
    phrases: declared.effective,
    bindings: negativeControlBindings,
  });
  const fixtures = expandFixturesForNegativeControls({
    fixtures: selectedFixtures,
    resolved: negativeResolution.resolved,
  });
  const resolvedControlFixtures =
    controlFixtures ??
    directControlFixtureIds({
      fixtures: selectedFixtures,
      channels: controlManifest?.declaredOutputs?.channels ?? [],
    });
  const bundles = {};
  for (const vertical of verticals) {
    bundles[vertical] = await resolveBundle({ vertical, mode: bundleMode });
  }

  const sourceFiles = sourceFreshness
    ? [
        ...new Set([
          ...(sourceFreshness.sourceFiles ?? []),
          ...Object.values(bundles).flatMap((bundle) =>
            (bundle.provenance.inputs ?? []).map((path) =>
              path.startsWith('packages/') ? path : `packages/core/${path}`,
            ),
          ),
        ]),
      ].sort()
    : [];
  const preMeasurementDigest = sourceFreshness
    ? computeSourceDigest(sourceFiles, { root: REPOSITORY_ROOT })
    : null;

  const { browser, close, provenance: browserProvenance } = await launchBrowser();
  const observations = {};
  /**
   * The stylesheet-level half of the exact-restore law, stated in hashes.
   *
   * For a static arm the removal phase must re-serve the BASELINE BYTES, not an
   * equivalent recomposition. Recording all three hashes lets a reader check
   * that rather than take it on trust, and `mutationDifferedFromBaseline`
   * catches the opposite accident: an arm whose block changed nothing about the
   * served sheet, which would make every "inert" row meaningless.
   */
  const stylesheets = {};
  try {
    for (const arm of arms) {
      const scopes = {};
      stylesheets[arm.armId] = {};
      // The plan is the UNION across scopes, not the last scope's. A fixture
      // that matches in one vertical and not another must surface as a
      // zero-match row in the vertical that lost it, which cannot happen if the
      // plan silently shrinks to whatever the final scope measured.
      const planByKey = new Map();
      const unmatched = [];
      for (const vertical of verticals) {
        for (const theme of themes) {
          const scope = { vertical, theme, engine, arm: 'both' };
          const id = scopeId(scope);
          const measured = await measureCausalScope({
            browser,
            css: bundles[vertical].css,
            scope,
            fixtures,
            arm,
            planFromMemo: (memo) => planInlinePhase({ memo, properties: arm.variables }),
          });
          for (const row of measured.plan) planByKey.set(`${row.fixtureId}/${row.targetId}`, row);
          scopes[id] = { phases: measured.phases, inline: measured.inline };
          const hashes = Object.fromEntries(
            Object.entries(measured.cssByPhase).map(([phase, text]) => [phase, sha256(text)]),
          );
          stylesheets[arm.armId][id] = {
            ...hashes,
            removalIsByteIdenticalToBaseline: hashes.removal === hashes.baseline,
            mutationDifferedFromBaseline: hashes.mutation !== hashes.baseline,
          };
          for (const row of measured.unmatched) unmatched.push({ scope: id, ...row });
        }
      }
      observations[arm.armId] = {
        plan: [...planByKey.values()].sort((left, right) =>
          `${left.fixtureId}/${left.targetId}`.localeCompare(`${right.fixtureId}/${right.targetId}`),
        ),
        scopes,
        unmatched,
      };
    }
  } finally {
    await close();
  }

  const postMeasurementDigest = sourceFreshness
    ? computeSourceDigest(sourceFiles, { root: REPOSITORY_ROOT })
    : null;
  const measuredSourceFreshness = sourceFreshness
    ? {
        ...sourceFreshness,
        observedDigest: postMeasurementDigest,
        preMeasurementDigest,
        postMeasurementDigest,
        sourceFiles,
      }
    : null;

  const report = buildCausalReport({
    controlId,
    stop,
    controlManifest,
    familyManifest,
    negativeControlBindings,
    arms,
    observations,
    sourceFreshness: measuredSourceFreshness,
    controlFixtures: resolvedControlFixtures,
  });

  return {
    ...report,
    scopeOfRun: {
      verticals: [...verticals],
      themes: [...themes],
      engine,
      fixtures: fixtures.map((fixture) => fixture.id),
      viewport: VIEWPORT,
      note: ROSTER_NOTE,
    },
    provenance: {
      browser: browserProvenance,
      bundleMode,
      bundles: Object.fromEntries(
        Object.entries(bundles).map(([vertical, bundle]) => [vertical, bundle.provenance]),
      ),
      stylesheets,
      sourceFreshness: measuredSourceFreshness,
      stylesheetLaw:
        'A static arm removes by re-serving the baseline BYTES, so removal and baseline must ' +
        'hash identically and the mutation must not. A DB arm never changes the sheet, so all ' +
        'three hashes agree and its restore law lives in the inline memo instead.',
    },
  };
}

/** Stable serialisation: two identical trees must produce identical bytes. */
export function serialiseArtifact(artifact) {
  return `${JSON.stringify(artifact, sortedReplacer, 2)}\n`;
}

function sortedReplacer(_key, value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return value;
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}
