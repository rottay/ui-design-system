/**
 * RT04 (WO-CAT-03 amendment): the caps a tenant's own chrome values answer to
 * bind at EVERY public tenant-authored producer, not only at V1 publication.
 *
 * `9999px` on a card radius passed the v1 document, v2 document, preview and
 * draft doors and was then refused at publish. A preview that paints what
 * publish refuses is the most expensive kind of wrong, so the same grammar and
 * the same ceilings now run at the door -- reported at the ORIGINAL transport
 * path, which for the v1 document is the exact path publication already names.
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import { getTenantThemeVerticalEnvelope } from "@/contracts/theme/runtime/envelopes";
import {
  compileTenantThemeConfig,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";

import { ThemeAdmissionError } from "../../../facade/foundation/admission";
import { compileThemeIntent } from "../../../facade/runtime/compile";
import {
  documentThemeIntent,
  draftPreviewThemeIntent,
  previewThemeIntent,
} from "..";

const SLUG = "authored-caps-acceptance";

/** The five authored-cap fixtures of the re-audit, verbatim. */
const CAP_FIXTURES = [
  ["radius", "9999px"],
  ["padding", "9999px"],
  ["bodyPadding", "9999px"],
  ["shadow", "0 0 9999px #000"],
  [
    "shadow",
    "0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000",
  ],
] as const;

const chromeOf = (field: string, value: string) => ({
  cardComponent: { [field]: value },
});

const v2Document = (chrome: object): TenantThemeDocumentV2 =>
  ({ version: 2, plan: "pro", decisions: {}, overrides: { chrome } }) as unknown as TenantThemeDocumentV2;

const v1Document = (chrome: object): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: "advanced",
    visualFoundation: { advanced: { chrome } },
  }) as unknown as TenantThemeDocument;

const draftOf = (chrome: object): BrandTheme =>
  ({ id: SLUG, name: "Authored caps", chrome }) as unknown as BrandTheme;

function refusal(run: () => unknown): ThemeAdmissionError {
  try {
    run();
  } catch (error) {
    if (error instanceof ThemeAdmissionError) return error;
    throw error;
  }
  throw new Error("the door admitted a value past the authored caps");
}

function publish(document: TenantThemeDocument, vertical: string): unknown {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(document, {
      tenantId: "authored-caps",
      slug: SLUG,
      verticalKey: vertical,
      rowVersion: 1,
    } as never),
    { verticalEnvelope: getTenantThemeVerticalEnvelope(vertical as never) }
  );
}

describe("authored chrome caps bind at every public producer", () => {
  it("refuses the 5 cap fixtures x 3 verticals on the v2 document and its preview", () => {
    const outcomes: string[] = [];
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const [field, value] of CAP_FIXTURES) {
        const document = v2Document(chromeOf(field, value));
        for (const produce of [documentThemeIntent, previewThemeIntent]) {
          const error = refusal(() =>
            compileThemeIntent(produce({ vertical, slug: SLUG, document }))
          );
          expect(error.issues[0].code).toBe("unsafe_value");
          expect(error.issues[0].path).toBe(
            `$.overrides.chrome.cardComponent.${field}`
          );
        }
        outcomes.push(`${vertical}/${field}/${value}`);
      }
    }
    expect(outcomes).toHaveLength(15);
  });

  it("refuses them on the v1 document at the path publication already names", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const [field, value] of CAP_FIXTURES) {
        const document = v1Document(chromeOf(field, value));
        const error = refusal(() =>
          compileThemeIntent(
            documentThemeIntent({ vertical, slug: SLUG, document })
          )
        );
        expect(error.issues[0]).toMatchObject({
          code: "unsafe_value",
          path: `$.visualFoundation.advanced.chrome.cardComponent.${field}`,
        });
        // The publication terminal refuses the same document, with the same
        // code at the same path: one document, one answer.
        expect(() => publish(document, vertical)).toThrow(
          /Invalid or unsafe visual-value|unsafe/u
        );
      }
    }
  });

  it("refuses them on the BrandTheme draft, at the draft's own keypath", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const [field, value] of CAP_FIXTURES) {
        const error = refusal(() =>
          compileThemeIntent(
            draftPreviewThemeIntent({
              vertical,
              slug: SLUG,
              draft: draftOf(chromeOf(field, value)),
            })
          )
        );
        expect(error.issues[0]).toMatchObject({
          code: "unsafe_value",
          path: `$.chrome.cardComponent.${field}`,
        });
      }
    }
  });

  it("refuses a url()-bearing background and the `initial` reset everywhere", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const value of ["url(https://invalid.example/x)", "initial"]) {
        expect(() =>
          compileThemeIntent(
            previewThemeIntent({
              vertical,
              slug: SLUG,
              document: v2Document(chromeOf("bg", value)),
            })
          )
        ).toThrow(ThemeAdmissionError);
      }
    }
  });
});

describe("the caps measure AUTHORSHIP, not what the compiler derived from it", () => {
  it("admits the valid control on every transport", () => {
    const chrome = chromeOf("radius", "var(--ds-radius-lg)");
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      expect(() =>
        compileThemeIntent(
          documentThemeIntent({ vertical, slug: SLUG, document: v2Document(chrome) })
        )
      ).not.toThrow();
      expect(() =>
        compileThemeIntent(
          documentThemeIntent({ vertical, slug: SLUG, document: v1Document(chrome) })
        )
      ).not.toThrow();
      expect(() =>
        compileThemeIntent(
          draftPreviewThemeIntent({ vertical, slug: SLUG, draft: draftOf(chrome) })
        )
      ).not.toThrow();
    }
  });

  it("does not measure a Standard decision's own expansion against a tenant cap", () => {
    // `shape.button-style: pill` lowers to a 9999px control radius. That is the
    // authorized propagation of a Standard decision, not authored chrome, and
    // refusing it would make the plan limit where an edit may LAND.
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      expect(() =>
        compileThemeIntent(
          documentThemeIntent({
            vertical,
            slug: SLUG,
            document: {
              version: 2,
              plan: "standard",
              decisions: { "shape.button-style": "pill" },
            } as unknown as TenantThemeDocumentV2,
          })
        )
      ).not.toThrow();
    }
  });

  it("measures a DRAFT's own control radius, which no ledger derived", () => {
    // The exemption follows the derivation, not the keypath. A draft records no
    // ledger, so `chrome.controls.buttonGeometry.radius` is what its author
    // typed -- and typing it is not selecting `shape.button-style`.
    const draft = draftOf({
      controls: { buttonGeometry: { radius: "99999px" } },
    });
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      const error = refusal(() =>
        compileThemeIntent(draftPreviewThemeIntent({ vertical, slug: SLUG, draft }))
      );
      expect(error.issues[0]).toMatchObject({
        code: "unsafe_value",
        path: "$.chrome.controls.buttonGeometry.radius",
      });
    }
  });

  it("refuses a document that authors the same radius, at its own path", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      const error = refusal(() =>
        compileThemeIntent(
          documentThemeIntent({
            vertical,
            slug: SLUG,
            document: v2Document({
              controls: { buttonGeometry: { radius: "99999px" } },
            }),
          })
        )
      );
      expect(error.issues[0]).toMatchObject({
        code: "unsafe_value",
        path: "$.overrides.chrome.controls.buttonGeometry.radius",
      });
    }
  });
});
