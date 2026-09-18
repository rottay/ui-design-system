/**
 * The `form-sections` vocabulary at rest: every channel equals the one fallback
 * its Modern skin reads it with, so producing the name cannot move a pixel,
 * and any higher-ranked statement still wins. The per-tone names the skin
 * DECLARES (rather than reads) stay this deriver's non-producers: a second
 * authority there would flatten the tone contract.
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
import { formSectionsChromeDeriver } from "..";

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

describeFamilyContract(formSectionsChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/form-sections/index.css"),
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

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/form-sections", () => {
  it("states every declared channel at the single resting value the skin reads it with", () => {
    const derived = formSectionsChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...formSectionsChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("does not produce the names the skin declares per tone arm", () => {
    const derived = formSectionsChromeDeriver.derive(context(), {});
    for (const name of [
      "--ds-form-sections-surface",
      "--ds-form-sections-muted-surface",
      "--ds-form-sections-border",
      "--ds-form-sections-active-border",
      "--ds-form-sections-divider",
      "--ds-form-sections-badge-bg",
      "--ds-form-sections-badge-border",
      "--ds-form-sections-accent",
      "--ds-form-sections-accent-secondary",
      "--ds-form-sections-grid-color",
      "--ds-form-sections-grid-size",
    ]) {
      expect(derived[name], name).toBeUndefined();
    }
  });

  it("does not produce the material lane's routed channel", () => {
    const derived = formSectionsChromeDeriver.derive(context(), {});
    expect(derived["--ds-material-raised-shadow-selected"]).toBeUndefined();
  });

  it("names only its own family namespace", () => {
    for (const channel of formSectionsChromeDeriver.produces) {
      expect(channel.startsWith("--ds-form-sections-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(formSectionsChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: formSectionsChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [formSectionsChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
