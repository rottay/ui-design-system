/**
 * @fileoverview themanagementmiami invariant suite (WO-ENG-20).
 *
 * themanagementmiami is a real, second first-party tenant on the bithire
 * vertical, authored to read as a different company rather than a recolor.
 * Per the owner's 2026-07-09 decision there is no convergence requirement
 * between tenants sharing a vertical -- cadence, density, separation
 * strategy, accent grammar, and type ramp are all free to differ from
 * bithire's. The one thing a tenant configuration may NOT do is produce an
 * unusable interface, so this suite asserts two things:
 *
 * 1. Divergence -- for every Tier-1 channel named in the work order,
 *    themanagementmiami's compiled value differs from bithire's. A theme
 *    that "diverges" only in ways nobody can observe is not a proof.
 * 2. The semantic-color-collision invariant -- success/warning/error/info
 *    are mutually distinguishable and distinguishable from primaryColor, by
 *    a measured hue/lightness separation, never a hue whitelist. A teal
 *    success would be legitimate on a different primary; the reason the
 *    legacy `foundation/tokens/css/facade/legacy/themanagementmiami/index.css` shipped a BLUE
 *    success was that a green brand collided with a green semantic and
 *    someone "fixed" the collision by changing the semantic's meaning
 *    instead of its color. This suite measures separation instead.
 *
 * Pattern followed from torture-fixtures.test.ts in this same directory.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

import { compileBrandTheme } from "../index";
import type { CompiledBrand } from "@/foundation/contracts/composition/tenants/themes";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes";
import { themanagementmiamiBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/fixtures/themanagementmiami";
import {
  isBundledTenant,
  isKnownTenant,
  BUNDLED_TENANT_SLUGS,
} from "@/infrastructure/runtime/tenant/foundation/configuration/registry";
import {
  hexToRgb,
  isHexColor,
} from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import {
  contrastRatio,
  rgbToHsl,
} from "@/foundation/kernel/accessibility/branding-contrast";

// ── Compile ─────────────────────────────────────────────────────────────

describe("themanagementmiami compiles", () => {
  it("compiles via compileBrandTheme without throwing and scopes it to its tenant selector", () => {
    const compiled = compileBrandTheme({
      brandTheme: themanagementmiamiBrandTheme,
      tenantSlug: "themanagementmiami",
      baseTheme: "light",
    });
    expect(Object.keys(compiled.cssVariables).length).toBeGreaterThan(0);
    expect(compiled.cssString).toContain("[data-tenant='themanagementmiami']");
  });
});

// ── Tier-1 divergence from bithire ─────────────────────────────────────
//
// Each entry names a Tier-1 channel from the work order and how to read its
// compiled value: most channels land directly in compileBrandTheme's
// cssVariables output (verified against infrastructure/compilers/kernel/runtime/brand-theme);
// motion and accent-grammar fields are personality-mediated (BrandMotion and
// BrandChrome.accent both convert through brandThemeToPersonality, not
// brandThemeToCssVariables) so those channels read compiled.personality
// instead. it.each names the failing channel directly, per-row, rather than
// bundling the whole ranked list into one assertion.

const compiledThemanagementmiami: CompiledBrand = compileBrandTheme({
  brandTheme: themanagementmiamiBrandTheme,
  tenantSlug: "themanagementmiami",
  baseTheme: "light",
});
const compiledBithire: CompiledBrand = compileBrandTheme({
  brandTheme: bithireBrandTheme,
  tenantSlug: "bithire",
  baseTheme: "light",
});

interface DivergenceChannel {
  name: string;
  extract: (compiled: CompiledBrand) => unknown;
}

const TIER1_DIVERGENCE_CHANNELS: readonly DivergenceChannel[] = [
  // 1. Typography — serif heading/display against bithire's system sans stack.
  {
    name: "1. typography: heading font family",
    extract: (c) => c.cssVariables["--ds-font-family-heading"],
  },
  {
    name: "1. typography: heading letter-spacing (serif tracking discipline)",
    extract: (c) => c.cssVariables["--ds-letter-spacing-heading"],
  },
  // 2. Radius — deco-crisp 4/6/8/12 against bithire's 6/8/10/14.
  {
    name: "2. radius: sm step",
    extract: (c) => c.cssVariables["--ds-radius-sm"],
  },
  {
    name: "2. radius: md step",
    extract: (c) => c.cssVariables["--ds-radius-md"],
  },
  {
    name: "2. radius: lg step",
    extract: (c) => c.cssVariables["--ds-radius-lg"],
  },
  {
    name: "2. radius: xl step",
    extract: (c) => c.cssVariables["--ds-radius-xl"],
  },
  // 3. Motion temperament — spring-settled slide-up against bithire's linear fade.
  {
    name: "3. motion: entrance type",
    extract: (c) => c.personality.animation?.entrance,
  },
  {
    name: "3. motion: entrance duration (--ds-motion-calm)",
    extract: (c) => c.cssVariables["--ds-motion-calm"],
  },
  {
    name: "3. motion: spring usage",
    extract: (c) => c.personality.animation?.useSpring,
  },
  {
    name: "3. motion: hover lift",
    extract: (c) => c.personality.animation?.hoverLift,
  },
  // 4. Separation strategy — shadow-led + warm temperature against bithire's
  //    border-led + cool temperature.
  {
    name: "4. separation strategy: card border",
    extract: (c) => c.cssVariables["--ds-card-border"],
  },
  {
    name: "4. separation strategy: card shadow",
    extract: (c) => c.cssVariables["--ds-card-shadow"],
  },
  {
    name: "4. separation strategy: sidebar border",
    extract: (c) => c.cssVariables["--ds-sidebar-border"],
  },
  {
    name: "4. separation strategy: card showBorder posture",
    extract: (c) => c.personality.card?.showBorder,
  },
  // 5. Accent grammar — top gradient bar + square badges against bithire's
  //    left solid bar + pill badges.
  {
    name: "5. accent grammar: bar position",
    extract: (c) => c.personality.accent?.barPosition,
  },
  {
    name: "5. accent grammar: bar style",
    extract: (c) => c.personality.accent?.barStyle,
  },
  {
    name: "5. accent grammar: badge shape",
    extract: (c) => c.personality.accent?.badgeShape,
  },
  {
    name: "5. accent grammar: divider style",
    extract: (c) => c.personality.accent?.dividerStyle,
  },
  // 6. Effects posture — warmer intensity against bithire's quieter baseline.
  {
    name: "6. effects posture: effect intensity",
    extract: (c) => c.cssVariables["--ds-effect-intensity"],
  },
  // 7. Palette, last.
  {
    name: "7. palette: primary color",
    extract: (c) => c.cssVariables["--ds-color-primary"],
  },
  {
    name: "7. palette: secondary color",
    extract: (c) => c.cssVariables["--ds-color-secondary"],
  },
  {
    name: "7. palette: accent color",
    extract: (c) => c.cssVariables["--ds-color-accent"],
  },
  // chrome.table — white + hairline against bithire's tinted paper-band header.
  {
    name: "chrome.table: header background",
    extract: (c) => c.cssVariables["--ds-table-header-bg"],
  },
  {
    name: "chrome.table: border",
    extract: (c) => c.cssVariables["--ds-table-border"],
  },
];

describe("themanagementmiami diverges from bithire on every Tier-1 channel", () => {
  it.each(TIER1_DIVERGENCE_CHANNELS)("$name", ({ extract }) => {
    const tmmValue = extract(compiledThemanagementmiami);
    const bithireValue = extract(compiledBithire);
    expect(
      tmmValue,
      "themanagementmiami must emit a defined value for this channel"
    ).not.toBeUndefined();
    expect(
      tmmValue,
      `themanagementmiami and bithire must differ on this channel (both resolved to ${JSON.stringify(
        tmmValue
      )})`
    ).not.toEqual(bithireValue);
  });
});

// ── Semantic-color-collision invariant (owner decision 2026-07-09) ────
//
// Reuses the existing color primitives instead of a fourth color
// implementation: hexToRgb (compilers/kernel/foundation/css/color-math) and rgbToHsl +
// contrastRatio (the foundation accessibility kernel's WCAG validator, already used to
// gate tenant branding elsewhere in the DS). A pair is "distinguishable" if
// EITHER its hue is far enough apart to read as a different color family, OR
// its WCAG relative-luminance contrast ratio is far enough apart to read as a
// different tone -- either difference alone is how humans actually tell two
// swatches apart, so the check is an OR, not an AND.

function circularHueDistance(hueA: number, hueB: number): number {
  const delta = Math.abs(hueA - hueB);
  return Math.min(delta, 360 - delta);
}

function hexHue(hex: string): number {
  if (!isHexColor(hex)) {
    throw new Error(
      `semantic-collision check received a non-hex color: ${hex}`
    );
  }
  const rgb = hexToRgb(hex);
  if (!rgb) {
    throw new Error(
      `semantic-collision check could not parse hex color: ${hex}`
    );
  }
  return rgbToHsl(rgb).h;
}

const MIN_HUE_SEPARATION_DEG = 25;
const MIN_CONTRAST_SEPARATION = 1.15;

function isDistinguishable(a: string, b: string): boolean {
  return (
    circularHueDistance(hexHue(a), hexHue(b)) >= MIN_HUE_SEPARATION_DEG ||
    contrastRatio(a, b) >= MIN_CONTRAST_SEPARATION
  );
}

describe("semantic-color-collision invariant (owner decision 2026-07-09)", () => {
  const palette = themanagementmiamiBrandTheme.palette;
  if (!palette) {
    throw new Error(
      "themanagementmiamiBrandTheme.palette is required for the semantic-collision invariant"
    );
  }

  const colors: Record<
    "primary" | "success" | "warning" | "error" | "info",
    string | undefined
  > = {
    primary: palette.primaryColor,
    success: palette.successColor,
    warning: palette.warningColor,
    error: palette.errorColor,
    info: palette.infoColor,
  };

  it.each(Object.entries(colors))(
    "%s color is a real hex value",
    (_name, value) => {
      expect(
        value,
        "every semantic + primary color must be a literal hex value for a measured separation check"
      ).toBeDefined();
      expect(isHexColor(value as string)).toBe(true);
    }
  );

  const REQUIRED_PAIRS: ReadonlyArray<
    readonly [keyof typeof colors, keyof typeof colors]
  > = [
    ["success", "primary"],
    ["warning", "primary"],
    ["error", "primary"],
    ["info", "primary"],
    ["success", "warning"],
    ["success", "error"],
    ["success", "info"],
    ["warning", "error"],
    ["warning", "info"],
    ["error", "info"],
  ];

  it.each(REQUIRED_PAIRS)("%s is distinguishable from %s", (a, b) => {
    const colorA = colors[a] as string;
    const colorB = colors[b] as string;
    const hueDist = circularHueDistance(hexHue(colorA), hexHue(colorB));
    const contrast = contrastRatio(colorA, colorB);
    expect(
      isDistinguishable(colorA, colorB),
      `${a} (${colorA}) vs ${b} (${colorB}): hueDist=${hueDist.toFixed(
        1
      )}deg (need >=${MIN_HUE_SEPARATION_DEG}) and ` +
        `contrast=${contrast.toFixed(
          2
        )} (need >=${MIN_CONTRAST_SEPARATION}) -- neither threshold met`
    ).toBe(true);
  });
});

// ── BUNDLED_TENANT_SLUGS promise holds for every member ────────────────
//
// The set is a promise about the shipped CSS bundle. Derived directly from
// the live set (not a hand-maintained parallel list) so a slug cannot sit
// here promising a bundle that does not exist on disk -- the exact shape of
// the trap this work order found themanagementmiami sitting in.

describe("BUNDLED_TENANT_SLUGS promise holds for every member", () => {
  it("themanagementmiami is an explicit fixture, never a known or bundled runtime tenant", () => {
    expect(isKnownTenant("themanagementmiami")).toBe(false);
    expect(BUNDLED_TENANT_SLUGS.has("themanagementmiami")).toBe(false);
    expect(isBundledTenant("themanagementmiami")).toBe(false);
  });

  it.each([...BUNDLED_TENANT_SLUGS])(
    "%s has a bundled CSS artifact on disk",
    (slug) => {
      const artifactPath = resolve(
        process.cwd(),
        "src/foundation/tokens/css/facade/artifacts",
        slug,
        "index.css"
      );
      expect(
        existsSync(artifactPath),
        `expected foundation/tokens/css/facade/artifacts/${slug}/index.css to exist`
      ).toBe(true);
    }
  );

  it("themanagementmiami legacy CSS cannot become a second runtime authority", () => {
    const legacyPath = resolve(
      process.cwd(),
      "src/foundation/tokens/css/facade/legacy/themanagementmiami/index.css"
    );
    expect(existsSync(legacyPath)).toBe(false);
  });
});
