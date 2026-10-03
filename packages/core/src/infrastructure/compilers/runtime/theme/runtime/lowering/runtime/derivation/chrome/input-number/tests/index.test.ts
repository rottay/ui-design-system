/**
 * The `input-number` focus ring: the input family's ring, hence the tenant's focus
 * signature at rest and an authored input focus shadow when a theme states one.
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
import { firstPartyFixture } from "@tests/support/theme-lowering";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { inputNumberChromeDeriver } from "..";

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

describeFamilyContract(inputNumberChromeDeriver, FIXTURES);

const RING = "--ds-input-number-shadow-focus";
const INPUT_RING = "--ds-input-focus-ring";
const AUTHORED = "0 0 0 5px rgba(255, 0, 170, 0.4)";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/input-number/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

describe("chrome/input-number focus ring", () => {
  it("rests the ring on the input family's ring, never on the halo the frozen engines read", () => {
    for (const fixture of FIXTURES) {
      const derived = inputNumberChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(derived[RING], fixture.label).toBe(`var(${INPUT_RING}, var(--ds-focus-ring))`);
    }
    expect(SKIN).toContain(`var(${RING}, var(--ds-focus-ring))`);
  });

  it("rests every status ring on the input family's gated status ring, and the skin reads it", () => {
    for (const fixture of FIXTURES) {
      const derived = inputNumberChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(derived["--ds-input-number-error-shadow-focus"], fixture.label).toBe("var(--ds-input-focus-ring-error, var(--ds-focus-ring))");
      expect(SKIN).toContain("box-shadow: var(--ds-input-number-error-shadow-focus, var(--ds-focus-ring));");
      expect(derived["--ds-input-number-warning-shadow-focus"], fixture.label).toBe("var(--ds-input-focus-ring-warning, var(--ds-focus-ring))");
      expect(SKIN).toContain("box-shadow: var(--ds-input-number-warning-shadow-focus, var(--ds-focus-ring));");
    }
  });

  it("resolves to the signature at rest and to an authored input focus shadow when one is stated", () => {
    const theme = firstPartyFixture("bithire");
    const rest = runDerivation(buildLoweringContext({ theme }));
    expect(rest.channels[INPUT_RING]).toBe("var(--ds-focus-ring)");
    expect(rest.channels[RING]).toBe(`var(${INPUT_RING}, var(--ds-focus-ring))`);
    const authored = runDerivation(
      buildLoweringContext({
        theme: {
          ...theme,
          chrome: {
            ...theme.chrome,
            controls: {
              ...theme.chrome?.controls,
              input: { ...theme.chrome?.controls?.input, shadowFocus: AUTHORED },
            },
          },
        },
      })
    );
    expect(authored.channels[INPUT_RING]).toBe("var(--ds-input-shadow-focus)");
    expect(authored.channels["--ds-input-shadow-focus"]).toBe(AUTHORED);
    expect(authored.channels[RING]).toBe(`var(${INPUT_RING}, var(--ds-focus-ring))`);
  });

  it("lets the family's own authored focus shadow outrank the input ring", () => {
    const theme = firstPartyFixture("bithire");
    const result = runDerivation(
      buildLoweringContext({
        theme: {
          ...theme,
          chrome: {
            ...theme.chrome,
            controls: {
              ...theme.chrome?.controls,
              inputNumber: { ...theme.chrome?.controls?.inputNumber, shadowFocus: AUTHORED },
            },
          },
        },
      })
    );
    expect(result.channels[RING]).toBe(AUTHORED);
    expect(result.provenance.get(RING)?.rank).toBe("verticalOverride");
  });
});
