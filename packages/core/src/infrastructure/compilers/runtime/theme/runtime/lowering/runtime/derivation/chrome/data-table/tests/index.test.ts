/**
 * The data-table family under the shared contract battery: generated from the
 * one template every family answers, never restated here in its own words.
 *
 * The cascade-wiring block below pins each wired channel to the exact chain
 * its Modern skin reads (produced === fallback === resting paint), the same
 * parity contract the form-sections wave lot asserts.
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
import { buildLoweringContext } from "../../../../pipeline";
import { FAMILY_DERIVERS } from "../../..";
import { dataTableChromeDeriver } from "..";

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

describeFamilyContract(dataTableChromeDeriver, FIXTURES);

describe("chrome/data-table", () => {
  it("is registered once, at rank derived", () => {
    expect(
      FAMILY_DERIVERS.filter((deriver) => deriver === dataTableChromeDeriver)
    ).toHaveLength(1);
    expect(dataTableChromeDeriver.family).toBe("data-table");
    expect(dataTableChromeDeriver.rank).toBe("derived");
  });
});

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css"
  ),
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

const context = () =>
  buildLoweringContext({ theme: firstPartyFixture("bithire") });

/** Every wired channel: the exact chain the deriver produces and the skin reads. */
const WIRED: Record<string, string> = {
  "--ds-data-table-action-shadow": "var(--ds-elevation-0, none)",
  "--ds-data-table-control-size":
    "calc(var(--ds-spacing-8, 2rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))",
  "--ds-data-table-control-size-compact":
    "calc(var(--ds-spacing-7, 1.75rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))",
  "--ds-data-table-control-size-spacious":
    "calc(var(--ds-spacing-9, 2.25rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))",
  "--ds-data-table-editor-checkbox-size": "var(--ds-spacing-4, 1rem)",
  "--ds-data-table-editor-input-line-height":
    "var(--ds-line-height-normal, 1.5)",
  "--ds-data-table-editorial-header-padding-block": "var(--ds-spacing-4, 1rem)",
  "--ds-data-table-editorial-header-transform":
    "var(--ds-text-eyebrow-transform, uppercase)",
  "--ds-data-table-minimal-shadow": "var(--ds-elevation-0, none)",
  "--ds-data-table-resize-hit-size": "var(--ds-spacing-4, 1rem)",
  "--ds-data-table-touch-target": "var(--ds-spacing-11, 2.75rem)",
};

describe("chrome/data-table cascade wiring", () => {
  it("produces the exact chained string the Modern skin reads, for every wired channel", () => {
    const derived = dataTableChromeDeriver.derive(context(), {});
    for (const [channel, chain] of Object.entries(WIRED)) {
      expect(derived[channel], channel).toBe(chain);
      expect({ channel, fallbacks: skinFallbacks(channel) }, channel).toEqual({
        channel,
        fallbacks: [normalise(chain)],
      });
    }
  });

  it("wires the pinned insets at the read site without a produced statement", () => {
    const derived = dataTableChromeDeriver.derive(context(), {});
    /* The engine stamps the measured sticky offset inline; nobody produces or
       declares the name on the scope root, so only the read fallback carries
       the chain. */
    expect(derived["--ds-data-table-pinned-inset-start"]).toBeUndefined();
    expect(derived["--ds-data-table-pinned-inset-end"]).toBeUndefined();
    expect(skinFallbacks("--ds-data-table-pinned-inset-start")).toEqual([
      "0px",
    ]);
    expect(skinFallbacks("--ds-data-table-pinned-inset-end")).toEqual(["0px"]);
  });
});

/** The four skins this family paints from, in the order the family declares them. */
const FAMILY_SKINS = [
  "src/foundation/tokens/css/presentation/components/skin/data-table-actions/index.css",
  "src/foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css",
  "src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css",
  "src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css",
].map((path) =>
  readFileSync(resolve(process.cwd(), path), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    ""
  )
);

/** Every distinct fallback any of the family's skins states for `channel`. */
function familyFallbacks(channel: string): string[] {
  const found = new Set<string>();
  for (const text of FAMILY_SKINS) {
    for (const match of text.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*,/g)) {
      if (match[1] !== channel) continue;
      const start = (match.index ?? 0) + match[0].length;
      let end = start;
      for (let depth = 1; depth > 0; end += 1) {
        if (text[end] === "(") depth += 1;
        else if (text[end] === ")") depth -= 1;
      }
      found.add(normalise(text.slice(start, end - 1)));
    }
  }
  return [...found];
}

/**
 * The skin's component-scoped ladder (`--ds-modern-table-*`), every declaration
 * in source order.
 *
 * The aliases are declared on the data-table root, so they do not exist at the
 * theme root this deriver writes to. A resting value that named one would
 * resolve against an undefined name, compute to the guaranteed-invalid value
 * and leave the channel inert -- the read site would keep painting from its own
 * fallback and a tenant decision would reach nothing. The expansion below is
 * what the ladder resolves to on the element, read from the skin so the two
 * cannot drift.
 */
function skinLadder(): Map<string, string[]> {
  const ladder = new Map<string, string[]>();
  for (const match of SKIN.matchAll(/(--ds-modern-table-[a-z-]+)\s*:/g)) {
    const start = (match.index ?? 0) + match[0].length;
    let end = start;
    for (let depth = 0; ; end += 1) {
      if (SKIN[end] === "(") depth += 1;
      else if (SKIN[end] === ")") depth -= 1;
      else if (SKIN[end] === ";" && depth === 0) break;
    }
    const declarations = ladder.get(match[1]!) ?? [];
    declarations.push(normalise(SKIN.slice(start, end)));
    ladder.set(match[1]!, declarations);
  }
  return ladder;
}

const LADDER = skinLadder();

/**
 * The density postures the skin states, in declaration order, and the channel
 * suffix each one reads. The resting posture carries no suffix, the way the
 * control rung itself is spelled.
 */
const POSTURES = ["", "-compact", "-spacious"] as const;

/**
 * `value` with every ladder alias replaced by what it resolves to at `posture`,
 * recursively.
 *
 * Declaration order IS posture order: a `[data-density]` rule restates the
 * alias after the resting rule, and it wins on the matching root. An alias with
 * one declaration is posture-blind, so it answers the same at every index.
 */
function atPosture(value: string, posture: number): string {
  let out = value;
  for (let pass = 0; pass < LADDER.size + 1; pass += 1) {
    const next = out.replace(
      /var\(\s*(--ds-modern-table-[a-z-]+)\s*(?:,[^()]*(?:\([^()]*\)[^()]*)*)?\)/g,
      (whole, alias: string) => {
        const declarations = LADDER.get(alias);
        if (!declarations) return whole;
        return declarations[Math.min(posture, declarations.length - 1)]!;
      }
    );
    if (next === out) return normalise(out);
    out = next;
  }
  throw new Error(`the ladder did not settle for ${value}`);
}

/** `value` as the resting root resolves it. */
const atThemeRoot = (value: string) => atPosture(value, 0);

/** The `data-density` posture of every rule that declares `alias`, in order. */
function densityPostures(alias: string): string[] {
  const postures: string[] = [];
  for (const match of SKIN.matchAll(
    new RegExp(`${alias}\\s*:`, "g")
  )) {
    const selector = SKIN.slice(0, match.index ?? 0).split("}").pop() ?? "";
    const density = selector.match(/\[data-density="([a-z]+)"\]/);
    if (density) postures.push(density[1]!);
  }
  return postures;
}

/**
 * The channels drained out of the `--ds-table-` spelling nobody produced: the
 * skins now read the family's own name and the deriver produces it at the same
 * byte-identical fallback, so the resting paint is unchanged.
 */
const DRAINED: Record<string, string> = {
  "--ds-data-table-action-gap": "var(--ds-spacing-2, 0.5rem)",
  "--ds-data-table-drag-grip-size":
    "calc(var(--ds-data-table-control-size, calc(var(--ds-spacing-8, 2rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))) - 0.375rem)",
  "--ds-data-table-drop-indicator-radius":
    "var(--ds-table-control-radius, var(--ds-radius-md, 0.5rem))",
  "--ds-data-table-editorial-mobile-title-size": "1rem",
  "--ds-data-table-mobile-actions-padding-block": "0.625rem",
  "--ds-data-table-mobile-bulk-padding": "0.625rem 0.75rem",
  "--ds-data-table-mobile-card-focus-ring":
    "0 0 0 var(--ds-focus-ring-width, 2px) color-mix(in srgb, var(--ds-color-primary) 42%, transparent), var(--ds-collection-card-shadow-hover, var(--ds-premium-card-shadow-hover, var(--ds-elevation-2)))",
  "--ds-data-table-mobile-card-hover-lift": "-1px",
  "--ds-data-table-mobile-control-size": "2.25rem",
  "--ds-data-table-mobile-pagination-padding": "0.625rem 0.75rem",
  "--ds-data-table-mobile-selected-outline-offset": "2px",
  "--ds-data-table-mobile-state-min-height": "8rem",
  "--ds-data-table-mobile-state-padding": "2rem 1.25rem",
  "--ds-data-table-mobile-state-radius":
    "var(--ds-table-radius, var(--ds-radius-lg))",
  "--ds-data-table-mobile-summary-divider":
    "color-mix(in srgb, var(--ds-color-border-subtle) 72%, transparent)",
  "--ds-data-table-mobile-summary-min-height": "2rem",
  "--ds-data-table-mobile-summary-padding-block": "0.375rem",
  "--ds-data-table-mobile-summary-padding-inline": "0.125rem",
  "--ds-data-table-resize-bar-height-active": "74%",
  "--ds-data-table-resize-bar-width-active": "0.1875rem",
  "--ds-data-table-ruled-mobile-radius": "var(--ds-radius-md, 0.5rem)",
  "--ds-data-table-ruled-mobile-shadow": "none",
};

/** The three names this family reads that no honest single value can produce. */
const DIVERGENT = [
  "--ds-table-cell-line-height",
  "--ds-table-control-radius",
  "--ds-table-shadow",
];

describe("chrome/data-table drained channels", () => {
  it("produces each one at the single fallback its skins state", () => {
    const derived = dataTableChromeDeriver.derive(context(), {});
    for (const [channel, rest] of Object.entries(DRAINED)) {
      expect(derived[channel], channel).toBe(rest);
      const resting = familyFallbacks(channel).map(atThemeRoot);
      expect({ channel, resting }, channel).toEqual({
        channel,
        resting: [normalise(rest)],
      });
    }
  });

  it("rests the two ladder channels on the expansion, never on the alias", () => {
    const derived = dataTableChromeDeriver.derive(context(), {});
    /* The aliases really are component-scoped: the skin declares them under the
       root's own selector, so nothing at the theme root can name them. */
    for (const alias of [
      "--ds-modern-table-control-size",
      "--ds-modern-table-control-radius",
    ]) {
      expect(LADDER.has(alias), alias).toBe(true);
      expect(SKIN, alias).toContain(
        `.ds-pattern-data-table.ds-engine-modern[data-part="root"]`
      );
      for (const channel of Object.keys(DRAINED)) {
        expect(derived[channel], `${channel} names ${alias}`).not.toContain(
          alias
        );
      }
    }
    /* The control-size rung is declared three times: the resting one and the
       two the `[data-density]` postures state. The expansion takes the
       resting one -- a theme-root value cannot carry the other three, because a
       custom property substitutes its `var()`s where it is DECLARED. */
    expect(LADDER.get("--ds-modern-table-control-size")).toEqual([
      "var(--ds-data-table-control-size, calc(var(--ds-spacing-8, 2rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1)))",
      "var(--ds-data-table-control-size-compact, calc(var(--ds-spacing-7, 1.75rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1)))",
      "var(--ds-data-table-control-size-spacious, calc(var(--ds-spacing-9, 2.25rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1)))",
    ]);
    expect(LADDER.get("--ds-modern-table-control-radius")).toEqual([
      "var(--ds-table-control-radius, var(--ds-radius-md, 0.5rem))",
    ]);
    /* Both expansions end on channels a decision moves: the grip on the
       family's own control rung, the corner on the radius scale. */
    expect(derived["--ds-data-table-drag-grip-size"]).toContain(
      "var(--ds-data-table-control-size,"
    );
    expect(
      dataTableChromeDeriver.produces.includes("--ds-data-table-control-size")
    ).toBe(true);
    expect(derived["--ds-data-table-drop-indicator-radius"]).toContain(
      "var(--ds-radius-md, 0.5rem)"
    );
  });

  it("splits the grip one channel per density posture", () => {
    const derived = dataTableChromeDeriver.derive(context(), {});
    /* The skin restates the grip rung under each `[data-density]` posture, and
       the deriver states the channel that rule reads. Without the split the
       theme-root declaration would substitute its `var()`s once and carry the
       resting rung to all three, which is the regression this pins. */
    expect(densityPostures("--ds-modern-table-drag-grip-size")).toEqual([
      "compact",
      "spacious",
    ]);
    expect(LADDER.get("--ds-modern-table-drag-grip-size")).toHaveLength(
      POSTURES.length
    );
    POSTURES.forEach((suffix, posture) => {
      const channel = `--ds-data-table-drag-grip-size${suffix}`;
      expect(dataTableChromeDeriver.produces, channel).toContain(channel);
      expect(
        LADDER.get("--ds-modern-table-drag-grip-size")?.[posture],
        channel
      ).toBe(
        `var(${channel}, calc(var(--ds-modern-table-control-size) - 0.375rem))`
      );
      /* The produced value IS the expansion of that posture's own fallback:
         the grip rung cut from the control rung the same posture states. */
      expect(
        familyFallbacks(channel).map((fallback) =>
          atPosture(fallback, posture)
        ),
        channel
      ).toEqual([normalise(derived[channel]!)]);
    });
    /* Three distinct rungs, so the postures cannot silently collapse. */
    expect(
      new Set(
        POSTURES.map(
          (suffix) => derived[`--ds-data-table-drag-grip-size${suffix}`]
        )
      ).size
    ).toBe(POSTURES.length);
  });

  it("holds the drop indicator's corner at one channel, because no posture moves it", () => {
    const derived = dataTableChromeDeriver.derive(context(), {});
    /* Why the corner gets no `-compact` / `-spacious` twin: unlike the control
       size, its rung is declared exactly once, under the base root selector,
       and no `[data-density]` rule restates it. The single theme-root channel
       therefore already reaches all three postures, and a split would produce
       channels no rule reads. */
    expect(densityPostures("--ds-modern-table-control-radius")).toEqual([]);
    expect(LADDER.get("--ds-modern-table-control-radius")).toHaveLength(1);
    expect(densityPostures("--ds-modern-table-control-size")).toEqual([
      "compact",
      "spacious",
    ]);
    for (const suffix of POSTURES) {
      const channel = `--ds-data-table-drop-indicator-radius${suffix}`;
      if (suffix === "") continue;
      expect(derived[channel], channel).toBeUndefined();
      expect(dataTableChromeDeriver.produces, channel).not.toContain(channel);
      expect(familyFallbacks(channel), channel).toEqual([]);
    }
    expect(
      atThemeRoot(familyFallbacks("--ds-data-table-drop-indicator-radius")[0]!)
    ).toBe(normalise(derived["--ds-data-table-drop-indicator-radius"]!));
  });

  it("rests the drag grip's margin at the declaration that wins the cascade", () => {
    /* Two rules state `margin-inline-end` on the SAME selector; the later one
       carries `0`, so `0` is what the grip paints whether or not the channel
       is produced. */
    const skin = FAMILY_SKINS[FAMILY_SKINS.length - 1]!;
    const sites = [
      ...skin.matchAll(
        /([^}]*?)\{[^}]*?margin-inline-end:\s*var\(--ds-data-table-drag-grip-offset,\s*([^)]*)\)/g
      ),
    ];
    expect(sites).toHaveLength(2);
    expect(sites.map((site) => normalise(site[1]!))).toEqual([
      '.ds-pattern-data-table.ds-engine-modern [data-part="drag-grip"]',
      '.ds-pattern-data-table.ds-engine-modern [data-part="drag-grip"]',
    ]);
    expect(sites.map((site) => site[2]!.trim())).toEqual(["0.125rem", "0"]);
    expect(
      dataTableChromeDeriver.derive(context(), {})[
        "--ds-data-table-drag-grip-offset"
      ]
    ).toBe("0");
  });

  it("leaves the three divergent reads unproduced, with their divergence measured", () => {
    const derived = dataTableChromeDeriver.derive(context(), {});
    for (const channel of DIVERGENT) {
      expect(derived[channel], channel).toBeUndefined();
      expect(
        familyFallbacks(channel).length,
        `${channel}: one resting value would repaint the other read sites`
      ).toBeGreaterThan(1);
    }
    expect(familyFallbacks("--ds-table-cell-line-height").sort()).toEqual([
      "1.25",
      "1.35",
      "1.55",
    ]);
    expect(familyFallbacks("--ds-table-control-radius").sort()).toEqual([
      "var(--ds-radius-full, 9999px)",
      "var(--ds-radius-md, 0.5rem)",
    ]);
    expect(familyFallbacks("--ds-table-shadow").sort()).toEqual([
      "var(--ds-elevation-1)",
      "var(--ds-workspace-card-shadow, var(--ds-elevation-1))",
    ]);
  });
});
