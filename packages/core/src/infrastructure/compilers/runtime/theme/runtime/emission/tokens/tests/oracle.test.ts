/**
 * I-10 — the resolver and evaluator legs are bound by an oracle the pipeline
 * did not produce.
 *
 * Every row is asserted against `resolveChannelValue` / `evaluateCssValue`
 * directly. Nothing here goes through `emitThemeTokens`, so a defect in the
 * emitter's assembly cannot make a row pass, and a defect in the resolver or
 * the evaluator cannot cancel against itself.
 */

import { describe, expect, it } from "vitest";

import { TOKEN_EMISSION_BOUNDS } from "@/contracts/theme/runtime/compilation";

import { evaluateCssValue, resolveScope } from "..";
import {
  EVALUATION_ORACLE,
  ORACLE_ROWS,
  ORACLE_SUBJECTS,
  RESOLUTION_ORACLE,
} from "./oracle";

const ENVIRONMENT = { mode: "light" as const, rootFontSizePx: 16 };

describe("independent oracle", () => {
  it("is a floor, not a sample: every semantics and both spaces are represented", () => {
    expect(ORACLE_ROWS.length).toBeGreaterThanOrEqual(6);
    const covered = new Set(ORACLE_ROWS.map((row) => row.subject));
    for (const subject of ORACLE_SUBJECTS) {
      expect([...covered], `oracle no longer covers ${subject}`).toContain(subject);
    }
    for (const row of ORACLE_ROWS) {
      expect(row.derivation.length, `${row.id} has no written derivation`).toBeGreaterThan(80);
    }
  });

  describe.each(RESOLUTION_ORACLE.map((row) => [row.id, row] as const))(
    "%s",
    (_id, row) => {
      const outcome = resolveScope(row.scope);

      it("resolves exactly the channels the oracle says resolve, to its literals", () => {
        for (const [channel, expected] of Object.entries(row.resolved)) {
          expect(outcome.resolved[channel], `${channel}: ${row.derivation}`).toBe(expected);
        }
      });

      it("refuses exactly the channels the oracle says refuse, with its reasons", () => {
        const refused = outcome.unresolved
          .map((entry) => `${entry.channel}:${entry.reason}`)
          .sort();
        expect(refused).toEqual(
          row.refusals.map((entry) => `${entry.channel}:${entry.reason}`).sort()
        );
      });

      it("never emits a refused channel's own fallback as a value", () => {
        let carried = 0;
        for (const { channel } of row.refusals) {
          expect(Object.keys(row.resolved)).not.toContain(channel);
          const declared = row.scope[channel];
          const fallback = declared?.match(/,\s*([^)]+)\)\s*$/)?.[1]?.trim();
          if (!fallback) continue;
          carried += 1;
          expect(outcome.resolved[channel], `${channel} hooked its own fallback`).not.toBe(
            fallback
          );
        }
        if (row.refusals.length === 0) return;
        // Non-vacuity: a row whose refusers declare no fallback cannot tell a
        // resolver that hooks one from a resolver that refuses.
        expect(carried, `${row.id}: no refuser carries a fallback to hook`).toBeGreaterThan(0);
      });
    }
  );

  describe.each(EVALUATION_ORACLE.map((row) => [row.id, row] as const))("%s", (_id, row) => {
    it("evaluates to the hand-computed 8-bit triple and alpha", () => {
      const outcome = evaluateCssValue(row.value, ENVIRONMENT);
      expect(outcome.refused, row.derivation).toBeNull();
      expect(outcome.leaf?.kind).toBe("color");
      const leaf = outcome.leaf as { srgb: readonly number[]; alpha: number };
      for (let channel = 0; channel < 3; channel += 1) {
        expect(
          Math.abs(leaf.srgb[channel] - row.srgb[channel]),
          `${row.id} channel ${channel}: got ${leaf.srgb[channel]}, oracle ${row.srgb[channel]}`
        ).toBeLessThanOrEqual(row.tolerance);
      }
      expect(Math.abs(leaf.alpha - row.alpha)).toBeLessThanOrEqual(1e-9);
    });
  });

  it("the two interpolation spaces disagree on the same pair of colours", () => {
    const oklab = EVALUATION_ORACLE.find((row) => row.id === "O-6");
    const srgb = EVALUATION_ORACLE.find((row) => row.id === "O-5b");
    expect(oklab && srgb).toBeTruthy();
    const apart = oklab!.srgb.reduce(
      (most, channel, index) => Math.max(most, Math.abs(channel - srgb!.srgb[index])),
      0
    );
    expect(apart).toBeGreaterThan(TOKEN_EMISSION_BOUNDS.oklabSrgbChannelTolerance * 255);
  });

  /* ---- the mutants these rows exist to kill ------------------------------ */

  it("MUTANT M-2: a hex-only mix that drops alpha fails O-5", () => {
    const dropped = { kind: "color" as const, srgb: [51, 102, 255] as const, alpha: 1 };
    const row = EVALUATION_ORACLE.find((entry) => entry.id === "O-5")!;
    expect(Math.abs(dropped.alpha - row.alpha)).toBeGreaterThan(1e-9);
  });

  it("MUTANT M-5: a cycle member that hooked its own fallback fails O-2", () => {
    const row = RESOLUTION_ORACLE.find((entry) => entry.id === "O-2")!;
    const planted = { "--ds-oracle-c1": "1px", "--ds-oracle-c2": "2px" };
    for (const [channel, value] of Object.entries(planted)) {
      expect(resolveScope(row.scope).resolved[channel]).not.toBe(value);
    }
  });

  it("MUTANT M-7: a depth refusal that emitted the trailing fallback fails O-4", () => {
    const row = RESOLUTION_ORACLE.find((entry) => entry.id === "O-4")!;
    const outcome = resolveScope(row.scope);
    const hooking = row.refusals.filter(({ channel }) => /,\s*7px\)\s*$/.test(row.scope[channel]));
    expect(hooking.length, "O-4 declares no refuser the guard could hook").toBeGreaterThan(0);
    for (const { channel } of row.refusals) {
      expect(outcome.unresolved.some((item) => item.channel === channel)).toBe(true);
      expect(outcome.resolved[channel], `${channel} reported the guard as a value`).not.toBe("7px");
    }
  });
});
