/**
 * A tenant row that NAMES a style, through every door that reads one.
 *
 * The load-bearing assertions are the parity ones and the precedence ones. A
 * style is inherited, not authored: it must reach the patch under every plan,
 * it must never win a leaf the tenant or the profile expansion decided, and the
 * ledger's answer about who owns a leaf must agree with the value the effective
 * document actually carries. The last of those is the one an ordering mistake
 * breaks silently, so it is asserted on both halves at once.
 */

import { describe, expect, it } from "vitest";

import {
  assertDecisionProvenanceLedger,
  ledgerOwnerOfLeaf,
} from "@/foundation/contracts/composition/tenants/themes/provenance";
import type { TenantThemeDocumentAny } from "@/contracts/theme/presentation/document";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import { resolveThemeStyle } from "@/contracts/theme/runtime/styles";
import { documentAnyThemePatch } from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import {
  admitDocument,
  compileThemeIntent,
  documentThemeIntent,
  emitThemeCss,
  migrateAndAdmitDocument,
  previewThemeIntent,
  tenantArtifactScope,
} from "@/infrastructure/compilers/runtime/theme";

const VERTICAL = "bithire" as const;
const SLUG = "acme";
const STYLE = { id: "quiet-premium", version: 1 } as const;
const IDENTITY = {
  tenantId: "33333333-3333-4333-8333-333333333333",
  slug: SLUG,
  verticalKey: VERTICAL,
  rowVersion: 3,
} as const;

const row = (input: {
  plan?: string;
  decisions?: Record<string, unknown>;
  style?: unknown;
  version?: number;
}) =>
  ({
    version: input.version ?? (input.style === undefined ? 2 : 3),
    plan: input.plan ?? "standard",
    decisions: input.decisions ?? {},
    ...(input.style === undefined ? {} : { style: input.style }),
  }) as unknown as TenantThemeDocumentAny;

/** What one door did with one document: the error's NAME and its message. */
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

const DOORS = {
  documentThemeIntent: (document: TenantThemeDocumentAny) =>
    documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document }),
  previewThemeIntent: (document: TenantThemeDocumentAny) =>
    previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document }),
  migrateAndAdmitDocument: (document: TenantThemeDocumentAny) =>
    migrateAndAdmitDocument({ vertical: VERTICAL, document }),
  compileTenantThemeDocumentV2: (document: TenantThemeDocumentAny) =>
    compileTenantThemeDocumentV2({ ...IDENTITY, document: document as never }),
} as const;

const throughEveryDoor = (document: TenantThemeDocumentAny) =>
  Object.fromEntries(
    Object.entries(DOORS).map(([name, door]) => [name, refusal(() => door(document))])
  );

const css = (document: TenantThemeDocumentAny) =>
  emitThemeCss(
    compileThemeIntent(
      documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document })
    ).compiled,
    tenantArtifactScope(VERTICAL, SLUG)
  );

/* -------------------------------------------------------------------------- */
/* I1 — one refusal, four doors                                               */
/* -------------------------------------------------------------------------- */

describe("I1 an unknown or unavailable style is refused identically everywhere", () => {
  for (const [label, style, expected] of [
    [
      "an unknown id",
      { id: "nope", version: 1 },
      'ThemeStyle: unknown style "nope"; the registry is quiet-premium',
    ],
    [
      "an unavailable version",
      { id: "quiet-premium", version: 7 },
      'ThemeStyle: style "quiet-premium" has no version 7; the registered versions are 1',
    ],
  ] as const) {
    it(`refuses ${label} with byte-identical text on all four doors`, () => {
      const answers = throughEveryDoor(row({ style }));
      for (const [door, answer] of Object.entries(answers)) {
        expect([door, answer.name]).toEqual([door, "ThemeStyleReferenceError"]);
        expect([door, answer.message]).toEqual([door, expected]);
      }
    });
  }

  it("admits the registered style on all four doors", () => {
    for (const [door, answer] of Object.entries(
      throughEveryDoor(row({ style: STYLE }))
    )) {
      expect([door, answer.name]).toEqual([door, "no-refusal"]);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* I2 — an inline body never travels                                          */
/* -------------------------------------------------------------------------- */

describe("I2 a transport carries a style NAME and nothing else", () => {
  it("refuses an inline body on every door, by the key it carried", () => {
    const answers = throughEveryDoor(
      row({ style: { ...STYLE, decisions: { "density.mode": "compact" } } })
    );
    for (const [door, answer] of Object.entries(answers)) {
      expect([door, answer.message]).toEqual([
        door,
        'ThemeStyle: unsupported key "decisions" in style; a style is named by {id, version}, never carried',
      ]);
    }
  });

  it("refuses `style` on a v2 row: the field belongs to the version that has it", () => {
    expect(
      refusal(() => DOORS.documentThemeIntent(row({ version: 2, style: STYLE })))
        .message
    ).toBe('TenantThemeDocument v2: unsupported field "style"');
  });

  it("refuses a forged style tier on a transported ledger", () => {
    // `catalogTierOf` answers `null` for a style ref, so a stated tier is not
    // the catalog's and is refused by the assertion that already existed.
    expect(() =>
      assertDecisionProvenanceLedger(
        {
          entries: [
            {
              ref: { kind: "style-reference", id: "quiet-premium", version: 1 },
              provenance: "preset-inherited",
              tier: "pro",
              authoredValue: {},
              effectiveLeaves: [],
            },
          ],
        },
        { ids: ["density.mode"], tierById: { "density.mode": "standard" } }
      )
    ).toThrow(/a tier is read from the catalog, never stated/u);
  });
});

describe("I1 a style is admitted only for the verticals it is published for", () => {
  /**
   * The registered publication declares `all`, so the REFUSAL has no production
   * fixture to fire on -- which is the point: an exclusion is a measured
   * incompatibility and the launch set is empty. What is asserted here is that
   * the station reads the manifest's own answer, and the refusal itself is
   * drilled at the `theme-style-registry` gate, where a narrowed publication
   * can be planted without shipping one.
   */
  it("admits the `all` publication on every first-party vertical", () => {
    for (const vertical of ["rottay", "bithire", "evnto"] as const) {
      expect(
        refusal(() =>
          admitDocument({ vertical, document: row({ style: STYLE }) })
        ).name
      ).toBe("no-refusal");
    }
    expect(resolveThemeStyle(STYLE).manifest.verticals).toBe("all");
  });
});

/* -------------------------------------------------------------------------- */
/* I3 — Standard and Pro inherit equally                                      */
/* -------------------------------------------------------------------------- */

describe("I3 a style is inherited equally under every plan", () => {
  it("emits byte-identical CSS for Standard and Pro", () => {
    expect(css(row({ plan: "standard", style: STYLE }))).toBe(
      css(row({ plan: "pro", style: STYLE }))
    );
  });

  it("is not the trivial equality: the same pair agrees without a style too", () => {
    expect(css(row({ plan: "standard" }))).toBe(css(row({ plan: "pro" })));
  });

  it("is not vacuous: the style MOVES the emitted CSS", () => {
    expect(css(row({ plan: "standard", style: STYLE }))).not.toBe(
      css(row({ plan: "standard" }))
    );
  });

  it("carries the style entry at rank 0 with no tier for the station to judge", () => {
    const admission = admitDocument({
      vertical: VERTICAL,
      document: row({ plan: "standard", style: STYLE }),
    });
    const entry = admission.ledger.entries.find(
      (candidate) => candidate.ref.kind === "style-reference"
    );
    expect(entry?.provenance).toBe("preset-inherited");
    expect(entry?.tier).toBeNull();
    expect(admission.styleRef).toEqual(STYLE);
  });
});

/* -------------------------------------------------------------------------- */
/* I4 — inheritance is not a bypass                                           */
/* -------------------------------------------------------------------------- */

describe("I4 a Pro direct edit is still refused for Standard, style or no style", () => {
  const pro = { "palette.contrast-posture": "high" };

  it("refuses the tenant's own Pro row under Standard WITH a style present", () => {
    for (const [door, answer] of Object.entries(
      throughEveryDoor(row({ plan: "standard", decisions: pro, style: STYLE }))
    )) {
      expect([door, answer.message]).toEqual([
        door,
        'TenantThemeDocument v3: decision "palette.contrast-posture" is tier pro; plan standard entitles standard',
      ]);
    }
  });

  it("admits the style's own rows under the same Standard plan", () => {
    const admission = admitDocument({
      vertical: VERTICAL,
      document: row({ plan: "standard", style: STYLE }),
    });
    expect(admission.styleClaim?.leaves.length).toBeGreaterThan(0);
  });

  it("still admits the Pro row once the plan entitles it", () => {
    expect(
      refusal(() =>
        DOORS.documentThemeIntent(row({ plan: "pro", decisions: pro, style: STYLE }))
      ).name
    ).toBe("no-refusal");
  });
});

/* -------------------------------------------------------------------------- */
/* I5 — precedence, and the ledger agreeing with the effective document       */
/* -------------------------------------------------------------------------- */

const styleEntry = (admission: ReturnType<typeof admitDocument>) =>
  admission.ledger.entries.find((entry) => entry.ref.kind === "style-reference");

describe("I5 an explicit decision beats a style leaf, and the style is retained", () => {
  it("gives the tenant's own pairing the leaves the style would have supplied", () => {
    const admission = admitDocument({
      vertical: VERTICAL,
      document: row({
        plan: "standard",
        decisions: { "typography.pairing": "geometric" },
        style: STYLE,
      }),
    });
    const owner = ledgerOwnerOfLeaf(admission.ledger, "typography.typePairing");
    expect(owner?.ref).toEqual({ kind: "decision", id: "typography.pairing" });
    expect(owner?.provenance).toBe("direct-override");
    // Retained with the REMAINING leaves, never deleted.
    const style = styleEntry(admission);
    expect(style).toBeDefined();
    expect(style?.effectiveLeaves).not.toContain("typography.typePairing");
    expect(style?.effectiveLeaves).toContain("surfaces.radiusScale");
    // And the EFFECTIVE document carries the tenant's value, not the style's.
    const effective = admission.effective as never as {
      visualFoundation: { general: { typography: { typePairing: string } } };
    };
    expect(effective.visualFoundation.general.typography.typePairing).toBe(
      "geometric"
    );
  });

  /**
   * THE ORDERING ASSERTION. The underlay runs after the expansion and fills
   * only what is still absent, so a profile default beats a style leaf in the
   * ledger AND in the document. Move `underlayStyle` above `expandProfileDefaults`
   * and the two answers part company: the ledger still says `profile-derived`
   * while the document carries the style's value.
   */
  it("gives a profile expansion the leaf, in the ledger and in the document", () => {
    const admission = admitDocument({
      vertical: VERTICAL,
      document: row({
        plan: "pro",
        decisions: { "experience.profile": "rottay/management-editorial@1" },
        style: STYLE,
      }),
    });
    const owner = ledgerOwnerOfLeaf(admission.ledger, "surfaces.radiusScale");
    expect(owner?.provenance).toBe("profile-derived");
    const effective = admission.effective as never as {
      visualFoundation: { general: { shape: { radiusScale: number } } };
    };
    const profileValue = effective.visualFoundation.general.shape.radiusScale;
    const styleValue = 1.1;
    expect(profileValue).not.toBe(styleValue);
    expect(styleEntry(admission)?.effectiveLeaves).not.toContain(
      "surfaces.radiusScale"
    );
  });

  it("retains a fully displaced style with no leaves rather than dropping it", () => {
    const admission = admitDocument({
      vertical: VERTICAL,
      document: row({
        plan: "pro",
        decisions: {
          "typography.pairing": "geometric",
          "typography.scale": 1.02,
          "shape.radius-scale": 0.9,
          "shape.button-style": "pill",
          "surfaces.elevation-posture": "flat",
          "surfaces.effect-intensity": 0.3,
          "states.focus-style": "ring",
          "motion.dial": { intensity: 0.2, durationScale: 0.9 },
        },
        style: STYLE,
      }),
    });
    const style = styleEntry(admission);
    expect(style).toBeDefined();
    expect(style?.effectiveLeaves).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* I9 — the rollout                                                            */
/* -------------------------------------------------------------------------- */

/**
 * WHAT AN OLD READER DID WITH A v3 ROW, measured at `cb876bdca` before this lot
 * was written, and recorded here because the same tree cannot host both
 * readers. The arms below assert the REPAIR; this table is what they repair.
 *
 *   documentThemeIntent       TypeError: Cannot read properties of undefined (reading 'general')
 *   previewThemeIntent        the identical TypeError, from the same site
 *   documentAnyThemePatch     the identical TypeError, from the same site
 *   migrateAndAdmitDocument   ThemePatchMigrationError: ThemePatch migration: unsupported schemaVersion undefined
 *   compileTenantThemeDocumentV2  $.document.version: Only TenantThemeDocument version 2 is supported
 *
 * Two of the four ingress doors CRASHED rather than refused: a bare TypeError
 * out of a private refusal helper, naming neither the version nor the door.
 */
const OUT_OF_SET = "TenantThemeDocument: unsupported version 4; the supported set is 2 | 3";

describe("I9 an out-of-set version is refused BY NAME, from one fork site", () => {
  it("refuses it on all four public doors, with no TypeError anywhere", () => {
    const answers = throughEveryDoor(row({ version: 4 }));
    for (const [door, answer] of Object.entries(answers)) {
      expect([door, answer.name]).toEqual([door, "TenantThemeDocumentError"]);
      expect([door, answer.message]).toEqual([door, OUT_OF_SET]);
    }
  });

  it("refuses it identically through the UNPUBLISHED fifth caller", () => {
    // `documentAnyThemePatch` is deliberately unpublished and takes the same v1
    // branch, so it crashed with the same bare TypeError. One fork above that
    // branch closes it too -- which is what proves the fork is inside
    // `admitDocument` rather than pasted per door.
    expect(
      refusal(() =>
        documentAnyThemePatch({ vertical: VERTICAL, document: row({ version: 4 }) })
      )
    ).toEqual({ name: "TenantThemeDocumentError", message: OUT_OF_SET });
  });

  it("leaves a v1 row on the v1 branch: it states no `version` to fork on", () => {
    const v1 = {
      schemaVersion: 1,
      mode: "simple",
      appearance: { shape: { radiusScale: 1.05 } },
    } as unknown as TenantThemeDocumentAny;
    expect(admitDocument({ vertical: VERTICAL, document: v1 }).version).toBe(1);
  });

  it("admits a v2 row unchanged", () => {
    const admission = admitDocument({
      vertical: VERTICAL,
      document: row({ decisions: { "density.mode": "compact" } }),
    });
    expect(admission.version).toBe(2);
  });

  it("round-trips a v2 row to v3 with a byte-identical admission", () => {
    const v2 = row({ plan: "pro", decisions: { "density.mode": "compact" } });
    const migrated = migrateAndAdmitDocument({ vertical: VERTICAL, document: v2 });
    expect(migrated.migrated.version).toBe(3);
    expect(migrated.patch).toEqual(
      admitDocument({ vertical: VERTICAL, document: v2 }).patch
    );
    expect(migrated.ledger).toEqual(
      admitDocument({ vertical: VERTICAL, document: v2 }).ledger
    );
  });

  it("carries a v3 style's leaves into the patch", () => {
    expect(
      JSON.stringify(
        admitDocument({ vertical: VERTICAL, document: row({ style: STYLE }) }).patch
      )
    ).not.toBe(
      JSON.stringify(admitDocument({ vertical: VERTICAL, document: row({}) }).patch)
    );
  });
});

/* -------------------------------------------------------------------------- */
/* I11 — values, at request time, and never clamped                           */
/* -------------------------------------------------------------------------- */

describe("I11 a style's values answer to the same owners the tenant's do", () => {
  const narrowed = {
    densityScale: { min: 0.85, max: 1.15 },
    effectIntensity: { min: 0, max: 0.65 },
    motionIntensity: { min: 0, max: 0.8 },
    motionDurationScale: { min: 0.75, max: 1.35 },
    typeScale: { min: 0.92, max: 1.08 },
    // The caller narrows the radius below the style's own 1.1.
    radiusScale: { min: 0.8, max: 1.0 },
  };

  it("refuses a caller-narrowed envelope identically on preview and publish", () => {
    const document = row({ style: STYLE });
    const preview = refusal(() =>
      previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document, ranges: narrowed })
    );
    const persisted = refusal(() =>
      documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document, ranges: narrowed })
    );
    expect(preview.name).toBe("ThemeStyleValidationError");
    expect(preview).toEqual(persisted);
  });

  it("emits the issue in the shape `envelopeDialIssues` emits", () => {
    let issues: unknown;
    try {
      documentThemeIntent({
        vertical: VERTICAL,
        slug: SLUG,
        document: row({ style: STYLE }),
        ranges: narrowed,
      });
    } catch (error) {
      issues = (error as { issues?: unknown }).issues;
    }
    expect(issues).toEqual([
      {
        code: "invalid_value",
        path: '$.style.decisions["shape.radius-scale"]',
        message: "Value exceeds the bithire envelope",
      },
    ]);
  });

  it("sees no caller-narrowed envelope on the migrate door, so the static ones are the whole check", () => {
    // `migrateAndAdmitDocument` takes `{vertical, document}` and nothing else,
    // so its arm is the static-envelope one by construction.
    expect(
      refusal(() =>
        migrateAndAdmitDocument({ vertical: VERTICAL, document: row({ style: STYLE }) })
      ).name
    ).toBe("no-refusal");
    expect(
      Object.keys({} as Parameters<typeof migrateAndAdmitDocument>[0])
    ).not.toContain("ranges");
  });

  it("NEVER clamps: every admitted dial is the style's own value", () => {
    const admission = admitDocument({
      vertical: VERTICAL,
      document: row({ style: STYLE }),
    });
    const general = (
      admission.effective as never as {
        visualFoundation: { general: Record<string, never> };
      }
    ).visualFoundation.general as unknown as {
      shape: { radiusScale: number };
      surfaces: { effectIntensity: number };
      typography: { scale: number };
      motion: { intensity: number; durationScale: number };
    };
    expect(general.shape.radiusScale).toBe(1.1);
    expect(general.surfaces.effectIntensity).toBe(0.45);
    expect(general.typography.scale).toBe(1.05);
    expect(general.motion.intensity).toBe(0.5);
    expect(general.motion.durationScale).toBe(1.1);
  });
});
