import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
  TenantThemeVerticalEnvelope,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  TENANT_THEME_COMPILER_VERSION,
  TENANT_THEME_CONFIG_SCHEMA,
  TENANT_THEME_CONFIG_SCHEMA_DIGEST,
  TENANT_THEME_DOCUMENT_SCHEMA_DIGEST,
  TENANT_THEME_VERTICAL_ENVELOPES,
  TenantThemeValidationError,
  canonicalizeTenantThemeValue,
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  parseTenantThemeDocument,
  sha256TenantThemeValue,
  tenantThemeArtifactRootAttributes,
  validateTenantThemeConfig,
  validateTenantThemeDocument,
} from "..";
import { themeLeafOptions } from "@/foundation/contracts/composition/tenants/themes/iso/schema";
import { migrateV1 } from "../migrate-v1";

const IDENTITY: TenantThemeConfigIdentity = {
  tenantId: "tenant_01",
  slug: "themanagementmiami",
  verticalKey: "bithire",
  rowVersion: 7,
};

const BITHIRE_STATIC_ARTIFACT = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/facade/artifacts/bithire/index.css"
  ),
  "utf8"
);

const SIMPLE_DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {
    palette: {
      primary: "#0F766E",
      secondary: "#8C6D46",
      accent: "#E2725B",
      foreground: {
        muted: "#6B6154",
        disabled: "#80766A",
      },
    },
    typography: {
      fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
      fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
    },
    density: "normal",
    motion: { intensity: 0.62, durationScale: 1.15, ambient: "subtle" },
    shape: { buttonStyle: "soft" },
    surfaces: { elevation: "elevated" },
    navigation: { sidebarTone: "subtle" },
  },
};

const ADVANCED_DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general:
      SIMPLE_DOCUMENT.mode === "simple" ? SIMPLE_DOCUMENT.appearance : {},
    advanced: {
      tokenOverrides: {
        "--ds-color-bg-primary": "#FBF6EC",
        "--ds-color-success": "#5B8A3A",
        "--ds-color-warning": "#C39E22",
        "--ds-color-error": "#C0392B",
        "--ds-color-info": "#5B6FA8",
        "--ds-font-family-display":
          "'Fraunces', Georgia, 'Times New Roman', serif",
        "--ds-radius-sm": "4px",
        "--ds-radius-md": "6px",
        "--ds-radius-lg": "8px",
        "--ds-radius-xl": "12px",
        "--ds-shadow-md":
          "0 4px 10px rgba(46, 38, 28, 0.08), 0 1px 3px rgba(46, 38, 28, 0.05)",
        "--ds-gradient-primary": "linear-gradient(135deg, #0F766E, #E2725B)",
        "--ds-effect-intensity": 0.45,
      },
      chrome: {
        sidebar: {
          bg: "#FFFEFB",
          border: "#E2D9CC",
          text: "#2E261C",
          width: "284px",
          collapsedWidth: "72px",
          headerHeight: "68px",
          iconSize: "18px",
          // The active row is a governed APCA pair
          // (`--ds-sidebar-item-color-active` over
          // `--ds-sidebar-item-bg-active`), so this document authors BOTH
          // halves as hex. It used to author only the ground, as
          // `var(--ds-tint-8)`, and only got away with it because the ground
          // happened to be byte-identical to the vertical's own base value and
          // therefore never counted as changed. A tenant leaf now holds its
          // rank inside every mode it did not qualify, so that half-statement
          // reached the dark block and paired a reference ground with a dark
          // ink the tenant never wrote -- non-hex-ground, correctly rejected at
          // intake. Authoring a verifiable pair is the honest fixture: warm
          // paper wash under the document's own sidebar ink.
          itemBgActive: "#F3EEE5",
          itemColorActive: "#2E261C",
          // Governed reference tokens stay covered, on a channel that is not
          // half of a contrast pair -- a hover wash carries no text.
          itemBgHover: "var(--ds-tint-8)",
        },
        layout: {
          headerHeight: "64px",
        },
        shell: {
          commandHomeMaxWidth: "1180px",
          commandHomeGap: "20px",
          commandHomePanelGap: "14px",
          commandHomeCompactActionHeight: "38px",
          commandHomeConsoleMinHeight: "320px",
          commandHomeConsolePadding: "20px",
          commandHomeIconBg: "#F3EEE5",
          commandHomeIconBorder: "#D8CFC1",
        },
        badge: {
          fontFamily: "Optima, Candara, 'Noto Sans', sans-serif",
          fontWeight: 650,
          radius: "3px",
          chipRadius: "4px",
          pillRadius: "6px",
          surface: "#FFFEFB",
          ink: "#2E261C",
          frame: "#9B8A73",
          surfaceHover: "#FBF3E7",
          frameHover: "#0F766E",
          selectedSurface: "#E7F2EE",
          selectedFrame: "#0F766E",
          countRadius: "2px",
          removeRadius: "2px",
          removeOpacity: 0.82,
          pulseScale: 1.2,
          motionDuration: "190ms",
          motionEasing: "ease-out",
        },
        table: {
          bg: "#FFFEFB",
          headerBg: "#FFFFFF",
          rowBgHover: "#FBF3E7",
          rowBgSelected: "var(--ds-tint-12)",
          headerFontWeight: 700,
          headerLetterSpacing: "0.04em",
          headerTextTransform: "none",
          headerBlockSize: "42px",
        },
        cardComponent: {
          bg: "#FFFEFB",
          border: "transparent",
          shadow: "0 4px 10px rgba(46, 38, 28, 0.08)",
          radius: "8px",
          hoverTransform: "translateY(-1px)",
          titleFontWeight: 600,
        },
        metricCard: {
          bg: "#FFFEFB",
          minHeight: "156px",
          hoverTransform: "translateY(-1px)",
          transition: "background 180ms ease, transform 180ms ease",
          iconBg: "#F3EEE5",
          iconBorder: "#D8CFC1",
          meterFill: "linear-gradient(90deg, #0F766E, #E2725B)",
          valueColor: "#2E261C",
        },
        signalCard: {
          topLineDisplay: "none",
        },
        listingGrid: {
          minCardWidth: "240px",
          minCompactWidth: "180px",
          minTallWidth: "280px",
          columns: "repeat(3, minmax(0, 1fr))",
        },
      },
    },
  },
};

const BITHIRE_TEST_ENVELOPE = getTenantThemeVerticalEnvelope("bithire")!;
const EVNTO_TEST_ENVELOPE = getTenantThemeVerticalEnvelope("evnto")!;

const hydrate = (
  document: TenantThemeDocument = SIMPLE_DOCUMENT,
  identity: TenantThemeConfigIdentity = IDENTITY
) => hydrateTenantThemeConfig(document, identity);

/**
 * Every terminal keypath of a ThemePatch. Used to count what survives the v1
 * migration: an authored dial that collides with another one, or that the
 * migration silently drops, changes this cardinality even though the document
 * itself still validates.
 */
const leafKeypaths = (value: unknown, prefix = ""): string[] => {
  if (value === null || typeof value !== "object") return [prefix];
  if (Array.isArray(value))
    return value.flatMap((entry, index) =>
      leafKeypaths(entry, `${prefix}[${index}]`)
    );
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, entry]) => leafKeypaths(entry, prefix ? `${prefix}.${key}` : key)
  );
};

/**
 * How an authored radius literal reaches the artifact once the shared radius
 * dial folds it: a tenant corner stays reachable by `shape.radius-scale`
 * instead of outranking it from the unlayered tenant block. Spelled out here
 * rather than imported so the expectation is not the emitter's own arithmetic.
 * The BitHire envelope contributes the governed 1.25 radius scale before the
 * shared dial is applied, so authored layout radii are normalized back to the
 * canonical scale instead of being magnified a second time.
 */
const dialedRadius = (authored: string) =>
  `calc(${authored} / 1.25 * var(--ds-radius-scale, 1))`;

describe("DS-S001 DB recipe-profile channel", () => {
  it("persists a valid selection through normalized Appearance and CSS", () => {
    const document = structuredClone(ADVANCED_DOCUMENT);
    if (document.mode !== "advanced") {
      throw new Error("Expected the advanced fixture");
    }
    document.visualFoundation.recipeProfile = "rottay/editorial-round@1";

    expect(validateTenantThemeDocument(document).success).toBe(true);
    const artifact = compileTenantThemeConfig(hydrate(document), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });

    expect(artifact.normalizedAppearance.recipeProfile).toBe(
      "rottay/editorial-round@1"
    );
    expect(artifact.variables["--ds-recipe-profile"]).toBe(
      '"rottay/editorial-round@1"'
    );
  });

  it("rejects unpublished ids at the DB schema boundary", () => {
    const document = structuredClone(ADVANCED_DOCUMENT);
    if (document.mode !== "advanced") {
      throw new Error("Expected the advanced fixture");
    }
    document.visualFoundation.recipeProfile = "foreign/not-published@9";

    const validation = validateTenantThemeDocument(document);
    expect(validation.success).toBe(false);
    if (validation.success) throw new Error("expected a rejected document");
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "$.visualFoundation.recipeProfile",
        }),
      ])
    );
  });
});

describe("TenantThemeConfig v1 server contract", () => {
  it("uses a portable SHA-256 implementation with the canonical known vector", () => {
    const expected = createHash("sha256").update("abc").digest("hex");
    expect(sha256TenantThemeValue("abc")).toBe(expected);
    expect(sha256TenantThemeValue("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("publishes immutable schema/document drift sentinels", () => {
    // OVL-PV-01-RETIRE re-anchor: both digests moved exactly once because the
    // popover document schema STOPPED publishing four fields —
    // `borderedHighlight`, `minimalHighlight`, `inverseHighlight` and
    // `richHighlight`. This is a NARROWING, the rare direction for these
    // sentinels, and it is the point of the change rather than a side effect:
    // the popover skin's readers for those channels were deleted by OVL-PV-01
    // (the family sheen was a SECOND top-light beside the surface's own
    // intensity-governed zenith keyline), leaving the compiler emitting four
    // `--ds-popover-*-highlight` variables that nothing read. A channel a
    // tenant can set and no surface consumes is a promise the product does not
    // keep, so the emission, the DB schema field and the typed contract field
    // were withdrawn together. The per-recipe decoration axis popover DOES
    // expose is `*Texture`, consumed by all four recipes; the tooltip contract
    // keeps its own `*Highlight` because the tooltip skin still reads it.
    // The move is confined to these two sentinels: no fixture or first-party
    // document authors popover chrome, so every PINNED artifact digest is
    // unchanged (verified by probe before re-anchoring).
    //
    // E2 re-anchor: both digests moved exactly once because `advanced` gained
    // the RESPONSIVE POSTURE axis (closed enum over the published ladder
    // registry — the container-width thresholds the adaptive runtime resolves
    // postures on). The axis is data-only: no CSS channel is emitted, so the
    // move is confined to these two sentinels and the PINNED artifact digests
    // below did not move — no existing document authors `responsivePosture`,
    // and absent resolves to the baseline ladder whose thresholds ARE the
    // pre-capability 639/839 constants. Previous moves: E1 (general gained the
    // rhythm axis + E2 responsivePosture landed in CONCURRENT agent trees;
    // this integration re-anchor captures their SUM — the final schema's
    // only additions vs pre-wave are exactly those two fields, verified by
    // git diff at integration), C2 (advanced.profiles gained the icon axis), C1b
    // (expressive selection fields), C1 (--ds-color-bg-overlay allowlist row).
    // R1 Cohort 1 re-anchor: both digests moved because the schema PUBLISHES
    // the recipe-profile registry as a closed enum -- `schemas/tenant-theme`
    // spreads `RECIPE_PROFILES.map(p => p.id)` into the document schema -- and
    // that registry gained `rottay/network-professional@1`.
    //
    // The addition was FORCED, not preferred, and the alternatives were
    // exhausted first: the db-row canary requires the recipe-profile axis to
    // diverge; The Management had to leave `editorial-round@1` because its
    // `shape: 'round'` default routes buttons to `--ds-radius-full`, which no
    // allowlisted override can square and which pill-forbids that direction;
    // that leaves `technical-sharp@1` occupied by The Management; and
    // `editorial-round@1` cannot absorb BitHire because it was sighted and
    // REJECTED there. With only two published profiles the axis could not
    // diverge at all, so a third entry was the only route.
    //
    // This is a genuine SCHEMA-surface change, which is exactly what these
    // sentinels exist to catch -- they caught it. The re-anchor is recorded
    // with its cause, following the same protocol as the moves below; no
    // sentinel was widened, no assertion relaxed, and the digest was not
    // copied merely to turn the suite green. The new id is permanent per the
    // registry's supersede-never-reuse law.
    // Modern-rescue plumbing re-anchor: both digests moved exactly once
    // because `TENANT_THEME_OVERRIDE_TOKENS` STOPPED publishing four rows --
    // `--ds-color-dark-primary`, `-secondary`, `-accent` and `-bg`. Another
    // NARROWING, and the same shape as the OVL-PV-01 move above: no compiler
    // emits that channel family and no stylesheet reads it, so allowing a
    // tenant to write one was a knob wired to nothing. The static path's
    // `dark*Color` palette fields and its the retired dark-ramp twin twin
    // were withdrawn in the same change, so the family is gone from every
    // producer, contract and allowlist at once rather than surviving on the
    // input side alone.
    //
    // A tenant's dark values are not lost: they belong to its dark MODE and
    // reach the PLAIN channel names while that mode is active -- through
    // `palette.dark` and `light-dark()` on this DB path, and through
    // `modes.dark` on the static one. Both were already the supported route.
    //
    // The move is confined to these two sentinels plus the populated-simple
    // artifact digest, which moved for a different, separately declared
    // reason (the shared interaction floor). No fixture or first-party
    // document authors a `--ds-color-dark-*` override, so nothing else
    // re-anchored. No sentinel was widened and no assertion relaxed.
    //
    // ROTTAY-T1 re-anchor: both digests moved once more because the document
    // schema gained the DB mirror for the chrome channels the rottay extension
    // drain moved into the governed contract. This is a WIDENING, the ordinary
    // direction, and it is strictly additive: measured against the pre-tranche
    // schema the surface gains 117 leaf paths and removes ZERO -- 57 new
    // fields (each publishing a `type` and a `format`) plus three new
    // container objects (`controls.form`, `controls.textarea` and
    // `search.commandPalette`, which publish a `type` of their own).
    //
    // The 57 fields land in eight chrome sections: badge (2), controls.form
    // (8), controls.textarea (13), layout (1), popover (5),
    // search.commandPalette (7), sidebar (9) and tooltip (12). Each one exists
    // because a channel the extension used to hard-code now has to be
    // reachable from BOTH transports -- a static Theme field with no DB mirror
    // would make the drain a downgrade for DB tenants, which is the exact
    // asymmetry Theme-ISO forbids.
    //
    // Nothing was withdrawn, no existing field changed type or format, and no
    // artifact digest below moved: no fixture or first-party document authors
    // any of the 57, so absent still resolves to the same compiled output as
    // before the widening (verified by probe against a HEAD-materialized copy
    // of this schema before re-anchoring). The sidebar nine are the same nine
    // the G4 ruling migrated on the static side, so both transports gained the
    // family in the same tranche rather than drifting apart.
    //
    // ROTTAY-T2 MASS re-anchor: both digests moved once more, for the same
    // reason and in the same direction as ROTTAY-T1 -- the document schema
    // gained the DB mirror for the control chrome the second rottay extension
    // tranche moved into the governed contract. 302 physical declarations
    // (151 unique channels) left `artifacts/rottay/_source/extension.css`; 261
    // of them became typed leaves on both transports and 41 were proven to be
    // derivations of a floor that already paints them.
    //
    // The widening is STRICTLY ADDITIVE and was measured, not asserted: against
    // a reconstruction of the pre-tranche schema (this file's own predecessor
    // digest reproduced byte-exactly by removing the ROTTAY-T2 block and
    // nothing else) the surface gains 678 leaf paths and removes ZERO. That
    // total is 13 new container objects and 163 new fields, each field
    // publishing a `type` and a `format`, counted across the two projections
    // the schema publishes the advanced document through (`documents.advanced`
    // and `modes.advanced`): (163 * 2 + 13) * 2 = 678.
    //
    // The 13 containers are `controls.select` plus the twelve families
    // `autocomplete`, `checkbox`, `datePicker`, `inputNumber`, `radio`, `rate`,
    // `slider`, `switch`, `timePicker`, `toggle`, `transfer` and `upload`. The
    // measured per-container field counts are autocomplete 10, checkbox 13,
    // datePicker 12, inputNumber 13, radio 14, rate 1, select 33, slider 9,
    // switch 8, timePicker 11, toggle 12, transfer 5, upload 22 -- 130 across
    // the twelve, plus the select 33 (the 15 channels the C3 vocabulary
    // already governed on the static side plus the 18 this tranche added).
    // `select` is a container here for the first time: the DB transport had no
    // select mirror at all before this tranche, which is precisely the
    // asymmetry Theme-ISO forbids and the reason it is admitted now.
    //
    // Nothing was withdrawn, no existing field changed type or format, and
    // every leaf is a closed VISUAL field -- no open map, no legacy alias, no
    // slug or product branch. No fixture or first-party document authors any
    // of the 163, so absent still resolves to the same compiled output and no
    // PINNED artifact digest below moved.
    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).not.toBe(
      "sha256-713ccbafb369557d4e9c57686400e9eef2a02dd0dc478ab3fa0862ca9eb1d5d6"
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).not.toBe(
      "sha256-d8871d06009115f98da1afef5c32ce961b387d7078d6092f331d090e35355a7f"
    );
    // F4A-6/K3 re-anchor (class R-1): the schema PUBLISHES referenceTokens and
    // gained --ds-color-text-page. This is an AMPLIATION of the closed field
    // set, not a narrowing -- no field was withdrawn, no existing field
    // changed type or format, same law as the sentinel note above this one.
    // Both pins re-derived from the tree and verified directly against the
    // published digests (dist/server.js) before writing, not copied blind.
    // C0 re-anchor: a3ba2e479 withdrew `segmented.itemShadowSelected` and
    // `segmented.focusRing` -- the pair whose emitters, artifact declarations
    // and skin reads were already retired. A NARROWING this time, and the
    // superseded pins stay asserted so the ratchet keeps its history. Both
    // values re-derived from the tree; `canonical-digest-identity.test.ts`
    // carries the same move with the full supersession chain.
    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).not.toBe(
      "sha256-9b9d5b8d32a90805d9a52998d9e94b2fa586491063a19055d94b713a8b53a739"
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).not.toBe(
      "sha256-e893268074cc59e4acdeaf27a0986d71104c98df67c12bf643031ed615caa952"
    );
    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).toBe(
      "sha256-c35633aea90299acc841fc8e62221622e44083941761dfd4e71d80ef642f5c45"
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).toBe(
      "sha256-576975600674f58a3e3f2a1a8d12e51f6ff0294df84da40c7e379e7c72ef9188"
    );
    expect(Object.isFrozen(TENANT_THEME_CONFIG_SCHEMA)).toBe(true);
    expect(Object.isFrozen(TENANT_THEME_CONFIG_SCHEMA.documents.simple)).toBe(
      true
    );
    expect(Object.isFrozen(TENANT_THEME_CONFIG_SCHEMA.limits)).toBe(true);
    expect(TENANT_THEME_COMPILER_VERSION).toBe("tenant-theme-compiler@4");
    expect(TENANT_THEME_CONFIG_SCHEMA.limits).toMatchObject({
      maxCompiledVariables: 512,
      maxCompiledVariableBytes: 90_112,
      maxTokenOverrides: 200,
    });
    expect(TENANT_THEME_CONFIG_SCHEMA.scopeAttributes).toEqual([
      "data-ds-root",
      "data-vertical",
      "data-tenant",
    ]);
    expect(() => {
      (
        TENANT_THEME_CONFIG_SCHEMA.limits as { maxDepth: number }
      ).maxDepth = 999;
    }).toThrow(TypeError);
  });

  it("owns the complete BitHire policy envelope in the server-safe registry", () => {
    expect(BITHIRE_TEST_ENVELOPE).toEqual({
      schemaVersion: 1,
      verticalKey: "bithire",
      allowedModes: ["simple", "advanced"],
      advanced: {
        chromeFamilies: [
          "sidebar",
          "layout",
          "shell",
          "toolbar",
          "filterPill",
          "badge",
          "breadcrumb",
          "search",
          "controls",
          "table",
          "cardComponent",
          "metricCard",
          "signalCard",
          "workspaceCard",
          "compactCard",
          "tallCard",
          "collectionCard",
          "listingGrid",
          "modal",
          "tooltip",
          "popover",
          "tabs",
          // ROTTAY-T3 CHROME ROSTER WIDENING (2026-08-15): the roster went
          // 22 -> 48 top-level families. The list is published inside every
          // vertical envelope, so the envelope digest moves, and both schema
          // sentinels above move exactly once for these 26 names and nothing
          // else.
          "alert",
          "anchor",
          "avatar",
          "backTop",
          "calendar",
          "collapse",
          "descriptions",
          "drawer",
          "dropdown",
          "empty",
          "floatButton",
          "liveFeed",
          "menu",
          "message",
          "notification",
          "pagination",
          "progress",
          "result",
          "skeleton",
          "spinner",
          "statistic",
          "statsGrid",
          "steps",
          "tag",
          "timeline",
          "tree",
        ],
        allowTokenOverrides: true,
        allowAnatomyVariants: true,
      },
      ranges: {
        densityScale: { min: 0.85, max: 1.15 },
        effectIntensity: { min: 0, max: 0.65 },
        motionIntensity: { min: 0, max: 0.8 },
        motionDurationScale: { min: 0.75, max: 1.35 },
        typeScale: { min: 0.92, max: 1.08 },
        radiusScale: { min: 0.8, max: 1.2 },
      },
    } satisfies TenantThemeVerticalEnvelope);
    expect(Object.isFrozen(TENANT_THEME_VERTICAL_ENVELOPES)).toBe(true);
    expect(
      Object.isFrozen(BITHIRE_TEST_ENVELOPE.advanced?.chromeFamilies)
    ).toBe(true);
    expect(getTenantThemeVerticalEnvelope("unknown")).toBeUndefined();
  });

  it("owns a bounded Evnto envelope and rejects vertical identity widening", () => {
    expect(EVNTO_TEST_ENVELOPE).toMatchObject({
      schemaVersion: 1,
      verticalKey: "evnto",
      allowedModes: ["simple", "advanced"],
      advanced: {
        allowTokenOverrides: true,
        allowAnatomyVariants: true,
        chromeFamilies: BITHIRE_TEST_ENVELOPE.advanced!.chromeFamilies,
      },
      ranges: {
        densityScale: { min: 0.85, max: 1.15 },
        effectIntensity: { min: 0, max: 0.75 },
        motionIntensity: { min: 0, max: 0.8 },
        motionDurationScale: { min: 0.75, max: 1.35 },
        typeScale: { min: 0.92, max: 1.08 },
        radiusScale: { min: 0.8, max: 1.2 },
      },
    } satisfies Partial<TenantThemeVerticalEnvelope>);
    expect(EVNTO_TEST_ENVELOPE.advanced?.chromeFamilies).toEqual(
      BITHIRE_TEST_ENVELOPE.advanced?.chromeFamilies
    );
    expect(Object.isFrozen(EVNTO_TEST_ENVELOPE)).toBe(true);
    expect(Object.isFrozen(EVNTO_TEST_ENVELOPE.ranges)).toBe(true);

    const evntoIdentity: TenantThemeConfigIdentity = {
      ...IDENTITY,
      tenantId: "tenant_evnto",
      slug: "acme-events",
      verticalKey: "evnto",
    };
    const config = hydrateTenantThemeConfig(SIMPLE_DOCUMENT, evntoIdentity);
    const artifact = compileTenantThemeConfig(config, {
      verticalEnvelope: EVNTO_TEST_ENVELOPE,
    });

    expect(artifact.verticalKey).toBe("evnto");
    expect(artifact.scopes.combinedSelector).toContain(
      '[data-vertical="evnto"]'
    );
    expect(artifact.verticalEnvelopeDigest).toMatch(/^sha256-[a-f0-9]{64}$/);
    expect(() =>
      compileTenantThemeConfig(config, {
        verticalEnvelope: BITHIRE_TEST_ENVELOPE,
      })
    ).toThrow(TenantThemeValidationError);
  });

  it("keeps row identity out of the persisted document and hydrates from trusted columns", () => {
    expect(validateTenantThemeDocument(SIMPLE_DOCUMENT).success).toBe(true);
    expect(
      validateTenantThemeDocument({
        ...SIMPLE_DOCUMENT,
        tenantId: IDENTITY.tenantId,
      })
    ).toMatchObject({
      success: false,
      issues: [{ code: "unknown_key", path: "$.tenantId" }],
    });
    expect(hydrate()).toMatchObject({ ...IDENTITY, mode: "simple" });
  });

  it("rejects presentation switches instead of turning tenant data into a CSS router", () => {
    const result = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: "simple",
      appearance: { presentationProfile: "tenant-authored-css" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          code: "unknown_key",
          path: "$.appearance.presentationProfile",
        })
      );
    }
  });

  it("fails closed when trusted row identity disagrees with request/directory identity", () => {
    expect(() =>
      hydrateTenantThemeConfig(SIMPLE_DOCUMENT, IDENTITY, {
        expectedIdentity: { tenantId: "another-tenant", slug: IDENTITY.slug },
      })
    ).toThrow(TenantThemeValidationError);
  });

  it("does not touch browser globals while validating and compiling for SSR", () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    vi.stubGlobal("localStorage", undefined);
    try {
      expect(() => compileTenantThemeConfig(hydrate())).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("deterministic artifact compilation and isolation", () => {
  it("normalizes key order and emits byte-identical artifacts", () => {
    const ordered = hydrate();
    const reversed = {
      rowVersion: IDENTITY.rowVersion,
      verticalKey: IDENTITY.verticalKey,
      slug: IDENTITY.slug,
      tenantId: IDENTITY.tenantId,
      appearance: {
        navigation: { sidebarTone: "subtle" },
        surfaces: { elevation: "elevated" },
        shape: { buttonStyle: "soft" },
        motion: { ambient: "subtle", durationScale: 1.15, intensity: 0.62 },
        density: "normal",
        typography: {
          fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
          fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        },
        palette: {
          accent: "#E2725B",
          secondary: "#8C6D46",
          primary: "#0F766E",
          foreground: {
            disabled: "#80766A",
            muted: "#6B6154",
          },
        },
      },
      mode: "simple",
      schemaVersion: 1,
    };
    const left = compileTenantThemeConfig(ordered);
    const right = compileTenantThemeConfig(reversed);
    expect(canonicalizeTenantThemeValue(ordered)).toBe(
      canonicalizeTenantThemeValue(reversed)
    );
    // `toEqual` is order-INSENSITIVE: on its own it proves the two compiles
    // carry the same channels and the same values, and says nothing about the
    // order they are emitted in. The artifact is served as text, so emission
    // order is part of the contract — assert it positionally, and assert the
    // text and the cache digest that are derived from it.
    expect(right).toEqual(left);
    expect(Object.keys(right.variables)).toEqual(Object.keys(left.variables));
    expect(right.css).toBe(left.css);
    expect(right.digest).toBe(left.digest);
  });

  /**
   * M4 — the DB transport must be order-blind.
   *
   * A tenant theme arrives as a JSON document out of Postgres. Neither the
   * driver, the column serialization, nor an admin edit that rewrites one
   * nested object guarantees a stable key order, so authoring order in the
   * document must not reach the artifact. This is the DB-side counterpart of
   * the authored-order law on the static BrandTheme transport: there, leg B is
   * byte-invariant under a source permutation by design; here, the ONLY
   * transport is the document, so it must be invariant unconditionally.
   *
   * The permutation reverses every object's own keys at every depth — a
   * strictly stronger input than a hand-written reordering of one level, and
   * it changes no key and no value. Both fixtures are exercised because the
   * advanced mode compiles a different and much larger surface (token
   * overrides, chrome sections, mode deltas) than the simple one.
   */
  const deepReverseKeys = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(deepReverseKeys);
    if (value && typeof value === "object") {
      const reversed: Record<string, unknown> = {};
      for (const key of Object.keys(value as Record<string, unknown>).reverse()) {
        reversed[key] = deepReverseKeys((value as Record<string, unknown>)[key]);
      }
      return reversed;
    }
    return value;
  };

  for (const [label, document, options] of [
    ["simple", SIMPLE_DOCUMENT, undefined],
    // The advanced surface only compiles under a code-owned vertical policy
    // envelope; the envelope is not tenant data and is held constant here.
    ["advanced", ADVANCED_DOCUMENT, { verticalEnvelope: BITHIRE_TEST_ENVELOPE }],
  ] as const) {
    it(`${label}: a deep key permutation of the DB document compiles byte-identically`, () => {
      const permuted = deepReverseKeys(
        structuredClone(document)
      ) as TenantThemeDocument;

      // The permutation is real: at least one object was reordered, and no key
      // and no value moved. A no-op permutation would make this law vacuous.
      expect(Object.keys(permuted)).not.toEqual(Object.keys(document));
      expect(permuted).toEqual(document);

      const baseline = compileTenantThemeConfig(hydrate(document), options);
      const shuffled = compileTenantThemeConfig(hydrate(permuted), options);

      expect(Object.keys(shuffled.variables)).toEqual(
        Object.keys(baseline.variables)
      );
      expect(shuffled.variables).toEqual(baseline.variables);
      expect(shuffled.css).toBe(baseline.css);
      expect(shuffled.digest).toBe(baseline.digest);
      expect(shuffled.modeDeltas ?? null).toEqual(baseline.modeDeltas ?? null);
      expect(canonicalizeTenantThemeValue(hydrate(permuted))).toBe(
        canonicalizeTenantThemeValue(hydrate(document))
      );
    });
  }

  it("includes row/compiler identity in the cache digest", () => {
    const current = compileTenantThemeConfig(hydrate());
    const next = compileTenantThemeConfig(
      hydrate(SIMPLE_DOCUMENT, { ...IDENTITY, rowVersion: 8 })
    );
    expect(current.compilerVersion).toBe(TENANT_THEME_COMPILER_VERSION);
    expect(current.digest).not.toBe(next.digest);
    expect(current.variables).toEqual(next.variables);
  });

  it("keeps compiler-owned bounded presets valid even when their emitted value exceeds authored caps", () => {
    const artifact = compileTenantThemeConfig(
      hydrate({
        schemaVersion: 1,
        mode: "simple",
        appearance: { shape: { buttonStyle: "pill" } },
      })
    );
    expect(artifact.variables["--ds-radius-button"]).toBe(
      "calc(9999px / 1.25 * var(--ds-radius-scale, 1))"
    );
  });

  it("accepts only code-owned font-pack references inside font-family lists", () => {
    const document = structuredClone(ADVANCED_DOCUMENT);
    if (document.mode !== "advanced")
      throw new Error("Expected Advanced fixture");
    document.visualFoundation.general = {
      ...document.visualFoundation.general,
      typography: {
        ...document.visualFoundation.general?.typography,
        fontFamilyHeading:
          "var(--ds-font-pack-editorial-display), Georgia, 'Times New Roman', serif",
      },
    };
    document.visualFoundation.advanced = {
      ...document.visualFoundation.advanced,
      tokenOverrides: {
        ...document.visualFoundation.advanced?.tokenOverrides,
        "--ds-font-family-display":
          "var(--ds-font-pack-editorial-display), Georgia, 'Times New Roman', serif",
      },
    };

    const artifact = compileTenantThemeConfig(hydrate(document), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    expect(artifact.variables["--ds-font-family-heading"]).toContain(
      "var(--ds-font-pack-editorial-display)"
    );
    expect(artifact.variables["--ds-font-family-display"]).toContain(
      "var(--ds-font-pack-editorial-display)"
    );
  });

  it.each([
    "var(--ds-font-family-heading), serif",
    "var(--ds-font-pack-editorial-display, Georgia), serif",
    "var(--ds-font-pack-Editorial-Display), serif",
    "var(--ds-font-pack-unknown), serif",
    // The bare pre-W4 id never resolved to any css and is retired, not aliased.
    "var(--ds-font-pack-editorial), serif",
    "var(--ds-font-pack-editorial-display); color: red",
  ])(
    "rejects unsafe font-family variable reference %s",
    (fontFamilyHeading) => {
      expect(
        validateTenantThemeDocument({
          schemaVersion: 1,
          mode: "simple",
          appearance: { typography: { fontFamilyHeading } },
        }).success
      ).toBe(false);
    }
  );

  it("emits separate root/vertical/tenant scopes and one exact combined selector", () => {
    const artifact = compileTenantThemeConfig(hydrate());
    expect(artifact.scopes).toEqual({
      root: { attribute: "data-ds-root", selector: ":where([data-ds-root])" },
      vertical: {
        attribute: "data-vertical",
        value: "bithire",
        selector: ':where([data-ds-root][data-vertical="bithire"])',
      },
      tenant: {
        attribute: "data-tenant",
        value: "themanagementmiami",
        selector: ':where([data-ds-root][data-tenant="themanagementmiami"])',
      },
      combinedSelector:
        '[data-ds-root][data-vertical="bithire"][data-tenant][data-tenant="themanagementmiami"]',
    });
    expect(artifact.css).toContain(`${artifact.scopes.combinedSelector} {`);
    expect(artifact.css).not.toContain("@layer");
    expect(artifact.css).not.toContain("html[data-tenant");
    expect(tenantThemeArtifactRootAttributes(artifact)).toEqual({
      "data-ds-root": "",
      "data-vertical": "bithire",
      "data-tenant": "themanagementmiami",
    });
  });

  it("keeps two tenants on distinct provider roots with no selector/value bleed", () => {
    const management = compileTenantThemeConfig(hydrate());
    const bithire = compileTenantThemeConfig(
      hydrate(
        {
          schemaVersion: 1,
          mode: "simple",
          appearance: {
            palette: { primary: "#2563EB" },
            typography: { fontFamilyBase: "Inter, sans-serif" },
          },
        },
        { ...IDENTITY, tenantId: "tenant_02", slug: "bithire-baseline" }
      )
    );

    expect(management.variables["--ds-color-primary"]).toBe("#0F766E");
    expect(bithire.variables["--ds-color-primary"]).toBe("#2563EB");
    expect(management.css).not.toContain('data-tenant="bithire-baseline"');
    expect(bithire.css).not.toContain('data-tenant="themanagementmiami"');
    expect(management.scopes.combinedSelector).not.toBe(
      bithire.scopes.combinedSelector
    );
  });

  it("keeps the exact tenant overlay above the generated static artifact and local to sibling/nested roots", () => {
    const management = compileTenantThemeConfig(hydrate(ADVANCED_DOCUMENT), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    const bithire = compileTenantThemeConfig(
      hydrate(
        {
          schemaVersion: 1,
          mode: "simple",
          appearance: { palette: { primary: "#2563EB" } },
        },
        { ...IDENTITY, tenantId: "tenant_02", slug: "bithire-baseline" }
      )
    );
    const managementRoot = document.createElement("section");
    const nestedBithireRoot = document.createElement("section");
    const siblingBithireRoot = document.createElement("section");
    const style = document.createElement("style");

    for (const [root, slug] of [
      [managementRoot, "themanagementmiami"],
      [nestedBithireRoot, "bithire-baseline"],
      [siblingBithireRoot, "bithire-baseline"],
    ] as const) {
      root.setAttribute("data-ds-root", "");
      root.setAttribute("data-vertical", "bithire");
      root.setAttribute("data-tenant", slug);
    }
    managementRoot.append(nestedBithireRoot);
    document.body.append(managementRoot, siblingBithireRoot);

    // Deliberately put the complete generated static artifact last. This covers
    // its highest-specificity light/dark root-state variants, not a toy selector.
    style.textContent = [
      management.css,
      bithire.css,
      BITHIRE_STATIC_ARTIFACT,
    ].join("\n");
    document.head.append(style);

    try {
      expect(
        getComputedStyle(managementRoot)
          .getPropertyValue("--ds-color-primary")
          .trim()
      ).toBe("#0F766E");
      expect(
        getComputedStyle(managementRoot)
          .getPropertyValue("--ds-color-bg-primary")
          .trim()
      ).toBe("#FBF6EC");
      expect(
        getComputedStyle(nestedBithireRoot)
          .getPropertyValue("--ds-color-primary")
          .trim()
      ).toBe("#2563EB");
      expect(
        getComputedStyle(siblingBithireRoot)
          .getPropertyValue("--ds-color-primary")
          .trim()
      ).toBe("#2563EB");
    } finally {
      style.remove();
      managementRoot.remove();
      siblingBithireRoot.remove();
    }
  });

  it("compiles a legal Management Advanced projection with strong visual divergence", () => {
    const management = compileTenantThemeConfig(hydrate(ADVANCED_DOCUMENT), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    const baseline = compileTenantThemeConfig(
      hydrate(
        {
          schemaVersion: 1,
          mode: "simple",
          appearance: {
            palette: { primary: "#2563EB" },
            surfaces: { elevation: "flat" },
          },
        },
        { ...IDENTITY, tenantId: "tenant_02", slug: "bithire-baseline" }
      )
    );
    const changed = Object.keys(management.variables).filter(
      (key) => management.variables[key] !== baseline.variables[key]
    );

    expect(changed.length).toBeGreaterThan(20);
    expect(management.variables).toMatchObject({
      "--ds-color-bg-primary": "#FBF6EC",
      // DS-A007: emission carries the Arabic-safe family ahead of the
      // trailing generic; `--ds-badge-font-family` is outside that invariant.
      "--ds-font-family-display":
        "'Fraunces', Georgia, 'Times New Roman', \"Noto Sans Arabic\", serif",
      "--ds-card-bg": "#FFFEFB",
      "--ds-table-header-bg": "#FFFFFF",
      "--ds-table-header-letter-spacing": "0.04em",
      "--ds-table-header-text-transform": "none",
      "--ds-table-header-block-size": "42px",
      "--ds-shell-sidebar-width": "284px",
      "--ds-shell-sidebar-collapsed-width": "72px",
      "--ds-shell-sidebar-header-block-size": "68px",
      "--ds-shell-header-block-size": "64px",
      "--ds-command-home-max-width": "1180px",
      "--ds-command-home-console-padding": "20px",
      "--ds-badge-font-family": "Optima, Candara, 'Noto Sans', sans-serif",
      "--ds-badge-font-weight": "650",
      // Authored 3/4/6px, emitted through the shared radius dial so
      // `shape.radius-scale` reaches a corner the tenant authored.
      "--ds-badge-radius": "calc(3px / 1.25 * var(--ds-radius-scale, 1))",
      "--ds-badge-chip-radius": "calc(4px / 1.25 * var(--ds-radius-scale, 1))",
      "--ds-badge-pill-radius": "calc(6px / 1.25 * var(--ds-radius-scale, 1))",
      "--ds-badge-surface": "#FFFEFB",
      "--ds-badge-frame-hover": "#0F766E",
      "--ds-badge-remove-opacity": "0.82",
      "--ds-badge-pulse-scale": "1.2",
      "--ds-card-hover-transform": "translateY(-1px)",
      "--ds-metric-card-min-height": "156px",
      "--ds-metric-card-hover-transform": "translateY(-1px)",
      "--ds-metric-card-icon-bg": "#F3EEE5",
      "--ds-listing-grid-columns": "repeat(3, minmax(0, 1fr))",
      "--ds-effect-intensity": "0.45",
    });
    expect(management.verticalEnvelopeDigest).toMatch(/^sha256-/);
  });
});

describe("closed schema and hostile input rejection", () => {
  it.each([
    [
      "unknown schema",
      { ...SIMPLE_DOCUMENT, schemaVersion: 2 },
      "unsupported_schema_version",
    ],
    ["engine", { ...SIMPLE_DOCUMENT, engine: "custom" }, "unknown_key"],
    [
      "raw css",
      { ...SIMPLE_DOCUMENT, rawCss: ":root{--pwned:red}" },
      "unknown_key",
    ],
    ["selector", { ...SIMPLE_DOCUMENT, selector: "html *" }, "unknown_key"],
    [
      "topology",
      { ...SIMPLE_DOCUMENT, topology: { phone: "desktop-table" } },
      "unknown_key",
    ],
  ])("rejects %s at the document boundary", (_name, input, code) => {
    const result = validateTenantThemeDocument(input);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.issues.some((issue) => issue.code === code)).toBe(true);
  });

  it("rejects selector injection in tenant/vertical identities", () => {
    const hostile = { ...hydrate(), slug: 'acme"]{color:red}/*' };
    expect(validateTenantThemeConfig(hostile).success).toBe(false);
    expect(() => compileTenantThemeConfig(hostile)).toThrow(
      TenantThemeValidationError
    );
  });

  it("rejects private token references and declaration breakouts", () => {
    for (const value of [
      "var(--ds-private-secret)",
      "red; } html { color: hotpink",
      "url(https://evil.invalid/x)",
    ]) {
      const document = {
        schemaVersion: 1 as const,
        mode: "advanced" as const,
        visualFoundation: { advanced: { chrome: { sidebar: { bg: value } } } },
      };
      const input = { ...document, ...IDENTITY };
      expect(validateTenantThemeConfig(input).success).toBe(false);
    }
  });

  it("rejects arbitrary token names and fields without compiler-owned variables", () => {
    const invalidAdvancedValues = [
      { tokenOverrides: { "--ds-private-secret": "#fff" } },
      { chrome: { sidebar: { navigationMode: "floating" } } },
      { chrome: { shell: { gridOpacity: 0.5 } } },
      { chrome: { metricCard: { renderer: "custom" } } },
      { chrome: { card: { showBorder: false } } },
      { chrome: { accent: { iconContainerShape: "square" } } },
    ];

    for (const advanced of invalidAdvancedValues) {
      const result = validateTenantThemeDocument({
        schemaVersion: 1,
        mode: "advanced",
        visualFoundation: { advanced },
      });
      expect(result.success, JSON.stringify(advanced)).toBe(false);
    }
  });

  it("compiles the complete layout-foundation chrome contract from tenant data", () => {
    const document = structuredClone(ADVANCED_DOCUMENT);
    if (document.mode !== "advanced")
      throw new Error("advanced fixture required");
    const layout = {
      containerBackground: "#FFFCF6",
      containerBorder: "1px solid #C9B89D",
      containerRadius: "12px",
      containerShadow: "0 12px 30px rgb(20 34 56 / 20%)",
      containerMotionDuration: "220ms",
      containerMotionEasing: "ease-out",
      aspectRatioBackground: "#FBF3E7",
      aspectRatioBorder: "1px solid #C9B89D",
      aspectRatioRadius: "8px",
      aspectRatioShadow: "inset 0 1px #FFFFFF",
      aspectRatioOverflow: "hidden",
      aspectRatioMotionDuration: "220ms",
      aspectRatioMotionEasing: "ease-out",
      dividerColor: "#9B8A73",
      dividerThicknessThin: "1px",
      dividerThicknessMedium: "2px",
      dividerThicknessThick: "3px",
      dividerContentGap: "12px",
      dividerEdgeSegment: "7%",
      dividerMinSegment: "7%",
      dividerLabelMaxWidth: "32rem",
      dividerLabelFontSize: "12px",
      dividerLabelFontWeight: "700",
      dividerLabelLineHeight: "1.3",
      dividerLabelTransform: "none",
      dividerLabelTracking: "0.04em",
      dividerMotionDuration: "160ms",
      dividerMotionEasing: "ease-out",
      stackDividerSize: "1px",
      stackDividerColor: "#C9B89D",
      stackDividerOpacity: "0.82",
      spaceMotionDuration: "160ms",
      spaceMotionEasing: "ease-out",
    } as const;
    document.visualFoundation.advanced = {
      ...document.visualFoundation.advanced,
      chrome: {
        ...document.visualFoundation.advanced?.chrome,
        layout,
      },
    };

    expect(validateTenantThemeDocument(document).success).toBe(true);
    const artifact = compileTenantThemeConfig(hydrate(document), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    const expectedVariables = {
      "--ds-container-background": layout.containerBackground,
      "--ds-container-border": layout.containerBorder,
      "--ds-container-radius": dialedRadius(layout.containerRadius),
      "--ds-container-shadow": layout.containerShadow,
      "--ds-container-motion-duration": layout.containerMotionDuration,
      "--ds-container-motion-easing": layout.containerMotionEasing,
      "--ds-aspect-ratio-background": layout.aspectRatioBackground,
      "--ds-aspect-ratio-border": layout.aspectRatioBorder,
      "--ds-aspect-ratio-radius": dialedRadius(layout.aspectRatioRadius),
      "--ds-aspect-ratio-shadow": layout.aspectRatioShadow,
      "--ds-aspect-ratio-overflow": layout.aspectRatioOverflow,
      "--ds-aspect-ratio-motion-duration": layout.aspectRatioMotionDuration,
      "--ds-aspect-ratio-motion-easing": layout.aspectRatioMotionEasing,
      "--ds-divider-color": layout.dividerColor,
      "--ds-divider-thickness-thin": layout.dividerThicknessThin,
      "--ds-divider-thickness-medium": layout.dividerThicknessMedium,
      "--ds-divider-thickness-thick": layout.dividerThicknessThick,
      "--ds-divider-content-gap": layout.dividerContentGap,
      "--ds-divider-edge-segment": layout.dividerEdgeSegment,
      "--ds-divider-min-segment": layout.dividerMinSegment,
      "--ds-divider-label-max-width": layout.dividerLabelMaxWidth,
      "--ds-divider-label-font-size": layout.dividerLabelFontSize,
      "--ds-divider-label-font-weight": layout.dividerLabelFontWeight,
      "--ds-divider-label-line-height": layout.dividerLabelLineHeight,
      "--ds-divider-label-transform": layout.dividerLabelTransform,
      "--ds-divider-label-tracking": layout.dividerLabelTracking,
      "--ds-divider-motion-duration": layout.dividerMotionDuration,
      "--ds-divider-motion-easing": layout.dividerMotionEasing,
      "--ds-stack-divider-size": layout.stackDividerSize,
      "--ds-stack-divider-color": layout.stackDividerColor,
      "--ds-stack-divider-opacity": layout.stackDividerOpacity,
      "--ds-space-motion-duration": layout.spaceMotionDuration,
      "--ds-space-motion-easing": layout.spaceMotionEasing,
    } as const;
    expect(artifact.variables).toMatchObject(expectedVariables);
  });

  it("keeps ramp tokens reference-only while deriving all seven roles from legal base seeds", () => {
    const authoredRamp = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        advanced: { tokenOverrides: { "--ds-color-primary-500": "#FF00FF" } },
      },
    });
    expect(authoredRamp.success).toBe(false);

    const artifact = compileTenantThemeConfig(hydrate(ADVANCED_DOCUMENT), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    for (const role of [
      "primary",
      "secondary",
      "accent",
      "success",
      "warning",
      "error",
      "info",
    ] as const) {
      for (const step of [
        50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
      ] as const) {
        expect(artifact.variables[`--ds-color-${role}-${step}`]).toMatch(
          /^#[0-9A-F]{6}$/
        );
      }
    }
  });

  it.each(["rgb(15 118 110)", "hsl(176 77% 26%)", "oklch(0.52 0.09 190)"])(
    "accepts v1 functional color syntax %s but fails closed when APCA cannot verify it",
    (primary) => {
      const document = {
        schemaVersion: 1 as const,
        mode: "simple" as const,
        appearance: { palette: { primary } },
      };
      expect(validateTenantThemeDocument(document).success).toBe(true);
      expect(() => compileTenantThemeConfig(hydrate(document))).toThrow(
        /cannot be APCA-verified.*non-hex-ground/i
      );
    }
  );

  it("admits an accessible unique color-only chart palette without opening renderer or data semantics", () => {
    const palette = [
      "#0F766E",
      "#8C6D46",
      "#B24D3A",
      "#296F68",
      "#735838",
      "#963F31",
      "#3D756F",
      "#7D6140",
      "#A04435",
      "#5E5A52",
    ];
    const categories = Object.fromEntries(
      palette.map((color, index) => [`--ds-chart-category-${index + 1}`, color])
    );
    const document = {
      schemaVersion: 1 as const,
      mode: "advanced" as const,
      visualFoundation: { advanced: { tokenOverrides: categories } },
    };
    expect(validateTenantThemeDocument(document).success).toBe(true);
    const artifact = compileTenantThemeConfig(hydrate(document), {
      verticalEnvelope: BITHIRE_TEST_ENVELOPE,
    });
    expect(artifact.variables["--ds-chart-category-1"]).toBe("#0F766E");
    expect(artifact.variables["--ds-chart-category-10"]).toBe("#5E5A52");

    expect(
      validateTenantThemeDocument({
        ...document,
        visualFoundation: {
          advanced: {
            tokenOverrides: {
              "--ds-chart-category-1": "linear-gradient(#000, #fff)",
            },
          },
        },
      }).success
    ).toBe(false);
    expect(
      validateTenantThemeDocument({
        ...document,
        visualFoundation: {
          advanced: {
            tokenOverrides: { "--ds-chart-category-1": "rgb(15 118 110)" },
          },
        },
      }).success
    ).toBe(false);
  });

  it("rejects duplicate or low-contrast tenant chart categories at compilation", () => {
    const compileCategories = (
      categories: Record<string, string>,
      backgroundMode: "light" | "dark" | "auto" = "light"
    ) =>
      compileTenantThemeConfig(
        hydrate({
          schemaVersion: 1,
          mode: "advanced",
          visualFoundation: {
            general: { palette: { backgroundMode } },
            advanced: { tokenOverrides: categories },
          },
        }),
        { verticalEnvelope: BITHIRE_TEST_ENVELOPE }
      );

    expect(() =>
      compileCategories({
        "--ds-chart-category-1": "#0F766E",
        "--ds-chart-category-2": "#0f766e",
      })
    ).toThrow(/must be unique/i);
    expect(() =>
      compileCategories({ "--ds-chart-category-1": "#FDFDFD" })
    ).toThrow(/below 3:1/i);
    expect(() =>
      compileCategories({ "--ds-chart-category-1": "#111111" }, "dark")
    ).toThrow(/below 3:1/i);
    expect(() =>
      compileCategories({ "--ds-chart-category-1": "#767676" }, "auto")
    ).not.toThrow();
  });

  it("enforces value, field and payload caps", () => {
    const hostileValues = [
      { cardComponent: { padding: "-1rem" } },
      { cardComponent: { radius: "9999px" } },
      { cardComponent: { shadow: "0 0 9999px rgba(0,0,0,.4)" } },
      {
        cardComponent: {
          shadow: "0 1px #000, 0 2px #000, 0 3px #000, 0 4px #000, 0 5px #000",
        },
      },
      {
        cardComponent: {
          bg: "linear-gradient(#111,#222,#333,#444,#555,#666,#777,#888,#999)",
        },
      },
    ];
    for (const chrome of hostileValues) {
      const result = validateTenantThemeDocument({
        schemaVersion: 1,
        mode: "advanced",
        visualFoundation: { advanced: { chrome } },
      });
      expect(result.success, JSON.stringify(chrome)).toBe(false);
    }

    const overlong = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: "simple",
      appearance: { typography: { fontFamilyBase: "A".repeat(70_000) } },
    });
    expect(overlong.success).toBe(false);
    if (!overlong.success)
      expect(
        overlong.issues.some((issue) => issue.message.includes("65"))
      ).toBe(true);
  });

  it("rejects one entry over the tokenOverrides budget with one named issue (no truncation)", () => {
    const cap = TENANT_THEME_CONFIG_SCHEMA.limits.maxTokenOverrides;
    expect(cap).toBe(200);
    // The allowlisted vocabulary is wider than the budget, so an in-spec
    // author can legally reach 201 distinct keys.
    const budgetTokens = TENANT_THEME_CONFIG_SCHEMA.overrideTokens.filter(
      (token) =>
        token.startsWith("--ds-material-") || token.startsWith("--ds-type-")
    );
    expect(budgetTokens.length).toBeGreaterThan(cap);
    const overCap = {
      schemaVersion: 1 as const,
      mode: "advanced" as const,
      visualFoundation: {
        advanced: {
          tokenOverrides: Object.fromEntries(
            budgetTokens.slice(0, cap + 1).map((token) => [token, "1px"])
          ),
        },
      },
    };

    const validation = validateTenantThemeDocument(overCap);
    expect(validation.success).toBe(false);
    if (validation.success) throw new Error("expected a rejected document");
    expect(validation.issues).toEqual([
      {
        code: "invalid_value",
        path: "$.visualFoundation.advanced.tokenOverrides",
        message: `Maximum tokenOverrides entries is ${cap}; received ${
          cap + 1
        }`,
      },
    ]);

    // The hydrated modes envelope fails closed on the same single issue, so an
    // over-budget row can never reach the appearance compiler through the
    // canonical compile path.
    try {
      compileTenantThemeConfig(
        { ...overCap, ...IDENTITY },
        { verticalEnvelope: BITHIRE_TEST_ENVELOPE }
      );
      throw new Error("expected compileTenantThemeConfig to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(TenantThemeValidationError);
      const issues = (error as TenantThemeValidationError).issues;
      expect(issues).toHaveLength(1);
      expect(issues[0].path).toBe("$.visualFoundation.advanced.tokenOverrides");
      expect(issues[0].message).toContain(String(cap + 1));
    }
  });

  it("accepts exactly the tokenOverrides budget at the document boundary without truncation", () => {
    const cap = TENANT_THEME_CONFIG_SCHEMA.limits.maxTokenOverrides;
    const budgetTokens = TENANT_THEME_CONFIG_SCHEMA.overrideTokens
      .filter(
        (token) =>
          token.startsWith("--ds-material-") || token.startsWith("--ds-type-")
      )
      .slice(0, cap);
    const boundary = {
      schemaVersion: 1 as const,
      mode: "advanced" as const,
      visualFoundation: {
        advanced: {
          tokenOverrides: Object.fromEntries(
            budgetTokens.map((token) => [token, "1px"])
          ),
        },
      },
    };
    expect(validateTenantThemeDocument(boundary).success).toBe(true);
    expect(
      Object.keys(boundary.visualFoundation.advanced.tokenOverrides)
    ).toHaveLength(cap);

    // Accepting the document is only half the boundary. All 200 must also
    // survive the ISO lowering: the v1 migration maps each authored token to
    // its own typed keypath, so a truncation or a collision anywhere in that
    // map would still leave the document "valid".
    const patch = migrateV1(boundary as unknown as TenantThemeDocument, "light")
      .patch;
    expect(leafKeypaths(patch)).toHaveLength(cap);
    expect(budgetTokens).toHaveLength(cap);

    // And the row must COMPILE through the real boundary with every authored
    // value reaching the artifact. The roster here is the value-compatible
    // slice of the same budget: `--ds-material-*-foreground|background` are
    // APCA-verified colors, and a geometry literal is correctly rejected for
    // them, which is a different law than truncation. Everything else that a
    // tenant may legally set at the cap is asserted byte-for-byte.
    // A token whose Theme keypath carries a CLOSED OPTION DOMAIN is in the
    // same position as the APCA colors above: `"1px"` is not a truncation
    // there, it is a value the contract never declared. Derived from the
    // schema rather than listed, so a new closed leaf cannot quietly reopen.
    const closedDomain = new Set(
      budgetTokens.filter((token) =>
        leafKeypaths(
          migrateV1(
            {
              ...boundary,
              visualFoundation: {
                advanced: { tokenOverrides: { [token]: "1px" } },
              },
            } as unknown as TenantThemeDocument,
            "light"
          ).patch
        ).some((keypath) => themeLeafOptions(keypath) !== null)
      )
    );
    const compilable = budgetTokens.filter(
      (token) => !/foreground|background/.test(token) && !closedDomain.has(token)
    );
    expect(compilable.length).toBeGreaterThan(100);
    const artifact = compileTenantThemeConfig(
      {
        ...boundary,
        visualFoundation: {
          advanced: {
            tokenOverrides: Object.fromEntries(
              compilable.map((token) => [token, "1px"])
            ),
          },
        },
        ...IDENTITY,
      },
      { verticalEnvelope: BITHIRE_TEST_ENVELOPE }
    );
    expect(
      compilable.filter((token) => artifact.variables[token] !== "1px")
    ).toEqual([]);

    // The authored value is mode-agnostic, so it owns the default-mode scope
    // above. Where the code-owned vertical baseline re-authors the same facet
    // per mode, that overlay stays visible as a `dark` delta — it is the
    // baseline's own value, never the tenant literal leaking into a mode it
    // did not author. Asserted rather than assumed so a future baseline that
    // starts (or stops) overlaying a facet has to be adjudicated here.
    const darkDelta = (artifact.modeDeltas ?? []).find(
      (block) => block.mode === "dark"
    );
    const overlaid = compilable.filter(
      (token) => darkDelta?.variables[token] !== undefined
    );
    expect(overlaid.length).toBeGreaterThan(0);
    expect(
      overlaid.filter((token) => darkDelta?.variables[token] === "1px")
    ).toEqual([]);
  });

  it("never lets an untyped ISO lowering failure escape the compiler", async () => {
    // `mergeThemePatches` is fail-closed and throws a PLAIN Error when a patch key
    // is absent from the total Theme shape. Callers of this compiler contract
    // on ONE typed rejection, so that leg must be renamed into a document
    // issue instead of surfacing as a raw 500. Proven by forcing the throw in
    // an isolated module graph rather than by trusting the shape to be total.
    const rogue = {
      schemaVersion: 1 as const,
      mode: "advanced" as const,
      visualFoundation: {
        advanced: { chrome: { sidebar: { width: "260px" } } },
      },
    } as unknown as TenantThemeDocument;

    // Baseline: with the real lowering the same row compiles, so the canary
    // below measures the boundary, not a broken document.
    expect(() =>
      compileTenantThemeConfig(hydrate(rogue), {
        verticalEnvelope: BITHIRE_TEST_ENVELOPE,
      })
    ).not.toThrow();

    const isoPath =
      "@/foundation/contracts/composition/tenants/themes/iso" as const;
    vi.resetModules();
    vi.doMock(isoPath, async () => {
      const actual = await vi.importActual<Record<string, unknown>>(isoPath);
      return {
        ...actual,
        mergeThemePatches: () => {
          throw new Error(
            'mergeThemePatches: unknown key "width" at $.chrome.sidebar; ThemePatch is ingestion-only'
          );
        },
      };
    });
    try {
      const isolated = await import(
        "@/infrastructure/compilers/composition/tenant-theme"
      );
      const config = isolated.hydrateTenantThemeConfig(rogue, IDENTITY);
      let thrown: unknown;
      try {
        isolated.compileTenantThemeConfig(config, {
          verticalEnvelope: isolated.getTenantThemeVerticalEnvelope("bithire")!,
        });
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(isolated.TenantThemeValidationError);
      const issues = (thrown as InstanceType<
        typeof isolated.TenantThemeValidationError
      >).issues;
      expect(issues).toHaveLength(1);
      expect(issues[0].code).toBe("invalid_value");
      expect(issues[0].path).toBe("$.visualFoundation");
      expect(issues[0].message).toContain("ISO Theme lowering");
      expect(issues[0].message).toContain('unknown key "width"');
    } finally {
      vi.doUnmock(isoPath);
      vi.resetModules();
    }
  });

  it("requires an explicit, matching vertical envelope for Advanced compilation", () => {
    const config = hydrate(ADVANCED_DOCUMENT);
    expect(() => compileTenantThemeConfig(config)).toThrow(
      /requires a vertical policy envelope/i
    );
    expect(() =>
      compileTenantThemeConfig(config, {
        verticalEnvelope: { ...BITHIRE_TEST_ENVELOPE, verticalKey: "platform" },
      })
    ).toThrow(/does not match/i);
    expect(() =>
      compileTenantThemeConfig(config, {
        verticalEnvelope: {
          ...BITHIRE_TEST_ENVELOPE,
          advanced: { chromeFamilies: ["sidebar"], allowTokenOverrides: true },
        },
      })
    ).toThrow(/disabled by this vertical/i);
    expect(() =>
      compileTenantThemeConfig(config, {
        verticalEnvelope: {
          ...BITHIRE_TEST_ENVELOPE,
          allowedModes: ["advanced", "advanced"],
        },
      })
    ).toThrow(/unique non-empty/i);
  });

  it("rejects bounded neutral overrides that miss the governed APCA floor", () => {
    const neutralOverrides = {
      "--ds-color-text-primary": "#E8E6E1",
      "--ds-color-text-secondary": "#A39F98",
      "--ds-color-text-muted": "#6E6A63",
      "--ds-color-border-primary": "#26231F",
      "--ds-color-border-secondary": "#33302B",
    };
    const document = {
      schemaVersion: 1 as const,
      mode: "advanced" as const,
      visualFoundation: {
        // The tenant owns the dark canvas, but the compiler still checks every
        // authored text role against the complete light/dark Theme. It rejects
        // an unsafe pair instead of repainting the user's values silently.
        general: { palette: { backgroundMode: "dark" as const } },
        advanced: { tokenOverrides: neutralOverrides },
      },
    };
    expect(validateTenantThemeDocument(document).success).toBe(true);
    expect(() =>
      compileTenantThemeConfig(hydrate(document), {
        verticalEnvelope: BITHIRE_TEST_ENVELOPE,
      })
    ).toThrow(/authored tenant colors must meet the governed floor/i);
  });

  it.each([
    ["url() exfiltration", "url(https://evil.invalid/x)"],
    ["var() reference", "var(--ds-color-neutral-800)"],
    ["functional color", "rgb(232 230 225)"],
    ["named color", "white"],
    ["hex with alpha channel", "#E8E6E1CC"],
    ["gradient", "linear-gradient(#000, #fff)"],
    ["declaration breakout", "#fff; } html { color: hotpink"],
  ])("rejects %s in the neutral override group", (_name, value) => {
    for (const token of [
      "--ds-color-text-primary",
      "--ds-color-text-secondary",
      "--ds-color-text-muted",
      "--ds-color-border-primary",
      "--ds-color-border-secondary",
    ]) {
      const result = validateTenantThemeDocument({
        schemaVersion: 1,
        mode: "advanced",
        visualFoundation: { advanced: { tokenOverrides: { [token]: value } } },
      });
      expect(result.success, `${token} <- ${value}`).toBe(false);
    }
  });

  it("keeps neutral overrides behind the vertical allowTokenOverrides policy", () => {
    const config = hydrate({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        advanced: {
          tokenOverrides: { "--ds-color-text-primary": "#E8E6E1" },
        },
      },
    });
    expect(() =>
      compileTenantThemeConfig(config, {
        verticalEnvelope: {
          ...BITHIRE_TEST_ENVELOPE,
          advanced: {
            chromeFamilies:
              BITHIRE_TEST_ENVELOPE.advanced?.chromeFamilies ?? [],
            allowTokenOverrides: false,
          },
        },
      })
    ).toThrow(/Token overrides are disabled/i);
  });

  it("parses into a detached canonical value rather than retaining tainted references", () => {
    const source = structuredClone(SIMPLE_DOCUMENT);
    const parsed = parseTenantThemeDocument(source);
    (source.appearance as { palette?: { primary?: string } }).palette!.primary =
      "#FFFFFF";
    expect(parsed.mode).toBe("simple");
    if (parsed.mode === "simple")
      expect(parsed.appearance.palette?.primary).toBe("#0F766E");
  });
});
