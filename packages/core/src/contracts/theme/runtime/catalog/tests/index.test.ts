import { describe, expect, it } from "vitest";

import {
  CHROME_ANATOMY_FAMILIES,
  EXPRESSIVE_AXIS_KEYS,
  MOTION_DIAL_KEYS,
  NEW_THEME_DECISION_IDS,
  PALETTE_SEED_ROLES,
  PALETTE_STATUS_SEED_ROLES,
  THEME_DECISION_IDS,
  THEME_DECISION_TIER_BY_ID,
} from "@/contracts/theme/foundation/decisions";
import {
  THEME_CATALOG_ANNEX,
  THEME_CATALOG_RETIRED,
  THEME_CONTROL_CATALOG,
  THEME_CONTROL_IDS,
  themeControl,
  themeControlTier,
} from "..";

/**
 * The mechanical assignment of `roadmap/kit-2026-09.md` section 1, restated as
 * the test's expectation rather than read back from the catalog: a rule that
 * derives its own expectation from the subject proves nothing.
 */
const DECLARED_RATIO_ROWS = [1, 11, 15, 16, 17, 22, 24];
// Rows 20 and 21 sat in this set under WO-DER-02, whose declared floors had
// no recorded owner decision; the K3 audit HOLD of WO-DER-02 (2026-09-08,
// WIP-02 adjudication) returned both rows to `owner-pending`, with their
// family lists kept in the catalog as proposals only.
const DECLARED_FAN_OUT_ROWS = [18, 19, 25, 26, 27, 28, 29];

describe("theme control catalog", () => {
  it("is the 29 approved kit rows, in kit order, with the approved tier census", () => {
    expect(THEME_CONTROL_CATALOG).toHaveLength(29);
    expect(THEME_CONTROL_CATALOG.map((row) => row.kitRow)).toEqual(
      Array.from({ length: 29 }, (_, index) => index + 1)
    );
    expect(
      THEME_CONTROL_CATALOG.filter((row) => row.tier === "standard")
    ).toHaveLength(19);
    expect(THEME_CONTROL_CATALOG.filter((row) => row.tier === "pro")).toHaveLength(
      10
    );
  });

  it("is the single tier source and agrees with the decisions contract", () => {
    expect([...THEME_CONTROL_IDS]).toEqual([...THEME_DECISION_IDS]);
    for (const id of THEME_DECISION_IDS) {
      expect(themeControlTier(id)).toBe(THEME_DECISION_TIER_BY_ID[id]);
    }
  });

  it("assigns every minimum-families kind by the kit's mechanical rule", () => {
    for (const row of THEME_CONTROL_CATALOG) {
      const expected = DECLARED_RATIO_ROWS.includes(row.kitRow)
        ? "declared-ratio"
        : DECLARED_FAN_OUT_ROWS.includes(row.kitRow)
          ? "declared-fan-out"
          : "owner-pending";
      expect(`${row.kitRow}:${row.minimumFamilies.kind}`).toBe(
        `${row.kitRow}:${expected}`
      );
    }
  });

  it("carries the approved ratios of the seven rule-1 rows", () => {
    const ratios = Object.fromEntries(
      THEME_CONTROL_CATALOG.filter(
        (row) => row.minimumFamilies.kind === "declared-ratio"
      ).map((row) => [
        row.id,
        (row.minimumFamilies as { families: number }).families,
      ])
    );
    expect(ratios).toEqual({
      "palette.seeds": 25,
      "shape.radius-scale": 24,
      "density.mode": 24,
      "spacing.rhythm": 20,
      "surfaces.elevation-posture": 25,
      "motion.dial": 25,
      "navigation.sidebar-tone": 2,
    });
  });

  it("never promotes the kit's >= 20/25 EXAMPLE into a binding floor", () => {
    for (const row of THEME_CONTROL_CATALOG) {
      if (row.minimumFamilies.kind !== "owner-pending") continue;
      // The example is carried under a name that says it is an example, and
      // the row stays uncertifiable until an owner value is recorded.
      expect(row.minimumFamilies).toEqual({
        kind: "owner-pending",
        referenceExample: 20,
        denominator: 25,
      });
    }
  });

  it("closes every domain: no row may carry an open one", () => {
    for (const row of THEME_CONTROL_CATALOG) {
      switch (row.domain.kind) {
        case "enum":
          expect(row.domain.values.length).toBeGreaterThan(1);
          break;
        case "scale":
          expect(row.domain.bounds.min).toBeLessThan(row.domain.bounds.max);
          break;
        case "color-set":
          expect(row.domain.roles.length).toBeGreaterThan(0);
          break;
        case "record":
          expect(row.domain.keys.length).toBeGreaterThan(0);
          break;
        case "registered":
          expect(row.domain.registry).toMatch(/^[A-Z][A-Z0-9_]+$/u);
          break;
      }
    }
  });

  it("declares the D-28 (b) envelope census: 5 locked by default, 5 never lockable", () => {
    const locked = THEME_CONTROL_CATALOG.filter(
      (row) => row.envelope === "locked-by-default"
    ).map((row) => row.id);
    const never = THEME_CONTROL_CATALOG.filter(
      (row) => row.envelope === "never-lockable"
    ).map((row) => row.id);
    expect(locked).toEqual([
      "shape.nesting",
      "motion.character",
      "experience.profile",
      "recipe-profile",
    ]);
    expect(never).toEqual([
      "palette.seeds",
      "palette.status-seeds",
      "palette.dark-mode",
      "typography.families",
      "states.focus-style",
    ]);
    // The fifth locked entry is `signature.*`, which is outside the 29 and
    // therefore lives in the annex, exactly as kit section 4.1 states.
    expect(
      THEME_CATALOG_ANNEX.filter((entry) => entry.envelope === "locked-by-default")
        .map((entry) => entry.id)
    ).toEqual(["signature.accent-bar", "signature.texture"]);
  });

  it("marks the still-underived new rows as not-yet-derived and nothing else", () => {
    // WO-DER-02 derives two of the ten `(new)` rows. The list they came from
    // is a KIT fact -- which rows the kit added -- and stays as authored; what
    // moves is the measured `effect`, which is what this row asserts.
    const derivedByWoDer02: Parameters<typeof themeControl>[0][] = [
      "states.emphasis",
      "states.focus-style",
    ];
    const notDerived = THEME_CONTROL_CATALOG.filter(
      (row) => row.effect === "not-yet-derived"
    ).map((row) => row.id);
    expect([...notDerived].sort()).toEqual(
      [...NEW_THEME_DECISION_IDS]
        .filter((id) => !derivedByWoDer02.includes(id))
        .sort()
    );
    for (const id of derivedByWoDer02) {
      const row = themeControl(id);
      expect(row.effect).toBe("css-channels");
      expect(row.produces.channels.length).toBeGreaterThan(0);
      expect(row.keypath.document).not.toBeNull();
      expect(row.keypath.brandTheme).not.toBeNull();
    }
    for (const row of THEME_CONTROL_CATALOG) {
      if (row.effect !== "not-yet-derived") continue;
      expect(row.produces.channels).toHaveLength(0);
      expect(row.produces.rootAttributes).toHaveLength(0);
      expect(row.keypath.document).toBeNull();
    }
  });

  it("declares responsive.posture data-only (F-35) rather than publishing a paint it has no producer for", () => {
    const responsive = themeControl("responsive.posture");
    expect(responsive.effect).toBe("data-only");
    expect(responsive.produces.channels).toHaveLength(0);
    expect(responsive.produces.rootAttributes).toHaveLength(0);
    // A data-only row still has a real keypath: it is authored, it just paints
    // nothing. That is the distinction F-35 asked the catalog to publish.
    expect(responsive.keypath.document).not.toBeNull();
  });

  it("refuses an unknown control by name", () => {
    expect(() => themeControl("nope" as never)).toThrow(/unknown control "nope"/u);
  });

  it("names the two retired v1 controls and what replaces each", () => {
    expect(THEME_CATALOG_RETIRED.map((entry) => entry.id).sort()).toEqual([
      "chrome.families",
      "token-overrides",
    ]);
    for (const entry of THEME_CATALOG_RETIRED) {
      expect(THEME_CONTROL_IDS).not.toContain(entry.id);
      expect(entry.replacedBy.length).toBeGreaterThan(20);
    }
  });

  it("keeps the annex out of the decision denominator", () => {
    for (const entry of THEME_CATALOG_ANNEX) {
      expect(THEME_CONTROL_IDS).not.toContain(entry.id);
    }
    expect(THEME_CATALOG_ANNEX.map((entry) => entry.id)).toEqual([
      "sanctioned-overrides",
      "profiles.icon",
      "signature.accent-bar",
      "signature.texture",
    ]);
  });

  it("states each map-valued domain with the SAME keys the decisions contract closes (F-70)", () => {
    // The chrome family list had four spellings. The catalog is a literal on
    // purpose -- the gate reader parses it with the AST -- so the single origin
    // is asserted here rather than achieved by a spread that would make the row
    // invisible to every gate.
    const keysOf = (id: Parameters<typeof themeControl>[0]) => {
      const domain = themeControl(id).domain;
      return domain.kind === "record"
        ? domain.keys
        : domain.kind === "color-set"
          ? domain.roles
          : [];
    };
    expect(keysOf("chrome.anatomy")).toEqual([...CHROME_ANATOMY_FAMILIES]);
    expect(keysOf("profiles.expressive")).toEqual([...EXPRESSIVE_AXIS_KEYS]);
    expect(keysOf("motion.dial")).toEqual([...MOTION_DIAL_KEYS]);
    expect(keysOf("palette.seeds")).toEqual([...PALETTE_SEED_ROLES]);
    expect(keysOf("palette.status-seeds")).toEqual([...PALETTE_STATUS_SEED_ROLES]);
  });

  it("consumes only catalog ids: a row never names a channel as an input", () => {
    for (const row of THEME_CONTROL_CATALOG) {
      for (const input of row.consumes) {
        expect(THEME_CONTROL_IDS).toContain(input);
        expect(input).not.toMatch(/^--/u);
      }
    }
  });
});
