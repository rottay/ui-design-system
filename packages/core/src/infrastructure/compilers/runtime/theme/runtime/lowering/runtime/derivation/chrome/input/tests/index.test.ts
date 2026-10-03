/**
 * The `input` focus ring: the tenant's focus signature at rest, an authored
 * `chrome.controls.input.shadowFocus` above it, and the halo channel the frozen
 * engines read left with its own producer.
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
import { firstPartyFixture, lowerFlatThemeFixture } from "@tests/support/theme-lowering";
import { compileThemeIntent, emitThemeCss, firstPartyScope, staticThemeIntent } from "@/entrypoints/server";
import { projectFirstPartyArtifactScopes } from "@/infrastructure/compilers/kernel/foundation/css/scope-projection";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { deriveStateChannels } from "../../../states";
import { inputChromeDeriver } from "..";

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

describeFamilyContract(inputChromeDeriver, FIXTURES);

const RING = "--ds-input-focus-ring";
const HALO = "--ds-input-shadow-focus";
const AUTHORED = "0 0 0 5px rgba(255, 0, 170, 0.4)";
const STATUSES = ["error", "warning", "success"] as const;

const CSS_ROOT = resolve(process.cwd(), "src/foundation/tokens/css");

const readSkin = (path: string) =>
  readFileSync(resolve(CSS_ROOT, path), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** Every skin that paints a focused shell from the input family's own ring. */
const SKINS: Readonly<Record<string, string>> = {
  input: readSkin("runtime/engines/modern/skin/input/index.css"),
  "password-input": readSkin("runtime/engines/modern/skin/password-input/index.css"),
  "input-compounds": readSkin("presentation/components/skin/input-compounds/index.css"),
};

const normalise = (value: string) =>
  value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();

/** Every distinct fallback `skin` states for `channel`. */
function skinFallbacks(skin: string, channel: string): string[] {
  const found = new Set<string>();
  for (const match of skin.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*,/g)) {
    if (match[1] !== channel) continue;
    const start = (match.index ?? 0) + match[0].length;
    let end = start;
    for (let depth = 1; depth > 0 && end < skin.length; end += 1) {
      if (skin[end] === "(") depth += 1;
      else if (skin[end] === ")") depth -= 1;
    }
    expect(end, `unbalanced var() for ${channel}`).toBeLessThan(skin.length);
    found.add(normalise(skin.slice(start, end - 1)));
  }
  return [...found];
}

const withAuthoredHalo = (theme: FlatTheme): FlatTheme => ({
  ...theme,
  chrome: {
    ...theme.chrome,
    controls: {
      ...theme.chrome?.controls,
      input: { ...theme.chrome?.controls?.input, shadowFocus: AUTHORED },
    },
  },
});

describe("chrome/input focus ring", () => {
  it("declares the focus decision and every authored leaf it reads", () => {
    expect(inputChromeDeriver.consumes).toEqual(
      expect.arrayContaining([
        "states.focus",
        "chrome.controls.input.shadowFocus",
        "chrome.controls.input.errorShadowFocus",
        "chrome.controls.input.warningShadowFocus",
        "chrome.controls.input.successShadowFocus",
      ])
    );
  });

  it("rests the ring on the tenant's focus signature, never on a recipe of its own", () => {
    for (const fixture of FIXTURES) {
      const derived = inputChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(derived[RING], fixture.label).toBe("var(--ds-focus-ring)");
    }
    for (const [family, skin] of Object.entries(SKINS)) {
      expect(skinFallbacks(skin, RING), family).toEqual(["var(--ds-focus-ring)"]);
      // The halo, its status variants and the foundation literal are one fixed
      // shape under every signature.
      expect(skin, family).not.toMatch(/--ds-input-(?:[a-z]+-)?shadow-focus\b/);
      expect(skin, family).toContain("box-shadow: var(--ds-input-focus-ring-error, var(--ds-focus-ring));");
      expect(skin, family).not.toContain("--ds-shadow-focus-ring");
    }
  });

  it("resolves to the ring, underline and glow signatures exactly as the states family emits them", () => {
    const emitted = new Set<string>();
    for (const focusStyle of ["ring", "underline", "glow"] as const) {
      const base = firstPartyFixture("bithire");
      const theme: FlatTheme = { ...base, surfaces: { ...base.surfaces, focusStyle } };
      const result = runDerivation(buildLoweringContext({ theme }));
      expect(result.channels[RING], focusStyle).toBe("var(--ds-focus-ring)");
      expect(result.channels["--ds-focus-ring"], focusStyle).toBe(
        deriveStateChannels(theme)["--ds-focus-ring"]
      );
      emitted.add(result.channels["--ds-focus-ring"]!);
    }
    expect(emitted.size).toBe(3);
  });

  it("is restated beside the signature in the scope a nested root matches", () => {
    for (const vertical of ["rottay", "bithire", "evnto"] as const) {
      const css = projectFirstPartyArtifactScopes(
        emitThemeCss(
          compileThemeIntent(staticThemeIntent(vertical)).compiled,
          firstPartyScope(vertical)
        ),
        vertical,
        vertical
      );
      const block = css
        .split("}")
        .find((rule) => rule.includes(`${RING}: var(--ds-focus-ring);`));
      expect(block, vertical).toBeDefined();
      const selector = block!.slice(0, block!.indexOf("{"));
      expect(selector, vertical).toContain("[data-ds-root]");
      expect(selector, vertical).toMatch(new RegExp(`\\[data-vertical=['"]${vertical}['"]\\]`));
      // A var() resolves on the declaring element: both names must sit in one block.
      expect(block, vertical).toMatch(/--ds-focus-ring:\s/);
    }
  });

  it("leaves the halo channel the frozen engines read with its own producer", () => {
    expect(inputChromeDeriver.produces).not.toContain(HALO);
    for (const vertical of ["rottay", "bithire", "evnto"] as const) {
      const result = runDerivation(buildLoweringContext({ theme: firstPartyFixture(vertical) }));
      expect(result.provenance.get(HALO)?.family, vertical).not.toBe("input");
      expect(result.channels[HALO] ?? "", vertical).not.toContain("--ds-focus-ring");
      expect(result.channels[RING], vertical).toBe("var(--ds-focus-ring)");
      expect(result.provenance.get(RING), vertical).toEqual({ family: "input", rank: "derived" });
    }
    const bithire = runDerivation(buildLoweringContext({ theme: firstPartyFixture("bithire") }));
    expect(bithire.provenance.get(HALO)).toEqual({ family: "palette", rank: "derived" });
    expect(bithire.channels[HALO]).toMatch(/^0 0 0 3px /);
  });

  it("references the halo channel only when a theme states it", () => {
    for (const vertical of ["rottay", "bithire", "evnto"] as const) {
      const result = runDerivation(
        buildLoweringContext({ theme: withAuthoredHalo(firstPartyFixture(vertical)) })
      );
      expect(result.channels[HALO], vertical).toBe(AUTHORED);
      expect(result.provenance.get(HALO)?.rank, vertical).toBe("verticalOverride");
      expect(result.channels[RING], vertical).toBe(`var(${HALO})`);
    }
  });

  it("rests each status ring on the field ring until a theme authors that status", () => {
    for (const fixture of FIXTURES) {
      const derived = inputChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      for (const status of STATUSES) {
        expect(derived[`${RING}-${status}`], `${fixture.label} ${status}`).toBe(`var(${RING})`);
      }
    }
  });

  it("references a status halo only when a theme states it, at vertical rank", () => {
    for (const status of STATUSES) {
      const base = firstPartyFixture("bithire");
      const theme: FlatTheme = {
        ...base,
        chrome: {
          ...base.chrome,
          controls: {
            ...base.chrome?.controls,
            input: { ...base.chrome?.controls?.input, [`${status}ShadowFocus`]: AUTHORED },
          },
        },
      };
      const result = runDerivation(buildLoweringContext({ theme }));
      const halo = `--ds-input-${status}-shadow-focus`;
      expect(result.channels[halo], status).toBe(AUTHORED);
      expect(result.provenance.get(halo)?.rank, status).toBe("verticalOverride");
      expect(result.channels[`${RING}-${status}`], status).toBe(`var(${halo})`);
      for (const other of STATUSES.filter((name) => name !== status)) {
        expect(result.channels[`${RING}-${other}`], `${status} leaves ${other}`).toBe(`var(${RING})`);
      }
      expect(result.channels[RING], status).toBe("var(--ds-focus-ring)");
    }
  });

  it("lets a tenant's authored status ring paint through the compile door", () => {
    for (const status of STATUSES) {
      const compiled = lowerFlatThemeFixture({
        flatTheme: firstPartyFixture("bithire"),
        tenantPatch: { chrome: { controls: { input: { [`${status}ShadowFocus`]: AUTHORED } } } },
        tenantAuthoredPaths: new Set([`chrome.controls.input.${status}ShadowFocus`]),
      });
      const halo = `--ds-input-${status}-shadow-focus`;
      expect(compiled.cssVariables[halo], status).toBe(AUTHORED);
      expect(compiled.cssVariables[`${RING}-${status}`], status).toBe(`var(${halo})`);
    }
  });

  it("lets a tenant's authored focus shadow outrank the signature through the compile door", () => {
    const compiled = lowerFlatThemeFixture({
      flatTheme: firstPartyFixture("bithire"),
      tenantPatch: { chrome: { controls: { input: { shadowFocus: AUTHORED } } } },
      tenantAuthoredPaths: new Set(["chrome.controls.input.shadowFocus"]),
    });
    expect(compiled.cssVariables[HALO]).toBe(AUTHORED);
    expect(compiled.cssVariables[RING]).toBe(`var(${HALO})`);
    expect(compiled.cssString).toContain(`${RING}: var(${HALO});`);
  });

  it("keeps a tenant that only re-seeds its primary on the signature", () => {
    const flatTheme = firstPartyFixture("bithire");
    const compiled = lowerFlatThemeFixture({
      flatTheme,
      tenantPatch: { palette: { ...flatTheme.palette!, primaryColor: "#b4006e" } },
      tenantAuthoredPaths: new Set(["palette.primaryColor"]),
    });
    expect(compiled.cssVariables[RING]).toBe("var(--ds-focus-ring)");
    expect(compiled.cssVariables[HALO]).toMatch(/^0 0 0 3px /);
  });

  it("lets a tenant statement of the ring outrank the signature reference", () => {
    const tenant: FamilyDeriver = {
      family: "stated-tenant-ring",
      rank: "tenant",
      consumes: ["chrome.*"],
      produces: [RING],
      derive: () => ({ [RING]: "0 0 0 3px currentColor" }),
    };
    const result = runDerivation(buildLoweringContext({ theme: firstPartyFixture("bithire") }), [
      inputChromeDeriver,
      tenant,
    ]);
    expect(result.channels[RING]).toBe("0 0 0 3px currentColor");
    expect(result.provenance.get(RING)?.rank).toBe("tenant");
  });
});
