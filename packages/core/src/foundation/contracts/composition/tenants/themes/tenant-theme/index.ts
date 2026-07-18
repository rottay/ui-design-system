/**
 * @fileoverview Versioned, data-only tenant theme contract.
 *
 * This is the persistence boundary shared by app-platform, database DTOs,
 * server rendering and the DS compiler. It intentionally contains visual
 * values only: engine selection, component/route topology, permissions,
 * semantic mappings, React/code, selectors and raw CSS are not representable.
 */

import type {
  BrandBreadcrumbChrome,
  BrandCardChrome,
  BrandControlsChrome,
  BrandFilterPillChrome,
  BrandLayoutChrome,
  BrandListingGridChrome,
  BrandMetricCardChrome,
  BrandModalChrome,
  BrandPremiumCardChrome,
  BrandSearchChrome,
  BrandShellChrome,
  BrandSidebarChrome,
  BrandSignalCardChrome,
  BrandTableChrome,
  BrandTabsChrome,
  BrandToolbarChrome,
  TenantAppearanceGeneral,
} from "..";

/** The only TenantThemeConfig schema accepted by this release. */
export const TENANT_THEME_SCHEMA_VERSION = 1 as const;

/**
 * Closed set of semantic DS variables exposed to Advanced tenants in v1.
 *
 * This is deliberately not a `--ds-${string}` index signature. Adding a token
 * is a contract change that must update the schema manifest and its digest.
 */
export const TENANT_THEME_OVERRIDE_TOKENS_V1 = [
  "--ds-color-primary",
  "--ds-color-secondary",
  "--ds-color-accent",
  "--ds-chart-category-1",
  "--ds-chart-category-2",
  "--ds-chart-category-3",
  "--ds-chart-category-4",
  "--ds-chart-category-5",
  "--ds-chart-category-6",
  "--ds-chart-category-7",
  "--ds-chart-category-8",
  "--ds-chart-category-9",
  "--ds-chart-category-10",
  "--ds-color-success",
  "--ds-color-warning",
  "--ds-color-error",
  "--ds-color-info",
  "--ds-color-dark-primary",
  "--ds-color-dark-secondary",
  "--ds-color-dark-accent",
  "--ds-color-dark-bg",
  "--ds-color-bg-primary",
  "--ds-color-bg",
  "--ds-color-background",
  "--ds-font-family-base",
  "--ds-font-family-heading",
  "--ds-font-family-mono",
  "--ds-font-family-display",
  "--ds-letter-spacing-display",
  "--ds-letter-spacing-heading",
  "--ds-letter-spacing-body",
  "--ds-letter-spacing-mono",
  "--ds-line-height-display",
  "--ds-line-height-heading",
  "--ds-line-height-body",
  "--ds-line-height-tight",
  "--ds-line-height-relaxed",
  "--ds-radius-sm",
  "--ds-radius-md",
  "--ds-radius-lg",
  "--ds-radius-xl",
  "--ds-shadow-sm",
  "--ds-shadow-md",
  "--ds-shadow-lg",
  "--ds-shadow-xl",
  "--ds-glass-bg",
  "--ds-glass-border",
  "--ds-glass-blur",
  "--ds-gradient-primary",
  "--ds-gradient-surface",
  "--ds-gradient-mesh",
  "--ds-overlay-light",
  "--ds-overlay-medium",
  "--ds-overlay-heavy",
  "--ds-density-scale",
  "--ds-effect-intensity",
] as const;

export type TenantThemeOverrideTokenV1 =
  (typeof TENANT_THEME_OVERRIDE_TOKENS_V1)[number];

const TENANT_THEME_COLOR_ROLES_V1 = [
  "primary",
  "secondary",
  "accent",
  "success",
  "warning",
  "error",
  "info",
] as const;
const TENANT_THEME_COLOR_STEPS_V1 = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
] as const;

/**
 * Public semantic variables an authored Advanced value may reference with
 * `var()`. Prefix-only admission is forbidden because `--ds-*` also contains
 * private implementation tokens.
 */
export const TENANT_THEME_REFERENCE_TOKENS_V1: readonly string[] =
  Object.freeze(
    Array.from(
      new Set([
        ...TENANT_THEME_OVERRIDE_TOKENS_V1,
        "--ds-color-white",
        "--ds-color-bg-primary",
        "--ds-color-bg-secondary",
        "--ds-color-bg-tertiary",
        "--ds-color-bg-elevated",
        "--ds-color-bg-hover",
        "--ds-color-text-primary",
        "--ds-color-text-secondary",
        "--ds-color-text-muted",
        "--ds-color-border-primary",
        "--ds-color-border-secondary",
        "--ds-radius-button",
        "--ds-tint-4",
        "--ds-tint-8",
        "--ds-tint-12",
        "--ds-tint-16",
        "--ds-tint-24",
        ...TENANT_THEME_COLOR_ROLES_V1.flatMap((role) =>
          TENANT_THEME_COLOR_STEPS_V1.map(
            (step) => `--ds-color-${role}-${step}`
          )
        ),
        ...(["success", "warning", "error", "info"] as const).flatMap((role) =>
          [4, 8, 12, 16, 24].map((step) => `--ds-tint-${role}-${step}`)
        ),
      ])
    )
  );

/** Bounded sidebar paint, rhythm and geometry authored by the published tenant. */
export type TenantThemeSidebarChromeV1 = BrandSidebarChrome;

/** Complete bounded shell anatomy; gridOpacity has no compiler-owned variable. */
export type TenantThemeShellChromeV1 = Omit<BrandShellChrome, "gridOpacity">;

/** Complete bounded component-family anatomy authored by the published tenant. */
export type TenantThemeCardChromeV1 = BrandCardChrome;
export type TenantThemePremiumCardChromeV1 = BrandPremiumCardChrome;
export type TenantThemeMetricCardChromeV1 = BrandMetricCardChrome;
export type TenantThemeSignalCardChromeV1 = BrandSignalCardChrome;
export type TenantThemeListingGridChromeV1 = BrandListingGridChrome;

/**
 * Advanced, data-only chrome surface. Every exposed family maps to compiler-
 * owned variables; executable CSS, selectors and uncompiled anatomy remain
 * outside the tenant document.
 */
export interface TenantThemeChromeV1 {
  sidebar?: TenantThemeSidebarChromeV1;
  layout?: BrandLayoutChrome;
  shell?: TenantThemeShellChromeV1;
  toolbar?: BrandToolbarChrome;
  filterPill?: BrandFilterPillChrome;
  breadcrumb?: BrandBreadcrumbChrome;
  search?: BrandSearchChrome;
  controls?: BrandControlsChrome;
  table?: BrandTableChrome;
  cardComponent?: TenantThemeCardChromeV1;
  metricCard?: TenantThemeMetricCardChromeV1;
  signalCard?: TenantThemeSignalCardChromeV1;
  workspaceCard?: TenantThemePremiumCardChromeV1;
  compactCard?: TenantThemePremiumCardChromeV1;
  tallCard?: TenantThemePremiumCardChromeV1;
  collectionCard?: TenantThemePremiumCardChromeV1;
  listingGrid?: TenantThemeListingGridChromeV1;
  modal?: BrandModalChrome;
  tabs?: BrandTabsChrome;
}

export const TENANT_THEME_CHROME_FAMILIES_V1 = [
  "sidebar",
  "layout",
  "shell",
  "toolbar",
  "filterPill",
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
  "tabs",
] as const satisfies readonly (keyof TenantThemeChromeV1)[];

/** Code-owned static font packs TenantTheme may reference by CSS variable. */
export const TENANT_THEME_FONT_PACK_IDS_V1 = ["editorial"] as const;
export type TenantThemeFontPackIdV1 =
  (typeof TENANT_THEME_FONT_PACK_IDS_V1)[number];

export interface TenantThemeAdvancedAppearanceV1 {
  chrome?: TenantThemeChromeV1;
  tokenOverrides?: Partial<Record<TenantThemeOverrideTokenV1, string | number>>;
}

export type TenantThemeChromeFamilyV1 = keyof TenantThemeChromeV1;

/**
 * Vertical-owned policy envelope. The config owns values; the vertical owns
 * which Advanced paint families are meaningful and the permitted dial ranges.
 * This cannot enable engine, topology, semantics or behavior fields because
 * those fields are absent from the config schema itself.
 */
export interface TenantThemeVerticalEnvelopeV1 {
  schemaVersion: typeof TENANT_THEME_SCHEMA_VERSION;
  verticalKey: string;
  allowedModes: readonly ("simple" | "advanced")[];
  advanced?: {
    chromeFamilies: readonly TenantThemeChromeFamilyV1[];
    allowTokenOverrides: boolean;
  };
  ranges?: {
    densityScale?: { min: number; max: number };
    effectIntensity?: { min: number; max: number };
    motionIntensity?: { min: number; max: number };
    motionDurationScale?: { min: number; max: number };
  };
}

/** Full v1 visual foundation, normalized into the existing appearance compiler. */
export interface TenantVisualFoundationV1 {
  general?: TenantAppearanceGeneral;
  advanced?: TenantThemeAdvancedAppearanceV1;
}

export interface TenantThemeConfigIdentityV1 {
  /** Stable tenant database identifier; never used as a CSS selector. */
  tenantId: string;
  /** Canonical lower-kebab tenant slug. */
  slug: string;
  /** Canonical lower-kebab vertical identity. */
  verticalKey: string;
  /** Monotonic optimistic-concurrency version from the tenant theme row. */
  rowVersion: number;
}

/** JSONB payload. Tenant identity/version columns are intentionally absent. */
export interface TenantThemeSimpleDocumentV1 {
  schemaVersion: typeof TENANT_THEME_SCHEMA_VERSION;
  mode: "simple";
  appearance: TenantAppearanceGeneral;
}

/** JSONB payload. Tenant identity/version columns are intentionally absent. */
export interface TenantThemeAdvancedDocumentV1 {
  schemaVersion: typeof TENANT_THEME_SCHEMA_VERSION;
  mode: "advanced";
  visualFoundation: TenantVisualFoundationV1;
}

/** Canonical document stored in the versioned tenant theme row. */
export type TenantThemeDocumentV1 =
  | TenantThemeSimpleDocumentV1
  | TenantThemeAdvancedDocumentV1;
export type TenantThemeDocument = TenantThemeDocumentV1;

/**
 * Read/compile envelope constructed from the JSONB document plus trusted row
 * columns. Keeping it as an intersection preserves the convenient mode
 * discriminant without persisting identity twice.
 */
export type TenantThemeSimpleConfigV1 = TenantThemeSimpleDocumentV1 &
  TenantThemeConfigIdentityV1;
export type TenantThemeAdvancedConfigV1 = TenantThemeAdvancedDocumentV1 &
  TenantThemeConfigIdentityV1;
export type TenantThemeConfigV1 =
  | TenantThemeSimpleConfigV1
  | TenantThemeAdvancedConfigV1;
export type TenantThemeConfig = TenantThemeConfigV1;

/** Appearance shape emitted by the v1 compiler after mode normalization. */
export interface NormalizedTenantThemeAppearanceV1 {
  general?: TenantAppearanceGeneral;
  advanced?: TenantThemeAdvancedAppearanceV1;
}

export interface TenantThemeScopeDescriptor {
  attribute: "data-ds-root" | "data-vertical" | "data-tenant";
  value?: string;
  selector: string;
}

export interface TenantThemeArtifactScopes {
  root: TenantThemeScopeDescriptor & { attribute: "data-ds-root" };
  vertical: TenantThemeScopeDescriptor & {
    attribute: "data-vertical";
    value: string;
  };
  tenant: TenantThemeScopeDescriptor & {
    attribute: "data-tenant";
    value: string;
  };
  /** Exact provider-owned selector used by the generated CSS block. */
  combinedSelector: string;
}

/** Attributes the SSR/app root must stamp for the artifact selector to match. */
export interface TenantThemeRootAttributesV1 {
  "data-ds-root": "";
  "data-vertical": string;
  "data-tenant": string;
}

/** Immutable, cacheable compiler output consumed by SSR and hydration. */
export interface TenantThemeArtifactV1 {
  schemaVersion: typeof TENANT_THEME_SCHEMA_VERSION;
  tenantId: string;
  slug: string;
  verticalKey: string;
  rowVersion: number;
  compilerVersion: string;
  /** Digest of the vertical policy applied during compilation, when present. */
  verticalEnvelopeDigest?: string;
  /** `sha256-<hex>` over the canonical artifact source. */
  digest: string;
  normalizedAppearance: NormalizedTenantThemeAppearanceV1;
  variables: Readonly<Record<string, string>>;
  css: string;
  scopes: TenantThemeArtifactScopes;
}

export type TenantThemeArtifact = TenantThemeArtifactV1;

export type TenantThemeValidationIssueCode =
  | "invalid_type"
  | "invalid_value"
  | "unknown_key"
  | "unsupported_schema_version"
  | "unsafe_value";

export interface TenantThemeValidationIssue {
  code: TenantThemeValidationIssueCode;
  path: string;
  message: string;
}

export type TenantThemeValidationResult =
  | { success: true; data: TenantThemeConfigV1 }
  | { success: false; issues: TenantThemeValidationIssue[] };

export type TenantThemeDocumentValidationResult =
  | { success: true; data: TenantThemeDocumentV1 }
  | { success: false; issues: TenantThemeValidationIssue[] };
