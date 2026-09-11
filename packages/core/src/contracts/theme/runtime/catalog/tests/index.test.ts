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
const DECLARED_RATIO_ROWS = [1, 11, 15, 16, 17, 22, 24, 20, 21];
// Rows 20 and 21 sat in this set under WO-DER-02, whose declared floors had
// no recorded owner decision; the K3 audit HOLD of WO-DER-02 (2026-09-08,
// WIP-02 adjudication) returned both rows to `owner-pending`. The owner's
// D1 decision (2026-09-10, kit-2026-09.md section 5b) fixes the floor at 20
// real families per control with the applicable population fixed by rule per
// control, so both rows re-enter this set as decided floors.
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
      "states.emphasis": 20,
      "states.focus-style": 20,
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

  it("has no not-yet-derived row left, and every kit row lowers", () => {
    // WO-DER-02 derived two of the ten `(new)` rows, the CC-01 connection lot
    // four more, the WO-DER-03 palette half the two palette postures, and
    // connection lot 2 the last two shape rows. The list they came from is a
    // KIT fact -- which rows the kit added -- and stays as authored; what moved
    // is the measured `effect`, and it has now moved for all ten.
    //
    // The assertion is over `effect` READ FROM THE CATALOG, not over a list
    // restated here: a row that regressed to `not-yet-derived` would name
    // itself, and a new inert row admitted later fails on the same line.
    expect(
      THEME_CONTROL_CATALOG.filter(
        (row) => (row.effect as string) === "not-yet-derived"
      ).map((row) => row.id)
    ).toEqual([]);
    for (const id of NEW_THEME_DECISION_IDS) {
      const row = themeControl(id);
      expect(row.effect, id).toBe("css-channels");
      expect(row.produces.channels.length, id).toBeGreaterThan(0);
      expect(row.keypath.document, id).not.toBeNull();
      expect(row.keypath.brandTheme, id).not.toBeNull();
    }
  });

  it("keeps every connected row at the tier the kit gave it", () => {
    // The defect CC-01 named has exactly one wrong repair: moving a Standard
    // row to Pro so a better cascade can be sold with the upgrade. The tier
    // census above counts the catalog as a whole; this states the connected
    // rows by name, so a silent promotion is red HERE rather than only in a
    // total that another row could rebalance.
    expect(
      Object.fromEntries(
        (
          [
            "typography.role-weights",
            "typography.numeric",
            "surfaces.border-style",
            "motion.character",
            "shape.nesting",
            "shape.control-height",
          ] as const
        ).map((id) => [id, themeControl(id).tier])
      )
    ).toEqual({
      "typography.role-weights": "standard",
      "typography.numeric": "pro",
      "surfaces.border-style": "standard",
      "motion.character": "pro",
      "shape.nesting": "pro",
      "shape.control-height": "standard",
    });
  });

  it("publishes responsive.posture's real emission while its consumer status stays honest (CC-02)", () => {
    const responsive = themeControl("responsive.posture");
    // The row said `data-only` with no channels after its deriver had begun
    // projecting the selected posture: catalog metadata describing a
    // pre-DER-04 output. The EMISSION is these four.
    expect(responsive.effect).toBe("css-channels");
    expect([...responsive.produces.channels].sort()).toEqual([
      "--ds-posture-container-compact-max",
      "--ds-posture-container-standard-max",
      "--ds-posture-id",
      "--ds-posture-span-bias",
    ]);
    expect(responsive.produces.rootAttributes).toHaveLength(0);
    expect(responsive.keypath.document).not.toBeNull();
    // The CONSUMER status is a separate fact and does not move with the
    // emission: no productive `--ds-posture-*` reader exists under `src`, so
    // the declared fan-out stays empty. Serializing a value as a custom
    // property is not a family adopting it, and that adoption is INV-07's.
    expect(responsive.minimumFamilies).toEqual({
      kind: "declared-fan-out",
      families: [],
    });
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
