/**
 * The toolbar vocabulary at rest: every channel equals the one fallback the Modern
 * list-toolbar skin reads it with, and any higher-ranked statement still wins.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { FAMILY_DERIVERS } from "../../..";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { toolbarChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css"),
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

/**
 * The skin's component-scoped radius ladder (`--ds-list-toolbar-radius-*`).
 *
 * The aliases are declared on the toolbar root, so they do not exist at the
 * theme root this deriver writes to. A resting value that named one would
 * resolve against an undefined name and drop to the literal after the comma --
 * a silent pixel move. The expansion below is what the ladder resolves to on
 * the element, and it is read from the skin so the two cannot drift.
 */
function skinLadder(): Map<string, string> {
  const ladder = new Map<string, string>();
  for (const match of SKIN.matchAll(/(--ds-list-toolbar-radius-[a-z-]+)\s*:/g)) {
    const start = (match.index ?? 0) + match[0].length;
    let end = start;
    for (let depth = 0; ; end += 1) {
      if (SKIN[end] === "(") depth += 1;
      else if (SKIN[end] === ")") depth -= 1;
      else if (SKIN[end] === ";" && depth === 0) break;
    }
    ladder.set(match[1], normalise(SKIN.slice(start, end)));
  }
  return ladder;
}

const LADDER = skinLadder();

/** `value` with every ladder alias replaced by what it resolves to, recursively. */
function atThemeRoot(value: string): string {
  let out = value;
  for (let pass = 0; pass < LADDER.size + 1; pass += 1) {
    const next = out.replace(
      /var\(\s*(--ds-list-toolbar-radius-[a-z-]+)\s*(?:,[^()]*(?:\([^()]*\)[^()]*)*)?\)/g,
      (whole, alias: string) => LADDER.get(alias) ?? whole
    );
    if (next === out) return normalise(out);
    out = next;
  }
  throw new Error(`the ladder did not settle for ${value}`);
}

/**
 * The one channel the skin reads with two different fallbacks, pinned per site.
 *
 * `--ds-toolbar-control-gap` rests at 0.25rem, the value the filter rail, the
 * rail track and the compact actions group read it with. Its fourth site is the
 * head of the `--ds-toolbar-controls-gap` chain, which the skin states at
 * 0.5rem -- so the controls cluster rests on its own channel at the value that
 * chain resolved to while neither name had a producer. All four sites keep the
 * pixels they had.
 */
const SPLIT_SITE_GAPS: Readonly<Record<string, string>> = {
  "--ds-toolbar-control-gap": "var(--ds-spacing-1, 0.25rem)",
  "--ds-toolbar-controls-gap": "var(--ds-spacing-2, 0.5rem)",
};

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/toolbar", () => {
  it("is registered once, at rank derived", () => {
    expect(FAMILY_DERIVERS.filter((deriver) => deriver === toolbarChromeDeriver)).toHaveLength(1);
    expect(toolbarChromeDeriver.family).toBe("toolbar");
    expect(toolbarChromeDeriver.rank).toBe("derived");
  });

  it("states every declared channel at the single resting value the skin reads it with", () => {
    const derived = toolbarChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...toolbarChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      if (channel in SPLIT_SITE_GAPS) continue;
      const resting = skinFallbacks(channel).map(atThemeRoot);
      expect({ channel, resting }).toEqual({ channel, resting: [value] });
    }
  });

  it("keeps the four gap sites the skin states twice at the pixels each one had", () => {
    const derived = toolbarChromeDeriver.derive(context(), {});
    // The skin really does read the control gap with two different fallbacks.
    expect(skinFallbacks("--ds-toolbar-control-gap").sort()).toEqual([
      "var(--ds-spacing-1, 0.25rem)",
      "var(--ds-spacing-2, 0.5rem)",
    ]);
    // ...and the 0.5rem one is the tail of the controls chain, not a site of
    // its own, so the controls cluster is what carries that value now.
    expect(skinFallbacks("--ds-toolbar-controls-gap")).toEqual([
      "var(--ds-toolbar-control-gap, var(--ds-spacing-2, 0.5rem))",
    ]);
    for (const [channel, resting] of Object.entries(SPLIT_SITE_GAPS)) {
      expect({ channel, value: derived[channel] }).toEqual({ channel, value: resting });
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(toolbarChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: toolbarChromeDeriver.produces,
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
