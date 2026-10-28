/**
 * The toolbar vocabulary: resting skin values, semantic title weight, and
 * precedence for higher-ranked statements.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { deriveTypeRoleChannels } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/roles";
import { deriveTypeWeightChannels, roleWeightOverlay } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/weights";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { FAMILY_DERIVERS } from "../../..";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { deriveToolbarChannels, toolbarChromeDeriver } from "..";

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

const RAIL_FOCUS_CLEARANCE =
  "max(0.25rem, calc(var(--ds-focus-ring-offset) + max(2px, var(--ds-focus-ring-width))))";

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/toolbar", () => {
  it("is registered once, at rank derived", () => {
    expect(FAMILY_DERIVERS.filter((deriver) => deriver === toolbarChromeDeriver)).toHaveLength(1);
    expect(toolbarChromeDeriver.family).toBe("toolbar");
    expect(toolbarChromeDeriver.rank).toBe("derived");
  });

  it("states every declared channel at its skin rest or the semantic title weight", () => {
    const derived = toolbarChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...toolbarChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      if (channel in SPLIT_SITE_GAPS) continue;
      if (channel === "--ds-toolbar-title-font-weight") {
        expect(value).toBe("var(--ds-type-section-title-font-weight, var(--ds-font-weight-semibold, 600))");
        expect(skinFallbacks(channel)).toEqual(["var(--ds-font-weight-semibold, 600)"]);
        continue;
      }
      const resting = skinFallbacks(channel).map(atThemeRoot);
      expect({ channel, resting }).toEqual({ channel, resting: [value] });
    }
  });

  it("ends every focus channel in the tenant signature, never in a literal ring", () => {
    const derived = toolbarChromeDeriver.derive(context(), {});
    const rings = Object.keys(derived).filter((channel) => channel.endsWith("-focus-ring"));
    expect(rings).toEqual(["--ds-toolbar-control-focus-ring"]);
    expect(derived["--ds-toolbar-control-focus-ring"]).toBe(
      "var(--ds-material-control-focus-ring, var(--ds-focus-ring))"
    );
    // The shell ring retired with its only reader: no producer and no read.
    expect(toolbarChromeDeriver.produces).not.toContain("--ds-toolbar-focus-ring");
    expect(SKIN).not.toContain("--ds-toolbar-focus-ring");
    expect(skinFallbacks("--ds-toolbar-control-focus-ring")).toEqual([
      "var(--ds-material-control-focus-ring, var(--ds-focus-ring))",
    ]);
    expect(skinFallbacks("--ds-filter-pill-focus-ring")).toEqual(["var(--ds-focus-ring)"]);
  });

  it("derives the rail clearance from the signature geometry, floored at the forced-colors outline and the resting gutter", () => {
    const derived = toolbarChromeDeriver.derive(context(), {});
    expect(derived["--ds-toolbar-rail-focus-clearance"]).toBe(RAIL_FOCUS_CLEARANCE);
    expect(derived["--ds-toolbar-mobile-rail-padding"]).toBe(
      `var(--ds-toolbar-rail-focus-clearance, ${RAIL_FOCUS_CLEARANCE})`
    );
    expect(skinFallbacks("--ds-toolbar-rail-focus-clearance")).toEqual([RAIL_FOCUS_CLEARANCE]);
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

function weights(theme: FlatTheme): Map<string, string> {
  return new Map(Object.entries({
    ...deriveTypeWeightChannels(theme),
    ...deriveTypeRoleChannels(theme, undefined, {
      numeric: {},
      weights: roleWeightOverlay(theme),
    }),
  }));
}

function resolveWeight(value: string | undefined, channels: Map<string, string>): string {
  if (value === undefined) throw new Error("Missing weight channel");
  const reference = /^var\((--ds-[a-z0-9-]+)(?:,\s*(.*))?\)$/.exec(value);
  if (reference === null) return value;
  const [, channel, fallback] = reference;
  if (channel === undefined) throw new Error("Missing reference name");
  return resolveWeight(channels.get(channel) ?? fallback, channels);
}

const titleWeight = new Map(Object.entries(deriveToolbarChannels())).get("--ds-toolbar-title-font-weight");
const postures = [
  { roleWeights: "light", expected: "500" },
  { roleWeights: "regular", expected: "600" },
  { roleWeights: "strong", expected: "700" },
] as const;

describe("chrome/toolbar title weight", () => {
  it.each(postures)("follows the real $roleWeights posture while preserving body and supporting weights", ({ roleWeights, expected }) => {
    const channels = weights({ id: "posture", name: "Posture", typography: { roleWeights } });
    expect(resolveWeight(titleWeight, channels)).toBe(expected);
    expect(channels.get("--ds-type-body-font-weight")).toBe("400");
    expect(channels.get("--ds-type-supporting-font-weight")).toBe("400");
  });

  it("follows a section-title-only 700 to 300 change while label remains independent", () => {
    const theme = (fontWeight: number): FlatTheme => ({
      id: "section-only", name: "Section only",
      typography: { roles: { sectionTitle: { fontWeight }, label: { fontWeight: 800 } } },
    });
    const before = weights(theme(700));
    const after = weights(theme(300));
    expect(resolveWeight(titleWeight, before)).toBe("700");
    expect(resolveWeight(titleWeight, after)).toBe("300");
    expect(before.get("--ds-type-label-font-weight")).toBe("800");
    expect(after.get("--ds-type-label-font-weight")).toBe("800");
  });

  it("lets the explicit section title outrank the posture and ignores the semibold constant", () => {
    const channels = weights({
      id: "specific", name: "Specific",
      typography: { roleWeights: "strong", roles: { sectionTitle: { fontWeight: 300 }, label: { fontWeight: 800 } } },
    });
    channels.set("--ds-font-weight-semibold", "900");
    expect(resolveWeight(titleWeight, channels)).toBe("300");
  });

  it("retains semibold then 600 when the role channel is absent", () => {
    expect(resolveWeight(titleWeight, new Map([["--ds-font-weight-semibold", "650"]]))).toBe("650");
    expect(resolveWeight(titleWeight, new Map())).toBe("600");
  });

  it("preserves title family, size, tracking, density geometry, search and material declarations", () => {
    const channels = new Map(Object.entries(deriveToolbarChannels()));
    expect(channels.get("--ds-toolbar-title-font-family")).toBe("var(--ds-type-section-title-font-family, var(--ds-font-family-heading))");
    expect(channels.get("--ds-toolbar-title-font-size")).toBe("var(--ds-font-size-md)");
    expect(channels.get("--ds-toolbar-title-letter-spacing")).toBe("var(--ds-type-section-title-letter-spacing, -0.015em)");
    expect(channels.get("--ds-toolbar-title-gap")).toBe("var(--ds-spacing-2, 0.5rem)");
    expect(channels.get("--ds-toolbar-search-font-size")).toBe("var(--ds-button-sm-font-size, 0.8125rem)");
    expect(channels.get("--ds-toolbar-controls-bg")).toBe("transparent");
    expect(channels.get("--ds-toolbar-control-focus-ring")).toBe("var(--ds-material-control-focus-ring, var(--ds-focus-ring))");
    expect(toolbarChromeDeriver.scopes).toEqual(["density"]);
  });
});
