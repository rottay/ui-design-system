/**
 * The `collapse` vocabulary at rest on the Modern path: every channel the
 * Modern skin reads carries the exact chain the deriver produces, so producing
 * the name cannot move a pixel, and any higher-ranked statement still wins.
 * `--ds-collapse-content-surface` stays rootless: its resting value is the
 * keyword `transparent`, which no governed root in the surface lane
 * reproduces, so the skin keeps reading it bare and the deriver keeps the
 * honest literal.
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
import { elevationDeriver } from "../../../elevation";
import { expressiveDeriver } from "../../../expressive";
import { collapseChromeDeriver } from "..";

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

describeFamilyContract(collapseChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css"),
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

/* The lot-census channels this lot wires: each fallback is the exact chain
   the deriver produces, landing on a produced root whose resting value is the
   chain the channel already resolved to. */
const WIRED: Record<string, string> = {
  "--ds-collapse-arrow-motion-duration": "var(--ds-motion-feedback)",
  "--ds-collapse-arrow-motion-easing": "var(--ds-motion-ease-out)",
  "--ds-collapse-header-expanded-ink":
    "color-mix(in srgb, var(--ds-color-primary) 35%, var(--ds-color-text-primary))",
  "--ds-collapse-header-gap": "var(--ds-spacing-2)",
  "--ds-collapse-panel-surface":
    "var(--ds-material-card-background, var(--ds-surface-card))",
  "--ds-collapse-reveal-motion-duration": "var(--ds-motion-reveal)",
  "--ds-collapse-reveal-motion-easing": "var(--ds-motion-ease-out)",
  "--ds-collapse-state-motion-duration": "var(--ds-motion-feedback)",
};

describe("chrome/collapse", () => {
  it("produces each wired channel at the exact chain the skin reads it with", () => {
    const derived = collapseChromeDeriver.derive(context(), {});
    for (const [channel, chain] of Object.entries(WIRED)) {
      expect({ channel, produced: derived[channel] }).toEqual({ channel, produced: chain });
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [chain] });
    }
  });

  it("keeps the content surface rootless at the honest literal", () => {
    const derived = collapseChromeDeriver.derive(context(), {});
    /* `transparent` is a keyword no governed root in the surface lane
       reproduces, so the skin reads the channel bare and the deriver keeps
       the literal rather than chaining to a root that would repaint it. */
    expect(derived["--ds-collapse-content-surface"]).toBe("transparent");
    expect(skinFallbacks("--ds-collapse-content-surface")).toEqual([]);
  });

  it("names only its own family namespace", () => {
    for (const channel of collapseChromeDeriver.produces) {
      expect(channel.startsWith("--ds-collapse-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(collapseChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: collapseChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [collapseChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});

/* ---- the depth causality arm: `surfaces.borderStyle` reaches collapse's keyline ---- */

const BORDER_ROLE = "--ds-edge-hairline-width";
const KEYLINE = "--ds-collapse-root-default-idle-border-width";
const ROLE_CHAIN = `var(${BORDER_ROLE})`;
const COMPONENT_CSS = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/collapse/index.css"),
  "utf8"
);

const keylineContext = (theme: FlatTheme) => buildLoweringContext({ theme });

/** The width the role lands on the root, with one posture authored or none. */
function roleWidth(theme: FlatTheme): string | undefined {
  const { channels } = runDerivation(keylineContext(theme), [
    expressiveDeriver,
    elevationDeriver,
    collapseChromeDeriver,
  ]);
  expect(channels[KEYLINE], "the keyline reads the role, not a width").toBe(ROLE_CHAIN);
  return channels[BORDER_ROLE];
}

const posture = (borderStyle: "none" | "hairline" | "strong"): FlatTheme => ({
  ...MINIMAL_THEME,
  surfaces: { borderStyle },
});

describe("chrome/collapse depth keyline", () => {
  it("states the keyline through the governed edge role, never a width of its own", () => {
    const derived = collapseChromeDeriver.derive(keylineContext(MINIMAL_THEME), {});
    expect(derived[KEYLINE]).toBe(ROLE_CHAIN);
    expect(derived[KEYLINE]).not.toMatch(/\d/u);
  });

  it("CAUSALITY: a border posture moves the width this family paints", () => {
    // The hairline role is the thinnest of the three, so `none` retracts it and
    // both stated postures draw it. `none` against `strong` is exactly the pair
    // the depth axis measures.
    expect(roleWidth(posture("none"))).toBe("0px");
    expect(roleWidth(posture("hairline"))).toBe("1px");
    expect(roleWidth(posture("strong"))).toBe("1px");
    expect(roleWidth(posture("none"))).not.toBe(roleWidth(posture("strong")));
  });

  it("rests byte-identical to the component default it replaces, in every vertical", () => {
    // The claim this wire has to earn: with no posture authored, the role the
    // keyline now reads resolves to the SAME width the component declaration
    // stated -- in each first-party vertical, not just the default theme.
    // `--ds-edge-standard-width` would fail this: bithire rests it at 1.5px.
    expect(COMPONENT_CSS).toContain(`${KEYLINE}: var(--ds-border-width-1, 1px);`);
    for (const vertical of ["rottay", "bithire", "evnto"] as const) {
      expect(roleWidth(firstPartyFixture(vertical)), vertical).toBe("1px");
    }
    // A theme with no expressive profile states no role at all, so the
    // foundation default is what paints -- and it is the same 1px.
    expect(roleWidth(MINIMAL_THEME)).toBeUndefined();
    expect(
      readFileSync(
        resolve(
          process.cwd(),
          "src/foundation/tokens/css/foundation/themes/default/index.css"
        ),
        "utf8"
      )
    ).toContain(`${BORDER_ROLE}: 1px;`);
  });

  it("declares the border decision it now consumes", () => {
    expect(collapseChromeDeriver.consumes).toContain("surfaces.borderStyle");
  });
});
