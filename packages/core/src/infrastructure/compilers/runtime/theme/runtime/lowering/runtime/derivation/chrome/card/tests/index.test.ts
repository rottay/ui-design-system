/**
 * The `card` vocabulary at rest: every wired channel equals the one fallback
 * its Modern skin reads it with, so producing the name cannot move a pixel,
 * and any higher-ranked statement still wins. The toned fills and keylines
 * rest on the palette's tint rungs, the toned title inks on the deep rungs,
 * the outlined hover border on its override relation chain landing on the
 * border root, the loading geometry on the spacing ramp, the copy sizes on
 * the type roles, and the frosted scrim on the card surface root.
 * `--ds-card-instance-padding` is produced at the DEFAULT padding arm's
 * resting value: the skin's `[data-padding]` arms redeclare it on the card
 * element and outrank the derived statement, so the padding contract stands.
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
import { cardChromeDeriver } from "..";

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

describeFamilyContract(cardChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css"),
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

/** Channels the deriver produces; the skin's fallback must equal the produced string. */
const DERIVER_WIRED: Record<string, string> = {
  "--ds-card-border-accent-hover":
    "var(--ds-card-border-hover, var(--ds-card-border-color-hover, var(--ds-color-border-secondary)))",
  "--ds-card-outlined-border-hover":
    "var(--ds-card-border-accent-hover, var(--ds-card-border-hover, var(--ds-card-border-color-hover, var(--ds-color-border-secondary))))",
  "--ds-card-instance-padding":
    "calc(var(--ds-card-padding-md, var(--ds-card-padding-base)) * var(--ds-rhythm-effective-scale, 1))",
  "--ds-card-loading-min-height":
    "calc(var(--ds-spacing-10) * 3 * var(--ds-rhythm-effective-scale, 1))",
  "--ds-card-primary-title-color": "var(--ds-color-primary-900)",
  "--ds-card-success-title-color": "var(--ds-color-success-900)",
  "--ds-card-warning-title-color": "var(--ds-color-warning-900)",
  "--ds-card-error-title-color": "var(--ds-color-error-900)",
  "--ds-card-info-title-color": "var(--ds-color-info-900)",
  "--ds-card-title-font-size-sm": "var(--ds-type-body-font-size)",
  "--ds-card-body-font-size-sm": "var(--ds-type-supporting-font-size)",
  "--ds-card-title-font-size-lg": "var(--ds-type-section-title-font-size)",
};

/** Channels the card constants own; the deriver must not restate them. */
const CONSTANTS_WIRED: Record<string, string> = {
  "--ds-z-index-relative-base": "var(--ds-z-index-base, 0)",
  "--ds-card-primary-border-color": "var(--ds-color-primary-200)",
  "--ds-card-primary-bg": "var(--ds-color-primary-50)",
  "--ds-card-success-border-color": "var(--ds-color-success-200)",
  "--ds-card-success-bg": "var(--ds-color-success-50)",
  "--ds-card-warning-border-color": "var(--ds-color-warning-200)",
  "--ds-card-warning-bg": "var(--ds-color-warning-50)",
  "--ds-card-error-border-color": "var(--ds-color-error-200)",
  "--ds-card-error-bg": "var(--ds-color-error-50)",
  "--ds-card-info-border-color": "var(--ds-color-info-200)",
  "--ds-card-info-bg": "var(--ds-color-info-50)",
  "--ds-card-cover-min-height": "var(--ds-spacing-48, 12rem)",
  "--ds-card-loading-overlay-bg": "color-mix(in srgb, var(--ds-surface-card) 62%, transparent)",
};

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/card", () => {
  it("states every wired channel at the single resting value the skin reads it with", () => {
    const derived = cardChromeDeriver.derive(context(), {});
    for (const [channel, chain] of Object.entries(DERIVER_WIRED)) {
      expect(derived[channel], channel).toBe(chain);
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({
        channel,
        fallbacks: [normalise(chain)],
      });
    }
    for (const [channel, chain] of Object.entries(CONSTANTS_WIRED)) {
      expect(derived[channel], channel).toBeUndefined();
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({
        channel,
        fallbacks: [normalise(chain)],
      });
    }
  });

  it("produces the instance padding at the default arm's resting value", () => {
    const derived = cardChromeDeriver.derive(context(), {});
    expect(derived["--ds-card-instance-padding"]).toBe(
      "calc(var(--ds-card-padding-md, var(--ds-card-padding-base)) * var(--ds-rhythm-effective-scale, 1))"
    );
    /* The non-default `[data-padding]` arms redeclare the channel on the card
       element so each arm keeps outranking the derived default. */
    for (const arm of ["none", "sm", "lg", "xl"] as const) {
      const block = SKIN.match(
        new RegExp(`\\[data-padding='${arm}'\\] \\{[\\s\\S]*?\\n\\}`)
      )?.[0];
      expect(block, `data-padding='${arm}' arm`).toContain("--ds-card-instance-padding:");
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of cardChromeDeriver.produces) {
      expect(channel.startsWith("--ds-card-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(cardChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: cardChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [cardChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
