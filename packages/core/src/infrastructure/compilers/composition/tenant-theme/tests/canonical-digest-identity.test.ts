/**
 * Digest identity across the canonicalization extraction.
 *
 * Canonical form moved out of this compiler into
 * `foundation/kernel/serialization` so the theming runtime could stop reaching
 * up into a compiler composition owner for it, and the plain-object predicate
 * became realm-safe at the same time. Both changes sit directly under every
 * artifact digest, and a digest drift silently invalidates every artifact
 * already persisted against a tenant row.
 *
 * The pinned values in `canonical-extraction-pre-change-digests.json` were
 * captured from the compiler BEFORE the extraction. Every one of them must
 * still be produced byte-identically. This file is the regression fence for
 * that; it deliberately duplicates the fixture documents rather than importing
 * them, so a future edit to another suite's document constants cannot move
 * these inputs without also moving this file.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  TENANT_THEME_COMPILER_VERSION,
  TENANT_THEME_CONFIG_SCHEMA_DIGEST,
  TENANT_THEME_DOCUMENT_SCHEMA_DIGEST,
  canonicalizeTenantThemeValue,
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "..";

const FIXTURE_DIR = resolve(
  process.cwd(),
  "src/infrastructure/compilers/composition/tenant-theme/tests/fixtures"
);

const PINNED = JSON.parse(
  readFileSync(
    resolve(FIXTURE_DIR, "canonical-extraction-pre-change-digests.json"),
    "utf8"
  )
) as Record<string, string>;

const IDENTITY = {
  tenantId: "tenant_fixture",
  slug: "fixture-tenant",
  verticalKey: "bithire",
  rowVersion: 1,
} as const;

const W4_PIN_IDENTITY = {
  tenantId: "tenant_w4_pin",
  slug: "w4-pin-tenant",
  verticalKey: "bithire",
  rowVersion: 3,
} as const;

const NULL_OVERRIDE_DOCUMENT = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {},
} as unknown as TenantThemeDocument;

const POPULATED_SIMPLE_DOCUMENT = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {
    palette: {
      primary: "#0F766E",
      secondary: "#8C6D46",
      accent: "#E2725B",
      backgroundMode: "light",
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
} as unknown as TenantThemeDocument;

const ABSENT_NEW_FIELDS_DOCUMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      typography: {
        fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        fontFamilyHeading: "'Fraunces', Georgia, serif",
      },
      shape: { buttonStyle: "pill" },
      density: "compact",
      motion: { intensity: 0.4, durationScale: 0.9, ambient: "off" },
      surfaces: { elevation: "flat" },
      navigation: { sidebarTone: "inverse" },
    },
    advanced: {
      chrome: {
        sidebar: { bg: "#101014", text: "#F4F4F5", width: "248px" },
        layout: { headerBg: "#FFFFFF", headerHeight: "56px" },
        table: { headerBg: "#F8F8FA", cellPadding: "10px 12px" },
        cardComponent: { bg: "#FFFFFF", radius: "10px" },
      },
      tokenOverrides: {
        "--ds-radius-md": "10px",
        "--ds-density-scale": 0.9,
      },
    },
  },
} as unknown as TenantThemeDocument;

describe("digest identity across the canonicalization extraction", () => {
  it("pins the digests against the compiler version they were captured on", () => {
    // The version is inside the digest source, so bumping it moves every
    // artifact digest at once — which is why this file has never used a bump
    // to sanction a move, and why `nullOverrideDigest` survives as a negative
    // control. A pin below may only move with a written attribution in the
    // fixture's `reanchored` field naming what changed and how it was
    // measured; an unattributed move is a regression.
    expect(TENANT_THEME_COMPILER_VERSION).toBe(PINNED.compilerVersion);
  });

  it("moves both schema drift sentinels exactly once, for the declared narrowing", () => {
    // `TENANT_THEME_OVERRIDE_TOKENS` stopped publishing the four
    // `--ds-color-dark-primary|-secondary|-accent|-bg` rows: no compiler emits
    // that family and no stylesheet reads it, so the allowlist was granting a
    // tenant a knob wired to nothing. The re-anchor and its full rationale are
    // recorded at the primary sentinel site in `tenant-theme-compiler.test.ts`;
    // this file's job is to prove the move happened HERE too and is the
    // declared one, not a silent second drift.
    //
    // The pre-change values stay pinned and stay asserted. This suite's other
    // pins -- the null-override and W4-absent artifact digests, and the
    // compiler version -- are untouched, which is what confines the narrowing
    // to the schema surface.
    const POST_DARK_TOKEN_NARROWING_DOCUMENT_DIGEST =
      "sha256-4beabac2c0147b671abf92236230584950c5ba900d4f8750e3d036e84e088ce2";
    const POST_DARK_TOKEN_NARROWING_CONFIG_DIGEST =
      "sha256-2c4c6e60732ca8fee64938eb1e4959508408b22391f60c9d373f1c138bd10c53";

    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).not.toBe(
      PINNED.documentSchemaDigest
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).not.toBe(PINNED.configSchemaDigest);
    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).toBe(
      POST_DARK_TOKEN_NARROWING_DOCUMENT_DIGEST
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).toBe(
      POST_DARK_TOKEN_NARROWING_CONFIG_DIGEST
    );
  });

  it("keeps the null-override artifact digest byte-identical", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(NULL_OVERRIDE_DOCUMENT, { ...IDENTITY })
    );
    expect(artifact.digest).toBe(PINNED.nullOverrideDigest);
    expect(artifact.verticalEnvelopeDigest).toBe(
      PINNED.nullOverrideEnvelopeDigest
    );
  });

  it("moves the populated simple artifact digest exactly once, for the declared reason", () => {
    // THE ONE SANCTIONED MOVE. A document that authors a primary seed now also
    // receives the shared interaction floor -- `--ds-color-primary-foreground`,
    // `--ds-color-border-focus`, `--ds-color-link`, `--ds-color-link-hover`,
    // derived by `color-math/interaction-floor`, the same function the static
    // BrandTheme path uses. Four more variables in the emission is four more
    // bytes under the hash, so this digest legitimately changed.
    //
    // The pre-change value stays pinned and stays asserted: proving the digest
    // is no longer the old one is what makes this a DECLARED move rather than
    // a refreshed baseline. The `null-override` and `W4-absent` documents
    // author no primary seed, receive no floor, and are still asserted
    // byte-identical above and below -- so the move is confined to exactly the
    // documents the new derivation reaches.
    //
    // OPERATIONAL NOTE: a digest move invalidates artifacts already persisted
    // against a tenant row. Every such row must be recompiled.
    const POST_INTERACTION_FLOOR_DIGEST =
      "sha256-04c7dac06febfd205c12545ccb7a67144cdbfcff283479d168e8ee887d017985";

    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(POPULATED_SIMPLE_DOCUMENT, { ...IDENTITY })
    );
    expect(artifact.digest).not.toBe(PINNED.populatedSimpleDigest);
    expect(artifact.digest).toBe(POST_INTERACTION_FLOOR_DIGEST);
    // The envelope digest is untouched by an emission change, so it is still
    // held to the pre-change value.
    expect(artifact.verticalEnvelopeDigest).toBe(
      PINNED.populatedSimpleEnvelopeDigest
    );
    // The four channels that moved it, named rather than implied.
    for (const channel of [
      "--ds-color-primary-foreground",
      "--ds-color-border-focus",
      "--ds-color-link",
      "--ds-color-link-hover",
    ]) {
      expect(artifact.variables[channel], channel).toBeDefined();
    }
  });

  it("keeps the W4-absent advanced artifact digest byte-identical", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(ABSENT_NEW_FIELDS_DOCUMENT, {
        ...W4_PIN_IDENTITY,
      }),
      { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire") }
    );
    expect(artifact.digest).toBe(PINNED.w4AbsentDigest);
    expect(artifact.verticalEnvelopeDigest).toBe(PINNED.w4AbsentEnvelopeDigest);
  });

  it("produces one digest for a document authored in any key order", () => {
    // The whole point of canonical form: two editors that serialise the same
    // appearance with different property order must not fork the artifact.
    const reordered = {
      mode: "simple",
      appearance: {
        navigation: { sidebarTone: "subtle" },
        surfaces: { elevation: "elevated" },
        shape: { buttonStyle: "soft" },
        motion: { durationScale: 1.15, ambient: "subtle", intensity: 0.62 },
        density: "normal",
        typography: {
          fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
          fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        },
        palette: {
          backgroundMode: "light",
          accent: "#E2725B",
          secondary: "#8C6D46",
          primary: "#0F766E",
        },
      },
      schemaVersion: 1,
    } as unknown as TenantThemeDocument;

    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(reordered, { ...IDENTITY })
    );

    // Compared against the SAME document compiled in its declared key order,
    // not against a pinned literal. Key-order independence is a property of
    // the two compilations relative to each other; pinning it to a captured
    // hash made it break every time the emission legitimately changed, which
    // is a different fact wearing this test's name.
    const declaredOrder = compileTenantThemeConfig(
      hydrateTenantThemeConfig(POPULATED_SIMPLE_DOCUMENT, { ...IDENTITY })
    );
    expect(artifact.digest).toBe(declaredOrder.digest);
  });

  it("still publishes canonicalizeTenantThemeValue as a working alias", () => {
    // The name is part of the /server entrypoint. The extraction rebound it to
    // the shared kernel function; it must stay callable and stay canonical.
    expect(canonicalizeTenantThemeValue({ b: 1, a: "  x  " })).toBe(
      '{"a":"x","b":1}'
    );
  });
});
