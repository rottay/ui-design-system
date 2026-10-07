/**
 * @fileoverview The scrim ladder canon: steps, page-legibility bands, canon strengths and the Pro strength bounds.
 *
 * @module Foundation/Contracts/Composition/Tenants/Themes/ScrimLadder
 * @category Types
 * @package @rottay/design-system
 */

export const SCRIM_LADDER_STEPS = Object.freeze([
  "light",
  "medium",
  "heavy",
] as const);

export type ScrimLadderStep = (typeof SCRIM_LADDER_STEPS)[number];

/** WCAG contrast of page ink against page ground once the scrim covers both: [min, max). */
export interface ScrimBand {
  readonly min: number;
  readonly max: number;
}

/** context · focus · interrupt, as page-legibility bands. */
export const SCRIM_LADDER_BANDS: Readonly<Record<ScrimLadderStep, ScrimBand>> =
  Object.freeze({
    light: Object.freeze({ min: 3.0, max: 7.0 }),
    medium: Object.freeze({ min: 1.5, max: 3.0 }),
    heavy: Object.freeze({ min: 1.0, max: 1.5 }),
  });

export const SCRIM_LADDER_STRENGTHS: Readonly<Record<ScrimLadderStep, number>> =
  Object.freeze({ light: 0.52, medium: 0.78, heavy: 0.9 });

export const SCRIM_LADDER_STRENGTH_CAP = 0.95;

export interface ScrimBandEdge {
  readonly legibility: number;
  readonly minAlpha: number;
  readonly maxAlpha: number;
}

/** Alpha reaching each band edge over the six first-party vertical × mode grounds and inks. */
export const SCRIM_LADDER_BAND_EDGES: readonly ScrimBandEdge[] = Object.freeze([
  Object.freeze({ legibility: 7.0, minAlpha: 0.377, maxAlpha: 0.39 }),
  Object.freeze({ legibility: 3.0, minAlpha: 0.631, maxAlpha: 0.652 }),
  Object.freeze({ legibility: 1.5, minAlpha: 0.818, maxAlpha: 0.849 }),
]);

export interface ScrimStrengthBound {
  readonly min: number;
  readonly max: number;
}

function edgeAt(
  edges: readonly ScrimBandEdge[],
  legibility: number
): ScrimBandEdge {
  const edge = edges.find((entry) => entry.legibility === legibility);
  if (!edge) {
    throw new Error(`scrim ladder: no measured edge at legibility ${legibility}`);
  }
  return edge;
}

const hundredths = (value: number): number => Math.round(value * 1e6) / 1e4;

/** Inside each band at every measured ground, inset by half a hundredth; no shared endpoints. */
export function deriveScrimStrengthBounds(
  bands: Readonly<Record<ScrimLadderStep, ScrimBand>>,
  edges: readonly ScrimBandEdge[],
  cap: number
): Readonly<Record<ScrimLadderStep, ScrimStrengthBound>> {
  const bound = (step: ScrimLadderStep): ScrimStrengthBound => {
    const band = bands[step];
    const min = Math.ceil(hundredths(edgeAt(edges, band.max).maxAlpha + 0.005)) / 100;
    const max =
      band.min <= 1.0
        ? cap
        : Math.floor(hundredths(edgeAt(edges, band.min).minAlpha - 0.005)) / 100;
    return Object.freeze({ min, max });
  };
  return Object.freeze({
    light: bound("light"),
    medium: bound("medium"),
    heavy: bound("heavy"),
  });
}

export const SCRIM_LADDER_STRENGTH_BOUNDS = deriveScrimStrengthBounds(
  SCRIM_LADDER_BANDS,
  SCRIM_LADDER_BAND_EDGES,
  SCRIM_LADDER_STRENGTH_CAP
);

/**
 * Every reason an authored strength record is refused, in one wording for every door.
 * The bounds are disjoint and rising, so any admitted record keeps light < medium < heavy.
 */
export function scrimStrengthRefusals(value: unknown, path: string): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [`\`${path}\` must be an object of ${SCRIM_LADDER_STEPS.join(" | ")}`];
  }
  const refusals: string[] = [];
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!(SCRIM_LADDER_STEPS as readonly string[]).includes(key)) {
      refusals.push(
        `unsupported key "${key}" in ${path}; the scrim ladder steps are ${SCRIM_LADDER_STEPS.join(" | ")}`
      );
    }
  }
  for (const step of SCRIM_LADDER_STEPS) {
    const strength = record[step];
    if (strength === undefined) continue;
    const { min, max } = SCRIM_LADDER_STRENGTH_BOUNDS[step];
    if (typeof strength !== "number" || !Number.isFinite(strength) || strength < min || strength > max) {
      refusals.push(
        `${path}.${step} must be a number in [${min}, ${max}], the ${step} step's band; got ${JSON.stringify(strength)}`
      );
    }
  }
  return refusals;
}
