/**
 * The seven tenant theme rows app-platform actually seeds, verbatim.
 *
 * PROVENANCE. Copied without edit from
 * `app-platform/src/core/database/seed/access/tenancy-whitelabel-configs/index.ts`
 * (six `mode: "simple"` appearances built by `buildCanonicalCustomerConfig`,
 * plus the pre-authored advanced document of The Management Miami). They are
 * the shapes `migrate v1 -> v2` has to be TOTAL over, so the migration is
 * exercised against documents a customer really has rather than against ones
 * written to make it pass.
 *
 * NOT A RUNTIME TENANT. Nothing here is registered, compiled into a shipped
 * bundle, or a second source of identity: it is a fixture, like the BrandTheme
 * specimens beside it, and stays explicit-only.
 */

import type {
  TenantThemeAdvancedDocument,
  TenantThemeDocument,
  TenantThemeSimpleDocument,
} from "../..";

type SimpleAppearance = TenantThemeSimpleDocument["appearance"];

const simple = (appearance: SimpleAppearance): TenantThemeSimpleDocument => ({
  schemaVersion: 1,
  mode: "simple",
  appearance,
});

export const ACME_RECRUITING_ROW = simple({
  palette: {
    primary: "#1E3A5F",
    secondary: "#52677F",
    accent: "#C58A32",
    backgroundMode: "light",
  },
  typography: {
    fontFamilyBase: "Inter, system-ui, sans-serif",
    fontFamilyHeading: "Inter, system-ui, sans-serif",
  },
  shape: { buttonStyle: "soft" },
  density: "compact",
  motion: { intensity: 0.3, durationScale: 0.9, ambient: "off" },
  surfaces: { elevation: "flat" },
  navigation: { sidebarTone: "strong" },
});

export const TALENT_FORCE_ROW = simple({
  palette: {
    primary: "#4338CA",
    secondary: "#334155",
    accent: "#0891B2",
    backgroundMode: "light",
  },
  typography: {
    fontFamilyBase: "system-ui, sans-serif",
    fontFamilyHeading: "system-ui, sans-serif",
  },
  shape: { buttonStyle: "pill" },
  density: "normal",
  motion: { intensity: 0.55, durationScale: 1, ambient: "subtle" },
  surfaces: { elevation: "elevated" },
  navigation: { sidebarTone: "inverse" },
});

export const HIRE_SMART_ROW = simple({
  palette: {
    primary: "#166534",
    secondary: "#3F6212",
    accent: "#0F766E",
    backgroundMode: "light",
  },
  typography: {
    fontFamilyBase: "Inter, system-ui, sans-serif",
    fontFamilyHeading: "Georgia, serif",
  },
  shape: { buttonStyle: "soft" },
  density: "spacious",
  motion: { intensity: 0.4, durationScale: 1.1, ambient: "subtle" },
  surfaces: { elevation: "soft" },
  navigation: { sidebarTone: "subtle" },
});

export const RECRUIT_PRO_ROW = simple({
  palette: {
    primary: "#6B21A8",
    secondary: "#3B0764",
    accent: "#C026D3",
    backgroundMode: "light",
  },
  typography: {
    fontFamilyBase: "Arial, sans-serif",
    fontFamilyHeading: "Arial, sans-serif",
  },
  shape: { buttonStyle: "sharp" },
  density: "compact",
  motion: { intensity: 0.7, durationScale: 0.8, ambient: "subtle" },
  surfaces: { elevation: "elevated" },
  navigation: { sidebarTone: "strong" },
});

export const STAFFING_PLUS_ROW = simple({
  palette: {
    primary: "#0F2747",
    secondary: "#334155",
    accent: "#B68A35",
    backgroundMode: "light",
  },
  typography: {
    fontFamilyBase: "system-ui, sans-serif",
    fontFamilyHeading: "Georgia, serif",
  },
  shape: { buttonStyle: "sharp" },
  density: "compact",
  motion: { intensity: 0.2, durationScale: 0.9, ambient: "off" },
  surfaces: { elevation: "flat" },
  navigation: { sidebarTone: "inverse" },
});

export const CAREER_BUILDERS_ROW = simple({
  palette: {
    primary: "#C2413B",
    secondary: "#1D4ED8",
    accent: "#EA580C",
    backgroundMode: "light",
  },
  typography: {
    fontFamilyBase: "Arial, sans-serif",
    fontFamilyHeading: "Arial, sans-serif",
  },
  shape: { buttonStyle: "pill" },
  density: "spacious",
  motion: { intensity: 0.6, durationScale: 1.05, ambient: "subtle" },
  surfaces: { elevation: "soft" },
  navigation: { sidebarTone: "subtle" },
});

export const THE_MANAGEMENT_MIAMI_ROW: TenantThemeAdvancedDocument = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: {
        primary: "#0F766E",
        secondary: "#8C6D46",
        accent: "#B44F3C",
        backgroundMode: "auto",
        dark: {
          primary: "#4FB3AA",
          secondary: "#D0AE78",
          accent: "#D97864",
          background: "#1A1611",
        },
      },
      typography: { typePairing: "editorial", scale: 1.05 },
      shape: { buttonStyle: "sharp", radiusScale: 0.8 },
      motion: { intensity: 0.62, durationScale: 1.3, ambient: "subtle" },
      surfaces: { elevation: "elevated" },
      navigation: { sidebarTone: "subtle" },
    },
    advanced: {
      chrome: {
        cardComponent: {
          anatomy: "underline",
          titleFontWeight: 600,
          shadow:
            "0 4px 10px rgba(46, 38, 28, 0.08), 0 1px 3px rgba(46, 38, 28, 0.05)",
          shadowHover:
            "0 14px 32px rgba(46, 38, 28, 0.12), 0 4px 10px rgba(46, 38, 28, 0.06)",
        },
        table: {
          anatomy: "open",
          headerFontWeight: 700,
          cellFontSize: "0.9375rem",
        },
        sidebar: {
          anatomy: "panel",
          groupFontWeight: 700,
          groupLetterSpacing: "0.08em",
          itemFontWeightActive: 700,
        },
        layout: { anatomy: "floating", headerHeight: "64px" },
      },
      tokenOverrides: {
        "--ds-density-scale": 1.05,
        "--ds-effect-intensity": 0.45,
        "--ds-line-height-body": 1.55,
        "--ds-letter-spacing-body": "0.01em",
      },
    },
  },
} as TenantThemeAdvancedDocument;

/**
 * The Miami row with the three v1 surfaces v2 retires removed.
 *
 * `palette.dark` (per-mode seeds, kit row 5: they return as per-mode sanctioned
 * overrides, which the kit has not opened yet) and the three raw tokens that
 * are not a decision (`--ds-density-scale`, `--ds-line-height-body`,
 * `--ds-letter-spacing-body`; D-03 retires raw authorship). `--ds-effect-intensity`
 * stays: it IS a decision, and the migration carries it as one.
 */
export const THE_MANAGEMENT_MIAMI_REMEDIATED: TenantThemeAdvancedDocument = {
  ...THE_MANAGEMENT_MIAMI_ROW,
  visualFoundation: {
    ...THE_MANAGEMENT_MIAMI_ROW.visualFoundation,
    general: {
      ...THE_MANAGEMENT_MIAMI_ROW.visualFoundation.general,
      palette: {
        primary: "#0F766E",
        secondary: "#8C6D46",
        accent: "#B44F3C",
        backgroundMode: "auto",
      },
    },
    advanced: {
      ...THE_MANAGEMENT_MIAMI_ROW.visualFoundation.advanced,
      tokenOverrides: { "--ds-effect-intensity": 0.45 },
    },
  },
} as TenantThemeAdvancedDocument;

export interface AppPlatformRow {
  readonly tenant: string;
  readonly document: TenantThemeDocument;
}

/** The rows in seed order. */
export const APP_PLATFORM_TENANT_ROWS: readonly AppPlatformRow[] = Object.freeze([
  { tenant: "acme-recruiting", document: ACME_RECRUITING_ROW },
  { tenant: "talent-force", document: TALENT_FORCE_ROW },
  { tenant: "hire-smart", document: HIRE_SMART_ROW },
  { tenant: "recruit-pro", document: RECRUIT_PRO_ROW },
  { tenant: "staffing-plus", document: STAFFING_PLUS_ROW },
  { tenant: "career-builders", document: CAREER_BUILDERS_ROW },
  { tenant: "themanagementmiami", document: THE_MANAGEMENT_MIAMI_ROW },
]);

/**
 * The same rows with every field v2 has no counterpart for removed.
 *
 * This is the MIGRATION PLAN a customer row needs, made executable: each entry
 * names what has to change in the row before it can become a v2 document, and
 * the suite proves the stripped row then migrates AND compiles to the same
 * bytes as the original for everything that survived.
 */
export interface AppPlatformRowRemediation {
  readonly tenant: string;
  /** The v1 field the migration refuses, and the substring it names. */
  readonly refusedField: string;
  readonly document: TenantThemeDocument;
}

const withoutTypography = (
  row: TenantThemeSimpleDocument
): TenantThemeSimpleDocument => {
  const { typography: _typography, ...appearance } = row.appearance as Record<
    string,
    unknown
  >;
  return { ...row, appearance: appearance as SimpleAppearance };
};

export const APP_PLATFORM_ROW_REMEDIATIONS: readonly AppPlatformRowRemediation[] =
  Object.freeze([
    {
      tenant: "acme-recruiting",
      refusedField: "general.typography.fontFamilyBase",
      document: withoutTypography(ACME_RECRUITING_ROW),
    },
    {
      tenant: "talent-force",
      refusedField: "general.typography.fontFamilyBase",
      document: withoutTypography(TALENT_FORCE_ROW),
    },
    {
      tenant: "hire-smart",
      refusedField: "general.typography.fontFamilyBase",
      document: withoutTypography(HIRE_SMART_ROW),
    },
    {
      tenant: "recruit-pro",
      refusedField: "general.typography.fontFamilyBase",
      document: withoutTypography(RECRUIT_PRO_ROW),
    },
    {
      tenant: "staffing-plus",
      refusedField: "general.typography.fontFamilyBase",
      document: withoutTypography(STAFFING_PLUS_ROW),
    },
    {
      tenant: "career-builders",
      refusedField: "general.typography.fontFamilyBase",
      document: withoutTypography(CAREER_BUILDERS_ROW),
    },
    {
      tenant: "themanagementmiami",
      refusedField: "general.palette.dark",
      document: THE_MANAGEMENT_MIAMI_REMEDIATED,
    },
  ]);
