/**
 * The `tag-input` focus ring: the tenant's focus signature at rest, with a
 * tenant statement of the family channel above it.
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
import { tagInputChromeDeriver } from "..";

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

describeFamilyContract(tagInputChromeDeriver, FIXTURES);

const RING = "--ds-tag-input-shadow-focus";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/tag-input/index.css"),
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
    for (let depth = 1; depth > 0 && end < SKIN.length; end += 1) {
      if (SKIN[end] === "(") depth += 1;
      else if (SKIN[end] === ")") depth -= 1;
    }
    expect(end, `unbalanced var() for ${channel}`).toBeLessThan(SKIN.length);
    found.add(normalise(SKIN.slice(start, end - 1)));
  }
  return [...found];
}

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/tag-input focus ring", () => {
  it("rests the ring on the tenant's focus signature, never on the foundation literal", () => {
    for (const fixture of FIXTURES) {
      const derived = tagInputChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(derived[RING], fixture.label).toBe("var(--ds-focus-ring)");
    }
    expect(skinFallbacks(RING)).toEqual(["var(--ds-focus-ring)"]);
    // The foundation literal is one fixed wash under every signature.
    expect(SKIN).not.toContain("--ds-shadow-focus-ring");
  });

  it("keeps the validation frame under the ring instead of a second halo", () => {
    expect(SKIN).toMatch(/:focus-within:not\(\[data-error='true'\]\)\s*\{\s*border-color:/);
    expect(SKIN).toMatch(/\[data-rejected\]:not\(:focus-within\)\s*\{\s*box-shadow:/);
  });

  it("lets a tenant statement of the ring outrank the signature reference", () => {
    const tenant: FamilyDeriver = {
      family: "stated-tenant-ring",
      rank: "tenant",
      consumes: ["chrome.*"],
      produces: [RING],
      derive: () => ({ [RING]: "0 0 0 3px currentColor" }),
    };
    const result = runDerivation(context(), [tagInputChromeDeriver, tenant]);
    expect(result.channels[RING]).toBe("0 0 0 3px currentColor");
    expect(result.provenance.get(RING)?.rank).toBe("tenant");
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(tagInputChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: channels as FamilyDeriver["produces"],
        derive: () => Object.fromEntries(channels.map((channel) => [channel, "stated"])),
      };
      const result = runDerivation(context(), [tagInputChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel], `${rank} ${channel}`).toBe("stated");
      }
    }
  });
});
