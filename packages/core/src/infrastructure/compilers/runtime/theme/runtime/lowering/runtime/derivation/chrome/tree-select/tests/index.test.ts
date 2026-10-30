/**
 * The `tree-select` focus rings: the tenant's focus signature at rest and under a
 * validation status, and the input family's gated status ring once a theme
 * authors that status.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { compileFlatThemeThroughDoor } from "@tests/support/theme-door";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { treeSelectChromeDeriver } from "..";

const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: firstPartyFixture("rottay") },
  { label: "bithire", theme: firstPartyFixture("bithire") },
  { label: "evnto", theme: firstPartyFixture("evnto") },
  { label: "minimal", theme: MINIMAL_THEME },
  {
    label: "bithire under a tenant floor",
    theme: firstPartyFixture("bithire"),
    tenant: FIXTURE_TENANT_FACTS,
  },
];

describeFamilyContract(treeSelectChromeDeriver, FIXTURES);

const RING = "--ds-tree-select-shadow-focus";
const AUTHORED = "0 0 0 5px rgba(255, 0, 170, 0.4)";
const STATUSES = ["error", "warning"] as const;

const statusRing = (status: (typeof STATUSES)[number]) => `--ds-tree-select-${status}-shadow-focus`;

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/tree-select/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

const withInput = (theme: FlatTheme, input: Record<string, string>): FlatTheme => ({
  ...theme,
  chrome: {
    ...theme.chrome,
    controls: {
      ...theme.chrome?.controls,
      input: { ...theme.chrome?.controls?.input, ...input },
    },
  },
});

describe("chrome/tree-select focus rings", () => {
  it("declares the focus decision and the authored status leaves it reads", () => {
    expect(treeSelectChromeDeriver.consumes).toEqual(
      expect.arrayContaining([
        "states.focus",
        "chrome.controls.input.errorShadowFocus",
        "chrome.controls.input.warningShadowFocus",
      ])
    );
  });

  it("rests the ring on the tenant's focus signature, and the skin reads it", () => {
    for (const fixture of FIXTURES) {
      const derived = treeSelectChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(derived[RING], fixture.label).toBe("var(--ds-focus-ring)");
    }
    expect(SKIN).toContain(`box-shadow: var(${RING}, var(--ds-focus-ring));`);
  });

  it("rests each status ring on the field's own ring until a theme authors that status", () => {
    for (const fixture of FIXTURES) {
      const derived = treeSelectChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      for (const status of STATUSES) {
        expect(derived[statusRing(status)], `${fixture.label} ${status}`).toBe(
          `var(${RING}, var(--ds-focus-ring))`
        );
        // The halo the frozen engines read is always defined: resting on it would paint it by default.
        expect(derived[statusRing(status)], `${fixture.label} ${status}`).not.toMatch(
          /--ds-input-(?:error|warning|success)-shadow-focus/
        );
        expect(SKIN).toContain(`box-shadow: var(${statusRing(status)}, var(--ds-focus-ring));`);
      }
    }
  });

  it("keeps a focused status frame on the signature when a theme authors only the input focus shadow", () => {
    const result = runDerivation(
      buildLoweringContext({ theme: withInput(firstPartyFixture("bithire"), { shadowFocus: AUTHORED }) })
    );
    expect(result.channels[RING]).toBe("var(--ds-focus-ring)");
    for (const status of STATUSES) {
      expect(result.channels[statusRing(status)], status).toBe(`var(${RING}, var(--ds-focus-ring))`);
    }
  });

  it("reads the input family's gated ring once a theme authors that status, at vertical rank", () => {
    for (const status of STATUSES) {
      const result = runDerivation(
        buildLoweringContext({
          theme: withInput(firstPartyFixture("bithire"), { [`${status}ShadowFocus`]: AUTHORED }),
        })
      );
      const gated = `--ds-input-focus-ring-${status}`;
      expect(result.channels[statusRing(status)], status).toBe(`var(${gated}, var(--ds-focus-ring))`);
      expect(result.channels[gated], status).toBe(`var(--ds-input-${status}-shadow-focus)`);
      expect(result.channels[`--ds-input-${status}-shadow-focus`], status).toBe(AUTHORED);
      for (const other of STATUSES.filter((name) => name !== status)) {
        expect(result.channels[statusRing(other)], `${status} leaves ${other}`).toBe(
          `var(${RING}, var(--ds-focus-ring))`
        );
      }
      expect(result.channels[RING], status).toBe("var(--ds-focus-ring)");
    }
  });

  it("lets a tenant's authored status ring paint through the compile door", () => {
    for (const status of STATUSES) {
      const compiled = compileFlatThemeThroughDoor({
        flatTheme: firstPartyFixture("bithire"),
        tenantPatch: { chrome: { controls: { input: { [`${status}ShadowFocus`]: AUTHORED } } } },
      });
      const gated = `--ds-input-focus-ring-${status}`;
      expect(compiled.cssVariables[statusRing(status)], status).toBe(`var(${gated}, var(--ds-focus-ring))`);
      expect(compiled.cssVariables[gated], status).toBe(`var(--ds-input-${status}-shadow-focus)`);
      expect(compiled.cssVariables[`--ds-input-${status}-shadow-focus`], status).toBe(AUTHORED);
    }
  });
});

const HOVER = "--ds-tree-select-option-bg-hover";
const MATERIAL_HOVER = "--ds-material-control-background-hover";
const PALETTE_HOVER = "--ds-color-bg-hover";
const PALETTE_FIRST = `var(${PALETTE_HOVER}, var(${MATERIAL_HOVER}))`;

/** Resolve only whole-value var chains against independent test roots, without browser paint. */
function resolveChain(value: string, roots: Readonly<Record<string, string>>): string {
  const match = /^var\((--[a-z0-9-]+)(?:,\s*([\s\S]+))?\)$/.exec(value);
  if (!match) return value;
  const [, name, fallback] = match;
  if (name !== undefined && roots[name] !== undefined) return roots[name];
  if (fallback !== undefined) return resolveChain(fallback, roots);
  throw new Error(`Missing test root: ${name}`);
}

const deriveFor = (fixture: FamilyFixture) =>
  treeSelectChromeDeriver.derive(buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }), {});

const NON_TARGET_CHANNELS: Readonly<Record<string, string>> = {
  "--ds-tree-select-bg": "var(--ds-input-bg, var(--ds-material-control-background))",
  "--ds-tree-select-ink": "var(--ds-color-text-primary)",
  "--ds-tree-select-font-family": "var(--ds-input-font-family, var(--ds-type-body-font-family))",
  "--ds-tree-select-border": "var(--ds-input-border, var(--ds-material-control-border))",
  "--ds-tree-select-border-hover": "var(--ds-material-control-border-hover)",
  "--ds-tree-select-border-focus": "var(--ds-color-primary)",
  "--ds-tree-select-shadow-focus": "var(--ds-focus-ring)",
  "--ds-tree-select-error-border": "var(--ds-color-error)",
  "--ds-tree-select-warning-border": "var(--ds-color-warning)",
  "--ds-tree-select-error-shadow-focus": "var(--ds-tree-select-shadow-focus, var(--ds-focus-ring))",
  "--ds-tree-select-warning-shadow-focus": "var(--ds-tree-select-shadow-focus, var(--ds-focus-ring))",
  "--ds-tree-select-placeholder": "var(--ds-type-color-muted)",
  "--ds-tree-select-clear-color": "var(--ds-color-text-primary)",
  "--ds-tree-select-clear-color-hover": "var(--ds-input-clear-color-hover, var(--ds-color-text-primary))",
  "--ds-tree-select-dropdown-bg": "var(--ds-material-overlay-background)",
  "--ds-tree-select-dropdown-border": "var(--ds-color-border)",
  "--ds-tree-select-dropdown-shadow": "var(--ds-elevation-2)",
  "--ds-tree-select-divider": "var(--ds-color-border)",
  "--ds-tree-select-empty-ink": "var(--ds-type-color-muted)",
  "--ds-tree-select-option-ink": "var(--ds-color-text-primary)",
  "--ds-tree-select-option-ink-selected": "var(--ds-color-primary)",
  "--ds-tree-select-option-bg-selected": "color-mix(in srgb, var(--ds-color-primary) 10%, transparent)",
  "--ds-tree-select-option-border-selected": "color-mix(in srgb, var(--ds-color-primary) 24%, transparent)",
  "--ds-tree-select-highlight-ink": "var(--ds-color-primary)",
  "--ds-tree-select-check-accent": "var(--ds-color-primary)",
  "--ds-tree-select-line": "var(--ds-color-border-subtle)",
  "--ds-tree-select-spinner-track": "var(--ds-color-border)",
  "--ds-tree-select-spinner-ink": "var(--ds-color-primary)",
};

describe("chrome/tree-select option hover material", () => {
  it("moves with material while the declared palette hover stays fixed", () => {
    const base = { [PALETTE_HOVER]: "#eeeeee", [MATERIAL_HOVER]: "#112233" };
    const changed = { ...base, [MATERIAL_HOVER]: "#445566" };
    for (const fixture of FIXTURES) {
      const value = deriveFor(fixture)[HOVER]!;
      expect(resolveChain(value, base), fixture.label).toBe("#112233");
      expect(resolveChain(value, changed), fixture.label).toBe("#445566");
    }
  });

  it("holds material hover when only the palette hover changes", () => {
    const base = { [PALETTE_HOVER]: "#eeeeee", [MATERIAL_HOVER]: "#112233" };
    for (const fixture of FIXTURES) {
      const value = deriveFor(fixture)[HOVER]!;
      expect(resolveChain(value, { ...base, [PALETTE_HOVER]: "#999999" }), fixture.label).toBe(
        resolveChain(value, base)
      );
      expect(resolveChain(value, base), fixture.label).toBe(base[MATERIAL_HOVER]);
    }
  });

  it("detects the palette-first mutation masking an independently moved material", () => {
    const value = deriveFor(FIXTURES[3]!)[HOVER]!;
    const mutated = value.replace(`var(${MATERIAL_HOVER}, var(${PALETTE_HOVER}))`, PALETTE_FIRST);
    const base = { [PALETTE_HOVER]: "#eeeeee", [MATERIAL_HOVER]: "#112233" };
    const changed = { ...base, [MATERIAL_HOVER]: "#445566" };
    expect(mutated).not.toBe(value);
    expect(resolveChain(value, changed)).not.toBe(resolveChain(value, base));
    expect(resolveChain(mutated, changed)).toBe(resolveChain(mutated, base));
    expect(resolveChain(mutated, changed)).toBe(base[PALETTE_HOVER]);
  });

  it("retains palette hover as fallback when no material hover is declared", () => {
    expect(resolveChain(deriveFor(FIXTURES[3]!)[HOVER]!, { [PALETTE_HOVER]: "#eeeeee" })).toBe("#eeeeee");
  });

  it("preserves all 28 non-target channel values byte for byte", () => {
    const actual = Object.fromEntries(
      Object.entries(deriveFor(FIXTURES[3]!)).filter(([channel]) => channel !== HOVER)
    );
    expect(actual).toEqual(NON_TARGET_CHANNELS);
    expect(Object.keys(actual)).toHaveLength(28);
  });

  it("keeps the published family channel inventory unchanged", () => {
    const channels = Object.keys(deriveFor(FIXTURES[3]!)).sort();
    expect(channels).toEqual([...treeSelectChromeDeriver.produces].sort());
    expect(channels).toEqual([...Object.keys(NON_TARGET_CHANNELS), HOVER].sort());
  });
});
