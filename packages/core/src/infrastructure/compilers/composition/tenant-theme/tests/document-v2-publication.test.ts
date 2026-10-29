/**
 * The decision-document publication seam through the public server entrypoint,
 * including artifact verification, identity admission and named refusals.
 */
import { describe, expect, it } from "vitest";

import {
  TENANT_THEME_CONFIG_SCHEMA,
  TenantThemeValidationError,
  canonicalizeTenantThemeValue,
  compileTenantThemeConfig,
  compileTenantThemeDocumentV2,
  getTenantThemeVerticalEnvelope,
  validateTenantThemeConfig,
} from "@rottay/design-system/server";
import type {
  TenantThemeArtifact,
  TenantThemeDocumentV2,
} from "@rottay/design-system/server";
import {
  TenantThemeDocumentError,
  TenantThemeDocumentV2Error,
} from "@/contracts/theme/presentation/document";
// The verifier is deliberately NOT public: a consumer proves a mount through
// `resolveVisualAuthority`. This suite asserts the producer/verifier pair, so
// it reads the verifier where it lives.
import { verifyTenantThemeArtifactV1 } from "@/infrastructure/runtime/theming/foundation/visual-authority/foundation/admission";

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
    // The authored pairing owns its own leaf AND every leaf it expands into:
    // nothing more specific named them, so the causal owner is the selection
    // that caused them (I-P0/I-P3a). The expansion set is read from the
    // lowering that performs it, so it is the pairing's real reach -- fonts,
    // the heading tracking and the display leading -- not a shorter table.
    expect(entryFor(compilation, "typography.pairing")?.effectiveLeaves).toEqual(
      [
        "typography.typePairing",
        "typography.fontFamilyBase",
        "typography.fontFamilyHeading",
        "typography.letterSpacing.heading",
        "typography.lineHeight.display",
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

  it("records a v1 row's own authorship, and still mounts an artifact carrying none", () => {
    // The v1 transport reaches the SAME door, so it resolves the same ledger:
    // `density: compact` is a decision this row authored and the artifact says
    // so. A v1 row carries no plan, so nothing is tier-judged -- the ledger is
    // an authorship record here, not an entitlement one.
    const authored = compileTenantThemeConfig(
      {
        schemaVersion: 1,
        mode: "simple",
        appearance: { density: "compact" },
        ...IDENTITY,
      },
      { verticalEnvelope: getTenantThemeVerticalEnvelope(IDENTITY.verticalKey) }
    );
    expect(
      authored.provenance?.entries.map((entry) => [entry.ref, entry.provenance])
    ).toEqual([[{ kind: "decision", id: "density.mode" }, "direct-override"]]);
    // A row that authored nothing the ledger models emits no provenance and
    // puts none in its digest: it verifies exactly as a row compiled before
    // this field existed does, which is the compatibility half of the
    // extension.
    const legacy = compileTenantThemeConfig(
      { schemaVersion: 1, mode: "simple", appearance: {}, ...IDENTITY },
      { verticalEnvelope: getTenantThemeVerticalEnvelope(IDENTITY.verticalKey) }
    );
    expect(legacy.provenance).toBeUndefined();
    for (const artifact of [legacy, authored]) {
      expect(
        verifyTenantThemeArtifactV1(artifact, {
          slug: IDENTITY.slug,
          verticalKey: IDENTITY.verticalKey,
        })
      ).toEqual({ ok: true, artifact });
    }
  });
});

describe.each([2, 3] as const)("compileTenantThemeDocumentV2 · version %i slug admission", (version) => {
  const document = { ...DOCUMENT, version };

  it.each([
    ["empty", ""],
    ["uppercase", "Northwind"],
    ["underscore", "north_wind"],
    ["leading hyphen", "-northwind"],
    ["trailing hyphen", "northwind-"],
    ["double hyphen only", "--"],
    ["non-ASCII", "nórthwind"],
    ["65 characters", "a".repeat(65)],
    ["longer than 65 characters", "a".repeat(128)],
    ["whitespace", "north wind"],
    ["selector punctuation", 'northwind"]'],
  ])("refuses %s with a named slug issue", (_label, slug) => {
    expect(
      issuesOf(() => compileTenantThemeDocumentV2({ ...IDENTITY, slug, document }))
    ).toEqual([
      {
        code: "invalid_value",
        path: "$.slug",
        message: "Expected a lowercase slug of 1 to 64 characters with alphanumeric endpoints",
      },
    ]);
  });

  it.each([undefined, null, 7, { toString: () => "northwind" }])(
    "refuses a non-string slug %j without coercion",
    (slug) => {
      expect(
        issuesOf(() => compileTenantThemeDocumentV2({ ...IDENTITY, slug: slug as never, document }))
      ).toEqual([expect.objectContaining({ code: "invalid_value", path: "$.slug" })]);
    }
  );

  it.each(["a", "0", "a0", "northwind", "north-wind-7", "a".repeat(64), "0" + "-".repeat(62) + "9", "tenant--one"])(
    "preserves and verifies the valid slug %j",
    (slug) => {
      const { artifact } = compileTenantThemeDocumentV2({ ...IDENTITY, slug, document });
      expect(artifact).toMatchObject({ ...IDENTITY, slug });
      const reloaded = JSON.parse(JSON.stringify(artifact)) as TenantThemeArtifact;
      expect(
        verifyTenantThemeArtifactV1(reloaded, { slug, verticalKey: IDENTITY.verticalKey })
      ).toEqual({ ok: true, artifact: reloaded });
      expect(
        compileTenantThemeConfig(
          { schemaVersion: 1, mode: "simple", appearance: {}, ...IDENTITY, slug },
          { verticalEnvelope: getTenantThemeVerticalEnvelope(IDENTITY.verticalKey) }
        ).slug
      ).toBe(slug);
    }
  );

  it.each(["rottay", "bithire", "evnto", "Bit-Hire", "ＢｉｔＨｉｒｅ"])(
    "preserves the reserved-identity refusal for %j",
    (slug) => {
      expect(() => compileTenantThemeDocumentV2({ ...IDENTITY, slug, document })).toThrow(
        expect.objectContaining({ name: "ReservedTenantIdentityError" })
      );
    }
  );
});

describe.each([2, 3] as const)("compileTenantThemeDocumentV2 · version %i payload ceilings", (version) => {
  const { maxDepth, maxObjectFields, maxDocumentBytes } = TENANT_THEME_CONFIG_SCHEMA.limits;
  // A raw channel is refused by the admission's recursive walk only once the
  // walk reaches it, so its refusal proves the walk ran over the whole payload.
  const RAW = { "--ds-card-bg": "red" };
  const RAW_WALK = expect.objectContaining({ message: expect.stringContaining('raw channel "--ds-card-bg"') });
  const withChrome = (chrome: Record<string, unknown>) =>
    ({ version, plan: "pro", decisions: {}, overrides: { chrome } }) as unknown as TenantThemeDocumentV2;
  const compile = (document: TenantThemeDocumentV2) => () =>
    compileTenantThemeDocumentV2({ ...IDENTITY, document });
  const ceiling = (message: string) => [{ code: "invalid_value", path: "$.document", message }];

  // document 0 -> overrides 1 -> chrome 2 -> cardComponent 3; the raw leaf sits one below the last wrapper.
  const atDepth = (depth: number) => {
    let node: Record<string, unknown> = RAW;
    for (let level = 4; level < depth; level += 1) node = { k: node };
    return withChrome({ cardComponent: node });
  };
  // version, plan, decisions, overrides, chrome and cardComponent hold six fields; the raw key is the last.
  const withFields = (fields: number) =>
    withChrome({
      cardComponent: Object.fromEntries([
        ...Array.from({ length: fields - 7 }, (_, index) => [`f${index}`, "x"]),
        ["--ds-card-bg", "red"],
      ]),
    });
  const withBytes = (bytes: number) => {
    const bare = new TextEncoder().encode(
      canonicalizeTenantThemeValue(withChrome({ modal: { overlayBg: "" }, cardComponent: RAW }))
    ).byteLength;
    return withChrome({ modal: { overlayBg: "x".repeat(bytes - bare) }, cardComponent: RAW });
  };

  it.each([
    ["depth", () => atDepth(maxDepth)],
    ["field count", () => withFields(maxObjectFields)],
    ["canonical bytes", () => withBytes(maxDocumentBytes)],
  ])("lets a payload exactly at the %s ceiling reach the admission walk", (_label, build) => {
    const document = build();
    expect(compile(document)).toThrow(RAW_WALK);
    expect(compile(document)).toThrow(TenantThemeDocumentError);
  });

  it.each([
    ["depth", () => atDepth(maxDepth + 1), `Maximum object depth is ${maxDepth}`],
    ["field count", () => withFields(maxObjectFields + 1), `Maximum field count is ${maxObjectFields}`],
    ["canonical bytes", () => withBytes(maxDocumentBytes + 1), `Maximum canonical payload is ${maxDocumentBytes} bytes`],
  ])("refuses one %s over the ceiling before the admission walks it", (_label, build, message) => {
    expect(issuesOf(compile(build()))).toEqual(ceiling(message));
  });

  it("answers with the v1 terminal's measurement and messages", () => {
    const payload = {
      deep: atDepth(maxDepth + 4),
      wide: withFields(maxObjectFields + 1),
      long: "x".repeat(maxDocumentBytes),
    };
    const v1 = validateTenantThemeConfig({ schemaVersion: 1, mode: "simple", appearance: payload });
    const onV1 = v1.success ? [] : v1.issues.filter((issue) => issue.path === "$");
    const onV2 = issuesOf(compile(withChrome({ cardComponent: payload })));
    expect(onV1).toHaveLength(3);
    expect(onV2).toEqual(onV1.map(({ code, message }) => ({ code, path: "$.document", message })));
  });

  it("keeps compiling a document whose optional members are left undefined", () => {
    const document = {
      ...DOCUMENT,
      version,
      overrides: undefined,
      decisions: { ...DOCUMENT.decisions, "palette.seeds": { primary: "#2f6bff", secondary: undefined } },
    } as unknown as TenantThemeDocumentV2;
    const { artifact } = compileTenantThemeDocumentV2({ ...IDENTITY, document });
    const reloaded = JSON.parse(JSON.stringify(artifact)) as TenantThemeArtifact;
    expect(
      verifyTenantThemeArtifactV1(reloaded, { slug: IDENTITY.slug, verticalKey: IDENTITY.verticalKey })
    ).toEqual({ ok: true, artifact: reloaded });
  });

  it("keeps the lowering's typed refusal for a cyclic document", () => {
    const cycle: Record<string, unknown> = {};
    Object.assign(cycle, { k: cycle });
    expect(issuesOf(compile(withChrome({ cardComponent: cycle })))).toEqual([
      expect.objectContaining({
        code: "invalid_value",
        path: "$.document",
        message: expect.stringContaining("Rejected by the ISO Theme lowering"),
      }),
    ]);
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
            // WO-CAT-04: the terminal reads both decision versions, so the
            // refusal names the set rather than a single literal. A v1 row is
            // still refused here; `compileTenantTheme` is its door.
            message: "Only TenantThemeDocument versions 2 | 3 are supported",
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
