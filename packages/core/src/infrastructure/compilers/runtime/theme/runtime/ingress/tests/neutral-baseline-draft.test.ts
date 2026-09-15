import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { baselineFor } from "@/infrastructure/compilers/runtime/theme";

import { draftPreviewThemeIntent } from "..";

const BADGE_SHAPE_LEAF = "chrome.accent.badgeShape";

function claimFor(ledger: ReturnType<typeof draftPreviewThemeIntent>["ledger"], leaf: string) {
  return ledger?.entries.find((entry) => entry.effectiveLeaves.includes(leaf));
}

describe("a draft ledger carried from the neutral foundation + preset", () => {
  /**
   * D6-2c-ii (2026-09-15): the contrast this test was built on -- the authored
   * first-party theme against the neutral baseline -- is exactly what the lot
   * retired, and the two are now one object, so no leaf can disagree between
   * them. The LAW is untouched and is re-anchored on what actually decides it:
   * a leaf equal to the theme it was CARRIED FROM is inherited, a leaf that
   * differs is the tenant's own. The carried theme states the leaf explicitly
   * rather than borrowing a value some preset happens to author, so the test
   * no longer depends on preset content at all.
   *
   * Measured: the neutral + preset baseline defines only five chrome leaves and
   * `chrome.accent.badgeShape` is not one of them, which is why the default
   * carry classifies the same draft as `direct-override` below.
   */
  it("classifies a chrome leaf equal to the theme it was carried from as inherited, and one that differs as the tenant's own", () => {
    const base = baselineFor("bithire", "acme");
    const carriedFrom = {
      ...base,
      chrome: {
        ...base.chrome,
        accent: { ...(base.chrome?.accent ?? {}), badgeShape: "rounded" },
      },
    } as typeof base;

    const draftOf = (badgeShape: string) =>
      ({
        id: "acme",
        name: "Acme",
        chrome: { accent: { badgeShape } },
      }) as unknown as FlatTheme;

    const inherited = draftPreviewThemeIntent({
      vertical: "bithire",
      slug: "acme",
      draft: draftOf("rounded"),
      carriedFrom,
    });
    const overridden = draftPreviewThemeIntent({
      vertical: "bithire",
      slug: "acme",
      draft: draftOf("square"),
      carriedFrom,
    });
    expect(claimFor(inherited.ledger, BADGE_SHAPE_LEAF)?.provenance).toBe("preset-inherited");
    expect(claimFor(overridden.ledger, BADGE_SHAPE_LEAF)?.provenance).toBe("direct-override");

    // The default carry is the neutral foundation + preset, which states no
    // badge shape, so the very same draft is the tenant's own decision there.
    expect(base.chrome.accent?.badgeShape).toBeUndefined();
    const overDefault = draftPreviewThemeIntent({
      vertical: "bithire",
      slug: "acme",
      draft: draftOf("rounded"),
    });
    expect(claimFor(overDefault.ledger, BADGE_SHAPE_LEAF)?.provenance).toBe("direct-override");
  });

  it("leaves the default draft path on the authored theme", () => {
    const draft = { id: "acme", name: "Acme", chrome: { accent: { badgeShape: "square" } } } as unknown as FlatTheme;
    const intent = draftPreviewThemeIntent({ vertical: "bithire", slug: "acme", draft });
    expect(intent.origin).toBe("preview");
    expect(claimFor(intent.ledger, BADGE_SHAPE_LEAF)?.provenance).toBe("direct-override");
  });
});
