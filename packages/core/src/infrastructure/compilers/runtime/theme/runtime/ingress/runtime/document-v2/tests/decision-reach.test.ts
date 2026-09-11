/**
 * Every decision a connection lot took from unlit to lit, end to end, on all
 * three verticals.
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

/**
 * The audit's own fixtures: the two values it drove each row with.
 *
 * The first four are CC-01's. `shape.nesting` and `shape.control-height` are
 * connection lot 2's, and they are proved HERE rather than in a suite of their
 * own precisely because the defect this file exists for was uniform: a row the
 * door accepted, reported unlit, and compiled to zero channels, while every
 * sub-owner it touched stayed green.
 */
const FIXTURES = {
  "typography.role-weights": ["light", "strong"],
  "typography.numeric": ["proportional", "tabular"],
  "surfaces.border-style": ["none", "strong"],
  "motion.character": ["mechanical", "playful"],
  "shape.nesting": ["concentric", "uniform"],
  "shape.control-height": ["compact", "tall"],
} as const;

type ConnectedId = keyof typeof FIXTURES;

describe("every connected decision reaches a channel on every vertical", () => {
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
            // the row cannot buy its "lit" verdict with a side effect. Read
            // through the field's declared type: `themeControl` returns the
            // union of all 29 `as const` rows, so a single row that still
            // declares no channel narrows `includes` to `never` and the check
            // stops compiling for reasons that have nothing to do with it.
            const declared: readonly string[] = row.produces.channels;
            expect(
              changed.filter((channel) => !declared.includes(channel))
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
            // The delta is present only for a TENANT compile; asserting it
            // exists is part of the claim, not a cast around the type.
            expect(doc.delta).toBeDefined();
            expect(published.artifact.variables).toEqual(doc.delta?.variables);
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
      "shape.nesting": "pro",
      "shape.control-height": "standard",
    });
  });
});

/**
 * The keyline beside the shadow posture it once claimed to outrank.
 *
 * The probe above drives one decision at a time, which is the exact shape that
 * cannot see this: `surfaces.border-style` alone has no posture to contest. The
 * CC-01 re-audit drove both together and found the stated order inverted -- the
 * catalog row and two doc comments said the keyline outranked the
 * `--ds-elevation-border-style` an elevation posture merely implies, while the
 * merge did the opposite, because a TENANT posture is re-stated by the `tenant`
 * family and the keyline derives two ranks below it. Settled by withdrawing the
 * claim and the channel: the row owns the three WIDTHS, the posture owns the
 * style. Both halves are asserted here, against the catalog, so the row's
 * declaration and the merge can only move together.
 */
describe("surfaces.border-style beside surfaces.elevation-posture", () => {
  const ROW = themeControl("surfaces.border-style");

  /** The audit's own two cases, at the values it drove them with. */
  const CASES = [
    {
      elevation: "elevated",
      borderStyle: "strong",
      widths: {
        "--ds-edge-hairline-width": "1px",
        "--ds-edge-standard-width": "1.5px",
        "--ds-edge-emphasis-width": "2px",
      },
      impliedStyle: "none",
    },
    {
      elevation: "flat",
      borderStyle: "none",
      widths: {
        "--ds-edge-hairline-width": "0px",
        "--ds-edge-standard-width": "0px",
        "--ds-edge-emphasis-width": "1px",
      },
      impliedStyle: "solid",
    },
  ] as const;

  it("declares the three width roles, and no border style", () => {
    expect([...ROW.produces.channels]).toEqual([
      "--ds-edge-hairline-width",
      "--ds-edge-standard-width",
      "--ds-edge-emphasis-width",
    ]);
  });

  for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
    for (const { elevation, borderStyle, widths, impliedStyle } of CASES) {
      it(`${vertical}/${elevation}+${borderStyle}: the row keeps the widths, the posture keeps the style`, () => {
        const both = compiled(
          vertical,
          v2({
            "surfaces.elevation-posture": elevation,
            "surfaces.border-style": borderStyle,
          })
        );
        for (const [channel, value] of Object.entries(widths)) {
          expect(both[channel], `${vertical} ${channel}`).toBe(value);
        }
        expect(
          both["--ds-elevation-border-style"],
          `${vertical} keyline style`
        ).toBe(impliedStyle);
      });

      it(`${vertical}/${borderStyle}: alone, the row states no border style at all`, () => {
        // The withdrawal itself: without a posture beside it the row must leave
        // the channel exactly where the vertical rests, rather than winning a
        // contest it loses the moment a posture is authored.
        const alone = compiled(vertical, v2({ "surfaces.border-style": borderStyle }));
        const rest = compiled(vertical, v2({}));
        expect(alone["--ds-elevation-border-style"]).toBe(
          rest["--ds-elevation-border-style"]
        );
        expect(alone["--ds-edge-standard-width"]).toBe(
          widths["--ds-edge-standard-width"]
        );
      });
    }
  }
});
