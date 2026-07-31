/**
 * @fileoverview Versioned, data-only tenant theme contract.
 *
 * This is the persistence boundary shared by app-platform, database DTOs,
 * server rendering and the DS compiler. It intentionally contains visual
 * values only: engine selection, component/route topology, permissions,
 * semantic mappings, React/code, selectors and raw CSS are not representable.
 */

import type {
  BrandBadgeChrome,
  BrandBreadcrumbChrome,
  BrandCardChrome,
  BrandControlsChrome,
  BrandFilterPillChrome,
  BrandLayoutChrome,
  BrandListingGridChrome,
  BrandMetricCardChrome,
  BrandModalChrome,
  BrandPremiumCardChrome,
  BrandPopoverChrome,
  BrandSearchChrome,
  BrandShellChrome,
  BrandSidebarChrome,
  BrandSignalCardChrome,
  BrandTableChrome,
  BrandTabsChrome,
  BrandTooltipChrome,
  BrandToolbarChrome,
  TenantAppearanceGeneral,
} from "..";

/** The only TenantThemeConfig schema accepted by this release. */
export const TENANT_THEME_SCHEMA_VERSION = 1 as const;

const TENANT_SEMANTIC_SURFACE_ROLES = [
  "canvas",
  "shell",
  "panel",
  "card",
  "inset",
  "control",
  "raised",
  "overlay",
] as const;

const TENANT_SEMANTIC_SURFACE_FACETS = [
  "background-hover",
  "background-active",
  "background-selected",
  "background-disabled",
  "foreground",
  "foreground-muted",
  "foreground-disabled",
  "border",
  "border-strong",
  "border-hover",
  "border-active",
  "border-selected",
  "border-disabled",
  "focus-ring",
  "shadow",
  "shadow-hover",
  "shadow-active",
  "shadow-selected",
  "highlight",
  "texture",
] as const;

type TenantSemanticSurfaceToken =
  `--ds-material-${(typeof TENANT_SEMANTIC_SURFACE_ROLES)[number]}-${(typeof TENANT_SEMANTIC_SURFACE_FACETS)[number]}`;

const TENANT_SEMANTIC_SURFACE_TOKENS: readonly TenantSemanticSurfaceToken[] =
  TENANT_SEMANTIC_SURFACE_ROLES.flatMap((role) =>
    TENANT_SEMANTIC_SURFACE_FACETS.map(
      (facet) => `--ds-material-${role}-${facet}` as const
    )
  );

const TENANT_SEMANTIC_TYPOGRAPHY_ROLES = [
  "display",
  "page-title",
  "section-title",
  "body",
  "supporting",
  "label",
  "caption",
  "code",
  "numeric",
] as const;

const TENANT_SEMANTIC_TYPOGRAPHY_FACETS = [
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-transform",
  "font-variant-numeric",
] as const;

type TenantSemanticTypographyToken =
  `--ds-type-${(typeof TENANT_SEMANTIC_TYPOGRAPHY_ROLES)[number]}-${(typeof TENANT_SEMANTIC_TYPOGRAPHY_FACETS)[number]}`;

const TENANT_SEMANTIC_TYPOGRAPHY_TOKENS: readonly TenantSemanticTypographyToken[] =
  TENANT_SEMANTIC_TYPOGRAPHY_ROLES.flatMap((role) =>
    TENANT_SEMANTIC_TYPOGRAPHY_FACETS.map(
      (facet) => `--ds-type-${role}-${facet}` as const
    )
  );

/**
 * Closed set of semantic DS variables exposed to Advanced tenants in v1.
 *
 * This is deliberately not a `--ds-${string}` index signature. Adding a token
 * is a contract change that must update the schema manifest and its digest.
 */
export const TENANT_THEME_OVERRIDE_TOKENS = [
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
  "--ds-color-text-primary",
  "--ds-color-text-secondary",
  "--ds-color-text-muted",
  "--ds-color-text-disabled",
  "--ds-color-border-primary",
  "--ds-color-border-secondary",
  "--ds-surface-canvas",
  "--ds-surface-shell",
  "--ds-surface-panel",
  "--ds-surface-card",
  "--ds-surface-inset",
  "--ds-surface-control",
  "--ds-surface-raised",
  "--ds-surface-overlay",
  ...TENANT_SEMANTIC_SURFACE_TOKENS,
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
  ...TENANT_SEMANTIC_TYPOGRAPHY_TOKENS,
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

export type TenantThemeOverrideToken =
  (typeof TENANT_THEME_OVERRIDE_TOKENS)[number];

/**
 * Neutral text/border overrides admit opaque hex only. They anchor global
 * reading surfaces, so functional colors, var() references and alpha channels
 * stay out of the tenant-authored channel.
 */
export const TENANT_THEME_NEUTRAL_OVERRIDE_TOKENS = [
  "--ds-color-text-primary",
  "--ds-color-text-secondary",
  "--ds-color-text-muted",
  "--ds-color-text-disabled",
  "--ds-color-border-primary",
  "--ds-color-border-secondary",
] as const satisfies readonly TenantThemeOverrideToken[];

const TENANT_THEME_COLOR_ROLES = [
  "primary",
  "secondary",
  "accent",
  "success",
  "warning",
  "error",
  "info",
] as const;
const TENANT_THEME_COLOR_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
] as const;

/**
 * Public semantic variables an authored Advanced value may reference with
 * `var()`. Prefix-only admission is forbidden because `--ds-*` also contains
 * private implementation tokens.
 */
export const TENANT_THEME_REFERENCE_TOKENS: readonly string[] = Object.freeze(
  Array.from(
    new Set([
      ...TENANT_THEME_OVERRIDE_TOKENS,
      "--ds-color-white",
      "--ds-color-bg-primary",
      "--ds-color-bg-secondary",
      "--ds-color-bg-tertiary",
      "--ds-color-bg-elevated",
      "--ds-color-bg-hover",
      "--ds-color-text-primary",
      "--ds-color-text-secondary",
      "--ds-color-text-muted",
      "--ds-color-text-disabled",
      "--ds-color-border-primary",
      "--ds-color-border-secondary",
      "--ds-radius-button",
      "--ds-tint-4",
      "--ds-tint-8",
      "--ds-tint-12",
      "--ds-tint-16",
      "--ds-tint-24",
      ...TENANT_THEME_COLOR_ROLES.flatMap((role) =>
        TENANT_THEME_COLOR_STEPS.map((step) => `--ds-color-${role}-${step}`)
      ),
      ...(["success", "warning", "error", "info"] as const).flatMap((role) =>
        [4, 8, 12, 16, 24].map((step) => `--ds-tint-${role}-${step}`)
      ),
    ])
  )
);

/**
 * Closed anatomy-variant vocabulary per participating chrome family.
 *
 * Anatomy is DATA that selects among code-owned skin variants; it never rides
 * as CSS in the artifact and never becomes component replacement. `default`
 * always maps to the current rendering and is what an absent field means, so
 * every existing document keeps compiling to zero visual change.
 *
 * Semantics:
 * - card `framed` = current default look (full border + shadow); `underline` =
 *   no side borders, bottom hairline, tighter radius; `ghost` = no border,
 *   background tint only on hover.
 * - table `ruled` = row hairlines, no stripes; `zebra` = striped rows, no
 *   hairlines; `open` = no hairlines/stripes, whitespace rhythm + header rule.
 * - sidebar `rail` = narrow icon-first rail with flyout labels; `panel` =
 *   current wide panel.
 * - layout `flat` = header merged with canvas (no border/shadow); `floating` =
 *   inset header card with radius + shadow.
 */
export const TENANT_THEME_ANATOMY_VARIANTS = {
  cardComponent: ["default", "framed", "underline", "ghost"],
  table: ["default", "ruled", "zebra", "open"],
  sidebar: ["default", "rail", "panel"],
  layout: ["default", "flat", "floating"],
} as const;

export type TenantThemeCardAnatomy =
  (typeof TENANT_THEME_ANATOMY_VARIANTS.cardComponent)[number];
export type TenantThemeTableAnatomy =
  (typeof TENANT_THEME_ANATOMY_VARIANTS.table)[number];
export type TenantThemeSidebarAnatomy =
  (typeof TENANT_THEME_ANATOMY_VARIANTS.sidebar)[number];
export type TenantThemeLayoutAnatomy =
  (typeof TENANT_THEME_ANATOMY_VARIANTS.layout)[number];

/** Bounded sidebar paint, rhythm and geometry authored by the published tenant. */
export type TenantThemeSidebarChrome = BrandSidebarChrome & {
  anatomy?: TenantThemeSidebarAnatomy;
};

/** Complete bounded shell anatomy; gridOpacity has no compiler-owned variable. */
export type TenantThemeShellChrome = Omit<BrandShellChrome, "gridOpacity">;

/** Complete bounded component-family anatomy authored by the published tenant. */
export type TenantThemeCardChrome = BrandCardChrome & {
  anatomy?: TenantThemeCardAnatomy;
};
export type TenantThemeTableChrome = BrandTableChrome & {
  anatomy?: TenantThemeTableAnatomy;
};
export type TenantThemeLayoutChrome = BrandLayoutChrome & {
  anatomy?: TenantThemeLayoutAnatomy;
};
export type TenantThemePremiumCardChrome = BrandPremiumCardChrome;
export type TenantThemeMetricCardChrome = BrandMetricCardChrome;
export type TenantThemeSignalCardChrome = BrandSignalCardChrome;
export type TenantThemeListingGridChrome = BrandListingGridChrome;

/**
 * Advanced, data-only chrome surface. Every exposed family maps to compiler-
 * owned variables; executable CSS, selectors and uncompiled anatomy remain
 * outside the tenant document.
 */
export interface TenantThemeChrome {
  sidebar?: TenantThemeSidebarChrome;
  layout?: TenantThemeLayoutChrome;
  shell?: TenantThemeShellChrome;
  toolbar?: BrandToolbarChrome;
  filterPill?: BrandFilterPillChrome;
  badge?: BrandBadgeChrome;
  breadcrumb?: BrandBreadcrumbChrome;
  search?: BrandSearchChrome;
  controls?: BrandControlsChrome;
  table?: TenantThemeTableChrome;
  cardComponent?: TenantThemeCardChrome;
  metricCard?: TenantThemeMetricCardChrome;
  signalCard?: TenantThemeSignalCardChrome;
  workspaceCard?: TenantThemePremiumCardChrome;
  compactCard?: TenantThemePremiumCardChrome;
  tallCard?: TenantThemePremiumCardChrome;
  collectionCard?: TenantThemePremiumCardChrome;
  listingGrid?: TenantThemeListingGridChrome;
  modal?: BrandModalChrome;
  tooltip?: BrandTooltipChrome;
  popover?: BrandPopoverChrome;
  tabs?: BrandTabsChrome;
}

export const TENANT_THEME_CHROME_FAMILIES = [
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
] as const satisfies readonly (keyof TenantThemeChrome)[];

/**
 * Code-owned static font packs TenantTheme may reference by CSS variable.
 *
 * Ids are role-suffixed because one `var()` slot carries ONE family list; a
 * pack that changes display AND body is two variables.
 */
export const TENANT_THEME_FONT_PACK_IDS = [
  "editorial-display",
  "editorial-text",
  "grotesk-display",
  "humanist-text",
  "geometric-display",
  "plex-mono",
] as const;
export type TenantThemeFontPackId = (typeof TENANT_THEME_FONT_PACK_IDS)[number];

export interface TenantThemeAdvancedAppearance {
  chrome?: TenantThemeChrome;
  tokenOverrides?: Partial<Record<TenantThemeOverrideToken, string | number>>;
}

/**
 * Global v1 caps for the tenant type-scale and radius-scale dials. The schema
 * manifest, the envelope range validator and the appearance compiler all read
 * these objects; a second literal anywhere is a cascade-integrity defect.
 */
export const TENANT_THEME_TYPE_SCALE_BOUNDS = {
  min: 0.9,
  max: 1.1,
} as const;
export const TENANT_THEME_RADIUS_SCALE_BOUNDS = {
  min: 0.75,
  max: 1.25,
} as const;
/** Global safety bounds for the coordinated gradient/glass/glow layer. */
export const TENANT_THEME_EFFECT_INTENSITY_BOUNDS = {
  min: 0,
  max: 1,
} as const;

export type TenantThemeChromeFamily = keyof TenantThemeChrome;

/**
 * Vertical-owned policy envelope. The config owns values; the vertical owns
 * which Advanced paint families are meaningful and the permitted dial ranges.
 * This cannot enable engine, topology, semantics or behavior fields because
 * those fields are absent from the config schema itself.
 */
export interface TenantThemeVerticalEnvelope {
  schemaVersion: typeof TENANT_THEME_SCHEMA_VERSION;
  verticalKey: string;
  allowedModes: readonly ("simple" | "advanced")[];
  advanced?: {
    chromeFamilies: readonly TenantThemeChromeFamily[];
    allowTokenOverrides: boolean;
    /** Absent = false: non-default anatomy variants fail closed per vertical. */
    allowAnatomyVariants?: boolean;
  };
  ranges?: {
    densityScale?: { min: number; max: number };
    effectIntensity?: { min: number; max: number };
    motionIntensity?: { min: number; max: number };
    motionDurationScale?: { min: number; max: number };
    typeScale?: { min: number; max: number };
    radiusScale?: { min: number; max: number };
  };
}

/** Full v1 visual foundation, normalized into the existing appearance compiler. */
export interface TenantVisualFoundation {
  general?: TenantAppearanceGeneral;
  advanced?: TenantThemeAdvancedAppearance;
  /**
   * Governed recipe-profile selection (DS-S001). Customer tenants may only
   * SELECT a registry id; the compiler validates fail-closed against the
   * closed first-party registry and drops anything unknown or malformed.
   */
  recipeProfile?: string;
}

export interface TenantThemeConfigIdentity {
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
export interface TenantThemeSimpleDocument {
  schemaVersion: typeof TENANT_THEME_SCHEMA_VERSION;
  mode: "simple";
  appearance: TenantAppearanceGeneral;
}

/** JSONB payload. Tenant identity/version columns are intentionally absent. */
export interface TenantThemeAdvancedDocument {
  schemaVersion: typeof TENANT_THEME_SCHEMA_VERSION;
  mode: "advanced";
  visualFoundation: TenantVisualFoundation;
}

/** Canonical document stored in the versioned tenant theme row. */
export type TenantThemeDocument =
  | TenantThemeSimpleDocument
  | TenantThemeAdvancedDocument;

/**
 * Read/compile envelope constructed from the JSONB document plus trusted row
 * columns. Keeping it as an intersection preserves the convenient mode
 * discriminant without persisting identity twice.
 */
export type TenantThemeSimpleConfig = TenantThemeSimpleDocument &
  TenantThemeConfigIdentity;
export type TenantThemeAdvancedConfig = TenantThemeAdvancedDocument &
  TenantThemeConfigIdentity;
export type TenantThemeConfig =
  | TenantThemeSimpleConfig
  | TenantThemeAdvancedConfig;

/** Appearance shape emitted by the v1 compiler after mode normalization. */
export interface NormalizedTenantThemeAppearance {
  general?: TenantAppearanceGeneral;
  advanced?: TenantThemeAdvancedAppearance;
  /** Validated recipe profile selected by the DB-owned appearance document. */
  recipeProfile?: string;
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
export interface TenantThemeRootAttributes {
  "data-ds-root": "";
  "data-vertical": string;
  "data-tenant": string;
}

/**
 * One deterministic APCA autocorrect applied by the compiler to keep an
 * authored text/ground pairing readable. Corrections are never silent and
 * never a rejection: the editor renders these rows.
 */
export interface TenantThemeContrastAdjustment {
  /** Foreground variable that was adjusted. */
  token: string;
  /** Ground variable the pairing was evaluated against. */
  pairedWith: string;
  /** Authored (pre-correction) foreground value. */
  from: string;
  /** Emitted (corrected) foreground value. */
  to: string;
  lcBefore: number;
  lcAfter: number;
}

/**
 * Every channel through which tenant visual paint can reach the document.
 *
 * The list is the shared vocabulary between the compiler (which declares what
 * it compiled) and the runtime provider (which decides which of its own
 * emitters must stay silent). A channel names an EMITTER, not a token family:
 * `appearance` is the provider's compiled-appearance variable block,
 * `brand-chrome` is the generated tenant chrome stylesheet, and `personality`
 * is the `SystemCssVariablesBridge` namespaced `--ds-personality-*` data rule.
 * The personality channel does not own canonical component variables: the
 * static personality projection maps its namespaced inputs to those aliases.
 */
export const TENANT_VISUAL_CHANNELS = [
  "visual-branding",
  "token-overrides",
  "appearance",
  "brand-chrome",
  "personality",
] as const;

export type TenantVisualChannel = (typeof TENANT_VISUAL_CHANNELS)[number];

/**
 * v1 compiler coverage. Personality is deliberately NOT covered.
 *
 * The compiled artifact is the only tenant authority; personality is a
 * subordinate product/vertical data axis. Because `personality` stays outside
 * this set, its namespaced bridge remains live under a compiled envelope. A
 * single static projection consumes that data; the bridge itself never paints
 * canonical component channels, so it cannot compete with the artifact.
 */
export const TENANT_THEME_V1_COVERAGE: readonly TenantVisualChannel[] =
  Object.freeze([
    "visual-branding",
    "token-overrides",
    "appearance",
    "brand-chrome",
  ]);

/** Immutable, cacheable compiler output consumed by SSR and hydration. */
export interface TenantThemeArtifact {
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
  /**
   * Channels this artifact compiled and therefore owns. Runtime emitters for
   * a covered channel must stay silent; an uncovered channel remains open to
   * the provider's subordinate emitters.
   */
  coverage: readonly TenantVisualChannel[];
  normalizedAppearance: NormalizedTenantThemeAppearance;
  variables: Readonly<Record<string, string>>;
  /** Present only when at least one contrast autocorrect was applied. */
  adjustments?: readonly TenantThemeContrastAdjustment[];
  css: string;
  scopes: TenantThemeArtifactScopes;
}

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
  | { success: true; data: TenantThemeConfig }
  | { success: false; issues: TenantThemeValidationIssue[] };

export type TenantThemeDocumentValidationResult =
  | { success: true; data: TenantThemeDocument }
  | { success: false; issues: TenantThemeValidationIssue[] };
