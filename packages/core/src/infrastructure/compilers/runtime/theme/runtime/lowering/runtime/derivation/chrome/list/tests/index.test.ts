/**
 * List's family contract, bordered-frame keyline and header title role weight.
 * The header follows the section-title role; item meta titles stay medium.
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
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { elevationDeriver } from "../../../elevation";
import { expressiveDeriver } from "../../../expressive";
import { typographyDeriver } from "../../../typography";
import { listChromeDeriver } from "..";

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

describeFamilyContract(listChromeDeriver, FIXTURES);

/* ---- the depth causality arm: `surfaces.borderStyle` reaches list's keyline ---- */

const BORDER_ROLE = "--ds-edge-hairline-width";
const KEYLINE = "--ds-list-border-width";
const ROLE_CHAIN = `var(${BORDER_ROLE})`;
const COMPONENT_CSS = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/list/index.css"),
  "utf8"
);

const keylineContext = (theme: FlatTheme) => buildLoweringContext({ theme });

/** The width the role lands on the root, with one posture authored or none. */
function roleWidth(theme: FlatTheme): string | undefined {
  const { channels } = runDerivation(keylineContext(theme), [
    expressiveDeriver,
    elevationDeriver,
    listChromeDeriver,
  ]);
  expect(channels[KEYLINE], "the keyline reads the role, not a width").toBe(ROLE_CHAIN);
  return channels[BORDER_ROLE];
}

const posture = (borderStyle: "none" | "hairline" | "strong"): FlatTheme => ({
  ...MINIMAL_THEME,
  surfaces: { borderStyle },
});

describe("chrome/list depth keyline", () => {
  it("states the keyline through the governed edge role, never a width of its own", () => {
    const derived = listChromeDeriver.derive(keylineContext(MINIMAL_THEME), {});
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
    expect(listChromeDeriver.consumes).toContain("surfaces.borderStyle");
  });
});

const HEADER_WEIGHT = "--ds-list-header-font-weight";
const META_WEIGHT = "--ds-list-meta-title-font-weight";
const HEADER_CHAIN =
  "var(--ds-type-section-title-font-weight, var(--ds-font-weight-semibold, 600))";
const WEIGHT_POSTURES = [
  { roleWeights: "light", expected: "500" },
  { roleWeights: "regular", expected: "600" },
  { roleWeights: "strong", expected: "700" },
] as const;
const TITLE_FONT_SIZES = ["1rem", "2rem"];
const AUTHORED_TITLE_WEIGHTS = [300, 800];

/** Read one authored declaration; duplicate declarations fail the guard. */
function componentWeight(channel: string): string | undefined {
  const declarations = [...COMPONENT_CSS.matchAll(new RegExp(`${channel}:\\s*([^;]+);`, "gu"))];
  expect(declarations).toHaveLength(1);
  return declarations.at(0)?.at(1)?.trim();
}

/** Resolve only weight references for this static guard, without simulating a browser. */
function resolveWeight(
  value: string | undefined,
  channels: Record<string, string>,
  depth = 0
): string {
  if (value === undefined || depth > 8) throw new Error("Missing or cyclic weight reference");
  const reference = /^var\((--ds-[a-z0-9-]+)(?:,\s*(.*))?\)$/u.exec(value);
  if (reference === null) return value;
  const [, channel, fallback] = reference;
  if (channel === undefined) throw new Error("Missing weight channel");
  return resolveWeight(Reflect.get(channels, channel) ?? fallback, channels, depth + 1);
}

describe("chrome/list header title role weight (static guard)", () => {
  it("reads section-title before semibold and preserves the meta title declaration", () => {
    expect(componentWeight(HEADER_WEIGHT)).toBe(HEADER_CHAIN);
    expect(componentWeight(META_WEIGHT)).toBe("var(--ds-font-weight-medium, 500)");
  });

  it.each(WEIGHT_POSTURES)("follows $roleWeights independently of section-title font-size", ({ roleWeights, expected }) => {
    for (const fontSize of TITLE_FONT_SIZES) {
      const theme: FlatTheme = {
        ...MINIMAL_THEME,
        typography: { roleWeights, roles: { sectionTitle: { fontSize } } },
      };
      const { channels } = runDerivation(keylineContext(theme), [typographyDeriver, listChromeDeriver]);
      expect(Reflect.get(channels, "--ds-type-section-title-font-size")).toBe(fontSize);
      expect(Reflect.get(channels, "--ds-type-section-title-font-weight")).toBe(expected);
      expect(resolveWeight(componentWeight(HEADER_WEIGHT), channels)).toBe(expected);
      expect(resolveWeight(componentWeight(META_WEIGHT), channels)).toBe("500");
      expect(listChromeDeriver.derive(keylineContext(theme), {}))
        .toEqual(listChromeDeriver.derive(keylineContext(MINIMAL_THEME), {}));
    }
  });

  it.each(WEIGHT_POSTURES)("honors authored section-title weight above $roleWeights and label weight", ({ roleWeights }) => {
    for (const fontWeight of AUTHORED_TITLE_WEIGHTS) {
      const theme: FlatTheme = {
        ...MINIMAL_THEME,
        typography: {
          roleWeights,
          roles: { sectionTitle: { fontWeight }, label: { fontWeight: 900 } },
        },
      };
      const { channels } = runDerivation(keylineContext(theme), [typographyDeriver, listChromeDeriver]);
      expect(Reflect.get(channels, "--ds-type-label-font-weight")).toBe("900");
      expect(Reflect.get(channels, "--ds-type-section-title-font-weight")).toBe(String(fontWeight));
      expect(resolveWeight(componentWeight(HEADER_WEIGHT), channels)).toBe(String(fontWeight));
      expect(resolveWeight(componentWeight(META_WEIGHT), channels)).toBe("500");
    }
  });

  it("keeps the unauthored header at 600 and the meta title at medium", () => {
    const { channels } = runDerivation(keylineContext(MINIMAL_THEME), [typographyDeriver, listChromeDeriver]);
    expect(resolveWeight(componentWeight(HEADER_WEIGHT), channels)).toBe("600");
    expect(resolveWeight(componentWeight(META_WEIGHT), channels)).toBe("500");
  });

  it("uses semibold and then literal 600 only when the section-title role is absent", () => {
    const header = componentWeight(HEADER_WEIGHT);
    expect(resolveWeight(header, {})).toBe("600");
    expect(resolveWeight(header, { "--ds-font-weight-semibold": "550" })).toBe("550");
    expect(resolveWeight(header, {
      "--ds-type-section-title-font-weight": "300",
      "--ds-font-weight-semibold": "900",
    })).toBe("300");
  });
});
