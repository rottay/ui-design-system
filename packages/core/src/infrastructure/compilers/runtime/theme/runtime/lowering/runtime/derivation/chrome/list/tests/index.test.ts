/**
 * The `list` family contract, and the one relation it states: a bordered
 * list's frame reads the governed hairline edge role, so `surfaces.borderStyle`
 * reaches it.
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
