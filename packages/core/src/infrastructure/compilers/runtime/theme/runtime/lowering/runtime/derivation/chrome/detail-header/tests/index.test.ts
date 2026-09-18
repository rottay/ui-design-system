/**
 * The `detail-header` vocabulary at rest: every channel equals the one fallback its
 * Modern skin reads it with, so producing the name cannot move a pixel, and any
 * higher-ranked statement still wins.
 *
 * ADAPTED CONTRACT (WO-FAM-10 sub-lot D2): this deriver is NOT registered in
 * `FAMILY_DERIVERS` yet — the DT adds the registration line at integration, one
 * commit per sub-lot. The reference suites assert registration here; this one
 * deliberately does not, and asserts the identity, the produced set, the
 * namespace and the precedence behaviour directly instead.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { detailHeaderChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/detail-header/index.css"),
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

describe("chrome/detail-header", () => {
  it("is the detail-header family at rank derived", () => {
    expect(detailHeaderChromeDeriver.family).toBe("detail-header");
    expect(detailHeaderChromeDeriver.rank).toBe("derived");
  });

  it("states every declared channel at the single resting value the skin reads it with", () => {
    const derived = detailHeaderChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...detailHeaderChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of detailHeaderChromeDeriver.produces) {
      expect(channel.startsWith("--ds-detail-header-")).toBe(true);
    }
  });

  it("leaves the touch floor unproduced, because it is the root lane's governed 44px", () => {
    // `--ds-size-touch-target` is the accessibility floor (fixed 44px, no
    // density/profile dial), owned by the token/root lane and read by many
    // families. A family deriver producing it would be a second owner of a
    // shared root, so the skin keeps reading it with its literal fallback and
    // the name stays routed (WO-FAM-10 census §4, roots group).
    expect([...detailHeaderChromeDeriver.produces]).not.toContain("--ds-size-touch-target");
    expect(skinFallbacks("--ds-size-touch-target")).toEqual(["44px"]);
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(detailHeaderChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: detailHeaderChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [detailHeaderChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
