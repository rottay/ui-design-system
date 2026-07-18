/**
 * W4 divergence-demo PROOF FIXTURE "sober" (design w4-whitelabel section 9).
 *
 * One of the two tenant documents the wave-exit certification renders on the
 * same bithire vertical to prove the white-label surface produces DIFFERENT
 * PRODUCTS, not recolors: sober technical identity (grotesk/humanist pairing,
 * steel-blue palette, framed cards, ruled tables, icon rail sidebar, flat
 * header, compact density, reduced type scale, sharp buttons, flat elevation,
 * light-only).
 *
 * This tenant is NOT a product tenant. It is never registered in
 * `KNOWN_TENANTS`, `BUNDLED_TENANT_SLUGS`, or `FIRST_PARTY_ARTIFACT_SPECS`,
 * and this fixtures directory is excluded from the published tarball by the
 * pack-inventory gate. It compiles at render/test time through
 * `compileTenantThemeConfig` under the code-owned bithire envelope — the same
 * path a DB-driven customer tenant takes.
 *
 * Both fixture documents must compile with ZERO contrast adjustments: a
 * well-formed tenant needs no autocorrect, and the divergence spec asserts it.
 *
 * The showroom divergence probe (packages/showroom/src/components/
 * divergence-surface/fixtures) carries a copy of this document; the
 * divergence Playwright spec asserts deep equality between the two, so this
 * module stays the single source of truth.
 *
 * Runtime-pure: only type-only imports, zero side effects, importable from a
 * plain Node or Playwright context without pulling in the design system.
 */

import type {
  TenantThemeAdvancedDocumentV1,
  TenantThemeConfigIdentityV1,
} from "../../../../../../contracts/composition/tenants/themes/tenant-theme";

export const DIVERGENCE_SOBER_IDENTITY: TenantThemeConfigIdentityV1 = {
  tenantId: "tenant_divergence_sober",
  slug: "divergence-sober",
  verticalKey: "bithire",
  rowVersion: 1,
};

export const DIVERGENCE_SOBER_DOCUMENT: TenantThemeAdvancedDocumentV1 = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: {
        primary: "#2F6B9A",
        backgroundMode: "light",
      },
      typography: {
        typePairing: "sober",
        scale: 0.96,
      },
      shape: {
        buttonStyle: "sharp",
      },
      surfaces: {
        elevation: "flat",
      },
    },
    advanced: {
      chrome: {
        cardComponent: { anatomy: "framed" },
        table: { anatomy: "ruled" },
        sidebar: { anatomy: "rail" },
        layout: { anatomy: "flat" },
      },
      tokenOverrides: {
        "--ds-density-scale": 0.92,
      },
    },
  },
};

/** Anatomy attributes the compiled artifact must project for this document. */
export const DIVERGENCE_SOBER_EXPECTED_ANATOMY: Readonly<
  Record<string, string>
> = {
  "data-anatomy-card": "framed",
  "data-anatomy-table": "ruled",
  "data-anatomy-sidebar": "rail",
  "data-anatomy-layout": "flat",
};
