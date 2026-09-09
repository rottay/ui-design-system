/**
 * WO-CON-06 — the v2 publication seam, through the published package boundary.
 *
 * A v2 row could not be published at all: `hydrateTenantThemeConfig` refused it
 * by schema version, and the only other route flattened it to v1, which drops
 * the `plan` the tier station judges. Both halves are asserted here through
 * `@rottay/design-system/server`, not through an internal path -- exporting
 * from a module is not exposing an API, and the consumer contract is the thing
 * under test.
 */
import { describe, expect, it } from "vitest";

import {
  TenantThemeValidationError,
  compileTenantThemeConfig,
  compileTenantThemeDocumentV2,
  getTenantThemeVerticalEnvelope,
} from "@rottay/design-system/server";
import type {
  TenantThemeArtifact,
  TenantThemeDocumentV2,
} from "@rottay/design-system/server";
import { TenantThemeDocumentV2Error } from "@/contracts/theme/presentation/document";
// The verifier is deliberately NOT public: a consumer proves a mount through
// `resolveVisualAuthority`. This suite asserts the producer/verifier pair, so
// it reads the verifier where it lives.
import { verifyTenantThemeArtifactV1 } from "@/infrastructure/runtime/theming/foundation/visual-authority";

const IDENTITY = {
  tenantId: "22222222-2222-4222-8222-222222222222",
  slug: "northwind",
  verticalKey: "bithire",
  rowVersion: 7,
} as const;

const DOCUMENT: TenantThemeDocumentV2 = {
  version: 2,
  plan: "pro",
  decisions: {
    "palette.seeds": { primary: "#2f6bff" },
    "typography.pairing": "editorial",
    "experience.profile": "rottay/management-editorial@1",
  },
  overrides: { chrome: { cardComponent: { radius: "var(--ds-radius-lg)" } } },
};

const publish = (document: TenantThemeDocumentV2 = DOCUMENT) =>
  compileTenantThemeDocumentV2({ ...IDENTITY, document });

const entryFor = (
  compilation: ReturnType<typeof publish>,
  id: string
) =>
  compilation.ledger.entries.find(
    (entry) => entry.ref.kind === "decision" && entry.ref.id === id
  );

/** The issue list a refusal carried, or `[]` when the call did not refuse. */
const issuesOf = (call: () => unknown) => {
  try {
    call();
    return [];
  } catch (error) {
    expect(error).toBeInstanceOf(TenantThemeValidationError);
    return (error as TenantThemeValidationError).issues;
  }
};

describe("compileTenantThemeDocumentV2 · the real published path", () => {
  it("compiles a v2 document into a verifiable artifact", () => {
    const { artifact } = publish();
    expect(artifact.schemaVersion).toBe(1);
    expect(artifact.slug).toBe(IDENTITY.slug);
    expect(artifact.rowVersion).toBe(IDENTITY.rowVersion);
    expect(
      verifyTenantThemeArtifactV1(artifact, {
        slug: IDENTITY.slug,
        verticalKey: IDENTITY.verticalKey,
      })
    ).toEqual({ ok: true, artifact });
  });

  it("carries the door's own report instead of a second answer beside it", () => {
    const { admission } = publish();
    expect(admission.version).toBe(2);
    expect(admission.decisions.map((decision) => decision.id)).toContain(
      "typography.pairing"
    );
  });

  it("records the tenant's selections as direct authorship, with the catalog's tier", () => {
    const compilation = publish();
    expect(entryFor(compilation, "typography.pairing")).toMatchObject({
      provenance: "direct-override",
      tier: "standard",
    });
    expect(entryFor(compilation, "experience.profile")?.provenance).toBe(
      "direct-override"
    );
    const override = compilation.ledger.entries.find(
      (entry) => entry.ref.kind === "sanctioned-override"
    );
    expect(override).toMatchObject({ provenance: "direct-override", tier: null });
  });

  it("records what the profile filled as derived, never as new authorship", () => {
    const compilation = publish();
    const derived = compilation.ledger.entries.filter(
      (entry) => entry.provenance === "profile-derived"
    );
    expect(derived.length).toBeGreaterThan(0);
    expect(
      derived.every((entry) => entry.ref.kind === "decision")
    ).toBe(true);
    // The pairing the tenant authored keeps its own leaf: a profile default
    // never displaces the selection that made it unnecessary.
    expect(
      derived.some((entry) =>
        entry.effectiveLeaves.includes("typography.typePairing")
      )
    ).toBe(false);
    // The authored pairing owns its own leaf AND the font families it expands
    // into: nothing more specific named them, so the causal owner is the
    // selection that caused them (I-P0/I-P3a).
    expect(entryFor(compilation, "typography.pairing")?.effectiveLeaves).toEqual(
      [
        "typography.typePairing",
        "typography.fontFamilyBase",
        "typography.fontFamilyHeading",
      ]
    );
  });

  it("keeps a partly authored dial split between its two owners", () => {
    // The tenant authored ONE member of `motion.dial`; the profile filled the
    // other two. Reporting all three as the tenant's would make a profile
    // default read as authorship (I-P0, I-T4), so the row's decision identity
    // stays with what the tenant wrote and each filled member keeps its own
    // `profile-derived` claim.
    const compilation = publish({
      version: 2,
      plan: "pro",
      decisions: {
        "experience.profile": "rottay/management-editorial@1",
        "motion.dial": { intensity: 0.2 },
      },
    });
    const authored = entryFor(compilation, "motion.dial");
    expect(authored).toMatchObject({
      provenance: "direct-override",
      tier: "standard",
      authoredValue: { intensity: 0.2 },
      effectiveLeaves: ["motion.intensity"],
    });
    const filled = compilation.ledger.entries.filter((entry) =>
      entry.effectiveLeaves.some(
        (leaf) => leaf === "motion.durationScale" || leaf === "motion.ambient"
      )
    );
    expect(
      filled.map((entry) => [entry.provenance, entry.tier, entry.effectiveLeaves])
    ).toEqual([
      ["profile-derived", null, ["motion.durationScale"]],
      ["profile-derived", null, ["motion.ambient"]],
    ]);
    expect(filled.map((entry) => entry.authoredValue)).toEqual([1.1, "subtle"]);
    // The two classes survive the artifact and the mount: a reader of the
    // serialized ledger sees the same split the compile resolved.
    const reloaded = JSON.parse(
      JSON.stringify(compilation.artifact)
    ) as TenantThemeArtifact;
    expect(
      verifyTenantThemeArtifactV1(reloaded, {
        slug: IDENTITY.slug,
        verticalKey: IDENTITY.verticalKey,
      })
    ).toEqual({ ok: true, artifact: reloaded });
    expect(
      reloaded.provenance?.entries
        .filter((entry) => entry.effectiveLeaves[0]?.startsWith("motion."))
        .map((entry) => [entry.provenance, ...entry.effectiveLeaves])
    ).toEqual([
      ["direct-override", "motion.intensity"],
      ["profile-derived", "motion.durationScale"],
      ["profile-derived", "motion.ambient"],
    ]);
  });

  it("serializes the provenance into the artifact and into its digest", () => {
    const { artifact, ledger } = publish();
    expect(artifact.provenance?.entries).toHaveLength(ledger.entries.length);
    expect(artifact.provenance?.entries[0]).not.toHaveProperty("authoredValue");
    const tampered: TenantThemeArtifact = {
      ...artifact,
      provenance: { entries: [] },
    };
    expect(
      verifyTenantThemeArtifactV1(tampered, {
        slug: IDENTITY.slug,
        verticalKey: IDENTITY.verticalKey,
      })
    ).toEqual({
      ok: false,
      error: "artifact digest does not recompute from v1 source",
    });
  });

  it("survives the database round trip with the same decided channels", () => {
    const { artifact } = publish();
    const reloaded = JSON.parse(
      JSON.stringify(artifact)
    ) as TenantThemeArtifact;
    expect(
      verifyTenantThemeArtifactV1(reloaded, {
        slug: IDENTITY.slug,
        verticalKey: IDENTITY.verticalKey,
      })
    ).toEqual({ ok: true, artifact: reloaded });
    expect(reloaded.provenance).toEqual(artifact.provenance);
    expect(reloaded.digest).toBe(artifact.digest);
  });

  it("mounts an artifact that carries no provenance at all", () => {
    // The v1 transport resolves no ledger, so it emits no provenance and puts
    // none in its digest: a row compiled before this field existed verifies
    // exactly as it did, which is the compatibility half of the extension.
    const legacy = compileTenantThemeConfig(
      {
        schemaVersion: 1,
        mode: "simple",
        appearance: { density: "compact" },
        ...IDENTITY,
      },
      { verticalEnvelope: getTenantThemeVerticalEnvelope(IDENTITY.verticalKey) }
    );
    expect(legacy.provenance).toBeUndefined();
    expect(
      verifyTenantThemeArtifactV1(legacy, {
        slug: IDENTITY.slug,
        verticalKey: IDENTITY.verticalKey,
      })
    ).toEqual({ ok: true, artifact: legacy });
  });
});

describe("compileTenantThemeDocumentV2 · refusals, by name", () => {
  it("refuses a v1 document at the version it was handed", () => {
    expect(() =>
      compileTenantThemeDocumentV2({
        ...IDENTITY,
        document: {
          schemaVersion: 1,
          mode: "simple",
          appearance: {},
        } as unknown as TenantThemeDocumentV2,
      })
    ).toThrow(
      expect.objectContaining({
        issues: [
          {
            code: "unsupported_schema_version",
            path: "$.document.version",
            message: "Only TenantThemeDocument version 2 is supported",
          },
        ],
      })
    );
  });

  it("refuses a vertical outside the roster", () => {
    try {
      compileTenantThemeDocumentV2({
        ...IDENTITY,
        verticalKey: "invented" as typeof IDENTITY.verticalKey,
        document: DOCUMENT,
      });
      throw new Error("expected a refusal");
    } catch (error) {
      expect(error).toBeInstanceOf(TenantThemeValidationError);
      expect((error as TenantThemeValidationError).issues[0].path).toBe(
        "$.verticalKey"
      );
    }
  });

  it("refuses a dial outside the vertical envelope, at the decision that authored it", () => {
    // The envelope option is the v1 terminal's law, so the v2 transport owes the
    // same answer: `shape.radius-scale` 1.24 is inside the catalog's own domain
    // and outside bithire's registered envelope, and before this it published.
    // The path names the DECISION, not the v1 field the projection wrote it to.
    try {
      compileTenantThemeDocumentV2({
        ...IDENTITY,
        document: {
          version: 2,
          plan: "pro",
          decisions: { "shape.radius-scale": 1.24 },
        },
      });
      throw new Error("expected a refusal");
    } catch (error) {
      expect(error).toBeInstanceOf(TenantThemeValidationError);
      expect((error as TenantThemeValidationError).issues).toEqual([
        {
          code: "invalid_value",
          path: '$.decisions["shape.radius-scale"]',
          message: "Value exceeds the bithire envelope",
        },
      ]);
    }
    expect(() =>
      compileTenantThemeConfig(
        {
          schemaVersion: 1,
          mode: "simple",
          appearance: { shape: { radiusScale: 1.24 } },
          ...IDENTITY,
        },
        { verticalEnvelope: getTenantThemeVerticalEnvelope(IDENTITY.verticalKey) }
      )
    ).toThrow(TenantThemeValidationError);
  });

  it("refuses a malformed envelope before measuring any document against it", () => {
    const registered = getTenantThemeVerticalEnvelope(IDENTITY.verticalKey);
    try {
      compileTenantThemeDocumentV2({
        ...IDENTITY,
        document: DOCUMENT,
        verticalEnvelope: {
          ...registered!,
          ranges: { ...registered!.ranges, radiusScale: { min: 2, max: 3 } },
        },
      });
      throw new Error("expected a refusal");
    } catch (error) {
      expect(error).toBeInstanceOf(TenantThemeValidationError);
      expect((error as TenantThemeValidationError).issues[0].path).toBe(
        "$.verticalEnvelope.ranges.radiusScale"
      );
    }
  });

  it("refuses an envelope that cannot say what it permits, as v1 does", () => {
    // A malformed RANGE was already refused; the envelope's own shape was not,
    // so an empty policy, a version this build does not know and another
    // vertical's policy all published. Each is now refused at the same path and
    // with the same message the v1 terminal answers.
    const registered = getTenantThemeVerticalEnvelope(IDENTITY.verticalKey)!;
    const malformed = [
      ["an empty policy", {}],
      ["an unknown version", { ...registered, schemaVersion: 99 }],
      ["another vertical's policy", { ...registered, verticalKey: "evnto" }],
    ] as const;
    for (const [what, verticalEnvelope] of malformed) {
      const onV2 = issuesOf(() =>
        compileTenantThemeDocumentV2({
          ...IDENTITY,
          document: DOCUMENT,
          verticalEnvelope: verticalEnvelope as never,
        })
      );
      const onV1 = issuesOf(() =>
        compileTenantThemeConfig(
          {
            schemaVersion: 1,
            mode: "simple",
            appearance: {},
            ...IDENTITY,
          },
          { verticalEnvelope: verticalEnvelope as never }
        )
      );
      expect(onV2, what).not.toEqual([]);
      expect(onV2, what).toEqual(onV1);
    }
  });

  it("refuses an authored dial the narrowed envelope forbids, on both transports", () => {
    const registered = getTenantThemeVerticalEnvelope(IDENTITY.verticalKey)!;
    const narrowed = {
      ...registered,
      ranges: { ...registered.ranges, radiusScale: { min: 0.8, max: 1 } },
    };
    expect(
      issuesOf(() =>
        compileTenantThemeDocumentV2({
          ...IDENTITY,
          document: { version: 2, plan: "pro", decisions: { "shape.radius-scale": 1.15 } },
          verticalEnvelope: narrowed,
        })
      )
    ).toEqual([
      {
        code: "invalid_value",
        path: '$.decisions["shape.radius-scale"]',
        message: "Value exceeds the bithire envelope",
      },
    ]);
    expect(
      issuesOf(() =>
        compileTenantThemeConfig(
          {
            schemaVersion: 1,
            mode: "simple",
            appearance: { shape: { radiusScale: 1.15 } },
            ...IDENTITY,
          },
          { verticalEnvelope: narrowed }
        )
      )
    ).toEqual([
      {
        code: "invalid_value",
        path: "$.appearance.shape.radiusScale",
        message: "Value exceeds the bithire envelope",
      },
    ]);
    // The same narrowed envelope still publishes a document that respects it.
    expect(
      compileTenantThemeDocumentV2({
        ...IDENTITY,
        document: DOCUMENT,
        verticalEnvelope: narrowed,
      }).artifact.slug
    ).toBe(IDENTITY.slug);
  });

  it("propagates the door's tier refusal without re-dressing it", () => {
    expect(() =>
      compileTenantThemeDocumentV2({
        ...IDENTITY,
        document: {
          version: 2,
          plan: "standard",
          decisions: { "palette.dark-mode": "auto" },
        },
      })
    ).toThrow(TenantThemeDocumentV2Error);
  });
});
