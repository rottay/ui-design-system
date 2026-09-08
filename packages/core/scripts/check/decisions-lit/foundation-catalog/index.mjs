/**
 * @fileoverview The 29 decisions as the probe needs them: two values and a class.
 *
 * TWO VALUES, NOT ONE. A decision is measured by MOVING it: the probe compiles
 * the same tenant twice, differing in exactly this decision, and diffs the
 * computed styles. A single value measures nothing, because a value that
 * happens to equal the vertical's own default paints the vertical's own paint.
 *
 * THE RECORDED CLASS IS DECLARED, AND SAYS SO. `recordedClass` is the audit's
 * measured classification of today's tree (`audit/50-matrices/cascade` section
 * 1 crossed with the consumer contract section 4), carried here so the
 * indicator can publish the `n/22` figure the contract states. It is NOT
 * derived by this probe and must never be read as if it were: deriving it
 * needs the per-decision minimum families, which the kit fixes in the typed
 * catalog of WO-CAT-02. What this probe DOES derive, and fails closed on, is
 * `movesSomething` -- and the rows recorded `new` must all measure false.
 *
 * @module Tooling/DecisionsLit/Foundation/Catalog
 */

import { readThemeCatalog } from '../../../libraries/theme-catalog/index.mjs';

const CATALOG_TIERS = new Map(readThemeCatalog().map((row) => [row.id, row.tier]));

/** The tier of a decision, read from the catalog and never restated here. */
function themeControlTier(id) {
  const tier = CATALOG_TIERS.get(id);
  if (!tier) {
    throw new Error(
      `decisions-lit: "${id}" is not a row of the typed catalog; the probe cannot`
        + ' measure a decision the catalog does not declare',
    );
  }
  return tier;
}

/** Today's control catalog: the 21 manifest controls plus `palette.dark-mode`. */
export const TODAY_CONTROL_DENOMINATOR = 22;

/**
 * The kit rows that do not exist in today's catalog at all. 10 -> 8 on
 * 2026-09-08 (K3 audit HOLD adjudication of WO-DER-02): `states.emphasis` and
 * `states.focus-style` gained a real producer and moved to `partial`.
 */
export const NEW_DECISION_DENOMINATOR = 8;

/**
 * `full`    the audit measured full, coherent effect in static and DB
 * `partial` measured effect, but below the fan-out the decision declares
 * `none`    measured no useful effect (wired, cancelled, or data-only)
 * `new`     no producer anywhere; one of the ten the kit marks `(new)`
 */
export const RECORDED_CLASSES = Object.freeze(['full', 'partial', 'none', 'new']);

/**
 * THE ARM VALUES SIT INSIDE THE VERTICAL ENVELOPE, and that is load-bearing.
 *
 * Four numeric rows used to probe values the envelope refuses -- `scale 0.9`
 * against a 0.92 floor, `radiusScale 0.75` against 0.8, `effectIntensity 1`
 * against 0.65, `durationScale 0.5` against 0.75. Nothing noticed, because
 * before WO-CAT-03 only the DB terminal applied the envelope and this probe
 * goes through the compile door. It was therefore measuring a compile no tenant
 * could publish -- F-27's complaint, in a new place -- and the door now says so
 * by refusing the arm.
 *
 * The arms are inside the envelope for every vertical, so each row still
 * contrasts two DIFFERENT admissible values and the measurement is of something
 * a tenant can actually do.
 */
export const DECISIONS = Object.freeze([
  ['palette.seeds', 'full', [{ primary: '#4F46E5' }, { primary: '#DC2626' }]],
  ['palette.status-seeds', 'full', [{ success: '#10B981' }, { success: '#0EA5E9' }]],
  ['palette.neutral-temperature', 'new', ['cool', 'warm']],
  ['palette.contrast-posture', 'new', ['soft', 'high']],
  ['palette.dark-mode', 'none', ['light', 'dark']],
  ['typography.families', 'full', [{ base: 'humanist-text' }, { base: 'editorial-text' }]],
  ['typography.pairing', 'full', ['sober', 'editorial']],
  ['typography.scale', 'partial', [0.95, 1.05]],
  ['typography.role-weights', 'new', ['light', 'strong']],
  ['typography.numeric', 'new', ['proportional', 'tabular']],
  ['shape.radius-scale', 'none', [0.85, 1.15]],
  ['shape.nesting', 'new', ['concentric', 'uniform']],
  ['shape.button-style', 'partial', ['sharp', 'pill']],
  ['shape.control-height', 'new', ['compact', 'tall']],
  ['density.mode', 'partial', ['compact', 'spacious']],
  ['spacing.rhythm', 'none', ['tight', 'airy']],
  ['surfaces.elevation-posture', 'partial', ['flat', 'elevated']],
  ['surfaces.border-style', 'new', ['none', 'strong']],
  ['surfaces.effect-intensity', 'partial', [0, 0.6]],
  // WO-DER-02 (2026-09-08, K3 audit HOLD adjudication): both state decisions
  // now have a real producer (`derivation/states`) and the probe MEASURES them
  // moving, so `new` is a lie the run refuses to publish. The class is
  // `partial`: measured effect, bounded by the verticals' own hand-authored
  // material roots (the emphasis probe measures 13/25 families at best, in
  // evnto), below the fan-out the rows declare.
  ['states.emphasis', 'partial', ['subtle', 'strong']],
  ['states.focus-style', 'partial', ['ring', 'glow']],
  ['motion.dial', 'partial', [
    { intensity: 0, durationScale: 0.8 },
    { intensity: 0.8, durationScale: 1.3 },
  ]],
  ['motion.character', 'new', ['mechanical', 'playful']],
  ['navigation.sidebar-tone', 'full', ['subtle', 'inverse']],
  ['experience.profile', 'full', [
    'rottay/bithire-technical@1',
    'rottay/management-editorial@1',
  ]],
  ['profiles.expressive', 'full', [{ type: 'technical' }, { type: 'editorial' }]],
  ['recipe-profile', 'none', [
    'rottay/technical-sharp@1',
    'rottay/editorial-round@1',
  ]],
  ['chrome.anatomy', 'none', [{ cardComponent: 'default' }, { cardComponent: 'framed' }]],
  ['responsive.posture', 'none', ['compact', 'expansive']],
].map(([id, recordedClass, values]) =>
  Object.freeze({
    id,
    // THE TIER IS NOT RESTATED. It is read from the typed catalog, which is the
    // only place a control's tier is declared since WO-CAT-02; a second column
    // here is exactly the drift F-03 recorded.
    tier: themeControlTier(id),
    recordedClass,
    values: Object.freeze(values),
  }),
));

/** The positive control: if THIS does not move, the instrument is not measuring. */
export const POSITIVE_CONTROL_ID = 'palette.seeds';

export const NEW_DECISION_IDS = Object.freeze(
  DECISIONS.filter((row) => row.recordedClass === 'new').map((row) => row.id),
);

/**
 * Fails closed on a catalog that no longer states what it claims to state.
 *
 * The censuses are the kit's own (29 rows, 19 standard, 10 pro, 10 new). A
 * silent edit that dropped a row would otherwise make every later count
 * smaller and still green.
 */
export function censusErrors(rows = DECISIONS) {
  const errors = [];
  const count = (predicate) => rows.filter(predicate).length;
  const newRows = rows.filter((row) => row.recordedClass === 'new');
  if (rows.length !== 29) errors.push(`expected 29 rows, found ${rows.length}`);
  if (count((r) => r.tier === 'standard') !== 19) {
    errors.push(`expected 19 standard rows, found ${count((r) => r.tier === 'standard')}`);
  }
  if (count((r) => r.tier === 'pro') !== 10) {
    errors.push(`expected 10 pro rows, found ${count((r) => r.tier === 'pro')}`);
  }
  if (newRows.length !== NEW_DECISION_DENOMINATOR) {
    errors.push(`expected ${NEW_DECISION_DENOMINATOR} new rows, found ${newRows.length}`);
  }
  for (const row of rows) {
    if (!RECORDED_CLASSES.includes(row.recordedClass)) {
      errors.push(`${row.id}: unknown recordedClass ${JSON.stringify(row.recordedClass)}`);
    }
    if (row.values.length !== 2) errors.push(`${row.id}: needs exactly two probe values`);
    if (JSON.stringify(row.values[0]) === JSON.stringify(row.values[1])) {
      errors.push(`${row.id}: its two probe values are identical, so it measures nothing`);
    }
  }
  if (new Set(rows.map((r) => r.id)).size !== rows.length) {
    errors.push('duplicate decision id');
  }
  // The probe measures the CATALOG's rows, in the catalog's order. A row here
  // that the catalog does not declare is a probe measuring something nobody
  // published, and a catalog row missing here is a decision nobody measures.
  const catalogIds = [...CATALOG_TIERS.keys()];
  if (rows === DECISIONS && rows.map((r) => r.id).join('|') !== catalogIds.join('|')) {
    errors.push(
      'the probe rows disagree with the typed catalog: '
        + `probe [${rows.map((r) => r.id).join(', ')}] vs catalog [${catalogIds.join(', ')}]`,
    );
  }
  return errors;
}

/** The same census, as the run's first fail-closed step. */
export function assertCatalogCensus() {
  const errors = censusErrors();
  if (errors.length > 0) {
    throw new Error(`decisions-lit catalog is invalid:\n  - ${errors.join('\n  - ')}`);
  }
}
