/**
 * Contract test for the surface-luminance lift channel in the default theme.
 *
 * Elevation depth on a dark surface is carried by a translucent
 * --ds-color-bg-elevated overlay (the black --ds-elevation-1..5 shadows are
 * near-invisible there), dialled by --ds-elevation-lift-strength: 0 on the
 * light-surface default (overlay inert), raised under [data-theme='dark'].
 *
 * The channel is ADDITIVE: the --ds-elevation-1..5 shadow ramp and
 * --ds-shadow-primary stay the tenant-overridable depth tokens, so this test
 * locks (a) the lift ramp derivation, (b) that the shadow ramp is untouched,
 * (c) that --ds-shadow-primary is brand-derived and never dresses the neutral
 * ramp, (d) that the interpolable --ds-elevation-lift hover dial is not declared
 * at rest in the theme, and (e) that the modern card skin honors the surface
 * layer it declares. Source parsing only, no DOM; the modal and popover lift is
 * proven by their family causality probes.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const fromRoot = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

const DEFAULT_CSS = fromRoot(
  "src/foundation/tokens/css/foundation/themes/default/index.css",
);
const CARD_CSS = fromRoot(
  "src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css",
);

const DARK_SELECTOR = ":root[data-theme='dark']";

function parseDeclarations(section: string): Map<string, string> {
  const declarations = new Map<string, string>();
  for (const match of section.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    declarations.set(match[1], match[2].replace(/\s+/g, " ").trim());
  }
  return declarations;
}

const darkStart = DEFAULT_CSS.indexOf(DARK_SELECTOR);
if (darkStart < 0) throw new Error("Dark theme block not found");
const rootScope = parseDeclarations(DEFAULT_CSS.slice(0, darkStart));
const darkOwnScope = parseDeclarations(DEFAULT_CSS.slice(darkStart));

describe("surface-lift channel (default theme)", () => {
  it("holds the lift-strength dial at 0 on the light-surface default", () => {
    expect(rootScope.get("--ds-elevation-lift-strength")).toBe("0");
  });

  it("raises the lift-strength dial under [data-theme='dark']", () => {
    const root = Number(rootScope.get("--ds-elevation-lift-strength"));
    const dark = Number(darkOwnScope.get("--ds-elevation-lift-strength"));
    expect(Number.isFinite(dark)).toBe(true);
    expect(dark).toBeGreaterThan(root);
  });

  it.each([0, 1, 2, 3, 4, 5])(
    "derives --ds-elevation-surface-%i from bg-elevated through the lift dial in oklch",
    (step) => {
      const value = rootScope.get(`--ds-elevation-surface-${step}`);
      expect(value, `--ds-elevation-surface-${step}`).toMatch(
        new RegExp(
          `^color-mix\\(in oklch, var\\(--ds-color-bg-elevated\\) ` +
            `calc\\(var\\(--ds-elevation-lift-strength\\) \\* ${step}%\\), transparent\\)$`,
        ),
      );
    },
  );
});

describe("additive law: the shadow ramp is untouched", () => {
  it.each([1, 2, 3, 4, 5])(
    "--ds-elevation-%i stays a static shadow list, not a lift overlay",
    (step) => {
      const value = rootScope.get(`--ds-elevation-${step}`);
      expect(value, `--ds-elevation-${step}`).toBeDefined();
      // C2 re-pin: the ramp is now PARAMETRIC over the shadow authorities
      // (--ds-shadow-tint / *-strength) so profiles and materials can move
      // dials. The original law survives in spirit: with the floors
      // (#000 / 1 / 1) every layer computes to the exact former rgba black,
      // and the ramp still must never become a surface overlay or borrow the
      // brand accent (that would be glow on neutral depth).
      expect(value).toContain("var(--ds-shadow-tint)");
      expect(value).not.toContain("elevation-surface");
      expect(value).not.toContain("color-primary");
      expect(value).not.toContain("shadow-primary");
      expect(rootScope.get("--ds-shadow-tint")).toBe("#000");
      expect(rootScope.get("--ds-shadow-key-strength")).toBe("1");
      expect(rootScope.get("--ds-shadow-ambient-strength")).toBe("1");
    },
  );
});

describe("--ds-shadow-primary is brand-derived, primary-emphasis only", () => {
  it("mixes the tenant accent in oklch and drops the static-black layers", () => {
    const value = rootScope.get("--ds-shadow-primary");
    expect(value).toBeDefined();
    expect(value).toContain("color-mix(in oklch, var(--ds-color-primary)");
    expect(value).not.toContain("rgba(0, 0, 0");
  });
});

describe("--ds-elevation-lift stays a forward hover dial", () => {
  it("is not declared at rest in the default theme (only -strength is)", () => {
    // Map keys are exact: --ds-elevation-lift-strength is a distinct token and
    // must not satisfy a lookup for --ds-elevation-lift.
    expect(rootScope.has("--ds-elevation-lift")).toBe(false);
    expect(darkOwnScope.has("--ds-elevation-lift")).toBe(false);
  });
});

describe("modern skins honor the surface layer they declare", () => {
  it("card composes a lift-aware overlay and interpolates it on hover", () => {
    expect(CARD_CSS).toContain(
      "--ds-card-elevation-surface: color-mix(in oklch, var(--ds-color-bg-elevated)",
    );
    expect(CARD_CSS).toContain("(1 + var(--ds-elevation-lift))");
    expect(CARD_CSS).toContain(
      "background-image: linear-gradient(var(--ds-card-elevation-surface), var(--ds-card-elevation-surface))",
    );
    expect(CARD_CSS).toMatch(/transition:[\s\S]*--ds-elevation-lift /);
    expect(CARD_CSS).toContain("--ds-elevation-lift: 1;");
  });
});
