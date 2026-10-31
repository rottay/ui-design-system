/**
 * The `tabs` vocabulary at rest: every wired channel equals the one fallback
 * its Modern skin reads it with, so producing the name cannot move a pixel,
 * and any higher-ranked statement still wins. The paddings quote their
 * spacing rungs with the rung's resting tail; the paints and easings quote
 * the produced chain verbatim; the measured indicator offset is produced at
 * the resting value the skin's root arm declares — the element statement and
 * the engine's measured overwrite outrank the derived one.
 * `--ds-tabs-indicator-scale` is deliberately not produced: the measured
 * transform scale rests at the bare 1 and no produced root reproduces it,
 * so a chain would hang the indicator on an unrelated dial.
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
import type { ChannelName, FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { tabsChromeDeriver } from "..";

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

describeFamilyContract(tabsChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css"),
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

/**
 * Every census channel wired in this lot: the exact chain the deriver
 * produces and the skin reads. Produced === fallback === resting paint.
 */
const WIRED: Record<string, string> = {
  "--ds-tabs-sm-padding": "0 var(--ds-spacing-3, 12px)",
  "--ds-tabs-sm-font-size": "var(--ds-type-supporting-font-size)",
  "--ds-tabs-lg-padding": "0 var(--ds-spacing-4, 16px)",
  "--ds-tabs-lg-font-size": "var(--ds-font-size-base)",
  "--ds-tabs-motion-duration": "var(--ds-motion-feedback)",
  "--ds-tabs-motion-easing": "var(--ds-motion-ease-standard)",
  "--ds-tabs-overflow-fade-color": "var(--ds-surface-card)",
  "--ds-tabs-underline-list-bg":
    "linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 76%, transparent), color-mix(in srgb, var(--ds-surface-inset) 44%, transparent))",
  "--ds-tabs-underline-list-shadow":
    "inset 0 -1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 58%, transparent)",
  "--ds-tabs-list-shadow":
    "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 82%, transparent)",
  "--ds-tabs-list-texture":
    "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--ds-color-text-primary) 13%, transparent) 0.55px, transparent 0.75px)",
  "--ds-tabs-list-highlight":
    "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 68%, transparent)",
  "--ds-tabs-segmented-list-bg":
    "color-mix(in srgb, var(--ds-surface-inset) 94%, var(--ds-color-primary) 6%)",
  "--ds-tabs-pills-list-bg": "color-mix(in srgb, var(--ds-surface-inset) 88%, transparent)",
  "--ds-tabs-active-highlight":
    "linear-gradient(118deg, transparent 12%, color-mix(in srgb, var(--ds-color-bg-elevated) 72%, transparent) 48%, transparent 76%)",
  "--ds-tabs-active-reveal-duration": "var(--ds-motion-feedback)",
  "--ds-tabs-icon-bg": "color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent)",
  "--ds-tabs-icon-shadow":
    "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-border-subtle) 72%, transparent)",
  "--ds-tabs-icon-shadow-active":
    "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 14%, transparent), 0 3px 8px color-mix(in srgb, var(--ds-color-primary) 8%, transparent)",
  "--ds-tabs-item-lift": "calc(-1px * var(--ds-motion-intensity))",
  "--ds-tabs-line-hover-bg": "var(--ds-material-control-background-hover, color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent))",
  "--ds-tabs-line-active-bg":
    "var(--ds-material-control-background-active, linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 8%, transparent), color-mix(in srgb, var(--ds-color-primary) 3%, transparent)))",
  "--ds-tabs-badge-bg": "color-mix(in srgb, var(--ds-color-text-primary) 7%, transparent)",
  "--ds-tabs-badge-keyline":
    "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 72%, transparent)",
  "--ds-tabs-indicator-offset": "var(--ds-spacing-0, 0px)",
  "--ds-tabs-panel-padding": "var(--ds-spacing-4, 16px) 0 0",
  "--ds-tabs-panel-gap": "var(--ds-spacing-3, 12px)",
  "--ds-tabs-panel-texture":
    "linear-gradient(135deg, color-mix(in srgb, var(--ds-color-primary) 2.5%, transparent), transparent 42%)",
  "--ds-tabs-panel-highlight":
    "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 72%, transparent)",
  "--ds-tabs-mobile-padding": "0 var(--ds-spacing-2, 8px)",
};

describe("chrome/tabs", () => {
  it("states every wired channel at the single resting value the skin reads it with", () => {
    const derived = tabsChromeDeriver.derive(context(), {});
    for (const [channel, chain] of Object.entries(WIRED)) {
      expect({ channel, produced: derived[channel] }).toEqual({ channel, produced: chain });
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({
        channel,
        fallbacks: [chain],
      });
    }
  });

  it("claims the density scope and never produces a root copy of the responsive height or padding", () => {
    expect(tabsChromeDeriver.scopes).toEqual(["density"]);
    const derived = tabsChromeDeriver.derive(context(), {});
    for (const channel of ["--ds-tabs-responsive-height", "--ds-tabs-responsive-padding"]) {
      expect({ channel, produced: new Set<string>(tabsChromeDeriver.produces).has(channel) }).toEqual({ channel, produced: false });
      expect(derived[channel]).toBeUndefined();
    }
  });

  it("produces the measured indicator offset at the skin's resting value", () => {
    const derived = tabsChromeDeriver.derive(context(), {});
    expect(derived["--ds-tabs-indicator-offset"]).toBe("var(--ds-spacing-0, 0px)");
    /* The measured transform scale rests at the bare 1 and no produced root
       reproduces it, so the name stays unproduced rather than hanging the
       indicator on an unrelated dial. */
    expect(derived["--ds-tabs-indicator-scale"]).toBeUndefined();
  });

  it("names only its own family namespace", () => {
    for (const channel of tabsChromeDeriver.produces) {
      expect(channel.startsWith("--ds-tabs-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(tabsChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: tabsChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [tabsChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
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
    "channel": "--ds-tabs-line-hover-bg",
    "material": "--ds-material-control-background-hover",
    "shift": "--ds-state-hover-shift",
    "rest": "color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)"
  },
  {
    "channel": "--ds-tabs-line-active-bg",
    "material": "--ds-material-control-background-active",
    "shift": "--ds-state-active-shift",
    "rest": "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 8%, transparent), color-mix(in srgb, var(--ds-color-primary) 3%, transparent))"
  }
] as const satisfies readonly {
  readonly channel: ChannelName;
  readonly material: ChannelName;
  readonly shift: ChannelName;
  readonly rest: string;
}[];

function emphasisChannels(posture: typeof EMPHASIS_POSTURES[number], theme: FlatTheme = MINIMAL_THEME): Map<string, string> {
  const themed: FlatTheme = { ...theme, surfaces: { ...theme.surfaces, stateEmphasis: posture } };
  return new Map([
    ...EMPHASIS_PALETTE,
    ...Object.entries(deriveStateChannels(themed)),
    ...Object.entries(deriveMaterialChannels(themed)),
    ...Object.entries(tabsChromeDeriver.derive(buildLoweringContext({ theme: themed }), {})),
  ]);
}

describe("tabs emphasis grounds", () => {
  it.each(EMPHASIS_TARGETS)("$channel follows its material state with palette and font size held fixed", ({ channel, material, shift }) => {
    const resolved = EMPHASIS_POSTURES.map((posture) => {
      const channels = emphasisChannels(posture);
      const ground = substituteChannels(`var(${channel})`, channels);
      expect(ground).toBe(substituteChannels(`var(${material})`, channels));
      expect(ground).toContain(channels.get(shift));
      expect(substituteChannels("var(--ds-tabs-line-item-radius)", channels)).toBe("var(--ds-radius-md)");
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
    const authored: FlatTheme = { ...MINIMAL_THEME, surfaces: { materials: { control: { backgroundHover: "#aabbcc", backgroundActive: "#ccbbaa" } } } };
    const channels = emphasisChannels("strong", authored);
    expect(substituteChannels("var(--ds-tabs-line-hover-bg)", channels)).toBe("#aabbcc");
    expect(substituteChannels("var(--ds-tabs-line-active-bg)", channels)).toBe("#ccbbaa");
  });

  it("yields both emphasis grounds to vertical and tenant statements in the ranked pipeline", () => {
    const ranks = ["verticalOverride", "tenant"] as const;
    for (const rank of ranks) {
      const stated: FamilyDeriver = {
        family: `stated-tabs-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: EMPHASIS_TARGETS.map(({ channel }) => channel),
        derive: () => Object.fromEntries(EMPHASIS_TARGETS.map(({ channel }) => [channel, "#c7548d"])),
      };
      const result = runDerivation(buildLoweringContext({ theme: MINIMAL_THEME }), [tabsChromeDeriver, stated]);
      const channels = new Map(Object.entries(result.channels));
      for (const { channel } of EMPHASIS_TARGETS) {
        expect(channels.get(channel)).toBe("#c7548d");
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});

/** Settle the one `calc(a% + b%)` form the icon well uses; not a CSS engine. */
const settlePercentSums = (value: string) =>
  value.replace(/calc\((\d+(?:\.\d+)?)% \+ (\d+(?:\.\d+)?)%\)/g, (_, a: string, b: string) => `${Number(a) + Number(b)}%`);

const ICON_WELL = "--ds-tabs-icon-bg-active";
const ICON_WELL_REST = "color-mix(in srgb, var(--ds-color-primary) 10%, transparent)";
const ICON_WELL_STILL = ["--ds-tabs-icon-bg", "--ds-tabs-icon-shadow-active", "--ds-tabs-icon-radius", "--ds-tabs-line-item-radius"] as const;

describe("tabs icon well emphasis", () => {
  it("rests at the skin's fallback under medium emphasis and travels with the selected shift", () => {
    expect(skinFallbacks(ICON_WELL)).toEqual([ICON_WELL_REST]);
    const wells = EMPHASIS_POSTURES.map((posture) => {
      const channels = emphasisChannels(posture);
      expect(substituteChannels(`var(${ICON_WELL})`, channels)).toContain(channels.get("--ds-state-selected-shift"));
      return settlePercentSums(substituteChannels(`var(${ICON_WELL})`, channels));
    });
    const rest = substituteChannels(ICON_WELL_REST, emphasisChannels("medium"));
    expect(wells).toEqual([
      "color-mix(in srgb, #2457a7 6%, transparent)",
      rest,
      "color-mix(in srgb, #2457a7 18%, transparent)",
    ]);
  });

  it("responds to the selected shift only", () => {
    const channels = emphasisChannels("medium");
    const baseline = substituteChannels(`var(${ICON_WELL})`, channels);
    const shifted = new Map(channels);
    shifted.set("--ds-state-selected-shift", "23%");
    expect(substituteChannels(`var(${ICON_WELL})`, shifted)).not.toBe(baseline);
    const unrelated = new Map(channels);
    unrelated.set("--ds-state-hover-shift", "29%");
    unrelated.set("--ds-state-active-shift", "29%");
    unrelated.set("--ds-type-body-font-size", "24px");
    unrelated.set("--ds-type-supporting-font-size", "21px");
    expect(substituteChannels(`var(${ICON_WELL})`, unrelated)).toBe(baseline);
  });

  it("rests at the skin fallback without the states root and yields to authored family paint", () => {
    const channels = emphasisChannels("strong");
    channels.delete("--ds-state-selected-shift");
    expect(settlePercentSums(substituteChannels(`var(${ICON_WELL})`, channels))).toBe(substituteChannels(ICON_WELL_REST, channels));
    channels.set(ICON_WELL, "#c7548d");
    expect(substituteChannels(`var(${ICON_WELL}, ${ICON_WELL_REST})`, channels)).toBe("#c7548d");
  });

  it("leaves the resting well, the active keyline and the radii unmoved by emphasis", () => {
    for (const channel of ICON_WELL_STILL) {
      const resolved = EMPHASIS_POSTURES.map((posture) => substituteChannels(`var(${channel})`, emphasisChannels(posture)));
      expect({ channel, postures: new Set(resolved).size }).toEqual({ channel, postures: 1 });
    }
  });
});
