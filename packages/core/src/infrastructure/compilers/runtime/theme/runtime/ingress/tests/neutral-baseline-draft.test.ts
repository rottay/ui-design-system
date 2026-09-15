import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { baselineFor } from "@/infrastructure/compilers/runtime/theme";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import { draftPreviewThemeIntent } from "..";

const BADGE_SHAPE_LEAF = "chrome.accent.badgeShape";

function claimFor(ledger: ReturnType<typeof draftPreviewThemeIntent>["ledger"], leaf: string) {
  return ledger?.entries.find((entry) => entry.effectiveLeaves.includes(leaf));
}

describe("a draft ledger carried from the neutral foundation + preset", () => {
  it("classifies a chrome leaf equal to the neutral baseline as carried, and one equal only to the authored theme as authored", () => {
    const neutral = baselineFor("bithire", "acme", "neutral-preset");
    const authored = FIRST_PARTY_THEMES.bithire;
    const neutralShape = neutral.chrome.accent?.badgeShape;
    const authoredShape = authored.chrome.accent?.badgeShape;
    // The measurement only means something where the two baselines disagree.
    expect(authoredShape).toBeDefined();
    expect(neutralShape).not.toBe(authoredShape);

    const draft = {
      id: "acme",
      name: "Acme",
      chrome: { accent: { badgeShape: authoredShape } },
    } as unknown as BrandTheme;

    const overAuthored = draftPreviewThemeIntent({ vertical: "bithire", slug: "acme", draft });
    const overNeutral = draftPreviewThemeIntent({
      vertical: "bithire",
      slug: "acme",
      draft,
      carriedFrom: neutral,
    });
    expect(claimFor(overAuthored.ledger, BADGE_SHAPE_LEAF)?.provenance).toBe("preset-inherited");
    expect(claimFor(overNeutral.ledger, BADGE_SHAPE_LEAF)?.provenance).toBe("direct-override");
  });

  it("leaves the default draft path on the authored theme", () => {
    const draft = { id: "acme", name: "Acme", chrome: { accent: { badgeShape: "square" } } } as unknown as BrandTheme;
    const intent = draftPreviewThemeIntent({ vertical: "bithire", slug: "acme", draft });
    expect(intent.origin).toBe("preview");
    expect(claimFor(intent.ledger, BADGE_SHAPE_LEAF)?.provenance).toBe("direct-override");
  });
});
