import { describe, expect, it } from "vitest";

import {
  bithireBrandTheme,
  evntoBrandTheme,
  rottayBrandTheme,
} from "@/foundation/tokens/ts/presentation/brand-themes";

import { FIRST_PARTY_VERTICAL_ROSTER, FIRST_PARTY_VERTICALS } from "..";

const BRAND_THEME_BY_SLUG = {
  rottay: rottayBrandTheme,
  bithire: bithireBrandTheme,
  evnto: evntoBrandTheme,
} as const;

describe("the roster names a vertical and carries no theme", () => {
  it("has no theme field on any row", () => {
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      expect("theme" in row).toBe(false);
    }
  });

  it("agrees with the authored theme it names: id, name and default mode", () => {
    // The theme sources still carry these three facts. Until they are retired
    // the roster is the authority and the theme must restate it exactly.
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      const theme = BRAND_THEME_BY_SLUG[row.slug];
      expect(theme.id).toBe(row.themeId);
      expect(theme.name).toBe(row.name);
      expect(theme.appearance.defaultMode).toBe(row.defaultMode);
    }
  });

  it("DRILL: a row whose theme disagrees on the default mode fails the agreement", () => {
    const mutated = { ...FIRST_PARTY_VERTICALS.rottay, defaultMode: "light" as const };
    expect(() => {
      expect(BRAND_THEME_BY_SLUG.rottay.appearance.defaultMode).toBe(mutated.defaultMode);
    }).toThrow();
  });
});
