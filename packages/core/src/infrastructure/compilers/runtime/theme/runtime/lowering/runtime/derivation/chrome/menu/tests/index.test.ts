/**
 * The `menu` vocabulary at rest: the two channels the Modern skin reads bare
 * now carry a fallback chain to a produced root whose resting value equals the
 * literal the deriver produces, so producing the name cannot move a pixel, and
 * any higher-ranked statement still wins. `--ds-menu-level` is produced at the
 * skin's own root-arm declaration (0): the engine stamps the name per row and
 * the component-root statement outranks this derived one for the whole
 * subtree. `--ds-menu-arrow-bg` chains the typography root that states the
 * same text-primary wash byte-for-byte. The remaining bare-read channels are
 * measured genuinely rootless (no spacing/motion/opacity rung or paint root
 * equals their resting literal) and stay byte-unchanged.
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
import { menuChromeDeriver } from "..";

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

describeFamilyContract(menuChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css"),
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
  "--ds-menu-level": "var(--ds-spacing-0, 0)",
  "--ds-menu-arrow-bg":
    "var(--ds-type-code-inline-bg, color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent))",
};

describe("chrome/menu", () => {
  it("produces each wired channel as exactly the chained fallback the skin reads it with", () => {
    const derived = menuChromeDeriver.derive(context(), {});
    for (const [channel, chain] of Object.entries(WIRED)) {
      expect({ channel, produced: derived[channel] }).toEqual({ channel, produced: chain });
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [chain] });
    }
  });

  it("measures the rootless bare-read channels at their produced literal, still read bare", () => {
    const derived = menuChromeDeriver.derive(context(), {});
    for (const [channel, literal, bareReads] of [
      ["--ds-menu-item-lift", "calc(-1px * var(--ds-motion-intensity))", 1],
      ["--ds-menu-icon-scale", "calc(1 + 0.04 * var(--ds-motion-intensity))", 2],
      ["--ds-menu-item-keyline", "inset 0 1px 0 color-mix(in srgb, var(--ds-color-white) calc(52% * var(--ds-effect-intensity)), transparent)", 1],
      ["--ds-menu-icon-plate-bg", "color-mix(in srgb, currentColor 6%, transparent)", 1],
      ["--ds-menu-icon-opacity", "0.7", 1],
      ["--ds-menu-arrow-opacity", "0.4", 1],
      ["--ds-menu-group-bg", "color-mix(in srgb, var(--ds-color-text-primary) 2%, transparent)", 1],
    ] as const) {
      expect({ channel, produced: derived[channel] }).toEqual({ channel, produced: literal });
      expect({ channel, bareReads: skinBareReads(channel) }).toEqual({ channel, bareReads });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of menuChromeDeriver.produces) {
      expect(channel.startsWith("--ds-menu-")).toBe(true);
    }
  });
});
