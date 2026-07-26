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
    // A compiler-version bump is a legitimate reason for artifact digests to
    // move. This assertion makes the pins below unambiguous: while the version
    // is unchanged, a moved digest is a regression, never a sanctioned bump.
    expect(TENANT_THEME_COMPILER_VERSION).toBe(PINNED.compilerVersion);
  });

  it("keeps both schema drift sentinels byte-identical", () => {
    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).toBe(PINNED.documentSchemaDigest);
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).toBe(PINNED.configSchemaDigest);
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

  it("keeps the populated simple artifact digest byte-identical", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(POPULATED_SIMPLE_DOCUMENT, { ...IDENTITY })
    );
    expect(artifact.digest).toBe(PINNED.populatedSimpleDigest);
    expect(artifact.verticalEnvelopeDigest).toBe(
      PINNED.populatedSimpleEnvelopeDigest
    );
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

    expect(artifact.digest).toBe(PINNED.populatedSimpleDigest);
  });

  it("still publishes canonicalizeTenantThemeValue as a working alias", () => {
    // The name is part of the /server entrypoint. The extraction rebound it to
    // the shared kernel function; it must stay callable and stay canonical.
    expect(canonicalizeTenantThemeValue({ b: 1, a: "  x  " })).toBe(
      '{"a":"x","b":1}'
    );
  });
});
