/**
 * RA03 (WO-CAT-02 amendment): the seven expressive axes are a CLOSED domain,
 * and an out-of-domain value is refused by name at every public producer.
 *
 * Closed record KEYS were enforced; their VALUES were not. The generated
 * domain admission skips a `record` row, and the paint-path sanitizer drops
 * what it cannot read -- correct for painting, wrong at a gate, where dropping
 * tells a writer its Pro selection was accepted and then shows it the
 * baseline. Validate first, sanitize later; same vocabularies, two jobs.
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import {
  EXPRESSIVE_AXIS_VOCABULARIES,
  ExpressiveAxisDomainError,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";

import { compileThemeIntent } from "../../../facade/runtime/compile";
import {
  documentThemeIntent,
  draftPreviewThemeIntent,
  previewThemeIntent,
} from "..";

const SLUG = "expressive-acceptance";
const UNKNOWN = "__unknown_audit_value__";
const AXES = Object.keys(EXPRESSIVE_AXIS_VOCABULARIES);
const PRODUCERS = { documentThemeIntent, previewThemeIntent } as const;

const v2 = (profiles: unknown): TenantThemeDocumentV2 =>
  ({
    version: 2,
    plan: "pro",
    decisions: { "profiles.expressive": profiles },
  }) as unknown as TenantThemeDocumentV2;

const v1 = (profiles: unknown): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: "advanced",
    visualFoundation: { advanced: { profiles } },
  }) as unknown as TenantThemeDocument;

const draft = (profiles: unknown): BrandTheme =>
  ({
    id: SLUG,
    name: "Expressive acceptance",
    expressive: { schemaVersion: 1, profiles },
  }) as unknown as BrandTheme;

describe("an invalid expressive axis is refused BY NAME", () => {
  it("refuses all 7 axes x 3 verticals x 2 public document producers", () => {
    const outcomes: string[] = [];
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const axis of AXES) {
        for (const [name, produce] of Object.entries(PRODUCERS)) {
          let thrown: unknown;
          try {
            produce({ vertical, slug: SLUG, document: v2({ [axis]: UNKNOWN }) });
          } catch (error) {
            thrown = error;
          }
          expect(thrown).toBeInstanceOf(ExpressiveAxisDomainError);
          const refusal = thrown as ExpressiveAxisDomainError;
          expect(refusal.axis).toBe(axis);
          expect(refusal.value).toBe(UNKNOWN);
          expect(refusal.message).toContain(
            `$.decisions["profiles.expressive"].${axis}`
          );
          outcomes.push(`${vertical}/${axis}/${name}`);
        }
      }
    }
    expect(outcomes).toHaveLength(42);
  });

  it("refuses the same axes on the v1 document and the draft transports", () => {
    for (const axis of AXES) {
      expect(() =>
        documentThemeIntent({
          vertical: "bithire",
          slug: SLUG,
          document: v1({ [axis]: UNKNOWN }),
        })
      ).toThrow(
        new RegExp(`\\$\\.visualFoundation\\.advanced\\.profiles\\.${axis}`, "u")
      );
      expect(() =>
        draftPreviewThemeIntent({
          vertical: "bithire",
          slug: SLUG,
          draft: draft({ [axis]: UNKNOWN }),
        })
      ).toThrow(new RegExp(`\\$\\.expressive\\.profiles\\.${axis}`, "u"));
    }
  });

  it("names an axis outside the seven, rather than ignoring it", () => {
    expect(() =>
      previewThemeIntent({
        vertical: "evnto",
        slug: SLUG,
        document: v1({ nosuchaxis: "sharp" }),
      })
    ).toThrow(/unsupported axis "nosuchaxis"/u);
  });
});

describe("the refusal is not achieved by refusing everything", () => {
  it("admits every value of every axis through both producers", () => {
    let admitted = 0;
    for (const [axis, vocabulary] of Object.entries(EXPRESSIVE_AXIS_VOCABULARIES)) {
      for (const value of vocabulary) {
        for (const produce of Object.values(PRODUCERS)) {
          expect(() =>
            compileThemeIntent(
              produce({
                vertical: "bithire",
                slug: SLUG,
                document: v2({ [axis]: value }),
              })
            )
          ).not.toThrow();
          admitted += 1;
        }
      }
    }
    expect(admitted).toBe(
      Object.values(EXPRESSIVE_AXIS_VOCABULARIES).reduce(
        (total, vocabulary) => total + vocabulary.length * 2,
        0
      )
    );
  });
});
