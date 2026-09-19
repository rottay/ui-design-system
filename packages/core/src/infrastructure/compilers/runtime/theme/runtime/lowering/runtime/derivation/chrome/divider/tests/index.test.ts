/**
 * The divider vocabulary at rest: every channel equals the one fallback the
 * Modern skin reads it with (or is itself the resting declaration where the
 * skin reads it bare), and any higher-ranked statement still wins.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { FAMILY_DERIVERS } from "../../..";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { dividerChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css"),
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

// A theme that states no canvas of its own: the label ink keeps its chain
// form here instead of the checked-ink a ground would derive, so the static
// equality below reads the same arm the skin names.
const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };

const context = () => buildLoweringContext({ theme: MINIMAL_THEME });

describe("chrome/divider", () => {
  it("is registered once, at rank derived", () => {
    expect(FAMILY_DERIVERS.filter((deriver) => deriver === dividerChromeDeriver)).toHaveLength(1);
    expect(dividerChromeDeriver.family).toBe("divider");
    expect(dividerChromeDeriver.rank).toBe("derived");
  });

  it("states every declared channel at the single resting value the skin reads it with", () => {
    const derived = dividerChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...dividerChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      const fallbacks = skinFallbacks(channel);
      expect({ channel, fallbacks }).toEqual({
        channel,
        // Bare reads carry no opinion: the produced declaration IS the rest.
        fallbacks: fallbacks.length === 0 ? [] : [value],
      });
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(dividerChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: dividerChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [...FAMILY_DERIVERS, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
