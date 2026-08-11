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

import { resolveBundle } from '../../runtime/bundle/index.mjs';
import { getFixtures, ROSTER_NOTE } from '../../foundation/roster/index.mjs';
import { scopeId, THEMES, VERTICAL_KEYS } from '../../foundation/scope/index.mjs';
import { launchBrowser } from '../../runtime/browser/index.mjs';
import { measureScope, VIEWPORT } from '../../runtime/measure/index.mjs';

export const ARTIFACT_VERSION = 1;

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

function buildDialReport({ dial, dialTarget, readings, dialled, witnesses, fixtures }) {
  const movements = {};
  let moved = 0;
  let inert = 0;
  for (const [scope, baselineTargets] of Object.entries(readings)) {
    const dialledTargets = dialled[scope] ?? {};
    const perScope = {};
    for (const [targetKey, baseline] of Object.entries(baselineTargets)) {
      const after = dialledTargets[targetKey];
      if (!baseline.present || !after?.present) continue;
      const perTarget = {};
      for (const [property, before] of Object.entries(baseline.values)) {
        const now = after.values[property];
        const didMove = before !== now;
        if (didMove) moved += 1;
        else inert += 1;
        perTarget[property] = didMove
          ? { moved: true, from: before, to: now }
          : { moved: false, value: before };
      }
      perScope[targetKey] = perTarget;
    }
    movements[scope] = perScope;
  }

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
          'tenant artifact land.'
        : 'Written inline on the measured element itself — a strictly stronger position than ' +
          'any tenant can occupy.',
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
function evaluateControls(movements, controlIds) {
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
        .filter(([, row]) => row.moved)
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

/** Stable serialisation: two identical trees must produce identical bytes. */
export function serialiseArtifact(artifact) {
  return `${JSON.stringify(artifact, sortedReplacer, 2)}\n`;
}

function sortedReplacer(_key, value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return value;
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}
