/**
 * The `form-surface` vocabulary at rest: every channel equals the one fallback its Modern
 * skin reads it with, so producing the name cannot move a pixel, and any
 * higher-ranked statement still wins.
 *
 * ADAPTED CONTRACT (WO-FAM-10 sub-lot F): the reference suites assert registration
 * in `FAMILY_DERIVERS`; this deriver is deliberately NOT registered — the DT adds
 * the line at integration, and until then the productive compile does not emit these
 * channels. Membership is therefore asserted nowhere here; identity, rank, the
 * produces/derive parity, the single-fallback contract, the namespace rule and
 * the precedence yield are all asserted directly against the deriver itself.
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
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { formSurfaceChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/form-surface/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

const normalise = (value: string) =>
  value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();

/** Every distinct fallback the skin states for `channel`. */
function skinFallbacks(channel: string): string[] {
  const found = new Set<string>();
  for (const match of SKIN.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*,/g)) {
    if (match[1] !== channel) continue;
    const start = (match.index ?? 0) + match[0].length;
    let end = start;
    for (let depth = 1; depth > 0; end += 1) {
      if (SKIN[end] === "(") depth += 1;
      else if (SKIN[end] === ")") depth -= 1;
    }
    found.add(normalise(SKIN.slice(start, end - 1)));
  }
  return [...found];
}

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
  {
    label: "minimal under a tenant floor",
    theme: MINIMAL_THEME,
    tenant: FIXTURE_TENANT_FACTS,
  },
];

describeFamilyContract(formSurfaceChromeDeriver, FIXTURES);

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

/** The one pre-existing channel that predates the `--ds-form-surface-*` naming. */
const LEGACY_CHANNEL = "--ds-form-action-dock-reserved-space";

describe("chrome/form-surface", () => {
  it("is the form-surface family at rank derived", () => {
    expect(formSurfaceChromeDeriver.family).toBe("form-surface");
    expect(formSurfaceChromeDeriver.rank).toBe("derived");
  });

  it("states every declared channel at the single resting value the skin reads it with", () => {
    const derived = formSurfaceChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...formSurfaceChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("names only its own family namespace, keeping the one pre-existing dock channel", () => {
    for (const channel of formSurfaceChromeDeriver.produces) {
      expect(channel.startsWith("--ds-form-surface-") || channel === LEGACY_CHANNEL).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(formSurfaceChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: formSurfaceChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [formSurfaceChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
