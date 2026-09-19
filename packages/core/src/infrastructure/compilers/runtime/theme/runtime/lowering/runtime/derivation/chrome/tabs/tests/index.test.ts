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
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { tabsChromeDeriver } from "..";

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
  "--ds-tabs-icon-bg-active": "color-mix(in srgb, var(--ds-color-primary) 10%, transparent)",
  "--ds-tabs-icon-shadow-active":
    "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 14%, transparent), 0 3px 8px color-mix(in srgb, var(--ds-color-primary) 8%, transparent)",
  "--ds-tabs-item-lift": "calc(-1px * var(--ds-motion-intensity))",
  "--ds-tabs-line-hover-bg": "color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)",
  "--ds-tabs-line-active-bg":
    "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 8%, transparent), color-mix(in srgb, var(--ds-color-primary) 3%, transparent))",
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
