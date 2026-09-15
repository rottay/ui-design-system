/**
 * An array leaf is compared by VALUE, which is what this owner always claimed.
 *
 * Arrays are leaves here on purpose -- `charts.categoryColors` is one value, not
 * a container of five -- but the comparison was `!==`, which answers identity
 * for them. Serializing a theme and reading it back is an ordinary thing for a
 * studio to do, and it returns a NEW array with the same elements, so an
 * untouched palette was landing in the moved patch as authorship.
 *
 * Both directions are asserted: an equal copy is carried, and a changed element
 * OR a changed order is still authored. Order is significant because a category
 * palette is a sequence -- the first colour is the first series.
 */
import { describe, expect, it } from "vitest";

import type {
  Theme,
  ThemeLayerPatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";

import { movedLeaves, movedThemePatch } from "../foundation/authorship";

const COLORS = ["#123456", "#abcdef"] as const;

/** The governed `charts` root, whose authored path unwraps to `charts.categoryColors`. */
const withCategoryColors = (colors: readonly string[]) =>
  ({ charts: { value: { categoryColors: [...colors] } } }) as unknown as Theme &
    ThemeLayerPatch;

describe("array leaves compare by value", () => {
  it("carries a deep-copied equal array: no moved leaf, nothing in the patch", () => {
    const baseline = withCategoryColors(COLORS);
    const patch = JSON.parse(JSON.stringify(baseline)) as ThemeLayerPatch;
    // The reproduction's premise: equal content, different identity.
    expect(patch).not.toBe(baseline);
    expect(movedLeaves(patch, baseline)).toEqual(new Set());
    expect(movedThemePatch(patch, baseline)).toEqual({});
  });

  it("keeps a changed element authored", () => {
    const baseline = withCategoryColors(COLORS);
    const patch = withCategoryColors(["#123456", "#fedcba"]);
    expect([...movedLeaves(patch, baseline)]).toEqual(["charts.categoryColors"]);
    expect(movedThemePatch(patch, baseline)).toEqual({
      charts: { value: { categoryColors: ["#123456", "#fedcba"] } },
    });
  });

  it("keeps a changed ORDER authored: the sequence is the value", () => {
    const baseline = withCategoryColors(COLORS);
    const patch = withCategoryColors([...COLORS].reverse());
    expect([...movedLeaves(patch, baseline)]).toEqual(["charts.categoryColors"]);
  });

  it("keeps a changed length authored in both directions", () => {
    const baseline = withCategoryColors(COLORS);
    expect([...movedLeaves(withCategoryColors(["#123456"]), baseline)]).toEqual([
      "charts.categoryColors",
    ]);
    expect(
      [...movedLeaves(withCategoryColors([...COLORS, "#000000"]), baseline)]
    ).toEqual(["charts.categoryColors"]);
  });

  it("does not confuse an array with a primitive at the same path", () => {
    const baseline = withCategoryColors(COLORS);
    const patch = { charts: { value: { categoryColors: "#123456" } } } as unknown as ThemeLayerPatch;
    expect([...movedLeaves(patch, baseline)]).toEqual(["charts.categoryColors"]);
  });

  it("leaves the primitive comparison exactly as it was", () => {
    const baseline = { surfaces: { radiusScale: 0.8 } } as unknown as Theme;
    expect(
      movedLeaves({ surfaces: { radiusScale: 0.8 } } as unknown as ThemeLayerPatch, baseline)
    ).toEqual(new Set());
    expect([
      ...movedLeaves({ surfaces: { radiusScale: 1.15 } } as unknown as ThemeLayerPatch, baseline),
    ]).toEqual(["surfaces.radiusScale"]);
  });
});
