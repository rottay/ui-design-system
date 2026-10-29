/**
 * The `breadcrumb` vocabulary at rest: every wired channel equals the one
 * fallback its Modern skin reads it with, so producing the name cannot move a
 * pixel, and any higher-ranked statement still wins. The skin's bare reads now
 * chain to the produced roots the deriver already quoted (`--ds-elevation-1`,
 * the spacing rungs, the motion cadences) or restate the deriver's own
 * expression verbatim, whose inner `var()` references land the chain on a
 * produced root.
 *
 * Three channels stay ROOTLESS, produced at their honest literals with no skin
 * fallback: `--ds-breadcrumb-link-underline` and `--ds-breadcrumb-icon-bg`
 * ride `currentColor`, which no governed root produces, and
 * `--ds-breadcrumb-separator-opacity` rests at 0.72, where no opacity rung
 * exists. A chained fallback for any of them would either repaint under a
 * tenant or terminate on nothing, so the reads stay byte-unchanged.
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
import { FAMILY_DERIVERS } from "../../..";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { breadcrumbChromeDeriver } from "..";

import { deriveMaterialChannels } from "../../../materials";
import { deriveStateChannels } from "../../../states";

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

describeFamilyContract(breadcrumbChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css"),
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

/** The exact chain the deriver produces and the skin reads for each wired channel. */
const WIRED: Record<string, string> = {
  "--ds-breadcrumb-shadow": "var(--ds-elevation-1)",
  "--ds-breadcrumb-list-gap": "var(--ds-spacing-0)",
  "--ds-breadcrumb-motion-duration": "var(--ds-motion-feedback)",
  "--ds-breadcrumb-motion-easing": "var(--ds-motion-ease-standard)",
  "--ds-breadcrumb-hover-border":
    "color-mix(in srgb, var(--ds-color-primary) 18%, var(--ds-color-border-subtle))",
  "--ds-breadcrumb-hover-bg":
    "var(--ds-material-card-background-hover, color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-card-bg, var(--ds-surface-card))))",
  "--ds-breadcrumb-hover-shadow": "var(--ds-elevation-1)",
  "--ds-breadcrumb-hover-lift": "calc(-1px * var(--ds-motion-intensity))",
  "--ds-breadcrumb-current-border":
    "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border-subtle))",
  "--ds-breadcrumb-current-bg":
    "var(--ds-material-card-background-selected, color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-card-bg, var(--ds-surface-card))))",
  "--ds-breadcrumb-current-keyline":
    "inset 0 1px 0 color-mix(in srgb, var(--ds-color-white) calc(58% * var(--ds-effect-intensity)), transparent)",
  "--ds-breadcrumb-ellipsis-min-width": "var(--ds-spacing-7)",
  "--ds-breadcrumb-ellipsis-padding-inline": "var(--ds-spacing-2)",
  "--ds-breadcrumb-ellipsis-bg":
    "color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)",
};

/** Produced at an honest literal no governed root reproduces: the reads stay bare. */
const ROOTLESS: Record<string, string> = {
  "--ds-breadcrumb-link-underline": "color-mix(in srgb, currentColor 32%, transparent)",
  "--ds-breadcrumb-icon-bg": "color-mix(in srgb, currentColor 7%, transparent)",
  "--ds-breadcrumb-separator-opacity": "0.72",
};

describe("chrome/breadcrumb", () => {
  it("is registered once, at rank derived", () => {
    expect(
      FAMILY_DERIVERS.filter((deriver) => deriver === breadcrumbChromeDeriver)
    ).toHaveLength(1);
    expect(breadcrumbChromeDeriver.family).toBe("breadcrumb");
    expect(breadcrumbChromeDeriver.rank).toBe("derived");
  });

  it("states every wired channel at the single chain its skin reads it with", () => {
    const derived = breadcrumbChromeDeriver.derive(
      buildLoweringContext({ theme: firstPartyFixture("bithire") }),
      {}
    );
    for (const [channel, chain] of Object.entries(WIRED)) {
      expect(derived[channel], channel).toBe(chain);
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({
        channel,
        fallbacks: [chain],
      });
    }
  });

  it("keeps the rootless channels produced at their honest literals, with no skin fallback", () => {
    const derived = breadcrumbChromeDeriver.derive(
      buildLoweringContext({ theme: firstPartyFixture("bithire") }),
      {}
    );
    for (const [channel, literal] of Object.entries(ROOTLESS)) {
      expect(derived[channel], channel).toBe(literal);
      expect(skinFallbacks(channel), channel).toEqual([]);
    }
  });
});

/** Substitute test channel values only; this is not a CSS engine or a paint measurement. */
function substituteChannels(value: string, channels: ReadonlyMap<string, string>, depth = 0): string {
  if (depth > 32) throw new Error("Channel substitution did not settle");
  let result = "";
  let cursor = 0;
  for (let start = value.indexOf("var("); start !== -1; start = value.indexOf("var(", cursor)) {
    result += value.slice(cursor, start);
    let end = start + 4;
    let balance = 1;
    for (; balance > 0 && end < value.length; end += 1) {
      if (value.charAt(end) === "(") balance += 1;
      else if (value.charAt(end) === ")") balance -= 1;
    }
    if (balance !== 0) throw new Error("Unbalanced channel reference");
    const body = value.slice(start + 4, end - 1);
    const comma = body.indexOf(",");
    const name = (comma === -1 ? body : body.slice(0, comma)).trim();
    const chosen = channels.get(name) ?? (comma === -1 ? undefined : body.slice(comma + 1).trim());
    result += chosen === undefined ? value.slice(start, end) : substituteChannels(chosen, channels, depth + 1);
    cursor = end;
  }
  return result + value.slice(cursor);
}

const EMPHASIS_POSTURES = ["subtle", "medium", "strong"] as const;
const EMPHASIS_PALETTE: ReadonlyArray<readonly [string, string]> = [
  ["--ds-color-primary", "#2457a7"],
  ["--ds-color-text-primary", "#17202a"],
  ["--ds-surface-control", "#f0f2f4"],
  ["--ds-surface-card", "#ffffff"],
  ["--ds-type-body-font-size", "16px"],
  ["--ds-type-supporting-font-size", "14px"],
];

const EMPHASIS_TARGETS = [
  {
    "channel": "--ds-breadcrumb-hover-bg",
    "material": "--ds-material-card-background-hover",
    "shift": "--ds-state-hover-shift",
    "rest": "color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-card-bg, var(--ds-surface-card)))"
  },
  {
    "channel": "--ds-breadcrumb-current-bg",
    "material": "--ds-material-card-background-selected",
    "shift": "--ds-state-selected-shift",
    "rest": "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-card-bg, var(--ds-surface-card)))"
  }
];

function emphasisChannels(posture: typeof EMPHASIS_POSTURES[number], theme: FlatTheme = MINIMAL_THEME): Map<string, string> {
  const themed: FlatTheme = { ...theme, surfaces: { ...theme.surfaces, stateEmphasis: posture } };
  return new Map([
    ...EMPHASIS_PALETTE,
    ...Object.entries(deriveStateChannels(themed)),
    ...Object.entries(deriveMaterialChannels(themed)),
    ...Object.entries(breadcrumbChromeDeriver.derive(buildLoweringContext({ theme: themed }), {})),
  ]);
}

describe("breadcrumb emphasis grounds", () => {
  it.each(EMPHASIS_TARGETS)("$channel follows its material state with palette and font size held fixed", ({ channel, material, shift }) => {
    const resolved = EMPHASIS_POSTURES.map((posture) => {
      const channels = emphasisChannels(posture);
      const ground = substituteChannels(`var(${channel})`, channels);
      expect(ground).toBe(substituteChannels(`var(${material})`, channels));
      expect(ground).toContain(channels.get(shift));
      expect(substituteChannels("var(--ds-breadcrumb-item-radius)", channels)).toBe("var(--ds-radius-md)");
      return ground;
    });
    expect(new Set(resolved).size).toBe(3);
  });

  it.each(EMPHASIS_TARGETS)("$channel responds to its own shift only", ({ channel, shift }) => {
    const channels = emphasisChannels("medium");
    const baseline = substituteChannels(`var(${channel})`, channels);
    const shifted = new Map(channels);
    shifted.set(shift, "23%");
    expect(substituteChannels(`var(${channel})`, shifted)).not.toBe(baseline);
    const unrelated = new Map(channels);
    unrelated.set("--ds-type-body-font-size", "24px");
    unrelated.set("--ds-type-supporting-font-size", "21px");
    const shifts = ["--ds-state-hover-shift", "--ds-state-active-shift", "--ds-state-selected-shift"];
    shifts.filter((name) => name !== shift).forEach((name) => unrelated.set(name, "29%"));
    expect(substituteChannels(`var(${channel})`, unrelated)).toBe(baseline);
  });

  it.each(EMPHASIS_TARGETS)("$channel keeps the resting fallback and gives authored family paint priority", ({ channel, material }) => {
    const channels = emphasisChannels("strong");
    channels.delete(material);
    const fallback = skinFallbacks(channel).at(0);
    expect(fallback).toBeDefined();
    expect(substituteChannels(`var(${channel})`, channels)).toBe(substituteChannels(fallback!, channels));
    const resting = emphasisChannels("medium");
    resting.delete(material);
    expect(substituteChannels(`var(${channel})`, channels)).toBe(substituteChannels(`var(${channel})`, resting));
    channels.set(channel, "#c7548d");
    expect(substituteChannels(`var(${channel})`, channels)).toBe("#c7548d");
  });

  it.each(EMPHASIS_TARGETS)("$channel skin fallback uses material without a family statement, then the original resting ground", ({ channel, material, rest }) => {
    const fallback = skinFallbacks(channel).at(0)!;
    const expression = `var(${channel}, ${fallback})`;
    const channels = emphasisChannels("strong");
    channels.delete(channel);
    expect(substituteChannels(expression, channels)).toBe(substituteChannels(`var(${material})`, channels));
    channels.delete(material);
    expect(substituteChannels(expression, channels)).toBe(substituteChannels(rest, channels));
    channels.set(channel, "#c7548d");
    expect(substituteChannels(expression, channels)).toBe("#c7548d");
  });

  it("honors authored material state grounds through the existing material producer", () => {
    const authored: FlatTheme = { ...MINIMAL_THEME, surfaces: { materials: { card: { backgroundHover: "#aabbcc", backgroundSelected: "#ccbbaa" } } } };
    const channels = emphasisChannels("strong", authored);
    expect(substituteChannels("var(--ds-breadcrumb-hover-bg)", channels)).toBe("#aabbcc");
    expect(substituteChannels("var(--ds-breadcrumb-current-bg)", channels)).toBe("#ccbbaa");
  });

  it("yields both emphasis grounds to vertical and tenant statements in the ranked pipeline", () => {
    const ranks = ["verticalOverride", "tenant"] as const;
    for (const rank of ranks) {
      const stated: FamilyDeriver = {
        family: `stated-breadcrumb-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: EMPHASIS_TARGETS.map(({ channel }) => channel),
        derive: () => Object.fromEntries(EMPHASIS_TARGETS.map(({ channel }) => [channel, "#c7548d"])),
      };
      const result = runDerivation(buildLoweringContext({ theme: MINIMAL_THEME }), [breadcrumbChromeDeriver, stated]);
      const channels = new Map(Object.entries(result.channels));
      for (const { channel } of EMPHASIS_TARGETS) {
        expect(channels.get(channel)).toBe("#c7548d");
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
