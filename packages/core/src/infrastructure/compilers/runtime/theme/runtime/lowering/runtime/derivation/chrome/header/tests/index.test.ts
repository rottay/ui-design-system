/**
 * The header contract's channels at rest: every channel equals the one fallback the
 * two header skins read it with, and any higher-ranked statement still wins.
 *
 * The fallback set is taken across BOTH files on purpose. `--ds-header-tone-*` is
 * read by the icon badge in `header-hero-shared` and by the status pill in
 * `edit-header`; if those two ever stated different fallbacks for one tone, the two
 * slots would diverge outside a compiled bundle and nothing else would say so.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { FAMILY_DERIVERS } from "../../..";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { headerChromeDeriver } from "..";

const SKIN_ROOT = "src/foundation/tokens/css/presentation/components/skin";

const SKINS = ["header-hero-shared", "edit-header"].map((name) =>
  readFileSync(resolve(process.cwd(), SKIN_ROOT, name, "index.css"), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    ""
  )
);

const normalise = (value: string) =>
  value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();

/** Every distinct fallback the header skins state for `channel`. */
function skinFallbacks(channel: string): string[] {
  const found = new Set<string>();
  for (const skin of SKINS) {
    for (const match of skin.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*,/g)) {
      if (match[1] !== channel) continue;
      const start = (match.index ?? 0) + match[0].length;
      let end = start;
      for (let depth = 1; depth > 0; end += 1) {
        if (skin[end] === "(") depth += 1;
        else if (skin[end] === ")") depth -= 1;
      }
      found.add(normalise(skin.slice(start, end - 1)));
    }
  }
  return [...found];
}

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/header", () => {
  it("is registered once, at rank derived", () => {
    expect(FAMILY_DERIVERS.filter((deriver) => deriver === headerChromeDeriver)).toHaveLength(1);
    expect(headerChromeDeriver.family).toBe("header");
    expect(headerChromeDeriver.rank).toBe("derived");
  });

  it("states every declared channel at the single resting value the skins read it with", () => {
    const derived = headerChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...headerChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("covers the whole tone domain once, three facets each, plus the back ring", () => {
    const derived = headerChromeDeriver.derive(context(), {});
    const tones = new Set(
      Object.keys(derived)
        .filter((channel) => channel.startsWith("--ds-header-tone-"))
        .map((channel) => channel.slice("--ds-header-tone-".length).replace(/-(bg|bd|fg)$/, ""))
    );
    expect([...tones].sort()).toEqual([
      "error",
      "info",
      "primary",
      "secondary",
      "success",
      "warning",
    ]);
    for (const tone of tones) {
      for (const facet of ["bg", "bd", "fg"]) {
        expect(derived[`--ds-header-tone-${tone}-${facet}`]).toBeTypeOf("string");
      }
    }
    expect(Object.keys(derived)).toHaveLength(tones.size * 3 + 1);
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(headerChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: headerChromeDeriver.produces,
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
