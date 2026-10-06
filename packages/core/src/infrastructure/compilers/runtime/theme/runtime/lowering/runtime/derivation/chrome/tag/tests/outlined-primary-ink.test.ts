/** The outlined primary chip's ink clears AA on every ground it is painted on, and moves only where the raw primary does not. */
import { describe, expect, it } from "vitest";

import { contrastRatio } from "@/foundation/kernel/color/contrast";
import { mixColor } from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import type { AssembledChannels, LoweringContext } from "../../../../../foundation/contract";
import { deriveOutlinedPrimaryInk } from "..";

const CHAIN = "var(--ds-color-primary)";
const PRIMARY: AssembledChannels = { "--ds-color-primary": "#2F5BE8" };

const context = (mode: "light" | "dark", palette: Record<string, unknown>) =>
  ({ mode, theme: { palette } }) as unknown as LoweringContext;

/** BitHire's seed crossing into dark: the canvas, the raised ground cards take, and the
 *  recommended pricing plan's primary wash over that raised ground. */
const DARK = { backgroundColor: "#0A0A0A", backgroundElevatedColor: "#182235" };
const DARK_GROUNDS = ["#0a0a0a", "#182235", mixColor("#182235", "#2f5be8", 0.1)];

describe("tag outlined primary ink", () => {
  it("keeps the chain where the primary clears AA on every light ground, its wash included", () => {
    const wash = mixColor("#ffffff", "#2f5be8", 0.1);
    expect(contrastRatio("#2F5BE8", wash)).toBeGreaterThanOrEqual(4.5);
    const light = context("light", { backgroundColor: "#FFFFFF", backgroundElevatedColor: "#FFFFFF" });
    expect(deriveOutlinedPrimaryInk(light, PRIMARY)).toBe(CHAIN);
  });

  it("moves a primary that misses AA in dark to the smallest step clearing AA on every ground", () => {
    expect(DARK_GROUNDS[2]).toBe("#1a2847");
    for (const ground of DARK_GROUNDS) expect(contrastRatio("#2F5BE8", ground)).toBeLessThan(4.5);

    const ink = deriveOutlinedPrimaryInk(context("dark", DARK), PRIMARY);
    expect(ink).toBe(mixColor("#2f5be8", "#ffffff", 6 / 20));
    for (const ground of DARK_GROUNDS) expect(contrastRatio(ink, ground)).toBeGreaterThanOrEqual(4.5);
    // The step before it misses the wash: the raised ground alone would have under-measured.
    expect(contrastRatio(mixColor("#2f5be8", "#ffffff", 5 / 20), DARK_GROUNDS[2])).toBeLessThan(4.5);
  });

  it("does not read the contrast posture, so no posture-scoped block can restate it", () => {
    const at = (contrastPosture: string) =>
      deriveOutlinedPrimaryInk(context("dark", { ...DARK, contrastPosture }), PRIMARY);
    expect(at("soft")).toBe(at("standard"));
    expect(at("high")).toBe(at("standard"));
  });

  it("keeps the chain for a primary or ground with no compile-time colour", () => {
    expect(deriveOutlinedPrimaryInk(context("dark", DARK), { "--ds-color-primary": "var(--brand)" })).toBe(CHAIN);
    expect(deriveOutlinedPrimaryInk(context("dark", { ...DARK, backgroundElevatedColor: "var(--x)" }), PRIMARY)).toBe(CHAIN);
    expect(deriveOutlinedPrimaryInk(context("dark", {}), PRIMARY)).toBe(CHAIN);
    expect(deriveOutlinedPrimaryInk(context("dark", DARK), {})).toBe(CHAIN);
  });
});
