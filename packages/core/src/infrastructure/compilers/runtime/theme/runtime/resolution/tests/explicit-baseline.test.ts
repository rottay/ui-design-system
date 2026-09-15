import { describe, expect, it } from "vitest";

import { staticThemeIntent } from "../../ingress";
import { NEUTRAL_THEME } from "@/foundation/presets/neutral-theme";

import { baselineFor, resolveTheme } from "..";

describe("resolveTheme over a baseline the caller supplies", () => {
  it("labels the supplied baseline with the intent's slug and never shares its graph", () => {
    const supplied = { ...NEUTRAL_THEME, id: "neutral" };
    const resolution = resolveTheme(staticThemeIntent("rottay", "acme"), { baseline: supplied });
    expect(resolution.theme.id).toBe("acme");
    expect(resolution.theme.palette).not.toBe(supplied.palette);
    expect(resolution.theme.palette).toEqual(supplied.palette);
  });

  it("keeps the authored baseline when none is supplied", () => {
    const resolution = resolveTheme(staticThemeIntent("bithire", "acme"));
    expect(resolution.theme).toEqual(baselineFor("bithire", "acme"));
  });

  it("refuses a supplied baseline that is not a Theme", () => {
    expect(() =>
      resolveTheme(staticThemeIntent("rottay", "acme"), { baseline: { id: "x" } as never })
    ).toThrow(/baseline declares no visual family/u);
  });
});
