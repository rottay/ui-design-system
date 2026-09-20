/**
 * The `dashboard-header` vocabulary at rest: every channel equals the one
 * fallback its Modern skin reads it with, so producing the name cannot move a
 * pixel, and any higher-ranked statement still wins.
 *
 * ADAPTED from the reference chrome tests (mobile-header, section-frame): this
 * deriver is deliberately NOT registered in FAMILY_DERIVERS yet -- the DT adds
 * the registration line at integration, serialized with the other sub-lot D
 * families -- so this suite asserts no registry membership and proves
 * precedence by running the deriver directly through runDerivation.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { elevationDeriver } from "../../../elevation";
import { expressiveDeriver } from "../../../expressive";
import { dashboardHeaderChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css"),
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

describe("chrome/dashboard-header", () => {
  it("declares the family id and rank derived", () => {
    expect(dashboardHeaderChromeDeriver.family).toBe("dashboard-header");
    expect(dashboardHeaderChromeDeriver.rank).toBe("derived");
  });

  it("states every declared channel at the single resting value the skin reads it with", () => {
    const derived = dashboardHeaderChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...dashboardHeaderChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [normalise(value)] });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of dashboardHeaderChromeDeriver.produces) {
      expect(channel.startsWith("--ds-dashboard-header-")).toBe(true);
    }
  });

  it("repairs every unproduced name the skin used to read, in the family namespace", () => {
    for (const retired of [
      "--ds-dashboard-metric-bg",
      "--ds-dashboard-metric-border",
      "--ds-dashboard-metric-icon-color",
      "--ds-dashboard-metric-radius",
    ]) {
      expect(SKIN).not.toContain(retired);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(dashboardHeaderChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: dashboardHeaderChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [dashboardHeaderChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});

/* ---- the depth causality arm: `surfaces.borderStyle` reaches the rule ---- */

const BORDER_ROLE = "--ds-edge-hairline-width";
const RULE = "--ds-dashboard-header-rule";
const ROLE_CHAIN = `var(${BORDER_ROLE})`;
const BARE_THEME: FlatTheme = { id: "minimal", name: "Minimal" };

const ruleContext = (theme: FlatTheme) => buildLoweringContext({ theme });

function roleWidth(theme: FlatTheme): string | undefined {
  const { channels } = runDerivation(ruleContext(theme), [
    expressiveDeriver,
    elevationDeriver,
    dashboardHeaderChromeDeriver,
  ]);
  expect(channels[RULE], "the rule reads the role, not a width").toBe(ROLE_CHAIN);
  return channels[BORDER_ROLE];
}

const posture = (borderStyle: "none" | "hairline" | "strong"): FlatTheme => ({
  ...BARE_THEME,
  surfaces: { borderStyle },
});

describe("chrome/dashboard-header depth rule", () => {
  it("states the rule through the governed edge role, never a width of its own", () => {
    const derived = dashboardHeaderChromeDeriver.derive(ruleContext(BARE_THEME), {});
    expect(derived[RULE]).toBe(ROLE_CHAIN);
    expect(derived[RULE]).not.toMatch(/\d/u);
  });

  it("CAUSALITY: a border posture moves the width the rule paints", () => {
    expect(roleWidth(posture("none"))).toBe("0px");
    expect(roleWidth(posture("hairline"))).toBe("1px");
    expect(roleWidth(posture("strong"))).toBe("1px");
    expect(roleWidth(posture("none"))).not.toBe(roleWidth(posture("strong")));
  });

  it("rests byte-identical to the scale step it replaces, in every vertical", () => {
    // The retired value was `var(--ds-border-width-1, 1px)`. The hairline role
    // rests at that same 1px everywhere, which `--ds-edge-standard-width` does
    // not: bithire rests it at 1.5px.
    for (const vertical of ["rottay", "bithire", "evnto"] as const) {
      expect(roleWidth(firstPartyFixture(vertical)), vertical).toBe("1px");
    }
    expect(SKIN).toContain(`var(${RULE}, ${ROLE_CHAIN})`);
  });

  it("declares the border decision it now consumes", () => {
    expect(dashboardHeaderChromeDeriver.consumes).toContain("surfaces.borderStyle");
  });
});
