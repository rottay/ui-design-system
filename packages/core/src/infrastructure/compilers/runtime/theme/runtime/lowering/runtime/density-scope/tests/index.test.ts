/** The scope-exposure roster, derived: which families read a name a local scope re-declares, which the
 *  compiler projects, and the census of those still frozen at the root. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { firstPartyFixture } from "@tests/support/theme-lowering";
import { compileThemeIntent, staticThemeIntent } from "@/entrypoints/server";
import type { FamilyDeriver } from "../../../foundation/contract";
import { DENSITY_SCOPE_POSTURES } from "../../../../emission";
import { FAMILY_DERIVERS } from "../../derivation";
import { buildLoweringContext, lowerBlock, runDerivation } from "../../pipeline";
import {
  claimsDensityScope,
  densityScopeExposed,
  densityScopeMembers,
  isDensityScopeName,
  projectDensityScopeBlock,
  referencedNames,
} from "..";

const CSS_ROOT = resolve(process.cwd(), "src/foundation/tokens/css/foundation");
const css = (file: string) =>
  readFileSync(resolve(CSS_ROOT, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

function declaredUnder(file: string, scoped: RegExp): Set<string> {
  const names = new Set<string>();
  for (const block of css(file).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!scoped.test(block[1])) continue;
    for (const declared of block[2].matchAll(/(--ds-[a-z0-9-]+)\s*:/g)) names.add(declared[1]);
  }
  return names;
}

const DENSITY_AXIS = declaredUnder("base/density/index.css", /:not\(:root\)/);
const ARABIC_AXIS = declaredUnder("responsive/language-arabic/index.css", /:lang\(ar\)/);

/** The arabic axis is EXCLUDED from projection: a claimed family's channel on it must be a masked pin
 *  named here with its reason. */
const MASKED_ARABIC: Readonly<Record<string, string>> = {
  "--ds-toolbar-title-letter-spacing":
    "the title's only read site is overridden by :lang(ar) { letter-spacing: normal } in rottay-responsive",
  "--ds-mobile-header-title-tracking":
    "the title is an h1: rottay-personality's :is(h1..h6) heading tracking outranks the channel at its only read site at rest, and :lang(ar) { letter-spacing: normal } in rottay-responsive masks both",
  "--ds-dashboard-header-title-tracking":
    "the title is an h1: rottay-personality's :is(h1..h6) heading tracking outranks the channel at its only read site at rest, and :lang(ar) { letter-spacing: normal } in rottay-responsive masks both",
  "--ds-detail-header-title-tracking":
    "the title is an h1: rottay-personality's :is(h1..h6) heading tracking outranks the channel at its only read site at rest, and :lang(ar) { letter-spacing: normal } in rottay-responsive masks both",
  "--ds-detail-header-title-tracking-compact":
    "the narrow title is an h1: rottay-personality's :is(h1..h6) heading tracking outranks the channel at its only read site at rest, and :lang(ar) { letter-spacing: normal } in rottay-responsive masks both",
  "--ds-collection-header-chip-tracking":
    "the chip's only read site (meta-item) is overridden by :lang(ar) { letter-spacing: normal } in rottay-responsive",
  "--ds-collection-header-subtitle-tracking-caption":
    "the caption subtitle's only read site is overridden by :lang(ar) { letter-spacing: normal } in rottay-responsive",
  "--ds-collection-header-subtitle-tracking-compact-technical":
    "the compact technical subtitle's only read site is overridden by :lang(ar) { letter-spacing: normal } in rottay-responsive",
  "--ds-collection-header-subtitle-tracking-code":
    "resolves to 0 at the root on every first-party vertical, and its only read site is overridden by :lang(ar) { letter-spacing: normal } in rottay-responsive for any tenant tracking",
  "--ds-shortcuts-overlay-category-letter-spacing":
    "the category label's only read site is overridden by :lang(ar) { letter-spacing: normal } in rottay-responsive",
  "--ds-menu-group-letter-spacing":
    "the group label's only read sites (menu skin, menu-compounds skin) are overridden by :lang(ar) { letter-spacing: normal } in rottay-responsive",
  "--ds-divider-label-track":
    "the overline label's only read site is overridden by :lang(ar) { letter-spacing: normal } in rottay-responsive",
  "--ds-divider-label-tracking":
    "reaches the overline label only through --ds-divider-label-track, resolved at the root, and that read site is overridden by :lang(ar) { letter-spacing: normal } in rottay-responsive",
  "--ds-tabs-item-letter-spacing":
    "the tab button's only read site is overridden by :lang(ar) { letter-spacing: normal } in rottay-responsive",
};

/** Families that read the density axis and must NOT claim it, each with the measured reason. */
const DENSITY_EXEMPT: Readonly<Record<string, string>> = {
  "data-table":
    "always its own boundary (the engine stamps data-density on every table, comfortable by default) and its posture PICKS the control-size/drag-grip rung, so the posture counts once; a claim would re-scale that rung (grip compact 10.75px -> 6.30px bithire) and kill every raw-root tenant override even at rest (13.05px painted, not the stated 99px), and the single-channel or unscaled-rung re-expressions move posture paint or retire 4 published hooks",
  popover:
    "a claim is paint-inert (identical on 14 cells x 2 verticals: the title rungs read presentation-sheet inputs frozen at :root) yet would outrank a tenant's raw-root rung override on any surface carrying its own posture; the frozen :root inputs are the real blocker to local scaling",
};

/** Families that read the density axis, are not claimed yet, and are not exempt: each names why and who moves it. */
const DENSITY_PENDING: Readonly<Record<string, { readonly reason: string; readonly owner: string }>> = {
  flex: {
    reason: "inert: its three channels read --ds-spacing-0, which every posture re-declares as 0, and any non-zero gap is written inline by the prop",
    owner: "inert by measurement",
  },
  grid: {
    reason: "inert: the engine always writes the effective gap inline (--ds-grid-gap for a preset, gap for a measure), so the theme channel never paints",
    owner: "inert by measurement",
  },
  "cockpit-header": {
    reason: "its skin re-declares 5 of its 5 density channels on the root, so no root or boundary statement reaches a read site",
    owner: "paint lane: the skin re-declarations",
  },
  "edit-header": {
    reason: "its skin re-declares 4 of its 4 density channels on the root, so no root or boundary statement reaches a read site",
    owner: "paint lane: the skin re-declarations",
  },
  pagination: {
    reason: "its nav inline-size is an alias of the md height, square only in md; retiring it or reading the current height is a family decision (retire vs repaint sm/lg)",
    owner: "family owner decision: nav square only in md",
  },
};

/** Every way the unclaimed families and the two registries can disagree; empty when the roster is the law. */
function rosterViolations(
  unclaimedFamilies: readonly string[],
  exempt: Readonly<Record<string, string>> = DENSITY_EXEMPT,
  pending: Readonly<Record<string, { readonly reason: string; readonly owner: string }>> = DENSITY_PENDING
): string[] {
  const violations: string[] = [];
  const unclaimed = new Set(unclaimedFamilies);
  for (const family of unclaimed) {
    if (!(family in exempt) && !(family in pending)) violations.push(`${family} is unclaimed and named nowhere`);
  }
  for (const family of new Set([...Object.keys(exempt), ...Object.keys(pending)])) {
    if (!unclaimed.has(family)) violations.push(`${family} is named but is not an unclaimed density family`);
    if (family in exempt && family in pending) violations.push(`${family} is both exempt and pending`);
  }
  for (const [family, reason] of Object.entries(exempt)) {
    if (!reason.trim()) violations.push(`${family} is exempt without a reason`);
  }
  for (const [family, { reason, owner }] of Object.entries(pending)) {
    if (!reason.trim()) violations.push(`${family} is pending without a reason`);
    if (!owner.trim()) violations.push(`${family} is pending without an owner`);
  }
  return violations;
}

const NAMED = new Set([...Object.keys(DENSITY_EXEMPT), ...Object.keys(DENSITY_PENDING)]);

const VERTICALS = ["bithire", "rottay", "evnto"] as const;

function roster(vertical: (typeof VERTICALS)[number], derivers: readonly FamilyDeriver[] = FAMILY_DERIVERS) {
  const { channels, provenance } = runDerivation(
    buildLoweringContext({ theme: firstPartyFixture(vertical) }),
    derivers
  );
  const family = (channel: string) => provenance.get(channel)?.family ?? "";
  const density = densityScopeExposed(channels);
  const direct = new Set(
    Object.entries(channels)
      .filter(([, value]) => referencedNames(value).some((name) => DENSITY_AXIS.has(name)))
      .map(([channel]) => channel)
  );
  const arabic = new Set(
    Object.entries(channels)
      .filter(([, value]) => referencedNames(value).some((name) => ARABIC_AXIS.has(name)))
      .map(([channel]) => channel)
  );
  const claimed = new Set(derivers.filter(claimsDensityScope).map((deriver) => deriver.family));
  const unclaimed = [...density].filter((channel) => !claimed.has(family(channel)));
  const unclaimedFamilies = [...new Set(unclaimed.map(family))];
  const namedChannels = [...density].filter((channel) => NAMED.has(family(channel))).length;
  return { channels, family, density, direct, arabic, claimed, unclaimed, unclaimedFamilies, namedChannels };
}

const familiesOf = (channels: Iterable<string>, family: (channel: string) => string) =>
  new Set([...channels].map(family)).size;

/** An unclaimed family that reads the density axis and that no registry names. */
const UNNAMED_PROBE: FamilyDeriver = {
  family: "probe-unnamed",
  rank: "derived",
  consumes: [],
  produces: ["--ds-probe-unnamed-gap", "--ds-probe-unnamed-size"],
  derive: () => ({
    "--ds-probe-unnamed-gap": "var(--ds-spacing-2)",
    "--ds-probe-unnamed-size": "calc(2rem * var(--ds-density-effective-scale, 1))",
  }),
};

describe("density-scope roster", () => {
  it("keys the boundary on exactly the postures base/density spells", () => {
    const postures = [...css("base/density/index.css").matchAll(/\[data-density='([a-z]+)'\]:not\(:root\)/g)].map(
      (match) => match[1]
    );
    expect([...new Set(postures)].sort()).toEqual([...DENSITY_SCOPE_POSTURES].sort());
  });

  it("names a density-scope input exactly when the boundary re-declares it", () => {
    expect(DENSITY_AXIS.size).toBeGreaterThan(0);
    for (const name of DENSITY_AXIS) expect({ name, scoped: isDensityScopeName(name) }).toEqual({ name, scoped: true });
    for (const vertical of VERTICALS) {
      const { channels } = roster(vertical);
      const read = new Set(Object.values(channels).flatMap(referencedNames));
      for (const name of [...read].filter(isDensityScopeName)) {
        expect({ name, declared: DENSITY_AXIS.has(name) }).toEqual({ name, declared: true });
      }
    }
  });

  it("measures the same roster on every first-party vertical", () => {
    const census = VERTICALS.map((vertical) => {
      const { density, direct, arabic, unclaimed, family, namedChannels } = roster(vertical);
      return {
        density: [familiesOf(density, family), density.size],
        direct: direct.size,
        arabic: [familiesOf(arabic, family), arabic.size],
        unclaimed: [familiesOf(unclaimed, family), unclaimed.length],
        named: [NAMED.size, namedChannels],
      };
    });
    expect(census[1]).toEqual(census[0]);
    expect(census[2]).toEqual(census[0]);
    // What is unclaimed is exactly what the two registries name, family for family and channel for channel.
    expect(census[0]).toEqual({
      density: [49, 345],
      direct: 344,
      arabic: [13, 23],
      unclaimed: census[0].named,
      named: census[0].named,
    });
  });

  it("the unclaimed families are exactly the exempt and the named pending ones, each with its reason", () => {
    expect(Object.keys(DENSITY_EXEMPT).sort()).toEqual(["data-table", "popover"]);
    for (const vertical of VERTICALS) {
      const { unclaimedFamilies } = roster(vertical);
      expect(unclaimedFamilies.sort()).toEqual([...Object.keys(DENSITY_EXEMPT), ...Object.keys(DENSITY_PENDING)].sort());
      expect(rosterViolations(unclaimedFamilies)).toEqual([]);
    }
  });

  it("drill: an unclaimed density family neither exempt nor pending breaks the law, and its channels break the count", () => {
    const lawful = roster("bithire");
    const probed = roster("bithire", [...FAMILY_DERIVERS, UNNAMED_PROBE]);
    expect(probed.unclaimedFamilies).toContain("probe-unnamed");
    expect(rosterViolations(probed.unclaimedFamilies)).toEqual([
      "probe-unnamed is unclaimed and named nowhere",
      ...rosterViolations(lawful.unclaimedFamilies),
    ]);
    expect(probed.unclaimed.length - probed.namedChannels).toBe(
      lawful.unclaimed.length - lawful.namedChannels + UNNAMED_PROBE.produces.length
    );
  });

  it("drill: an empty reason or owner in either registry breaks the law, and so does a name that is claimed or not density-exposed", () => {
    const { unclaimedFamilies } = roster("bithire");
    const base = rosterViolations(unclaimedFamilies);
    const added = (violations: string[]) => violations.filter((violation) => !base.includes(violation));
    expect(added(rosterViolations(unclaimedFamilies, { ...DENSITY_EXEMPT, popover: " " }))).toEqual([
      "popover is exempt without a reason",
    ]);
    expect(
      added(rosterViolations(unclaimedFamilies, DENSITY_EXEMPT, { ...DENSITY_PENDING, grid: { reason: "", owner: "inert by measurement" } }))
    ).toEqual(["grid is pending without a reason"]);
    expect(
      added(rosterViolations(unclaimedFamilies, DENSITY_EXEMPT, { ...DENSITY_PENDING, grid: { reason: "inert", owner: "" } }))
    ).toEqual(["grid is pending without an owner"]);
    expect(added(rosterViolations(unclaimedFamilies, { ...DENSITY_EXEMPT, toolbar: "claimed" }))).toEqual([
      "toolbar is named but is not an unclaimed density family",
    ]);
    expect(added(rosterViolations(unclaimedFamilies, { ...DENSITY_EXEMPT, grid: "twice" }))).toEqual([
      "grid is both exempt and pending",
    ]);
  });

  it("projects every density-exposed channel of a claiming family, and only those", () => {
    for (const vertical of VERTICALS) {
      const { density, family, claimed } = roster(vertical);
      const { compiled } = compileThemeIntent(staticThemeIntent(vertical));
      const projected = Object.keys(compiled.densityScopeBlock?.cssVariables ?? {}).sort();
      expect(projected).toEqual([...density].filter((channel) => claimed.has(family(channel))).sort());
      for (const channel of projected) {
        expect(compiled.densityScopeBlock?.cssVariables[channel]).toBe(compiled.cssVariables[channel]);
      }
    }
  });

  it("the claimants are the forty-two adopting families, and their arabic-axis channels are named masked pins", () => {
    expect(FAMILY_DERIVERS.filter(claimsDensityScope).map((deriver) => deriver.family)).toEqual([
      "textarea", "menu", "tabs", "breadcrumb", "stepper", "sidebar-surface", "form-header",
      "workbench-header", "section-frame", "mobile-header", "stats-header", "surface-lifecycle",
      "app-shell", "action-dock", "scope-switcher", "command-palette", "shortcuts-overlay",
      "search-command-bar", "surface-chrome", "collection-header", "dashboard-header",
      "detail-header", "form-surface", "wizard-surface", "detail-form-surface", "card", "table",
      "tag", "badge", "tree", "kanban-board", "widget-board", "column-settings", "filter-panel",
      "toolbar", "descriptions", "container", "space", "divider", "stack", "collapse", "splitter",
    ]);
    for (const vertical of VERTICALS) {
      const { arabic, family, claimed } = roster(vertical);
      const claimedArabic = [...arabic].filter((channel) => claimed.has(family(channel))).sort();
      expect(claimedArabic).toEqual(Object.keys(MASKED_ARABIC).sort());
    }
  });

  it("every channel of a claiming family reads the density axis directly: a selector alias is never projected", () => {
    for (const vertical of VERTICALS) {
      const { density, direct, family, claimed } = roster(vertical);
      expect([...density].filter((channel) => claimed.has(family(channel)) && !direct.has(channel))).toEqual([]);
    }
  });
});

describe("density-scope membership", () => {
  const theme = firstPartyFixture("bithire");
  const lower = (derivers: readonly FamilyDeriver[]) => lowerBlock({ theme }, derivers);
  const claiming: FamilyDeriver = {
    family: "probe-claim",
    rank: "derived",
    scopes: ["density"],
    consumes: [],
    produces: ["--ds-probe-scaled", "--ds-probe-fixed", "--ds-probe-through"],
    derive: () => ({
      "--ds-probe-scaled": "calc(2rem * var(--ds-density-effective-scale, 1))",
      "--ds-probe-fixed": "2rem",
      "--ds-probe-through": "var(--ds-probe-scaled)",
    }),
  };

  it("judges a claim on the family's own value and carries a higher-rank statement", () => {
    const stated: FamilyDeriver = {
      family: "probe-stated",
      rank: "tenant",
      consumes: [],
      produces: ["--ds-probe-scaled"],
      derive: () => ({ "--ds-probe-scaled": "50px" }),
    };
    const derivers = [...FAMILY_DERIVERS, claiming, stated];
    const members = densityScopeMembers(derivers, lower);
    expect(members).toEqual(expect.arrayContaining(["--ds-probe-scaled", "--ds-probe-through"]));
    expect(members).not.toContain("--ds-probe-fixed");
    const block = projectDensityScopeBlock(lower(derivers), members, []);
    expect(block?.cssVariables["--ds-probe-scaled"]).toBe("50px");
  });

  it("refuses a member that re-resolves only through an unprojected channel", () => {
    const outside: FamilyDeriver = {
      family: "probe-outside",
      rank: "derived",
      consumes: [],
      produces: ["--ds-probe-outside"],
      derive: () => ({ "--ds-probe-outside": "var(--ds-spacing-2)" }),
    };
    const through: FamilyDeriver = {
      family: "probe-through",
      rank: "derived",
      scopes: ["density"],
      consumes: [],
      produces: ["--ds-probe-inside"],
      derive: () => ({ "--ds-probe-inside": "var(--ds-probe-outside)" }),
    };
    expect(() => densityScopeMembers([...FAMILY_DERIVERS, outside, through], lower)).toThrow(
      /--ds-probe-inside re-resolves only through --ds-probe-outside/
    );
  });

  it("refuses a member a mode or contrast rule restates", () => {
    expect(() =>
      projectDensityScopeBlock({ "--ds-probe-scaled": "x" }, ["--ds-probe-scaled"], [
        { label: "dark mode", cssVariables: { "--ds-probe-scaled": "y" } },
      ])
    ).toThrow(/dark mode block restates --ds-probe-scaled/);
  });

  it("ignores an unclaimed family entirely", () => {
    const { scopes: _scopes, ...unclaimed } = claiming;
    expect(densityScopeMembers([...FAMILY_DERIVERS, unclaimed], lower)).not.toContain("--ds-probe-scaled");
  });
});
