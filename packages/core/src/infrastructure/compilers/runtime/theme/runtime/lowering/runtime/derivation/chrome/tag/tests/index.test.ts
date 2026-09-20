/**
 * The `tag` press transform rides the governed press dial: three authored
 * `surfaces.stateEmphasis` postures resolve to three different scales.
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
import { statesDeriver } from "../../../states";
import { elevationDeriver } from "../../../elevation";
import { expressiveDeriver } from "../../../expressive";
import { tagChromeDeriver } from "..";

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

describeFamilyContract(tagChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

const PRESS = "--ds-tag-press-transform";
const WIRED_CHAIN = "translateY(0) scale(var(--ds-state-press-scale))";

const context = (theme: FlatTheme) => buildLoweringContext({ theme });

/** The press scale each posture lands on the governed root, end to end. */
function pressScaleFor(emphasis: "subtle" | "medium" | "strong"): string {
  const theme: FlatTheme = { ...MINIMAL_THEME, surfaces: { stateEmphasis: emphasis } };
  const { channels } = runDerivation(context(theme), [statesDeriver, tagChromeDeriver]);
  const transform = channels[PRESS];
  const root = channels["--ds-state-press-scale"];
  expect(transform, `${emphasis}: the press transform reads the governed root`).toBe(WIRED_CHAIN);
  return transform.replace("var(--ds-state-press-scale)", root);
}

describe("chrome/tag press dial", () => {
  it("states the press transform through the governed press root, not a literal", () => {
    const derived = tagChromeDeriver.derive(context(MINIMAL_THEME), {});
    expect(derived[PRESS]).toBe(WIRED_CHAIN);
    expect(derived[PRESS]).not.toContain("0.98");
  });

  it("CAUSALITY: the three emphasis postures resolve to three distinct press scales", () => {
    const subtle = pressScaleFor("subtle");
    const medium = pressScaleFor("medium");
    const strong = pressScaleFor("strong");

    expect(subtle).toBe("translateY(0) scale(0.99)");
    expect(medium).toBe("translateY(0) scale(0.98)");
    expect(strong).toBe("translateY(0) scale(0.965)");
    expect(new Set([subtle, medium, strong]).size).toBe(3);
  });

  it("keeps the unauthored posture byte-identical to the retired literal", () => {
    expect(pressScaleFor("medium")).toBe("translateY(0) scale(0.98)");
  });

  it("leaves the skin fallback as the literal floor for a render with no artifact", () => {
    expect(SKIN).toContain(`transform: var(${PRESS}, translateY(0) scale(0.98));`);
  });

  it("declares the press decision it now consumes", () => {
    expect(tagChromeDeriver.consumes).toContain("states.press");
  });

  it("names only its own family namespace", () => {
    for (const channel of tagChromeDeriver.produces) {
      expect(channel.startsWith("--ds-tag-")).toBe(true);
    }
  });

  it("yields the press channel to a vertical or tenant statement of it", () => {
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: [PRESS],
        derive: () => ({ [PRESS]: rank }),
      };
      const result = runDerivation(context(MINIMAL_THEME), [tagChromeDeriver, stated]);
      expect(result.channels[PRESS]).toBe(rank);
      expect(result.provenance.get(PRESS)?.rank).toBe(rank);
    }
  });
});

/* ---- the depth causality arm: `surfaces.borderStyle` reaches tag's keyline ---- */

const BORDER_ROLE = "--ds-edge-hairline-width";
const KEYLINE = "--ds-tag-border-width";
const ROLE_CHAIN = `var(${BORDER_ROLE})`;
const COMPONENT_CSS = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/tag/index.css"),
  "utf8"
);

const keylineContext = (theme: FlatTheme) => buildLoweringContext({ theme });

/** The width the role lands on the root, with one posture authored or none. */
function roleWidth(theme: FlatTheme): string | undefined {
  const { channels } = runDerivation(keylineContext(theme), [
    expressiveDeriver,
    elevationDeriver,
    tagChromeDeriver,
  ]);
  expect(channels[KEYLINE], "the keyline reads the role, not a width").toBe(ROLE_CHAIN);
  return channels[BORDER_ROLE];
}

const posture = (borderStyle: "none" | "hairline" | "strong"): FlatTheme => ({
  ...MINIMAL_THEME,
  surfaces: { borderStyle },
});

describe("chrome/tag depth keyline", () => {
  it("states the keyline through the governed edge role, never a width of its own", () => {
    const derived = tagChromeDeriver.derive(keylineContext(MINIMAL_THEME), {});
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
    expect(tagChromeDeriver.consumes).toContain("surfaces.borderStyle");
  });
});

/* ---- the states causality arm: `surfaces.focusStyle` reaches the close ring ---- */

const CLOSE_RING = "--ds-tag-close-focus-ring";
const SHELL_RING = "--ds-tag-focus-ring";
const CLOSE_LITERAL = "0 0 0 2px color-mix(in srgb, currentColor 26%, transparent)";

/** The ring each posture lands on the close button, resolved through the root. */
function closeRingFor(focusStyle: "ring" | "underline" | "glow"): string {
  const theme: FlatTheme = { ...MINIMAL_THEME, surfaces: { focusStyle } };
  const { channels } = runDerivation(context(theme), [statesDeriver, tagChromeDeriver]);
  const chain = channels[CLOSE_RING];
  expect(chain, `${focusStyle}: the close ring reads the governed root`).toBe(
    `var(--ds-focus-ring, ${CLOSE_LITERAL})`
  );
  return channels["--ds-focus-ring"];
}

describe("chrome/tag close focus ring", () => {
  it("reads the governed ring first and keeps the literal as the floor", () => {
    const derived = tagChromeDeriver.derive(context(MINIMAL_THEME), {});
    expect(derived[CLOSE_RING]).toBe(`var(--ds-focus-ring, ${CLOSE_LITERAL})`);
  });

  it("states both of its rings the same way, shell and close", () => {
    const derived = tagChromeDeriver.derive(context(MINIMAL_THEME), {});
    for (const channel of [SHELL_RING, CLOSE_RING]) {
      expect(derived[channel], channel).toContain("var(--ds-focus-ring,");
    }
  });

  it("CAUSALITY: the three focus postures resolve to three distinct rings", () => {
    const ring = closeRingFor("ring");
    const underline = closeRingFor("underline");
    const glow = closeRingFor("glow");
    expect(new Set([ring, underline, glow]).size).toBe(3);
    expect(glow).toContain("0 0 12px 2px");
    expect(underline).toContain("inset");
  });

  it("MUTATION DRILL: unwiring the close ring stops the posture reaching it", () => {
    const unwired: FamilyDeriver = {
      ...tagChromeDeriver,
      family: "tag-unwired",
      derive: (ctx, input) => ({ ...tagChromeDeriver.derive(ctx, input), [CLOSE_RING]: CLOSE_LITERAL }),
    };
    const reading = (focusStyle: "ring" | "glow") => {
      const theme: FlatTheme = { ...MINIMAL_THEME, surfaces: { focusStyle } };
      return runDerivation(context(theme), [statesDeriver, unwired]).channels[CLOSE_RING];
    };
    expect(reading("ring")).toBe(CLOSE_LITERAL);
    expect(reading("glow")).toBe(reading("ring"));
  });

  it("declares the focus decision it now consumes", () => {
    expect(tagChromeDeriver.consumes).toContain("surfaces.focusStyle");
  });
});
