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

/** The bounded domains of the controls, verbatim from their catalog rows. */
const BUTTON_STYLES = ["sharp", "soft", "pill"] as const;
const NESTING_LAWS = ["concentric", "uniform"] as const;
const CONTROL_HEIGHTS = ["compact", "standard", "tall"] as const;

/** The channels each row DECLARES, so a partial reach is a failure here. */
const NESTING_CHANNELS = [
  "--ds-radius-nest-inset",
  "--ds-radius-nest-ratio",
] as const;
const CONTROL_HEIGHT_CHANNELS = ["--ds-control-height-scale"] as const;

const SLUG = "transport-parity";

function staticArm(vertical: FirstPartyVerticalId, draft: BrandTheme) {
  return compileThemeIntent(
    draftPreviewThemeIntent({ vertical, slug: SLUG, draft })
  ).compiled;
}

/**
 * The plan is an ENTITLEMENT, not a value. It is a parameter because a Pro row
 * is refused by name on a `standard` document -- which is the door working, not
 * a transport difference -- and because a plan that changed what a Standard row
 * compiles to would show up as the two arms of the same row disagreeing.
 */
function documentArm(
  vertical: FirstPartyVerticalId,
  decisions: object,
  plan: "standard" | "pro" = "standard"
) {
  return compileThemeIntent(
    documentThemeIntent({
      vertical,
      slug: SLUG,
      document: { version: 2, plan, decisions } as never,
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

describe("theme-transport-parity: shape.nesting", () => {
  for (const vertical of VERTICALS) {
    it(`${vertical}: an unauthored theme carries neither operand of the law`, () => {
      const baseline = documentArm(vertical, {}, "pro");
      for (const channel of NESTING_CHANNELS) {
        expect(baseline.cssVariables[channel]).toBeUndefined();
      }
    });

    for (const nesting of NESTING_LAWS) {
      it(`${vertical}/${nesting}: the static draft and the document compile to the same block`, () => {
        const fromDraft = staticArm(vertical, {
          id: SLUG,
          name: SLUG,
          surfaces: { nesting },
        } as unknown as BrandTheme);
        const fromDocument = documentArm(vertical, { "shape.nesting": nesting }, "pro");
        expect(fromDraft.cssVariables).toEqual(fromDocument.cssVariables);
        expect(fromDraft.modeBlocks).toEqual(fromDocument.modeBlocks);
      });

      it(`${vertical}/${nesting}: the law reaches BOTH declared operands on both doors`, () => {
        const baseline = documentArm(vertical, {}, "pro");
        const fromDocument = documentArm(vertical, { "shape.nesting": nesting }, "pro");
        const moved = NESTING_CHANNELS.filter(
          (channel) =>
            fromDocument.cssVariables[channel] !== baseline.cssVariables[channel]
        );
        expect(moved).toEqual([...NESTING_CHANNELS]);
      });
    }

    it(`${vertical}: uniform collapses the inset that concentric states`, () => {
      const concentric = documentArm(
        vertical,
        { "shape.nesting": "concentric" },
        "pro"
      );
      const uniform = documentArm(vertical, { "shape.nesting": "uniform" }, "pro");
      // `max(0, parent - min(padding, max(inset, parent * ratio)))` with both
      // operands at zero IS the parent corner; that is what makes `uniform`
      // expressible at all, rather than merely a smaller step-down.
      expect(uniform.cssVariables["--ds-radius-nest-inset"]).toBe("0px");
      expect(uniform.cssVariables["--ds-radius-nest-ratio"]).toBe("0");
      expect(concentric.cssVariables["--ds-radius-nest-inset"]).not.toBe("0px");
      expect(concentric.cssVariables["--ds-radius-nest-ratio"]).not.toBe("0");
    });
  }
});

describe("theme-transport-parity: shape.control-height", () => {
  for (const vertical of VERTICALS) {
    it(`${vertical}: an unauthored theme carries no height factor`, () => {
      const baseline = documentArm(vertical, {});
      expect(baseline.cssVariables["--ds-control-height-scale"]).toBeUndefined();
    });

    for (const controlHeight of CONTROL_HEIGHTS) {
      it(`${vertical}/${controlHeight}: the static draft and the document compile to the same block`, () => {
        const fromDraft = staticArm(vertical, {
          id: SLUG,
          name: SLUG,
          surfaces: { controlHeight },
        } as unknown as BrandTheme);
        const fromDocument = documentArm(vertical, {
          "shape.control-height": controlHeight,
        });
        expect(fromDraft.cssVariables).toEqual(fromDocument.cssVariables);
        expect(fromDraft.modeBlocks).toEqual(fromDocument.modeBlocks);
      });

      it(`${vertical}/${controlHeight}: the posture reaches its declared channel on both doors`, () => {
        const baseline = documentArm(vertical, {});
        const fromDocument = documentArm(vertical, {
          "shape.control-height": controlHeight,
        });
        const moved = CONTROL_HEIGHT_CHANNELS.filter(
          (channel) =>
            fromDocument.cssVariables[channel] !== baseline.cssVariables[channel]
        );
        expect(moved).toEqual([...CONTROL_HEIGHT_CHANNELS]);
      });
    }

    it(`${vertical}: the three postures are three different factors, ordered`, () => {
      const factor = (value: (typeof CONTROL_HEIGHTS)[number]) =>
        Number(
          documentArm(vertical, { "shape.control-height": value }).cssVariables[
            "--ds-control-height-scale"
          ]
        );
      // `standard` is the IDENTITY, not a fourth value: a tenant naming it back
      // after a vertical baseline moved must land on the resting ladder.
      expect(factor("standard")).toBe(1);
      expect(factor("compact")).toBeLessThan(factor("standard"));
      expect(factor("tall")).toBeGreaterThan(factor("standard"));
    });
  }
});
