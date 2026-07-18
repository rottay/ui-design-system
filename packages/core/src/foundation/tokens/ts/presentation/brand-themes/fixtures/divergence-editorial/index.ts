/**
 * W4 divergence-demo PROOF FIXTURE "editorial" (design w4-whitelabel section 9).
 *
 * The counterpart to `divergence-sober`: warm editorial identity on the SAME
 * bithire vertical (Fraunces/Newsreader pairing, plum palette with authored
 * dark seeds, underline cards, open tables, wide panel sidebar with inverse
 * tone, floating header, spacious density, enlarged type scale, pill buttons,
 * soft elevation, dual light/dark via backgroundMode auto). The divergence
 * spec's cross-tenant pixel floor is measured between this fixture and sober.
 *
 * Never a product tenant; see the sober fixture header for the registration,
 * packaging, zero-adjustments, and showroom-copy-parity contracts — they apply
 * identically here.
 *
 * Runtime-pure: only type-only imports, zero side effects.
 */

import type {
  TenantThemeAdvancedDocumentV1,
  TenantThemeConfigIdentityV1,
} from "../../../../../../contracts/composition/tenants/themes/tenant-theme";

export const DIVERGENCE_EDITORIAL_IDENTITY: TenantThemeConfigIdentityV1 = {
  tenantId: "tenant_divergence_editorial",
  slug: "divergence-editorial",
  verticalKey: "bithire",
  rowVersion: 1,
};

export const DIVERGENCE_EDITORIAL_DOCUMENT: TenantThemeAdvancedDocumentV1 = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: {
        primary: "#A23B72",
        backgroundMode: "auto",
        dark: {
          primary: "#D06A9F",
          background: "#181117",
        },
      },
      typography: {
        typePairing: "editorial",
        scale: 1.06,
      },
      shape: {
        buttonStyle: "pill",
      },
      surfaces: {
        elevation: "soft",
      },
      navigation: {
        sidebarTone: "inverse",
      },
    },
    advanced: {
      chrome: {
        cardComponent: { anatomy: "underline" },
        table: { anatomy: "open" },
        sidebar: { anatomy: "panel" },
        layout: { anatomy: "floating" },
      },
      tokenOverrides: {
        "--ds-density-scale": 1.08,
      },
    },
  },
};

/** Anatomy attributes the compiled artifact must project for this document. */
export const DIVERGENCE_EDITORIAL_EXPECTED_ANATOMY: Readonly<
  Record<string, string>
> = {
  "data-anatomy-card": "underline",
  "data-anatomy-table": "open",
  "data-anatomy-sidebar": "panel",
  "data-anatomy-layout": "floating",
};
