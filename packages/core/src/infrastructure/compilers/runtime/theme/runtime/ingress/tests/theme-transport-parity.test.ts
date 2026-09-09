/**
 * `theme-transport-parity` — one decision, two transports, one compiled block.
 *
 * F-08 measured the opposite: `shape.button-style` moved one channel through a
 * static `BrandTheme` draft and six through a document, because the DB ingress
 * expanded the silhouette into a `chrome.controls.buttonGeometry` leaf of its
 * own before the lowering ever saw it. A derivation that lives in one
 * transport's ingress is a derivation the other transport does not have.
 *
 * The two doors compared here are the two a tenant actually reaches:
 * `draftPreviewThemeIntent` (a `BrandTheme` draft, the authoring surfaces' own
 * shape) and `documentThemeIntent` (a persisted v2 document). Both resolve with
 * tenant authorship, so the comparison is transport against transport rather
 * than tenant against vertical.
 *
 * The assertion is EQUAL BYTES on `cssVariables` and `modeBlocks`, not "both
 * non-empty": the defect this closes was two non-empty answers.
 */
import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { compileThemeIntent } from "../../../facade/runtime/compile";
import { documentThemeIntent } from "../presentation/document";
import { draftPreviewThemeIntent } from "../presentation/preview";

const VERTICALS: readonly FirstPartyVerticalId[] = ["rottay", "bithire", "evnto"];

/** The bounded domain of the control, verbatim from the catalog row. */
const BUTTON_STYLES = ["sharp", "soft", "pill"] as const;

const SLUG = "transport-parity";

function staticArm(vertical: FirstPartyVerticalId, draft: BrandTheme) {
  return compileThemeIntent(
    draftPreviewThemeIntent({ vertical, slug: SLUG, draft })
  ).compiled;
}

function documentArm(vertical: FirstPartyVerticalId, decisions: object) {
  return compileThemeIntent(
    documentThemeIntent({
      vertical,
      slug: SLUG,
      document: { version: 2, plan: "standard", decisions } as never,
    })
  ).compiled;
}

describe("theme-transport-parity: shape.button-style", () => {
  for (const vertical of VERTICALS) {
    for (const buttonStyle of BUTTON_STYLES) {
      it(`${vertical}/${buttonStyle}: the static draft and the document compile to the same block`, () => {
        const fromDraft = staticArm(vertical, {
          id: SLUG,
          name: SLUG,
          surfaces: { buttonStyle },
        } as unknown as BrandTheme);
        const fromDocument = documentArm(vertical, {
          "shape.button-style": buttonStyle,
        });
        expect(fromDraft.cssVariables).toEqual(fromDocument.cssVariables);
        expect(fromDraft.modeBlocks).toEqual(fromDocument.modeBlocks);
      });

      it(`${vertical}/${buttonStyle}: the silhouette reaches the same six channels on both doors`, () => {
        const channels = [
          "--ds-radius-button",
          "--ds-button-xs-radius",
          "--ds-button-sm-radius",
          "--ds-button-md-radius",
          "--ds-button-lg-radius",
          "--ds-button-xl-radius",
        ] as const;
        const fromDocument = documentArm(vertical, {
          "shape.button-style": buttonStyle,
        });
        const baseline = documentArm(vertical, {});
        const moved = channels.filter(
          (channel) =>
            fromDocument.cssVariables[channel] !== baseline.cssVariables[channel]
        );
        expect(moved).toEqual([...channels]);
      });
    }
  }
});
