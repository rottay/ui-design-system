/** The selected chip's ink clears AA over its own active wash, and moves only where the raw primary does not. */
import { describe, expect, it } from "vitest";

import { contrastRatio } from "@/foundation/kernel/color/contrast";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { compileThemeIntent, documentThemeIntent, staticThemeIntent } from "@/entrypoints/server";
import { mixColor } from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import type { AssembledChannels, LoweringContext } from "../../../../../foundation/contract";
import { deriveSelectedInk } from "..";

const CHAIN = "var(--ds-filter-pill-active-color, var(--ds-color-primary))";

/** The primary over the control ground at the active shift: what the skin paints behind the ink. */
const wash = (primary: string, ground: string, shift: number) => mixColor(ground, primary, shift / 100);

const context = (theme: Partial<FlatTheme> = {}) => ({ theme }) as unknown as LoweringContext;

const TEAL: AssembledChannels = {
  "--ds-color-primary": "#0F766E",
  "--ds-color-bg-input": "#fefdfa",
  "--ds-state-active-shift": "13%",
};

/** The Management's published document: the tenant whose selected chip measured 4.47:1 in axe. */
const THE_MANAGEMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: {
        primary: "#0F766E",
        secondary: "#8C6D46",
        accent: "#B44F3C",
        background: "#FBF6EC",
        foreground: { primary: "#2E261C", secondary: "#5C4F3D", muted: "#6B5B48", disabled: "#74644F" },
        border: { primary: "#C8B9A5", secondary: "#E2D9CC" },
        backgroundMode: "light",
      },
    },
  },
} as const;

describe("badge selected ink", () => {
  it("moves a primary that misses AA over its wash by the smallest step that clears it", () => {
    const surface = wash("#0F766E", "#fefdfa", 13);
    expect(contrastRatio("#0F766E", surface)).toBeLessThan(4.5);

    const ink = deriveSelectedInk(context(), TEAL);
    expect(ink).toMatch(/^#[0-9a-f]{6}$/);
    expect(contrastRatio(ink, surface)).toBeGreaterThanOrEqual(4.5);
    // The first twentieth toward the standard posture's dark ink already clears it: no jump to the ink itself.
    expect(ink).toBe(mixColor("#0f766e", "#171717", 1 / 20));
  });

  it("steps a teal that misses AA over the default 7% wash to an ink that clears it", () => {
    const below = { "--ds-color-primary": "#14857c", "--ds-color-bg-input": "#fefdfa" };
    const surface = wash("#14857c", "#fefdfa", 7);
    expect(contrastRatio("#14857c", surface)).toBeLessThan(4.5);

    const ink = deriveSelectedInk(context(), below);
    expect(ink).not.toBe(CHAIN);
    expect(contrastRatio(ink, surface)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the chain for a primary with no compile-time colour", () => {
    for (const primary of ["var(--brand-primary)", "oklch(0.52 0.09 185)"]) {
      expect(deriveSelectedInk(context(), { ...TEAL, "--ds-color-primary": primary })).toBe(CHAIN);
    }
  });

  it("keeps the chain where the primary already clears AA", () => {
    const passing = { ...TEAL, "--ds-color-primary": "#2F5BE8", "--ds-color-bg-input": "#ffffff" };
    expect(contrastRatio("#2F5BE8", wash("#2F5BE8", "#ffffff", 13))).toBeGreaterThanOrEqual(4.5);
    expect(deriveSelectedInk(context(), passing)).toBe(CHAIN);
  });

  it("keeps the chain when the surface the ink would be measured against is authored or unknown", () => {
    expect(deriveSelectedInk(context({ chrome: { filterPill: { activeColor: "#123456" } } } as never), TEAL)).toBe(CHAIN);
    expect(deriveSelectedInk(context({ chrome: { filterPill: { activeBg: "#eeeeee" } } } as never), TEAL)).toBe(CHAIN);
    expect(deriveSelectedInk(context({ chrome: { badge: { selectedSurface: "#eeeeee" } } } as never), TEAL)).toBe(CHAIN);
    expect(deriveSelectedInk(context(), { ...TEAL, "--ds-surface-control": "#f0f0f0" })).toBe(CHAIN);
    expect(deriveSelectedInk(context(), { ...TEAL, "--ds-color-bg-input": "var(--ds-color-neutral-0)" })).toBe(CHAIN);
    expect(deriveSelectedInk(context(), { "--ds-color-bg-input": "#fefdfa" })).toBe(CHAIN);
  });

  it("lowers a readable selected ink for The Management and leaves the passing verticals on the chain", () => {
    const management = compileThemeIntent(
      documentThemeIntent({ vertical: "bithire", slug: "themanagementmiami", document: THE_MANAGEMENT as never })
    ).compiled.cssVariables;
    const ink = management["--ds-badge-selected-ink"];
    expect(contrastRatio(ink, wash("#0F766E", "#fefdfa", 13))).toBeGreaterThanOrEqual(4.5);

    const bithire = compileThemeIntent(staticThemeIntent("bithire")).compiled;
    expect(bithire.cssVariables["--ds-badge-selected-ink"]).toBe(CHAIN);
    const dark = bithire.modeBlocks.find((block) => block.mode === "dark")?.cssVariables ?? {};
    expect(contrastRatio(dark["--ds-badge-selected-ink"], wash("#2F5BE8", "#0c0c0c", 13))).toBeGreaterThanOrEqual(4.5);

    for (const vertical of ["rottay", "evnto"] as const) {
      expect(compileThemeIntent(staticThemeIntent(vertical)).compiled.cssVariables["--ds-badge-selected-ink"]).toBe(CHAIN);
    }
  });
});
