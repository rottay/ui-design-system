/**
 * The `tooltip` family: the unqualified `chrome.tooltip.bg` / `.color` pair
 * reaches the Modern bubble's overlay recipes when a theme authors it, and a
 * theme that authors neither derives exactly the recipe paint it always had.
 * The legacy root pair stays with the frozen engines and the compound skin.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  validateTenantThemeDocument,
} from "@/infrastructure/compilers/composition/tenant-theme";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { compileVerticalThroughDoor } from "@tests/support/theme-door";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import { buildLoweringContext } from "../../../../pipeline";
import { tooltipChromeDeriver } from "..";

const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };
const AUTHORED_BG = "#1e3a8a";

const withTooltip = (tooltip: Record<string, string>): FlatTheme => ({
  ...MINIMAL_THEME,
  chrome: { tooltip },
});

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: firstPartyFixture("rottay") },
  { label: "bithire", theme: firstPartyFixture("bithire") },
  { label: "evnto", theme: firstPartyFixture("evnto") },
  { label: "minimal", theme: MINIMAL_THEME },
  { label: "authored bg", theme: withTooltip({ bg: AUTHORED_BG }) },
  { label: "authored pair", theme: withTooltip({ bg: AUTHORED_BG, color: "#fde68a" }) },
  {
    label: "bithire under a tenant floor",
    theme: firstPartyFixture("bithire"),
    tenant: FIXTURE_TENANT_FACTS,
  },
];

describeFamilyContract(tooltipChromeDeriver, FIXTURES);

const derive = (theme: FlatTheme) =>
  tooltipChromeDeriver.derive(buildLoweringContext({ theme }), {});

const RECIPE_PAINT = {
  "--ds-tooltip-bordered-background": "var(--ds-material-overlay-background)",
  "--ds-tooltip-bordered-foreground": "var(--ds-color-text-primary)",
  "--ds-tooltip-minimal-background": "var(--ds-material-overlay-background)",
  "--ds-tooltip-minimal-foreground": "var(--ds-color-text-primary)",
} as const;

const pick = (vars: Readonly<Record<string, string>>) =>
  Object.fromEntries(Object.keys(RECIPE_PAINT).map((name) => [name, vars[name]]));

describe("a theme that authors no tooltip pair", () => {
  it.each(["rottay", "bithire", "evnto"] as const)("%s keeps the overlay recipe paint", (vertical) => {
    expect(pick(derive(firstPartyFixture(vertical)))).toEqual(RECIPE_PAINT);
  });

  it("derives the same record as a theme with no chrome at all", () => {
    expect(derive(withTooltip({ shadow: "none" }))).toEqual(derive(MINIMAL_THEME));
  });
});

describe("an authored chrome.tooltip pair", () => {
  it("routes both overlay recipes through the authored background", () => {
    const vars = derive(withTooltip({ bg: AUTHORED_BG }));
    expect(vars["--ds-tooltip-bordered-background"]).toBe("var(--ds-tooltip-bg)");
    expect(vars["--ds-tooltip-minimal-background"]).toBe("var(--ds-tooltip-bg)");
  });

  it("measures a readable ink over a hex background the theme left inkless", () => {
    const vars = derive(withTooltip({ bg: AUTHORED_BG }));
    expect(vars["--ds-tooltip-bordered-foreground"]).toBe("#ffffff");
    expect(vars["--ds-tooltip-minimal-foreground"]).toBe("#ffffff");
    expect(derive(withTooltip({ bg: "#fef3c7" }))["--ds-tooltip-bordered-foreground"]).toBe("#171717");
  });

  it("defers the ink over a background with no compile-time colour", () => {
    const vars = derive(withTooltip({ bg: "var(--ds-color-primary)" }));
    expect(vars["--ds-tooltip-bordered-background"]).toBe("var(--ds-tooltip-bg)");
    expect(vars["--ds-tooltip-bordered-foreground"]).toBe(RECIPE_PAINT["--ds-tooltip-bordered-foreground"]);
  });

  it("takes an authored color as the ink, with or without a background", () => {
    const pair = derive(withTooltip({ bg: AUTHORED_BG, color: "#fde68a" }));
    expect(pair["--ds-tooltip-bordered-foreground"]).toBe("var(--ds-tooltip-color)");
    const inkOnly = derive(withTooltip({ color: "#fde68a" }));
    expect(inkOnly["--ds-tooltip-bordered-background"]).toBe(RECIPE_PAINT["--ds-tooltip-bordered-background"]);
    expect(inkOnly["--ds-tooltip-minimal-foreground"]).toBe("var(--ds-tooltip-color)");
  });

  it("leaves the inverse and rich recipes on their own materials", () => {
    const authored = derive(withTooltip({ bg: AUTHORED_BG, color: "#fde68a" }));
    const bare = derive(MINIMAL_THEME);
    for (const recipe of ["inverse", "rich"]) {
      expect(authored[`--ds-tooltip-${recipe}-background`]).toBe(bare[`--ds-tooltip-${recipe}-background`]);
      expect(authored[`--ds-tooltip-${recipe}-foreground`]).toBe(bare[`--ds-tooltip-${recipe}-foreground`]);
    }
  });
});

const IDENTITY: TenantThemeConfigIdentity = {
  tenantId: "tenant_tooltip_probe",
  slug: "tooltip-probe",
  verticalKey: "bithire",
  rowVersion: 1,
};

const compileDocument = (document: TenantThemeDocument) => {
  expect(validateTenantThemeDocument(document).success).toBe(true);
  return compileTenantThemeConfig(hydrateTenantThemeConfig(document, IDENTITY), {
    verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")!,
  }).variables as Record<string, string>;
};

/** Resolve `var()` references against one compiled block, as the cascade would. */
function resolveVar(vars: Record<string, string>, value: string, depth = 0): string {
  if (depth > 16) throw new Error(`unresolved cycle at ${value}`);
  const match = /^var\(\s*(--ds-[a-z0-9-]+)\s*(?:,\s*([\s\S]+))?\)$/.exec(value.trim());
  if (!match) return value;
  const own = vars[match[1]!];
  if (own !== undefined) return resolveVar(vars, own, depth + 1);
  if (match[2] !== undefined) return resolveVar(vars, match[2], depth + 1);
  return value;
}

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

describe("through the tenant document door", () => {
  const bare: TenantThemeDocument = { schemaVersion: 1, mode: "advanced", visualFoundation: {} };
  const authored: TenantThemeDocument = {
    schemaVersion: 1,
    mode: "advanced",
    visualFoundation: { advanced: { chrome: { tooltip: { bg: AUTHORED_BG } } } },
  };

  it("paints the Modern bubble's default recipe with the tenant's background", () => {
    // The tenant artifact is a delta scoped over the vertical's own artifact.
    const vars = { ...compileVerticalThroughDoor("bithire").cssVariables, ...compileDocument(authored) };
    expect(resolveVar(vars, "var(--ds-tooltip-bordered-background)")).toBe(AUTHORED_BG);
    expect(resolveVar(vars, "var(--ds-tooltip-bordered-foreground)")).toBe("#ffffff");
    expect(SKIN).toMatch(
      /--ds-tooltip-surface-current:\s*var\(--ds-tooltip-bordered-background,/
    );
    expect(SKIN).toMatch(/background:\s*var\(--ds-tooltip-surface-current,/);
  });

  it("moves nothing but the overlay recipe pair and the authored channel", () => {
    const before = compileDocument(bare);
    const after = compileDocument(authored);
    const moved = [...new Set([...Object.keys(before), ...Object.keys(after)])]
      .filter((name) => before[name] !== after[name])
      .sort();
    expect(moved).toEqual([
      "--ds-tooltip-bg",
      "--ds-tooltip-bordered-background",
      "--ds-tooltip-bordered-foreground",
      "--ds-tooltip-minimal-background",
      "--ds-tooltip-minimal-foreground",
    ]);
  });
});

describe("the frozen engines keep the legacy pair", () => {
  const read = (path: string) =>
    readFileSync(resolve(process.cwd(), path), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  it("is never produced by the deriver, so the root default still reaches them", () => {
    for (const fixture of FIXTURES) {
      const vars = tooltipChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(vars).not.toHaveProperty("--ds-tooltip-bg");
      expect(vars).not.toHaveProperty("--ds-tooltip-color");
    }
    const root = read("src/foundation/tokens/css/foundation/themes/default/index.css");
    expect(root).toMatch(/--ds-tooltip-bg:\s*#171717;/);
    expect(root).toMatch(/--ds-tooltip-color:\s*#ffffff;/);
  });

  it("reads none of the recipe channels the deriver now routes", () => {
    for (const path of [
      "src/foundation/tokens/css/runtime/engines/classic/theme/index.css",
      "src/foundation/tokens/css/runtime/engines/rustic/theme/index.css",
      "src/foundation/tokens/css/runtime/engines/rustic/skin/tooltip/index.css",
      "src/foundation/tokens/css/presentation/components/skin/tooltip-compounds/index.css",
    ]) {
      expect(read(path)).not.toMatch(/--ds-tooltip-(bordered|minimal)-/);
    }
  });
});
