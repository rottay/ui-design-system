/**
 * The draft door states what the editor MOVED, not what the theme carried.
 *
 * A `BrandTheme` draft is the whole theme the studio opened, so its projection
 * carries every value the author never touched. Those values reached the tenant
 * posture floors, and a floor is read as "the tenant re-dialled this knob" --
 * which made the radius divisor come from the expressive profile instead of the
 * vertical's own explicit statement. The compile door, which has no patch,
 * divided by the vertical's value, so one preset's two radius statements ranked
 * differently on two productive doors.
 *
 * Both directions are asserted: a carried leaf must NOT reach the floors, and a
 * leaf the editor really moved must still reach them. A fix that only stopped
 * the first would have inverted the bug instead of closing it.
 */
import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import { baselineFor, compileThemeIntent } from "@/infrastructure/compilers/runtime/theme";
import {
  draftPreviewThemeIntent,
  staticThemeIntent,
} from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import { firstPartyFixture } from "@tests/support/theme-lowering";

const SLUG = "draft-carried";

const RADIUS_CHANNELS = [
  "--ds-radius-button",
  "--ds-button-xs-radius",
  "--ds-button-sm-radius",
  "--ds-button-md-radius",
  "--ds-button-lg-radius",
  "--ds-button-xl-radius",
] as const;

const varsOf = (intent: Parameters<typeof compileThemeIntent>[0]) =>
  compileThemeIntent(intent).compiled.cssVariables;

const draftOf = (vertical: (typeof FIRST_PARTY_VERTICAL_SLUGS)[number]) =>
  JSON.parse(JSON.stringify(firstPartyFixture(vertical))) as BrandTheme;

describe("the draft door carries what it did not move", () => {
  for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
    it(`${vertical}: the untouched baseline compiles identically on both doors`, () => {
      const compiled = varsOf(staticThemeIntent(vertical, SLUG));
      const drafted = varsOf(
        draftPreviewThemeIntent({ vertical, slug: SLUG, draft: draftOf(vertical) })
      );
      const names = [...new Set([...Object.keys(compiled), ...Object.keys(drafted)])];
      expect(names.filter((channel) => compiled[channel] !== drafted[channel])).toEqual([]);
    });
  }

  it("bithire: the explicit radius decision keeps the divisor its preset states", () => {
    // The preset decides `shape.radius-scale: 0.8` AND `geometry: "sharp"`,
    // whose expansion states 0.85. The explicit decision precedes the profile
    // default, so both doors divide by 0.8.
    const drafted = varsOf(
      draftPreviewThemeIntent({
        vertical: "bithire",
        slug: SLUG,
        draft: draftOf("bithire"),
      })
    );
    for (const channel of RADIUS_CHANNELS) {
      expect(drafted[channel], channel).toContain("/ 0.8 *");
    }
  });

  it("a moved leaf still reaches the tenant floors, and the expansion still sets the divisor", () => {
    // The other direction, so the fix cannot invert the bug. A radius the
    // editor really typed stays in the patch and moves `--ds-radius-scale`;
    // the button divisor still comes from the vertical's own expressive
    // geometry (0.85) rather than from the tenant's new dial, which is the
    // self-cancellation F-07 closed and this change must not reopen.
    const draft = draftOf("bithire");
    draft.surfaces = { ...draft.surfaces, radiusScale: 1.15 };
    const intent = draftPreviewThemeIntent({
      vertical: "bithire",
      slug: SLUG,
      draft,
    });
    expect(Object.keys(intent.patch)).toEqual(["surfaces"]);
    const patch = intent.patch as { surfaces?: { radiusScale?: number } };
    expect(patch.surfaces?.radiusScale).toBe(1.15);
    const drafted = varsOf(intent);
    expect(drafted["--ds-radius-scale"]).toBe("1.15");
    for (const channel of RADIUS_CHANNELS) {
      expect(drafted[channel], channel).toContain("/ 0.85 *");
    }
  });

  it("an explicitly supplied baseline is the one the patch is measured against", () => {
    // `carriedFrom` is the studio's own opened theme when it is not the
    // vertical's; the prune has to use it rather than re-deriving one.
    const draft = draftOf("bithire");
    const intent = draftPreviewThemeIntent({
      vertical: "bithire",
      slug: SLUG,
      draft,
      carriedFrom: baselineFor("bithire", SLUG),
    });
    expect(Object.keys(intent.patch)).toEqual([]);
  });
});
