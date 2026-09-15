import { describe, expect, it } from "vitest";

import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import { NEUTRAL_THEME } from "@/foundation/presets/neutral-theme";
import { FIRST_PARTY_VERTICALS } from "@/foundation/presets/verticals/roster";
import { baselineFor as authoredBaselineFor } from "../../../../runtime/resolution";

import { THEME_BASELINE_SOURCES, baselineFor } from "..";

describe("the baseline source", () => {
  it("is a closed set of two, and an unknown one is refused by name", () => {
    expect([...THEME_BASELINE_SOURCES]).toEqual(["brand-theme", "neutral-preset"]);
    expect(() => baselineFor("rottay", "acme", "candidate" as never)).toThrow(/unknown baseline source "candidate"/u);
  });

  it("defaults to the authored theme, byte for byte the resolver's own baseline", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      expect(baselineFor(vertical, "acme")).toEqual(authoredBaselineFor(vertical, "acme"));
      expect(baselineFor(vertical, "acme", "brand-theme")).toEqual(authoredBaselineFor(vertical, "acme"));
    }
  });

  for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
    it(`${vertical}: the neutral-preset baseline is named by the roster and decided by the preset`, () => {
      const composed = baselineFor(vertical, "acme", "neutral-preset");
      const row = FIRST_PARTY_VERTICALS[vertical];
      expect(composed.id).toBe("acme");
      expect(composed.name).toBe(row.name);
      expect(composed.appearance.defaultMode).toBe(row.defaultMode);
      expect(NEUTRAL_THEME.appearance.defaultMode).toBe("light");
      // The preset is what decided the shape; the foundation left it undecided.
      expect(composed.surfaces.radiusScale).toBeDefined();
      expect(NEUTRAL_THEME.surfaces.radiusScale).toBeUndefined();
      // A fresh graph per call, and the vertical's own slug when none is given.
      expect(baselineFor(vertical, "acme", "neutral-preset")).not.toBe(composed);
      expect(baselineFor(vertical, vertical, "neutral-preset").id).toBe(vertical);
    });
  }
});
