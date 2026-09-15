/**
 * The draft door states what the editor MOVED, not what the theme carried.
 *
 * A `FlatTheme` draft is the whole theme the studio opened, so its projection
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

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
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
  JSON.parse(JSON.stringify(firstPartyFixture(vertical))) as FlatTheme;

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

/**
 * `carriedFrom` is the EFFECTIVE baseline, not just the prune's yardstick.
 *
 * The prune was right that a leaf equal to `carriedFrom` is not authorship this
 * time, but the next station resolved the pruned patch over the VERTICAL's
 * baseline -- so a customization the tenant made on an earlier visit, and did
 * not touch on this one, was classified correctly and then thrown away: bithire
 * opened a theme dialled to 1.15 and compiled 0.8, its preset's value.
 *
 * One baseline, computed once by the ingress and handed down, answers both
 * questions. Both directions are asserted: the untouched customization survives,
 * and a leaf the editor really moved is still authorship.
 */
describe("the draft door composes over the baseline it was opened on", () => {
  /** A tenant's saved, already customized theme: the preset plus one dialled leaf. */
  const customizedBithire = () => {
    const draft = draftOf("bithire");
    draft.surfaces = { ...draft.surfaces, radiusScale: 1.15 };
    const theme = compileThemeIntent(
      draftPreviewThemeIntent({ vertical: "bithire", slug: SLUG, draft })
    ).resolution.theme;
    // The premise: the preset states 0.8 and this theme carries 1.15.
    expect(baselineFor("bithire", SLUG).surfaces.radiusScale).toBe(0.8);
    expect(theme.surfaces.radiusScale).toBe(1.15);
    return { draft, theme };
  };

  it("keeps an untouched customization in the effective theme, and out of the patch", () => {
    const { draft, theme } = customizedBithire();
    // The studio re-opens the tenant's theme and touches nothing.
    const reopened = JSON.parse(JSON.stringify(draft)) as FlatTheme;
    const intent = draftPreviewThemeIntent({
      vertical: "bithire",
      slug: SLUG,
      draft: reopened,
      carriedFrom: theme,
    });
    // Not edited this time -- so not authorship ...
    expect(intent.patch).toEqual({});
    // ... and still the tenant's value, because the resolution composes over
    // the theme it was opened on rather than over the preset.
    expect(varsOf(intent)["--ds-radius-scale"]).toBe("1.15");
  });

  it("moves the edited field and still carries the untouched customization", () => {
    const { draft, theme } = customizedBithire();
    const reopened = JSON.parse(JSON.stringify(draft)) as FlatTheme;
    // A DIFFERENT field, dialled this visit; the radius is left alone.
    reopened.surfaces = { ...reopened.surfaces, effectIntensity: 0.6 };
    const intent = draftPreviewThemeIntent({
      vertical: "bithire",
      slug: SLUG,
      draft: reopened,
      carriedFrom: theme,
    });
    const patch = intent.patch as { surfaces?: Record<string, unknown> };
    expect(Object.keys(intent.patch)).toEqual(["surfaces"]);
    expect(patch.surfaces).toEqual({ effectIntensity: 0.6 });
    const vars = varsOf(intent);
    expect(vars["--ds-effect-intensity"]).toBe("0.6");
    expect(vars["--ds-radius-scale"]).toBe("1.15");
  });

  it("without a carried baseline the draft still states its own value as authorship", () => {
    // The control that keeps the fix from becoming "always carry": a draft
    // opened on the VERTICAL still answers for the leaf it dialled.
    const { draft } = customizedBithire();
    const intent = draftPreviewThemeIntent({
      vertical: "bithire",
      slug: SLUG,
      draft: JSON.parse(JSON.stringify(draft)) as FlatTheme,
    });
    const patch = intent.patch as { surfaces?: { radiusScale?: number } };
    expect(patch.surfaces?.radiusScale).toBe(1.15);
    expect(varsOf(intent)["--ds-radius-scale"]).toBe("1.15");
  });
});
