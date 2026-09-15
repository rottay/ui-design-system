import { describe, expect, it } from "vitest";

import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import { isGovernedActive } from "@/foundation/contracts/composition/tenants/themes/iso";
import { FIRST_PARTY_VERTICALS } from "@/foundation/presets/verticals/roster";
import { baselineFor } from "@/infrastructure/compilers/runtime/theme";

import { NEUTRAL_THEME, NEUTRAL_THEME_ID, NEUTRAL_THEME_NAME } from "..";

const CHROMATIC = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|color-mix\(/iu;

function leaves(value: unknown, trail: string[] = [], out: Array<[string, unknown]> = []): Array<[string, unknown]> {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) leaves(child, [...trail, key], out);
  } else {
    out.push([trail.join("."), value]);
  }
  return out;
}

describe("the neutral foundation", () => {
  it("is a total Theme whose every visual leaf is undecided", () => {
    expect(NEUTRAL_THEME.id).toBe(NEUTRAL_THEME_ID);
    expect(NEUTRAL_THEME.name).toBe(NEUTRAL_THEME_NAME);
    expect(NEUTRAL_THEME.appearance.defaultMode).toBe("light");
    const decided = leaves(NEUTRAL_THEME)
      .filter(([path]) => !/^(id|name|appearance\.defaultMode|capabilities\.)/u.test(path))
      .filter(([, value]) => value !== undefined);
    expect(decided).toEqual([]);
  });

  it("carries the structure of every family and no colour of its own", () => {
    for (const family of ["palette", "typography", "surfaces", "chrome", "modes"] as const) {
      expect(typeof NEUTRAL_THEME[family]).toBe("object");
    }
    expect(Object.keys(NEUTRAL_THEME.modes)).toEqual(["light", "dark"]);
    expect(isGovernedActive(NEUTRAL_THEME.motion)).toBe(true);
    expect(isGovernedActive(NEUTRAL_THEME.charts)).toBe(true);
    expect(isGovernedActive(NEUTRAL_THEME.recipes)).toBe(true);
    expect(isGovernedActive(NEUTRAL_THEME.expressive)).toBe(true);
    expect(isGovernedActive(NEUTRAL_THEME.responsive)).toBe(true);
    expect(CHROMATIC.test(JSON.stringify(NEUTRAL_THEME))).toBe(false);
  });

  it("is frozen all the way down", () => {
    expect(Object.isFrozen(NEUTRAL_THEME)).toBe(true);
    expect(Object.isFrozen(NEUTRAL_THEME.palette)).toBe(true);
    expect(Object.isFrozen(NEUTRAL_THEME.modes.dark)).toBe(true);
  });

  for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
    it(`${vertical}: composes with its preset into a baseline the roster names`, () => {
      const composed = baselineFor(vertical, "acme", "neutral-preset");
      expect(composed.id).toBe("acme");
      expect(composed.name).toBe(FIRST_PARTY_VERTICALS[vertical].name);
      expect(composed.appearance.defaultMode).toBe(FIRST_PARTY_VERTICALS[vertical].defaultMode);
      // The preset decided something the foundation left undecided.
      expect(composed.surfaces.radiusScale).not.toBeUndefined();
      // A fresh clone per request: nothing shared with the foundation or a previous call.
      expect(baselineFor(vertical, "acme", "neutral-preset")).not.toBe(composed);
      expect(NEUTRAL_THEME.surfaces.radiusScale).toBeUndefined();
    });
  }
});
