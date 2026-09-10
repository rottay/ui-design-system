/**
 * The four decisions CC-01 found unlit, end to end, on all three verticals.
 *
 * A unit test on a sub-owner proves a table is read. It cannot prove the value
 * a TENANT wrote reaches that table: the audit's 24 cases were all accepted by
 * the door, all reported unlit, and all moved zero channels, and every sub-owner
 * involved was green throughout. So the probe here is the audit's own shape --
 * one decision at a time, through `documentThemeIntent`, `previewThemeIntent`
 * and V2 publication -- and it asserts the three facts that were false:
 * the row is LIT, the compiled block MOVES, and an out-of-domain word is still
 * refused BY NAME.
 *
 * The ledger is asserted beside the paint rather than after it. A decision that
 * moved a channel while the provenance report named someone else would be the
 * same defect this lot exists to close, one leaf lower down.
 */
import { describe, expect, it } from "vitest";

import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import { themeControl } from "@/contracts/theme/runtime/catalog";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import { compileThemeIntent } from "@/infrastructure/compilers/runtime/theme";

import { admitDocument, documentThemeIntent, previewThemeIntent } from "../../..";

const SLUG = "connection-lot";

const v2 = (decisions: Record<string, unknown>): TenantThemeDocumentV2 =>
  ({ version: 2, plan: "pro", decisions }) as TenantThemeDocumentV2;

const compiled = (
  vertical: (typeof FIRST_PARTY_VERTICAL_SLUGS)[number],
  document: TenantThemeDocumentV2
): Record<string, string> =>
  compileThemeIntent(documentThemeIntent({ vertical, slug: SLUG, document }))
    .compiled.cssVariables;

/** The audit's own fixtures: the two values it drove each row with. */
const FIXTURES = {
  "typography.role-weights": ["light", "strong"],
  "typography.numeric": ["proportional", "tabular"],
  "surfaces.border-style": ["none", "strong"],
  "motion.character": ["mechanical", "playful"],
} as const;

type ConnectedId = keyof typeof FIXTURES;

describe("the four connected decisions reach a channel on every vertical", () => {
  for (const id of Object.keys(FIXTURES) as ConnectedId[]) {
    describe(id, () => {
      const row = themeControl(id);

      it("declares a keypath on BOTH transports", () => {
        expect(row.keypath.document).not.toBeNull();
        expect(row.keypath.brandTheme).not.toBeNull();
        expect(row.effect).toBe("css-channels");
      });

      for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
        for (const value of FIXTURES[id]) {
          it(`${vertical}/${value}: is lit, and moves a channel the row declares`, () => {
            const document = v2({ [id]: value });
            const admission = admitDocument({ vertical, document });
            expect(admission.unlit).toEqual([]);
            expect(admission.decisions).toEqual([
              {
                id,
                tier: row.tier,
                lit: true,
                keypaths: [row.keypath.document],
              },
            ]);

            const base = compiled(vertical, v2({}));
            const moved = compiled(vertical, document);
            const changed = Object.keys(moved).filter(
              (channel) => moved[channel] !== base[channel]
            );
            expect(changed.length).toBeGreaterThan(0);
            // Every channel it moved is one the catalog said it produces, so
            // the row cannot buy its "lit" verdict with a side effect.
            expect(
              changed.filter(
                (channel) => !row.produces.channels.includes(channel)
              )
            ).toEqual([]);
          });

          it(`${vertical}/${value}: the ledger reports the tenant as the author`, () => {
            const { ledger } = admitDocument({ vertical, document: v2({ [id]: value }) });
            const entry = ledger.entries.find(
              (candidate) =>
                candidate.ref.kind === "decision" && candidate.ref.id === id
            );
            expect(entry?.provenance).toBe("direct-override");
            expect(entry?.tier).toBe(row.tier);
            expect(entry?.authoredValue).toBe(value);
            expect(entry?.effectiveLeaves).toEqual([row.keypath.brandTheme]);
          });

          it(`${vertical}/${value}: document, preview and publication agree`, () => {
            const document = v2({ [id]: value });
            const doc = compileThemeIntent(
              documentThemeIntent({ vertical, slug: SLUG, document })
            );
            const preview = compileThemeIntent(
              previewThemeIntent({ vertical, slug: SLUG, document })
            );
            const published = compileTenantThemeDocumentV2({
              document,
              verticalKey: vertical,
              slug: SLUG,
              tenantId: "connection-lot",
              rowVersion: 1,
            });
            expect(preview.compiled.cssVariables).toEqual(
              doc.compiled.cssVariables
            );
            expect(published.artifact.variables).toEqual(doc.delta.variables);
          });
        }

        it(`${vertical}: still refuses a word outside the domain, by name`, () => {
          const document = v2({ [id]: "__invalid__" });
          expect(() =>
            compileThemeIntent(previewThemeIntent({ vertical, slug: SLUG, document }))
          ).toThrow(new RegExp(id.replace(".", "\\.")));
          expect(() =>
            compileTenantThemeDocumentV2({
              document,
              verticalKey: vertical,
              slug: SLUG,
              tenantId: "connection-lot",
              rowVersion: 1,
            })
          ).toThrow(new RegExp(id.replace(".", "\\.")));
        });
      }
    });
  }

  it("keeps every connected row at the tier the kit gave it", () => {
    // The one wrong repair for CC-01 is selling the connection with an
    // upgrade. Asserted here as well as in the catalog's own suite, because
    // this is the file that proves the rows now paint.
    expect(
      Object.fromEntries(
        (Object.keys(FIXTURES) as ConnectedId[]).map((id) => [
          id,
          themeControl(id).tier,
        ])
      )
    ).toEqual({
      "typography.role-weights": "standard",
      "typography.numeric": "pro",
      "surfaces.border-style": "standard",
      "motion.character": "pro",
    });
  });
});
