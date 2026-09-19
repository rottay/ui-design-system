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
import { buildLoweringContext } from "../../../../pipeline";
import { breadcrumbChromeDeriver } from "..";

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
    "color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-card-bg, var(--ds-surface-card)))",
  "--ds-breadcrumb-hover-shadow": "var(--ds-elevation-1)",
  "--ds-breadcrumb-hover-lift": "calc(-1px * var(--ds-motion-intensity))",
  "--ds-breadcrumb-current-border":
    "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border-subtle))",
  "--ds-breadcrumb-current-bg":
    "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-card-bg, var(--ds-surface-card)))",
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
