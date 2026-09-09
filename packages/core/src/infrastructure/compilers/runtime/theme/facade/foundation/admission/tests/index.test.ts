/**
 * One admission, every origin.
 *
 * The load-bearing assertions are the parity ones. They do not compare a
 * refusal against a hand-written expectation; they compare the refusal the
 * PREVIEW door produces against the refusal the DOCUMENT door produces, for the
 * same document, by error name and by message. F-13 is exactly the gap between
 * those two answers: preview accepted `typography.scale 100`, `radiusScale 9`,
 * `effectIntensity 5`, `notacolor` and a palette under the APCA floor that
 * publish refused, and it clamped in silence where publish threw.
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import {
  compileTenantThemeConfig,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import {
  compileThemeIntent,
  documentThemeIntent,
  draftPreviewThemeIntent,
  previewThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";

import {
  ThemeAdmissionError,
  authoredLeaves,
  decisionsAuthoredBy,
  tierIssues,
} from "..";

const VERTICAL = "bithire" as const;
const SLUG = "acme";

const document = (appearance: Record<string, unknown>): TenantThemeDocument =>
  ({ schemaVersion: 1, mode: "simple", appearance }) as unknown as TenantThemeDocument;

/** What each door does with one document: the error's NAME and its message. */
function refusal(run: () => unknown): { name: string; message: string } {
  try {
    run();
  } catch (error) {
    return {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    };
  }
  return { name: "no-refusal", message: "" };
}

const throughPreview = (doc: TenantThemeDocument) =>
  refusal(() =>
    compileThemeIntent(
      previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document: doc })
    )
  );

const throughDocument = (doc: TenantThemeDocument) =>
  refusal(() =>
    compileThemeIntent(
      documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document: doc })
    )
  );

/**
 * The five values the audit's probes P10/P11 measured as accepted by preview
 * and refused by publish. Each one must now produce ONE answer.
 */
const F13_PROBES: readonly (readonly [string, TenantThemeDocument])[] = [
  ["typography.scale 100", document({ typography: { scale: 100 } })],
  ["radiusScale 9", document({ shape: { radiusScale: 9 } })],
  ["effectIntensity 5", document({ surfaces: { effectIntensity: 5 } })],
  [
    "a palette under the APCA floor",
    document({
      palette: {
        foreground: { primary: "#BDBDBD" },
        background: "#F5F5F5",
      },
    }),
  ],
];

describe("preview and publish give ONE answer about one document", () => {
  for (const [label, doc] of F13_PROBES) {
    it(`refuses ${label} identically through both doors`, () => {
      const preview = throughPreview(doc);
      const persisted = throughDocument(doc);
      expect(preview.name).not.toBe("no-refusal");
      expect(preview.name).toBe(persisted.name);
      expect(preview.message).toBe(persisted.message);
    });
  }

  it("admits an in-envelope document identically through both doors", () => {
    const doc = document({
      typography: { scale: 1.02 },
      shape: { radiusScale: 1.05 },
      surfaces: { effectIntensity: 0.58 },
    });
    expect(throughPreview(doc).name).toBe("no-refusal");
    expect(throughDocument(doc).name).toBe("no-refusal");
  });

  it("refuses out-of-envelope values BY NAME rather than clamping them", () => {
    // The preview used to clamp `radiusScale 5` to 1.25 and drop a density it
    // did not like. A clamp is an answer the author never asked for.
    const clamped = throughPreview(document({ shape: { radiusScale: 5 } }));
    expect(clamped.name).toBe("ThemeAdmissionError");
    expect(clamped.message).toMatch(
      /surfaces\.radiusScale: Value 5 exceeds the bithire envelope for radiusScale/u
    );
  });

  it("gives the DB terminal the same answer under its own published name", () => {
    // `compileTenantThemeConfig` no longer decides the APCA floor; it re-dresses
    // the door's issues. Same message, the name a route already catches.
    //
    // The APCA probe rather than the envelope one on purpose: a scale of 100
    // never reaches the door through the DB transport, because the DOCUMENT
    // schema and the document-space envelope validator both refuse it first,
    // and refusing earlier is not a second law -- it is the same verdict spelt
    // in the transport's own keypath. The APCA floor has no document-space
    // spelling at all, so what the terminal reports there IS the door's answer.
    const subFloor = document({
      palette: { foreground: { primary: "#BDBDBD" }, background: "#F5F5F5" },
    });
    const terminal = refusal(() =>
      compileTenantThemeConfig(
        hydrateTenantThemeConfig(subFloor, {
          tenantId: "t1",
          slug: SLUG,
          verticalKey: VERTICAL,
          rowVersion: 1,
        })
      )
    );
    expect(terminal.name).toBe("TenantThemeValidationError");
    expect(terminal.message).toBe(throughPreview(subFloor).message);
    expect(terminal.message).toMatch(
      /authored tenant colors must meet the governed floor/u
    );
  });
});

describe("the plan decides what a tenant may activate", () => {
  const proDecision = {
    version: 2,
    plan: "pro",
    decisions: { "recipe-profile": "rottay/technical-sharp@1" },
  } as unknown as TenantThemeDocumentV2;

  const standardDecision = {
    ...proDecision,
    plan: "standard",
  } as unknown as TenantThemeDocumentV2;

  it("refuses a pro decision under a standard plan through BOTH doors", () => {
    const preview = refusal(() =>
      previewThemeIntent({
        vertical: VERTICAL,
        slug: SLUG,
        document: standardDecision,
      })
    );
    const persisted = refusal(() =>
      documentThemeIntent({
        vertical: VERTICAL,
        slug: SLUG,
        document: standardDecision,
      })
    );
    expect(preview.name).not.toBe("no-refusal");
    expect(preview.name).toBe(persisted.name);
    expect(preview.message).toBe(persisted.message);
    expect(preview.message).toMatch(/is tier pro; plan standard entitles standard/u);
  });

  it("admits the same decision once the plan entitles it", () => {
    expect(() =>
      compileThemeIntent(
        previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document: proDecision })
      )
    ).not.toThrow();
  });

  it("the DOOR refuses a pro activation on an intent the plan does not entitle", () => {
    // The v2 document contract refuses this before the compile, which is the
    // cheapest place. The door is the backstop that holds for every OTHER
    // origin: a v1 row published under a standard plan, or a preview intent
    // assembled with an entitlement. `palette.dark-mode` is tier `pro` (D-01).
    const intent = documentThemeIntent({
      vertical: VERTICAL,
      slug: SLUG,
      document: document({
        palette: { backgroundMode: "auto", dark: { primary: "#17415F" } },
      }),
    });
    expect(intent.entitlement).toBeUndefined();
    expect(() => compileThemeIntent(intent)).not.toThrow();
    expect(() =>
      compileThemeIntent({ ...intent, entitlement: { plan: "standard" } })
    ).toThrow(/"palette\.dark-mode" is tier "pro"/u);
    expect(() =>
      compileThemeIntent({ ...intent, entitlement: { plan: "pro" } })
    ).not.toThrow();
  });

  it("reads activation off the LEDGER, never off the merged patch's leaves", () => {
    // The over-approximating `authoredPaths` reports every palette field of a
    // v1 migration, most of them `undefined`, and even the narrow leaf set
    // cannot say WHICH selection wrote a leaf. Charging a tenant for a `pro`
    // decision it never activated is the failure mode this guards.
    const intent = documentThemeIntent({
      vertical: VERTICAL,
      slug: SLUG,
      document: document({ palette: { primary: "#2F6B9A" } }),
    });
    expect(decisionsAuthoredBy(intent.ledger)).toEqual(["palette.seeds"]);
    expect(tierIssues(intent.ledger, { plan: "standard" })).toEqual([]);
  });

  it("refuses an entitled intent that reports no provenance at all", () => {
    // Silence is not "authored nothing": an intent that names a plan and
    // carries no ledger is one no gate captured, so it cannot be judged.
    const issues = tierIssues(undefined, { plan: "standard" });
    expect(issues).toHaveLength(1);
    expect(issues[0].path).toBe("$.ledger");
  });
});

describe("the door refuses, and the refusal names what it refused", () => {
  it("throws ThemeAdmissionError carrying typed issues", () => {
    try {
      compileThemeIntent(
        previewThemeIntent({
          vertical: VERTICAL,
          slug: SLUG,
          document: document({ typography: { scale: 100 } }),
        })
      );
      expect.unreachable("the door admitted an out-of-envelope scale");
    } catch (error) {
      expect(error).toBeInstanceOf(ThemeAdmissionError);
      const issues = (error as ThemeAdmissionError).issues;
      expect(issues).toHaveLength(1);
      expect(issues[0].code).toBe("invalid_value");
      expect(issues[0].path).toBe("$.theme.typography.scale");
    }
  });

  it("refuses an unknown experienceProfile instead of deleting the channels", () => {
    // F-61: an invalid id expanded to nothing, so twelve of the vertical's own
    // channels vanished and no one was told.
    expect(() =>
      compileThemeIntent(
        previewThemeIntent({
          vertical: VERTICAL,
          slug: SLUG,
          document: {
            version: 2,
            plan: "standard",
            decisions: { "experience.profile": "nope" },
          } as unknown as TenantThemeDocument,
        })
      )
    ).toThrow(/Experience profile rejected/u);
  });

  it("compiles the vertical's own baseline under every first-party slug", () => {
    // The admission must not refuse the products it protects.
    for (const slug of ["rottay", "bithire", "evnto"] as const) {
      expect(() =>
        compileThemeIntent({
          vertical: slug,
          slug,
          origin: "static-vertical",
          patch: {},
        })
      ).not.toThrow();
    }
  });
});

describe("the envelope measures AUTHORSHIP, which value equality cannot erase", () => {
  const ROTTAY = "rottay" as const;

  it("refuses an explicit motion.intensity equal to rottay's own baseline", () => {
    // Rottay renders at 1.0 and the tenant ceiling is 0.8, so this selection
    // moves no leaf. It is still a dial the tenant set, and v1 publication has
    // always refused it (I-P4).
    for (const doc of [
      document({ motion: { intensity: 1 } }),
      {
        version: 2,
        plan: "pro",
        decisions: { "motion.dial": { intensity: 1 } },
      } as unknown as TenantThemeDocumentV2,
    ]) {
      for (const produce of [documentThemeIntent, previewThemeIntent]) {
        const error = refusal(() =>
          compileThemeIntent(produce({ vertical: ROTTAY, slug: SLUG, document: doc }))
        );
        expect(error.message).toMatch(/motionIntensity/u);
      }
    }
  });

  it("still exempts the inherited value nobody chose", () => {
    // The same 1.0, carried by rottay's own baseline rather than decided: a
    // `preset-inherited` leaf answers to no tenant cap (contract 2.1).
    expect(() =>
      compileThemeIntent(
        draftPreviewThemeIntent({
          vertical: ROTTAY,
          slug: SLUG,
          draft: { id: SLUG, name: "Studio draft" } as never,
        })
      )
    ).not.toThrow();
  });
});
