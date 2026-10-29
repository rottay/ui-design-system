/**
 * The `table` vocabulary at rest: the four runtime-geometry channels the Modern
 * skin reads with a literal or bare fallback now chain to a produced root whose
 * resting value equals the literal the family painted, so producing the name
 * cannot move a pixel, and any higher-ranked statement still wins. The three
 * zero offsets ride the spacing ramp's zero rung and the truncating cap rides
 * the 20rem rung; the skin declares each of them at the family root and the
 * TSX re-stamps them per element, so those statements outrank these derived
 * ones for the whole subtree. The remaining reads (the container's 100% inline
 * size, the column's auto width, the uncapped scroll axis) are keyword values
 * no governed root shares and stay byte-unchanged.
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
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { typographyDeriver } from "../../../typography";
import { tableChromeDeriver } from "..";

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

describeFamilyContract(tableChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css"),
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

/** Every bare read of `channel` (no fallback) the skin states. */
function skinBareReads(channel: string): number {
  const pattern = new RegExp(`var\\(\\s*${channel.replace(/-/g, "\\-")}\\s*\\)`, "g");
  return [...SKIN.matchAll(pattern)].length;
}

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

/** The chained fallback both the deriver and the skin must state byte-for-byte. */
const WIRED: Record<string, string> = {
  "--ds-table-col-min-width": "var(--ds-spacing-0, 0)",
  "--ds-table-sticky-top": "var(--ds-spacing-0, 0)",
  "--ds-table-virtual-spacer": "var(--ds-spacing-0, 0)",
  "--ds-table-cell-ellipsis-max-width": "var(--ds-spacing-80, 320px)",
};

describe("chrome/table", () => {
  it("states every declared channel at the single value the skin reads it with", () => {
    const derived = tableChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...tableChromeDeriver.produces].sort());
  });

  it("produces each wired channel as exactly the chained fallback the skin reads it with", () => {
    const derived = tableChromeDeriver.derive(context(), {});
    for (const [channel, chain] of Object.entries(WIRED)) {
      expect({ channel, produced: derived[channel] }).toEqual({ channel, produced: chain });
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [chain] });
      expect({ channel, bareReads: skinBareReads(channel) }).toEqual({ channel, bareReads: 0 });
    }
  });

  it("measures the keyword reads as rootless: not produced, still literal or bare", () => {
    const derived = tableChromeDeriver.derive(context(), {});
    expect({ channel: "--ds-table-scroll-x", produced: derived["--ds-table-scroll-x"] }).toEqual({
      channel: "--ds-table-scroll-x",
      produced: undefined,
    });
    expect({ fallbacks: skinFallbacks("--ds-table-scroll-x") }).toEqual({ fallbacks: ["100%"] });
    for (const channel of ["--ds-table-col-width", "--ds-table-scroll-y"]) {
      expect({ channel, produced: derived[channel] }).toEqual({ channel, produced: undefined });
      expect({ channel, bareReads: skinBareReads(channel) }).toEqual({ channel, bareReads: 1 });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of tableChromeDeriver.produces) {
      expect(channel.startsWith("--ds-table-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(tableChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: tableChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [tableChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});

const TITLE_WEIGHT = "--ds-table-title-font-weight";
const CURRENT_WEIGHT = "--ds-table-pagination-current-font-weight";
const TITLE_CHAIN = "var(--ds-type-section-title-font-weight, var(--ds-font-weight-semibold))";
const CURRENT_CHAIN = "var(--ds-type-label-font-weight, var(--ds-font-weight-semibold))";
const ROLE_WEIGHT_CHANNELS = new Set([TITLE_WEIGHT, CURRENT_WEIGHT]);
const OTHER_CHANNELS: Record<string, string> = {
  "--ds-table-title-margin-block-end": "var(--ds-spacing-2)",
  "--ds-table-footer-margin-block-start": "var(--ds-spacing-2)",
  "--ds-table-cell-numeric": "tabular-nums",
  "--ds-table-pagination-numeric": "tabular-nums",
  "--ds-table-pagination-font-size": "var(--ds-type-supporting-font-size)",
  "--ds-table-pagination-margin-block-start": "var(--ds-spacing-4)",
  "--ds-table-selection-control-coarse-size": "calc(var(--ds-spacing-5) * var(--ds-control-height-scale, 1))",
  "--ds-table-touch-target-min": "var(--ds-touch-target-min)",
  "--ds-table-col-min-width": "var(--ds-spacing-0, 0)",
  "--ds-table-sticky-top": "var(--ds-spacing-0, 0)",
  "--ds-table-virtual-spacer": "var(--ds-spacing-0, 0)",
  "--ds-table-cell-ellipsis-max-width": "var(--ds-spacing-80, 320px)",
};

const read = (channels: Record<string, string>, channel: string): string | undefined =>
  new Map(Object.entries(channels)).get(channel);

const otherChannels = (channels: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(channels).filter(([channel]) => !ROLE_WEIGHT_CHANNELS.has(channel)));

function resolveWeight(value: string | undefined, channels: Record<string, string>): string {
  if (value === undefined) throw new Error("Missing weight channel");
  const reference = /^var\((--ds-[a-z0-9-]+)(?:,\s*(.*))?\)$/.exec(value);
  if (reference === null) return value;
  const [, channel = "", fallback] = reference;
  return resolveWeight(read(channels, channel) ?? fallback, channels);
}

function lower(typography: NonNullable<FlatTheme["typography"]>) {
  const ctx = buildLoweringContext({ theme: { ...MINIMAL_THEME, typography } });
  return { ctx, channels: runDerivation(ctx, [typographyDeriver, tableChromeDeriver]).channels };
}

const WEIGHT_POSTURES = [
  { roleWeights: "light", expected: "500" },
  { roleWeights: "regular", expected: "600" },
  { roleWeights: "strong", expected: "700" },
] as const;
const FONT_SIZES = ["1rem", "2rem"] as const;
const SECTION_TITLE_WEIGHTS = [300, 700] as const;
const LABEL_WEIGHTS = [300, 800] as const;

describe("chrome/table title role weight", () => {
  it.each(WEIGHT_POSTURES)("follows $roleWeights independently of section-title font-size", ({ roleWeights, expected }) => {
    for (const fontSize of FONT_SIZES) {
      const { ctx, channels } = lower({ roleWeights, roles: { sectionTitle: { fontSize } } });
      expect(read(channels, "--ds-type-section-title-font-size")).toBe(fontSize);
      expect(resolveWeight(read(channels, TITLE_WEIGHT), channels)).toBe(expected);
      const derived = tableChromeDeriver.derive(ctx, {});
      expect(read(derived, TITLE_WEIGHT)).toBe(TITLE_CHAIN);
      expect(otherChannels(derived)).toEqual(OTHER_CHANNELS);
    }
  });

  it("follows the authored section-title weight above the posture and label weight", () => {
    for (const fontWeight of SECTION_TITLE_WEIGHTS) {
      const { channels } = lower({
        roleWeights: "strong",
        roles: { sectionTitle: { fontWeight }, label: { fontWeight: 800 } },
      });
      expect(read(channels, "--ds-type-label-font-weight")).toBe("800");
      expect(resolveWeight(read(channels, TITLE_WEIGHT), channels)).toBe(String(fontWeight));
    }
  });

  it("falls back to semibold only when the section-title role channel is absent", () => {
    const titleWeight = read(tableChromeDeriver.derive(context(), {}), TITLE_WEIGHT);
    expect(resolveWeight(titleWeight, { "--ds-font-weight-semibold": "600" })).toBe("600");
    expect(resolveWeight(titleWeight, {
      "--ds-type-section-title-font-weight": "300",
      "--ds-font-weight-semibold": "900",
    })).toBe("300");
  });

  it("preserves every other declared channel exactly", () => {
    for (const fixture of FIXTURES) {
      const ctx = buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant });
      const derived = tableChromeDeriver.derive(ctx, {});
      expect(read(derived, TITLE_WEIGHT)).toBe(TITLE_CHAIN);
      expect(read(derived, CURRENT_WEIGHT)).toBe(CURRENT_CHAIN);
      expect(otherChannels(derived)).toEqual(OTHER_CHANNELS);
    }
  });
});

describe("chrome/table pagination current role weight", () => {
  it.each(WEIGHT_POSTURES)("follows $roleWeights independently of label font-size", ({ roleWeights, expected }) => {
    for (const fontSize of FONT_SIZES) {
      const { ctx, channels } = lower({ roleWeights, roles: { label: { fontSize } } });
      expect(read(channels, "--ds-type-label-font-size")).toBe(fontSize);
      expect(read(channels, "--ds-type-label-font-weight")).toBe(expected);
      expect(resolveWeight(read(channels, CURRENT_WEIGHT), channels)).toBe(expected);
      const derived = tableChromeDeriver.derive(ctx, {});
      expect(read(derived, CURRENT_WEIGHT)).toBe(CURRENT_CHAIN);
      expect(otherChannels(derived)).toEqual(OTHER_CHANNELS);
    }
  });

  it("follows the authored label weight above the posture and section-title weight", () => {
    for (const fontWeight of LABEL_WEIGHTS) {
      const { channels } = lower({
        roleWeights: "strong",
        roles: { label: { fontWeight }, sectionTitle: { fontWeight: 500 } },
      });
      expect(read(channels, "--ds-type-label-font-weight")).toBe(String(fontWeight));
      expect(resolveWeight(read(channels, CURRENT_WEIGHT), channels)).toBe(String(fontWeight));
      expect(resolveWeight(read(channels, TITLE_WEIGHT), channels)).toBe("500");
    }
  });

  it("stays on the label posture when only the section title is authored", () => {
    const { channels } = lower({ roleWeights: "light", roles: { sectionTitle: { fontWeight: 800 } } });
    expect(resolveWeight(read(channels, TITLE_WEIGHT), channels)).toBe("800");
    expect(resolveWeight(read(channels, CURRENT_WEIGHT), channels)).toBe("500");
  });

  it("falls back to semibold only when the label role channel is absent", () => {
    const currentWeight = read(tableChromeDeriver.derive(context(), {}), CURRENT_WEIGHT);
    expect(resolveWeight(currentWeight, { "--ds-font-weight-semibold": "600" })).toBe("600");
    expect(resolveWeight(currentWeight, {
      "--ds-type-section-title-font-weight": "300",
      "--ds-font-weight-semibold": "900",
    })).toBe("900");
    expect(resolveWeight(currentWeight, {
      "--ds-type-label-font-weight": "300",
      "--ds-font-weight-semibold": "900",
    })).toBe("300");
  });
});
