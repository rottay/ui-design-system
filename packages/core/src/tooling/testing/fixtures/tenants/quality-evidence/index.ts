/**
 * @fileoverview DS-Q001 code-owned torture tenants.
 *
 * The three fixtures represent different products, not palette swaps. They
 * combine typography, density, radius, elevation, anatomy and the complete
 * semantic surface-role hierarchy so visual gates can expose components that
 * still hardcode their own appearance.
 *
 * They are test inputs only: never register these identities as product
 * tenants or publish generated theme artifacts for them.
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type {
  TenantThemeAdvancedDocument,
  TenantThemeConfigIdentity,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";

import {
  EDITORIAL_FLAT_SURFACE_ROLES,
  HUMANIST_SOFT_SURFACE_ROLES,
  TECHNICAL_DARK_SURFACE_ROLES,
} from "./materials";

export type TortureTenantAxis =
  | "editorial"
  | "technical"
  | "humanist"
  | "light"
  | "dark"
  | "flat"
  | "soft"
  | "radius-0"
  | "ultra-rounded"
  | "compact"
  | "spacious";

export interface TortureTenantFixture {
  readonly id: string;
  readonly description: string;
  readonly axes: readonly TortureTenantAxis[];
  readonly brandTheme: BrandTheme;
  readonly tenantTheme: {
    readonly identity: TenantThemeConfigIdentity;
    readonly document: TenantThemeAdvancedDocument;
  };
}

export const EDITORIAL_FLAT_BRAND_THEME = {
  id: "quality-editorial-flat",
  name: "Quality evidence · Editorial flat",
  palette: {
    primaryColor: "#174E77",
    secondaryColor: "#8C5E38",
    accentColor: "#C67C3B",
    backgroundColor: "#F7F2E8",
    darkPrimaryColor: "#7DB4D9",
    darkSecondaryColor: "#D3A77F",
    darkAccentColor: "#E3A76E",
    darkBackgroundColor: "#171A1D",
    successColor: "#286B4A",
    warningColor: "#8A5B16",
    errorColor: "#A33A32",
    infoColor: "#174E77",
  },
  typography: {
    fontFamilyBase:
      "var(--ds-font-pack-editorial-text, Georgia, 'Times New Roman', serif)",
    fontFamilyHeading:
      "var(--ds-font-pack-editorial-display, Georgia, 'Times New Roman', serif)",
    fontFamilyMono:
      "var(--ds-font-pack-plex-mono, ui-monospace, SFMono-Regular, monospace)",
    headingWeightBias: "normal",
    headingLetterSpacing: "0",
    labelStyle: "uppercase",
    letterSpacing: {
      display: "-0.015em",
      heading: "0",
      body: "0",
      mono: "0.02em",
    },
    lineHeight: {
      display: 1.08,
      heading: 1.18,
      body: 1.58,
      tight: 1.12,
      relaxed: 1.72,
    },
  },
  surfaces: {
    surfaceRoles: EDITORIAL_FLAT_SURFACE_ROLES,
    borderRadius: { sm: "0px", md: "0px", lg: "0px", xl: "0px" },
    shadows: { sm: "none", md: "none", lg: "none", xl: "none" },
    densityScale: 0.85,
    effectIntensity: 0,
  },
  motion: {
    intensity: 0.12,
    entrance: "fade",
    entranceDuration: 110,
    hoverLift: 0,
    hoverScale: 1,
    useSpring: false,
    pulseSpeed: "none",
    skeletonStyle: "pulse",
    staggerDelay: 0,
    staggerMax: 0,
    countUpEnabled: false,
  },
} satisfies BrandTheme;

export const TECHNICAL_DARK_BRAND_THEME = {
  id: "quality-technical-dark",
  name: "Quality evidence · Technical dark",
  palette: {
    primaryColor: "#77B7FF",
    secondaryColor: "#61D4C8",
    accentColor: "#F0A45D",
    backgroundColor: "#07101C",
    darkPrimaryColor: "#8DC4FF",
    darkSecondaryColor: "#78E4D8",
    darkAccentColor: "#FFC07D",
    darkBackgroundColor: "#07101C",
    successColor: "#58C99A",
    warningColor: "#F0B45D",
    errorColor: "#FF7D7D",
    infoColor: "#77B7FF",
  },
  typography: {
    fontFamilyBase:
      "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
    fontFamilyHeading:
      "var(--ds-font-pack-grotesk-display, Inter, ui-sans-serif, system-ui, sans-serif)",
    fontFamilyMono:
      "var(--ds-font-pack-plex-mono, 'IBM Plex Mono', ui-monospace, monospace)",
    headingWeightBias: "heavier",
    headingLetterSpacing: "0.01em",
    labelStyle: "uppercase",
    letterSpacing: {
      display: "-0.025em",
      heading: "0.01em",
      body: "0",
      mono: "0.025em",
    },
    lineHeight: {
      display: 1.04,
      heading: 1.12,
      body: 1.42,
      tight: 1.06,
      relaxed: 1.58,
    },
  },
  surfaces: {
    surfaceRoles: TECHNICAL_DARK_SURFACE_ROLES,
    borderRadius: { sm: "2px", md: "3px", lg: "4px", xl: "6px" },
    shadows: {
      sm: "0 1px 0 rgba(0, 0, 0, 0.42)",
      md: "0 8px 24px rgba(0, 0, 0, 0.26)",
      lg: "0 18px 48px rgba(0, 0, 0, 0.38)",
      xl: "0 28px 80px rgba(0, 0, 0, 0.54)",
    },
    densityScale: 0.88,
    effectIntensity: 0.18,
  },
  motion: {
    intensity: 0.32,
    entrance: "fade",
    entranceDuration: 140,
    hoverLift: 1,
    hoverScale: 1.002,
    useSpring: false,
    pulseSpeed: "slow",
    skeletonStyle: "shimmer",
    staggerDelay: 12,
    staggerMax: 72,
    countUpEnabled: true,
  },
} satisfies BrandTheme;

export const HUMANIST_SOFT_BRAND_THEME = {
  id: "quality-humanist-soft",
  name: "Quality evidence · Humanist soft",
  palette: {
    primaryColor: "#315F83",
    secondaryColor: "#6C7661",
    accentColor: "#A96D4E",
    backgroundColor: "#F3F0E9",
    darkPrimaryColor: "#91BED9",
    darkSecondaryColor: "#B4C0A5",
    darkAccentColor: "#D7A88D",
    darkBackgroundColor: "#172126",
    successColor: "#37745B",
    warningColor: "#9A6B2F",
    errorColor: "#A94F4A",
    infoColor: "#315F83",
  },
  typography: {
    fontFamilyBase:
      "var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, sans-serif)",
    fontFamilyHeading:
      "var(--ds-font-pack-grotesk-display, 'Public Sans', ui-sans-serif, system-ui, sans-serif)",
    fontFamilyMono:
      "var(--ds-font-pack-plex-mono, ui-monospace, SFMono-Regular, monospace)",
    headingWeightBias: "normal",
    headingLetterSpacing: "-0.012em",
    labelStyle: "sentence",
    letterSpacing: {
      display: "-0.025em",
      heading: "-0.012em",
      body: "-0.002em",
      mono: "0.01em",
    },
    lineHeight: {
      display: 1.08,
      heading: 1.2,
      body: 1.56,
      tight: 1.12,
      relaxed: 1.72,
    },
  },
  surfaces: {
    surfaceRoles: HUMANIST_SOFT_SURFACE_ROLES,
    borderRadius: { sm: "18px", md: "24px", lg: "32px", xl: "40px" },
    shadows: {
      sm: "0 5px 14px rgba(36, 65, 80, 0.08)",
      md: "0 12px 32px rgba(36, 65, 80, 0.11)",
      lg: "0 20px 48px rgba(36, 65, 80, 0.17)",
      xl: "0 32px 90px rgba(18, 35, 44, 0.24)",
    },
    densityScale: 1.15,
    effectIntensity: 0.6,
  },
  motion: {
    intensity: 0.58,
    entrance: "slideUp",
    entranceDuration: 220,
    hoverLift: 3,
    hoverScale: 1.006,
    useSpring: true,
    springTension: 188,
    springFriction: 24,
    pulseSpeed: "slow",
    skeletonStyle: "shimmer",
    staggerDelay: 24,
    staggerMax: 144,
    countUpEnabled: true,
  },
} satisfies BrandTheme;

export const EDITORIAL_FLAT_IDENTITY = {
  tenantId: "tenant_quality_editorial_flat",
  slug: "quality-editorial-flat",
  verticalKey: "bithire",
  rowVersion: 1,
} satisfies TenantThemeConfigIdentity;

export const EDITORIAL_FLAT_DOCUMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: {
        primary: "#174E77",
        secondary: "#8C5E38",
        accent: "#C67C3B",
        backgroundMode: "light",
      },
      typography: { typePairing: "editorial", scale: 0.94 },
      shape: { buttonStyle: "sharp", radiusScale: 0.8 },
      density: "compact",
      surfaces: { elevation: "flat" },
      navigation: { sidebarTone: "subtle" },
    },
    advanced: {
      chrome: {
        cardComponent: { anatomy: "underline" },
        table: { anatomy: "open" },
        sidebar: { anatomy: "rail" },
        layout: { anatomy: "flat" },
      },
      tokenOverrides: {
        "--ds-color-bg-primary": "#F7F2E8",
        "--ds-color-bg": "#F7F2E8",
        "--ds-color-background": "#F7F2E8",
        "--ds-color-text-primary": "#25231F",
        "--ds-color-text-secondary": "#5B554B",
        "--ds-color-text-muted": "#756E62",
        "--ds-color-border-primary": "#CFC6B7",
        "--ds-color-border-secondary": "#B8AE9F",
        "--ds-surface-canvas": "#F7F2E8",
        "--ds-surface-shell": "#F2ECE0",
        "--ds-surface-panel": "#FBF8F1",
        "--ds-surface-card": "#FFFCF7",
        "--ds-surface-inset": "#EEE7DA",
        "--ds-surface-control": "#FFFFFF",
        "--ds-surface-raised": "#FFFFFF",
        "--ds-surface-overlay": "rgba(37, 35, 31, 0.88)",
        "--ds-material-card-border": "#C8BEAE",
        "--ds-material-card-border-strong": "#766D61",
        "--ds-material-card-background-hover": "#F9F3E8",
        "--ds-material-card-background-active": "#F2EADB",
        "--ds-material-card-background-selected": "#EEE4D4",
        "--ds-material-card-border-hover": "#8E8475",
        "--ds-material-card-focus-ring": "0 0 0 2px #174E77",
        "--ds-material-card-shadow": "none",
        "--ds-material-card-shadow-hover": "none",
        "--ds-radius-sm": "0px",
        "--ds-radius-md": "0px",
        "--ds-radius-lg": "0px",
        "--ds-radius-xl": "0px",
        "--ds-shadow-sm": "none",
        "--ds-shadow-md": "none",
        "--ds-shadow-lg": "none",
        "--ds-shadow-xl": "none",
        "--ds-density-scale": 0.85,
        "--ds-effect-intensity": 0,
      },
    },
  },
} satisfies TenantThemeAdvancedDocument;

export const TECHNICAL_DARK_IDENTITY = {
  tenantId: "tenant_quality_technical_dark",
  slug: "quality-technical-dark",
  verticalKey: "bithire",
  rowVersion: 1,
} satisfies TenantThemeConfigIdentity;

export const TECHNICAL_DARK_DOCUMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: {
        primary: "#77B7FF",
        secondary: "#61D4C8",
        accent: "#F0A45D",
        backgroundMode: "dark",
      },
      typography: { typePairing: "technical", scale: 0.96 },
      shape: { buttonStyle: "sharp", radiusScale: 0.82 },
      density: "compact",
      surfaces: { elevation: "soft" },
      navigation: { sidebarTone: "inverse" },
    },
    advanced: {
      chrome: {
        cardComponent: { anatomy: "framed" },
        table: { anatomy: "ruled" },
        sidebar: { anatomy: "rail" },
        layout: { anatomy: "floating" },
      },
      tokenOverrides: {
        "--ds-color-dark-bg": "#07101C",
        "--ds-color-bg-primary": "#07101C",
        "--ds-color-bg": "#07101C",
        "--ds-color-background": "#07101C",
        "--ds-color-text-primary": "#EDF5FF",
        "--ds-color-text-secondary": "#C0D1E2",
        "--ds-color-text-muted": "#8DA3B7",
        "--ds-color-border-primary": "#29445F",
        "--ds-color-border-secondary": "#3B6082",
        "--ds-surface-canvas": "#07101C",
        "--ds-surface-shell": "#091522",
        "--ds-surface-panel": "#0C1928",
        "--ds-surface-card": "#102032",
        "--ds-surface-inset": "#06101B",
        "--ds-surface-control": "#0B1A2A",
        "--ds-surface-raised": "#14283D",
        "--ds-surface-overlay": "rgba(3, 8, 15, 0.94)",
        "--ds-material-card-border": "#31506D",
        "--ds-material-card-border-strong": "#72A8D8",
        "--ds-material-card-background-hover": "#142941",
        "--ds-material-card-background-active": "#0D1A29",
        "--ds-material-card-background-selected": "#17324E",
        "--ds-material-card-border-hover": "#77B7FF",
        "--ds-material-card-focus-ring": "0 0 0 2px #77B7FF",
        "--ds-material-card-shadow": "0 10px 30px rgba(0, 0, 0, 0.24)",
        "--ds-material-card-shadow-hover":
          "0 14px 36px rgba(0, 0, 0, 0.32)",
        "--ds-radius-sm": "2px",
        "--ds-radius-md": "3px",
        "--ds-radius-lg": "4px",
        "--ds-radius-xl": "6px",
        "--ds-shadow-sm": "0 1px 0 rgba(0, 0, 0, 0.42)",
        "--ds-shadow-md": "0 8px 24px rgba(0, 0, 0, 0.26)",
        "--ds-shadow-lg": "0 18px 48px rgba(0, 0, 0, 0.38)",
        "--ds-shadow-xl": "0 28px 80px rgba(0, 0, 0, 0.54)",
        "--ds-density-scale": 0.88,
        "--ds-effect-intensity": 0.18,
      },
    },
  },
} satisfies TenantThemeAdvancedDocument;

export const HUMANIST_SOFT_IDENTITY = {
  tenantId: "tenant_quality_humanist_soft",
  slug: "quality-humanist-soft",
  verticalKey: "bithire",
  rowVersion: 1,
} satisfies TenantThemeConfigIdentity;

export const HUMANIST_SOFT_DOCUMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: {
        primary: "#315F83",
        secondary: "#6C7661",
        accent: "#A96D4E",
        backgroundMode: "light",
      },
      typography: { typePairing: "sober", scale: 1.06 },
      shape: { buttonStyle: "pill", radiusScale: 1.2 },
      density: "spacious",
      surfaces: { elevation: "soft" },
      navigation: { sidebarTone: "subtle" },
    },
    advanced: {
      chrome: {
        cardComponent: { anatomy: "framed" },
        table: { anatomy: "zebra" },
        sidebar: { anatomy: "panel" },
        layout: { anatomy: "floating" },
      },
      tokenOverrides: {
        "--ds-color-bg-primary": "#F3F0E9",
        "--ds-color-bg": "#F3F0E9",
        "--ds-color-background": "#F3F0E9",
        "--ds-color-text-primary": "#20303A",
        "--ds-color-text-secondary": "#465B66",
        "--ds-color-text-muted": "#6C7D85",
        "--ds-color-border-primary": "#D0DCE1",
        "--ds-color-border-secondary": "#A7BBC4",
        "--ds-surface-canvas": "#F3F0E9",
        "--ds-surface-shell": "#F9F7F2",
        "--ds-surface-panel": "#FCFDFC",
        "--ds-surface-card": "#FFFFFF",
        "--ds-surface-inset": "#E8EDEB",
        "--ds-surface-control": "#FFFFFF",
        "--ds-surface-raised": "#F7FAFB",
        "--ds-surface-overlay": "rgba(31, 48, 58, 0.88)",
        "--ds-material-card-border": "#CAD8DE",
        "--ds-material-card-border-strong": "#7F9FAC",
        "--ds-material-card-background-hover": "#EEF5F8",
        "--ds-material-card-background-active": "#E8F0F3",
        "--ds-material-card-background-selected": "#E2EDF2",
        "--ds-material-card-border-hover": "#6C94A6",
        "--ds-material-card-focus-ring":
          "0 0 0 3px rgba(49, 95, 131, 0.28)",
        "--ds-material-card-shadow":
          "0 12px 32px rgba(36, 65, 80, 0.11)",
        "--ds-material-card-shadow-hover":
          "0 20px 48px rgba(36, 65, 80, 0.17)",
        "--ds-radius-sm": "18px",
        "--ds-radius-md": "24px",
        "--ds-radius-lg": "32px",
        "--ds-radius-xl": "40px",
        "--ds-shadow-sm": "0 5px 14px rgba(36, 65, 80, 0.08)",
        "--ds-shadow-md": "0 12px 32px rgba(36, 65, 80, 0.11)",
        "--ds-shadow-lg": "0 20px 48px rgba(36, 65, 80, 0.17)",
        "--ds-shadow-xl": "0 32px 90px rgba(18, 35, 44, 0.24)",
        "--ds-density-scale": 1.15,
        "--ds-effect-intensity": 0.6,
      },
    },
  },
} satisfies TenantThemeAdvancedDocument;

export const TORTURE_TENANT_FIXTURES = [
  {
    id: "editorial-flat-radius-0-compact",
    description:
      "Warm editorial paper, zero radius, zero shadow and compact density.",
    axes: ["editorial", "light", "flat", "radius-0", "compact"],
    brandTheme: EDITORIAL_FLAT_BRAND_THEME,
    tenantTheme: {
      identity: EDITORIAL_FLAT_IDENTITY,
      document: EDITORIAL_FLAT_DOCUMENT,
    },
  },
  {
    id: "technical-dark-compact",
    description:
      "Dense dark instrumentation with mono detail, sharp geometry and precise edges.",
    axes: ["technical", "dark", "compact"],
    brandTheme: TECHNICAL_DARK_BRAND_THEME,
    tenantTheme: {
      identity: TECHNICAL_DARK_IDENTITY,
      document: TECHNICAL_DARK_DOCUMENT,
    },
  },
  {
    id: "humanist-soft-ultra-rounded-spacious",
    description:
      "Warm humanist hierarchy with layered materials, generous rhythm and oversized radii.",
    axes: [
      "humanist",
      "light",
      "soft",
      "ultra-rounded",
      "spacious",
    ],
    brandTheme: HUMANIST_SOFT_BRAND_THEME,
    tenantTheme: {
      identity: HUMANIST_SOFT_IDENTITY,
      document: HUMANIST_SOFT_DOCUMENT,
    },
  },
] as const satisfies readonly TortureTenantFixture[];

export {
  EDITORIAL_FLAT_SURFACE_ROLES,
  HUMANIST_SOFT_SURFACE_ROLES,
  TECHNICAL_DARK_SURFACE_ROLES,
} from "./materials";
export type { CompleteSemanticSurfaceRoleMap } from "./materials";
