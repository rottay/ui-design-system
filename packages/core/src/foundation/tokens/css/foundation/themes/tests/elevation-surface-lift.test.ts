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
 * at rest in the theme, and (e) that the modern card/modal/popover skins honor
 * the surface layer they declare. Source parsing only, no DOM.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const fromRoot = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

const DEFAULT_CSS = fromRoot(
  "src/foundation/tokens/css/foundation/themes/default.css",
);
const CARD_CSS = fromRoot(
  "src/foundation/tokens/css/runtime/engines/modern/skin/card.css",
);
const MODAL_CSS = fromRoot(
  "src/foundation/tokens/css/runtime/engines/modern/skin/modal.css",
);
const POPOVER_CSS = fromRoot(
  "src/foundation/tokens/css/runtime/engines/modern/skin/popover.css",
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
      // The neutral ramp must never become a color-mix/surface overlay, and must
      // never borrow the brand accent (that would be glow on neutral depth).
      expect(value).not.toContain("color-mix");
      expect(value).not.toContain("elevation-surface");
      expect(value).not.toContain("color-primary");
      expect(value).not.toContain("shadow-primary");
      expect(value).toMatch(/\brgba?\(/);
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

  it("modal composes the elevation-surface layer without touching its bg fill", () => {
    expect(MODAL_CSS).toMatch(
      /background-image:\s*linear-gradient\(var\(--ds-elevation-surface-4\), var\(--ds-elevation-surface-4\)\)/,
    );
    expect(MODAL_CSS).toContain(
      "background-color: var(--ds-modal-bg, var(--ds-surface-card))",
    );
  });

  it("popover composes the elevation-surface layer over its card fill", () => {
    expect(POPOVER_CSS).toContain(
      "background-color: var(--ds-popover-bg, var(--ds-surface-card))",
    );
    expect(POPOVER_CSS).toMatch(
      /background-image:\s*linear-gradient\(var\(--ds-elevation-surface-3\), var\(--ds-elevation-surface-3\)\)/,
    );
  });
});
