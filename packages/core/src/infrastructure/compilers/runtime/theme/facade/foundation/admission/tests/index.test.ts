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

/**
 * WO-CAT-04. The same law over a document that NAMES a style: a style refused
 * differently by preview and by the persisted door is a CAT-03 regression, not
 * a CAT-04 finding. The third probe is the request-time envelope one -- the
 * only style refusal that depends on an argument the caller supplies -- and it
 * is compared with the narrowed `ranges` handed to BOTH doors, exactly as a
 * publish terminal would hand it to one.
 */
const STYLE_PROBES: readonly (readonly [string, unknown])[] = [
  ["an unknown style id", { id: "nope", version: 1 }],
  ["an unavailable style version", { id: "quiet-premium", version: 7 }],
  ["an inline style body", { id: "quiet-premium", version: 1, decisions: {} }],
];

const NARROWED = {
  densityScale: { min: 0.85, max: 1.15 },
  effectIntensity: { min: 0, max: 0.65 },
  motionIntensity: { min: 0, max: 0.8 },
  motionDurationScale: { min: 0.75, max: 1.35 },
  typeScale: { min: 0.92, max: 1.08 },
  radiusScale: { min: 0.8, max: 1.0 },
};

describe("preview and publish give ONE answer about a NAMED STYLE", () => {
  for (const [label, style] of STYLE_PROBES) {
    it(`refuses ${label} identically through both doors`, () => {
      const styled = {
        version: 3,
        plan: "standard",
        decisions: {},
        style,
      } as unknown as TenantThemeDocument;
      const preview = throughPreview(styled);
      const persisted = throughDocument(styled);
      expect(preview.name).not.toBe("no-refusal");
      expect(preview.name).toBe(persisted.name);
      expect(preview.message).toBe(persisted.message);
    });
  }

  it("refuses a caller-narrowed envelope identically, in one issue shape", () => {
    const styled = {
      version: 3,
      plan: "standard",
      decisions: {},
      style: { id: "quiet-premium", version: 1 },
    } as unknown as TenantThemeDocument;
    const preview = refusal(() =>
      previewThemeIntent({
        vertical: VERTICAL,
        slug: SLUG,
        document: styled,
        ranges: NARROWED,
      })
    );
    const persisted = refusal(() =>
      documentThemeIntent({
        vertical: VERTICAL,
        slug: SLUG,
        document: styled,
        ranges: NARROWED,
      })
    );
    expect(preview.name).toBe("ThemeStyleValidationError");
    expect(preview).toEqual(persisted);
  });

  it("admits the registered style identically through both doors", () => {
    const styled = {
      version: 3,
      plan: "standard",
      decisions: {},
      style: { id: "quiet-premium", version: 1 },
    } as unknown as TenantThemeDocument;
    expect(throughPreview(styled).name).toBe("no-refusal");
    expect(throughDocument(styled).name).toBe("no-refusal");
  });
});

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

/**
 * The floor resolves a reference the way the CASCADE resolves it.
 *
 * Since the neutral doctrine moved every chromatic default into the foundation
 * stylesheet, a governed pair can arrive at the floor as two `var()` operands:
 * the compiled map no longer carries what the browser resolves every time. A
 * floor that read only that map refused those pairs by FORM -- measured 9 of 9
 * sidebar tone/vertical combinations admitted before the move and 3 of 9 after.
 * It now consults the foundation's own declarations second, so a pair is judged
 * on its RATIO, and fail-closed is intact: a ground with no legible ink is
 * still refused.
 */
describe("the contrast floor judges the ratio, never the form", () => {
  const tones = ["subtle", "strong", "inverse"] as const;

  it("admits every sidebar tone on every vertical, through both doors", () => {
    for (const vertical of ["rottay", "bithire", "evnto"] as const) {
      for (const tone of tones) {
        const doc = document({ navigation: { sidebarTone: tone } });
        for (const [door, run] of [
          ["document", () =>
            compileThemeIntent(
              documentThemeIntent({ vertical, slug: SLUG, document: doc })
            )],
          ["preview", () =>
            compileThemeIntent(
              previewThemeIntent({ vertical, slug: SLUG, document: doc })
            )],
        ] as const) {
          expect(refusal(run).name, `${vertical}/${tone} via ${door}`).toBe(
            "no-refusal"
          );
        }
      }
    }
  });

  it("still REFUSES a sidebar ground that leaves the ink illegible", () => {
    // The ground travels WITHOUT its ink, which is the shape the floor exists
    // to catch, and it still does: resolving the reference restored the
    // judgement, it did not soften it.
    const sidebar = (chrome: Record<string, string>) =>
      ({
        version: 2,
        plan: "pro",
        decisions: {},
        overrides: { chrome: { sidebar: chrome } },
      }) as unknown as TenantThemeDocument;
    expect(throughDocument(sidebar({ bg: "#101010" })).message).toMatch(
      /--ds-sidebar-text has APCA Lc .* against --ds-sidebar-bg/u
    );
    expect(
      throughDocument(sidebar({ bg: "#101010", text: "#F5F5F5" })).name
    ).toBe("no-refusal");
  });
});
