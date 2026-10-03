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
import { firstPartyFixture, lowerFlatThemeFixture } from "@tests/support/theme-lowering";
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
      const compiled = lowerFlatThemeFixture({
        flatTheme: firstPartyFixture("bithire"),
        tenantPatch: { chrome: { controls: { input: { [`${status}ShadowFocus`]: AUTHORED } } } },
        tenantAuthoredPaths: new Set([`chrome.controls.input.${status}ShadowFocus`]),
      });
      const gated = `--ds-input-focus-ring-${status}`;
      expect(compiled.cssVariables[statusRing(status)], status).toBe(`var(${gated}, var(--ds-focus-ring))`);
      expect(compiled.cssVariables[gated], status).toBe(`var(--ds-input-${status}-shadow-focus)`);
      expect(compiled.cssVariables[`--ds-input-${status}-shadow-focus`], status).toBe(AUTHORED);
    }
  });
});
