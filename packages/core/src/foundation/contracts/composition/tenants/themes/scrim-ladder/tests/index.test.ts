/**
 * The scrim ladder canon: the Pro bounds are the band edges' own derivation, the
 * canon strengths sit inside them, and every door words a refusal the same way.
 */
import { describe, expect, it } from "vitest";

import {
  SCRIM_LADDER_BAND_EDGES,
  SCRIM_LADDER_BANDS,
  SCRIM_LADDER_STEPS,
  SCRIM_LADDER_STRENGTH_BOUNDS,
  SCRIM_LADDER_STRENGTH_CAP,
  SCRIM_LADDER_STRENGTHS,
  deriveScrimStrengthBounds,
  scrimStrengthRefusals,
} from "..";

describe("scrim ladder bounds", () => {
  it("derives the Pro bounds from the measured band edges", () => {
    expect(SCRIM_LADDER_STRENGTH_BOUNDS).toEqual({
      light: { min: 0.4, max: 0.62 },
      medium: { min: 0.66, max: 0.81 },
      heavy: { min: 0.86, max: 0.95 },
    });
    expect(
      deriveScrimStrengthBounds(
        SCRIM_LADDER_BANDS,
        SCRIM_LADDER_BAND_EDGES,
        SCRIM_LADDER_STRENGTH_CAP
      )
    ).toEqual(SCRIM_LADDER_STRENGTH_BOUNDS);
  });

  it("keeps every bound inside its band edges, with no endpoint shared between steps", () => {
    const edge = (legibility: number) =>
      SCRIM_LADDER_BAND_EDGES.find((entry) => entry.legibility === legibility)!;
    for (const step of SCRIM_LADDER_STEPS) {
      const band = SCRIM_LADDER_BANDS[step];
      const bound = SCRIM_LADDER_STRENGTH_BOUNDS[step];
      expect(bound.min, step).toBeGreaterThan(edge(band.max).maxAlpha);
      if (band.min > 1.0) expect(bound.max, step).toBeLessThan(edge(band.min).minAlpha);
    }
    expect(SCRIM_LADDER_STRENGTH_BOUNDS.light.max).toBeLessThan(SCRIM_LADDER_STRENGTH_BOUNDS.medium.min);
    expect(SCRIM_LADDER_STRENGTH_BOUNDS.medium.max).toBeLessThan(SCRIM_LADDER_STRENGTH_BOUNDS.heavy.min);
  });

  it("seats each canon strength inside its own bound and rising", () => {
    for (const step of SCRIM_LADDER_STEPS) {
      const { min, max } = SCRIM_LADDER_STRENGTH_BOUNDS[step];
      expect(SCRIM_LADDER_STRENGTHS[step], step).toBeGreaterThanOrEqual(min);
      expect(SCRIM_LADDER_STRENGTHS[step], step).toBeLessThanOrEqual(max);
    }
    expect(scrimStrengthRefusals(SCRIM_LADDER_STRENGTHS, "p")).toEqual([]);
  });

  it("moves the bounds when a measured edge moves", () => {
    const moved = deriveScrimStrengthBounds(
      SCRIM_LADDER_BANDS,
      SCRIM_LADDER_BAND_EDGES.map((entry) =>
        entry.legibility === 3.0 ? { ...entry, minAlpha: 0.6, maxAlpha: 0.7 } : entry
      ),
      SCRIM_LADDER_STRENGTH_CAP
    );
    expect(moved.light.max).toBe(0.59);
    expect(moved.medium.min).toBe(0.71);
  });
});

describe("scrimStrengthRefusals", () => {
  const path = "overrides.chrome.scrim";

  it("admits an in-band partial record", () => {
    expect(scrimStrengthRefusals({ medium: 0.7 }, path)).toEqual([]);
  });

  it("refuses a non-object, an unknown step, an out-of-band and a non-numeric strength by name", () => {
    expect(scrimStrengthRefusals("0.7", path)).toEqual([
      "`overrides.chrome.scrim` must be an object of light | medium | heavy",
    ]);
    expect(scrimStrengthRefusals({ tint: 0.5 }, path)).toEqual([
      'unsupported key "tint" in overrides.chrome.scrim; the scrim ladder steps are light | medium | heavy',
    ]);
    expect(scrimStrengthRefusals({ medium: 0.05 }, path)).toEqual([
      "overrides.chrome.scrim.medium must be a number in [0.66, 0.81], the medium step's band; got 0.05",
    ]);
    expect(scrimStrengthRefusals({ heavy: "0.9" }, path)).toEqual([
      'overrides.chrome.scrim.heavy must be a number in [0.86, 0.95], the heavy step\'s band; got "0.9"',
    ]);
  });

  it("admits the extreme in-band record, which still rises because the bounds are disjoint", () => {
    expect(scrimStrengthRefusals({ light: 0.62, medium: 0.66, heavy: 0.86 }, path)).toEqual([]);
    expect(scrimStrengthRefusals({ light: 0.63 }, path)).toHaveLength(1);
  });
});
