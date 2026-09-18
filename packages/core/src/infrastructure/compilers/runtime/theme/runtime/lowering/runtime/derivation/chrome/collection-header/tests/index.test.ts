/**
 * The `collection-header` vocabulary at rest: every channel equals the one fallback its Modern
 * skin reads it with, so producing the name cannot move a pixel, and any
 * higher-ranked statement still wins.
 *
 * ADAPTED CONTRACT (WO-FAM-10 sub-lot D2): the reference suites assert registration
 * in `FAMILY_DERIVERS`; this deriver is deliberately NOT registered — the DT adds
 * the line at integration, and until then the productive compile does not emit these
 * channels. Membership is therefore asserted nowhere here; identity, rank, the
 * produces/derive parity, the single-fallback contract, the one-namespace rule and
 * the precedence yield are all asserted directly against the deriver itself.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { collectionHeaderChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/collection-header/index.css"),
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

describe("chrome/collection-header", () => {
  it("is the collection-header family at rank derived", () => {
    expect(collectionHeaderChromeDeriver.family).toBe("collection-header");
    expect(collectionHeaderChromeDeriver.rank).toBe("derived");
  });

  it("states every declared channel at the single resting value the skin reads it with", () => {
    const derived = collectionHeaderChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...collectionHeaderChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of collectionHeaderChromeDeriver.produces) {
      expect(channel.startsWith("--ds-collection-header-")).toBe(true);
    }
  });

  it("produces nothing the runtime-computed channels own", () => {
    // The coarse-pointer quick-action floor is per-instance, decided by the
    // responsive runtime, and retired onto the composed Button's own
    // coarse-pointer rule — it is not a tenant dial and not a derived channel.
    expect([...collectionHeaderChromeDeriver.produces]).not.toContain(
      "--ds-collection-header-action-floor"
    );
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(collectionHeaderChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: collectionHeaderChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [collectionHeaderChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
