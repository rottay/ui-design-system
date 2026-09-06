/**
 * @fileoverview The 29 approved identity decisions of `roadmap/kit-2026-09.md`,
 * as closed types: one id per kit row, with its tier and its closed domain.
 *
 * Data only: it derives nothing and knows no keypath. Domains that already
 * exist in the tenant contract are imported from it, never restated.
 *
 * @module Contracts/Theme/Decisions
 * @category Types
 * @package @rottay/design-system
 */

import type { AmbientMotion } from "@/foundation/contracts/runtime/motion";
import type { BrandExpressiveAxisOverrides } from "../../..";
import type {
  TenantThemeCardAnatomy,
  TenantThemeChrome,
  TenantThemeFontPackId,
  TenantThemeLayoutAnatomy,
  TenantThemeRhythmPosture,
  TenantThemeSidebarAnatomy,
  TenantThemeTableAnatomy,
} from "../..";
import {
  TENANT_THEME_EFFECT_INTENSITY_BOUNDS,
  TENANT_THEME_FONT_PACK_IDS,
  TENANT_THEME_RADIUS_SCALE_BOUNDS,
  TENANT_THEME_TYPE_SCALE_BOUNDS,
} from "../..";

export { TENANT_THEME_FONT_PACK_IDS };

/**
 * The plan a document is written under.
 *
 * `PlanEntitlement` owns tiers (kit section 4): the vertical envelope decides
 * what exists, the plan decides which tier the tenant may activate. `internal`
 * is the DS/vertical seat, not a customer plan.
 */
export const THEME_PLANS = Object.freeze([
  "standard",
  "pro",
  "internal",
] as const);

export type ThemePlan = (typeof THEME_PLANS)[number];

/** The two customer-visible tiers of the kit. `internal` is a plan, not a tier. */
export const THEME_DECISION_TIERS = Object.freeze(["standard", "pro"] as const);

export type ThemeDecisionTier = (typeof THEME_DECISION_TIERS)[number];

/** Which plans may activate a decision of a given tier. */
export const THEME_PLAN_TIERS: Readonly<
  Record<ThemePlan, readonly ThemeDecisionTier[]>
> = Object.freeze({
  standard: Object.freeze(["standard"] as const),
  pro: Object.freeze(["standard", "pro"] as const),
  internal: Object.freeze(["standard", "pro"] as const),
});

/* -------------------------------------------------------------------------- */
/* Vocabularies the ten new decisions introduce                                */
/* -------------------------------------------------------------------------- */

export const PALETTE_NEUTRAL_TEMPERATURES = Object.freeze([
  "cool",
  "neutral",
  "warm",
] as const);
export type PaletteNeutralTemperature =
  (typeof PALETTE_NEUTRAL_TEMPERATURES)[number];

export const PALETTE_CONTRAST_POSTURES = Object.freeze([
  "soft",
  "standard",
  "high",
] as const);
export type PaletteContrastPosture = (typeof PALETTE_CONTRAST_POSTURES)[number];

export const TYPOGRAPHY_ROLE_WEIGHTS = Object.freeze([
  "light",
  "regular",
  "strong",
] as const);
export type TypographyRoleWeight = (typeof TYPOGRAPHY_ROLE_WEIGHTS)[number];

export const TYPOGRAPHY_NUMERIC_POSTURES = Object.freeze([
  "proportional",
  "tabular",
] as const);
export type TypographyNumericPosture =
  (typeof TYPOGRAPHY_NUMERIC_POSTURES)[number];

export const SHAPE_NESTING_POSTURES = Object.freeze([
  "concentric",
  "uniform",
] as const);
export type ShapeNestingPosture = (typeof SHAPE_NESTING_POSTURES)[number];

export const SHAPE_CONTROL_HEIGHTS = Object.freeze([
  "compact",
  "standard",
  "tall",
] as const);
export type ShapeControlHeight = (typeof SHAPE_CONTROL_HEIGHTS)[number];

export const SURFACE_BORDER_STYLES = Object.freeze([
  "none",
  "hairline",
  "strong",
] as const);
export type SurfaceBorderStyle = (typeof SURFACE_BORDER_STYLES)[number];

export const STATE_EMPHASIS_POSTURES = Object.freeze([
  "subtle",
  "medium",
  "strong",
] as const);
export type StateEmphasisPosture = (typeof STATE_EMPHASIS_POSTURES)[number];

export const STATE_FOCUS_STYLES = Object.freeze([
  "ring",
  "underline",
  "glow",
] as const);
export type StateFocusStyle = (typeof STATE_FOCUS_STYLES)[number];

export const MOTION_CHARACTERS = Object.freeze([
  "mechanical",
  "organic",
  "playful",
] as const);
export type MotionCharacter = (typeof MOTION_CHARACTERS)[number];

/* -------------------------------------------------------------------------- */
/* Vocabularies that already exist in the tenant contract                      */
/* -------------------------------------------------------------------------- */

export const TYPOGRAPHY_PAIRINGS = Object.freeze([
  "sober",
  "editorial",
  "geometric",
  "technical",
] as const);
export type TypographyPairing = (typeof TYPOGRAPHY_PAIRINGS)[number];

export const SHAPE_BUTTON_STYLES = Object.freeze([
  "sharp",
  "soft",
  "pill",
] as const);
export type ShapeButtonStyle = (typeof SHAPE_BUTTON_STYLES)[number];

export const DENSITY_MODES = Object.freeze([
  "compact",
  "normal",
  "spacious",
] as const);
export type DensityMode = (typeof DENSITY_MODES)[number];

export const SURFACE_ELEVATION_POSTURES = Object.freeze([
  "flat",
  "soft",
  "elevated",
] as const);
export type SurfaceElevationPosture =
  (typeof SURFACE_ELEVATION_POSTURES)[number];

export const NAVIGATION_SIDEBAR_TONES = Object.freeze([
  "subtle",
  "strong",
  "inverse",
] as const);
export type NavigationSidebarTone = (typeof NAVIGATION_SIDEBAR_TONES)[number];

export const PALETTE_DARK_MODES = Object.freeze([
  "light",
  "dark",
  "auto",
] as const);
export type PaletteDarkMode = (typeof PALETTE_DARK_MODES)[number];

/** The four brand seeds row 1 closes. `neutral` is governed inside the seeds. */
export const PALETTE_SEED_ROLES = Object.freeze([
  "primary",
  "secondary",
  "accent",
  "background",
] as const);
export type PaletteSeedRole = (typeof PALETTE_SEED_ROLES)[number];

/** The four status seeds row 2 closes. */
export const PALETTE_STATUS_SEED_ROLES = Object.freeze([
  "success",
  "warning",
  "error",
  "info",
] as const);
export type PaletteStatusSeedRole = (typeof PALETTE_STATUS_SEED_ROLES)[number];

/** The four typography roles a registered font pack may be chosen for. */
export const TYPOGRAPHY_FAMILY_ROLES = Object.freeze([
  "base",
  "heading",
  "display",
  "mono",
] as const);
export type TypographyFamilyRole = (typeof TYPOGRAPHY_FAMILY_ROLES)[number];

/* -------------------------------------------------------------------------- */
/* The 29 decisions                                                            */
/* -------------------------------------------------------------------------- */

export type PaletteSeeds = Partial<Record<PaletteSeedRole, string>>;
export type PaletteStatusSeeds = Partial<
  Record<PaletteStatusSeedRole, string>
>;
export type TypographyFamilies = Partial<
  Record<TypographyFamilyRole, TenantThemeFontPackId>
>;

/** The three keys row 22 admits. */
export const MOTION_DIAL_KEYS = Object.freeze([
  "intensity",
  "durationScale",
  "ambient",
] as const);

/** Row 22: the three governed motion inputs, clamped later by motion policy. */
export interface MotionDial {
  intensity?: number;
  durationScale?: number;
  ambient?: AmbientMotion;
}

/**
 * Row 26: the six expressive axes plus the declared `icon` frontier axis.
 *
 * Each axis value is a REGISTERED id, closed by the expressive-profile registry
 * and re-resolved fail-closed by the compiler that consumes it. The registry
 * lives in `foundation/tokens`, which a contract may not depend on, so the
 * contract carries the axis SHAPE and the registry stays the single authority
 * over the values -- exactly as `experienceProfile` and `recipeProfile` are
 * already typed in the v1 transport.
 */
export type ExpressiveProfiles = BrandExpressiveAxisOverrides;

/** The seven axis keys row 26 admits. Values stay registry-owned. */
export const EXPRESSIVE_AXIS_KEYS = Object.freeze([
  "type",
  "geometry",
  "edge",
  "material",
  "elevation",
  "motif",
  "icon",
] as const);

/** The four families row 28 admits. Variants stay in the tenant contract. */
export const CHROME_ANATOMY_FAMILIES = Object.freeze([
  "cardComponent",
  "table",
  "sidebar",
  "layout",
] as const);

/** Row 28: the four anatomy families and their published variants. */
export interface ChromeAnatomy {
  cardComponent?: TenantThemeCardAnatomy;
  table?: TenantThemeTableAnatomy;
  sidebar?: TenantThemeSidebarAnatomy;
  layout?: TenantThemeLayoutAnatomy;
}

/**
 * The complete decision surface. Every key is a kit row id, verbatim, so a
 * document, a manifest, a probe and an adapter all name a decision the same
 * way and no translation table can drift between them.
 */
export interface ThemeDecisions {
  "palette.seeds": PaletteSeeds;
  "palette.status-seeds": PaletteStatusSeeds;
  "palette.neutral-temperature": PaletteNeutralTemperature;
  "palette.contrast-posture": PaletteContrastPosture;
  "palette.dark-mode": PaletteDarkMode;
  "typography.families": TypographyFamilies;
  "typography.pairing": TypographyPairing;
  "typography.scale": number;
  "typography.role-weights": TypographyRoleWeight;
  "typography.numeric": TypographyNumericPosture;
  "shape.radius-scale": number;
  "shape.nesting": ShapeNestingPosture;
  "shape.button-style": ShapeButtonStyle;
  "shape.control-height": ShapeControlHeight;
  "density.mode": DensityMode;
  "spacing.rhythm": TenantThemeRhythmPosture;
  "surfaces.elevation-posture": SurfaceElevationPosture;
  "surfaces.border-style": SurfaceBorderStyle;
  "surfaces.effect-intensity": number;
  "states.emphasis": StateEmphasisPosture;
  "states.focus-style": StateFocusStyle;
  "motion.dial": MotionDial;
  "motion.character": MotionCharacter;
  "navigation.sidebar-tone": NavigationSidebarTone;
  "experience.profile": string;
  "profiles.expressive": ExpressiveProfiles;
  "recipe-profile": string;
  "chrome.anatomy": ChromeAnatomy;
  /** A registered posture id; closed by the responsive-posture registry. */
  "responsive.posture": string;
}

export type ThemeDecisionId = keyof ThemeDecisions;

/**
 * The kit rows in approved order, with the tier each one carries.
 *
 * The order is row 1..29 of `roadmap/kit-2026-09.md`, and it is the only
 * ordering any report of this contract may use: a reader comparing a probe
 * artifact against the kit must not have to sort.
 */
export const THEME_DECISION_TIER_BY_ID: Readonly<
  Record<ThemeDecisionId, ThemeDecisionTier>
> = Object.freeze({
  "palette.seeds": "standard",
  "palette.status-seeds": "standard",
  "palette.neutral-temperature": "standard",
  "palette.contrast-posture": "pro",
  "palette.dark-mode": "pro",
  "typography.families": "pro",
  "typography.pairing": "standard",
  "typography.scale": "standard",
  "typography.role-weights": "standard",
  "typography.numeric": "pro",
  "shape.radius-scale": "standard",
  "shape.nesting": "pro",
  "shape.button-style": "standard",
  "shape.control-height": "standard",
  "density.mode": "standard",
  "spacing.rhythm": "standard",
  "surfaces.elevation-posture": "standard",
  "surfaces.border-style": "standard",
  "surfaces.effect-intensity": "standard",
  "states.emphasis": "standard",
  "states.focus-style": "standard",
  "motion.dial": "standard",
  "motion.character": "pro",
  "navigation.sidebar-tone": "standard",
  "experience.profile": "standard",
  "profiles.expressive": "pro",
  "recipe-profile": "pro",
  "chrome.anatomy": "pro",
  "responsive.posture": "pro",
});

/** The 29 ids, in kit row order. */
export const THEME_DECISION_IDS: readonly ThemeDecisionId[] = Object.freeze(
  Object.keys(THEME_DECISION_TIER_BY_ID) as ThemeDecisionId[]
);

/**
 * The ten rows the kit marks `(new)`: they have no producer anywhere yet.
 *
 * They are carried here so a document may activate them from day one and the
 * indicator can publish `n/22 (+m/10 new)` against the same two denominators
 * the consumer contract states, without a second list.
 */
export const NEW_THEME_DECISION_IDS: readonly ThemeDecisionId[] = Object.freeze(
  [
    "palette.neutral-temperature",
    "palette.contrast-posture",
    "typography.role-weights",
    "typography.numeric",
    "shape.nesting",
    "shape.control-height",
    "surfaces.border-style",
    "states.emphasis",
    "states.focus-style",
    "motion.character",
  ] as ThemeDecisionId[]
);

/** The 19 rows that already exist in today's 22-control catalog. */
export const KEPT_THEME_DECISION_IDS: readonly ThemeDecisionId[] =
  Object.freeze(
    THEME_DECISION_IDS.filter((id) => !NEW_THEME_DECISION_IDS.includes(id))
  );

/** Numeric domains, so a validator and a probe read one table. */
export const THEME_DECISION_BOUNDS = Object.freeze({
  "typography.scale": TENANT_THEME_TYPE_SCALE_BOUNDS,
  "shape.radius-scale": TENANT_THEME_RADIUS_SCALE_BOUNDS,
  "surfaces.effect-intensity": TENANT_THEME_EFFECT_INTENSITY_BOUNDS,
} as const);

/**
 * D-03: the ONLY escape hatch, and it is not a decision.
 *
 * A sanctioned override names a chrome family and a channel of that family by
 * its typed field name. It can never name a `--ds-*` custom property: the raw
 * `tokenOverrides` surface of v1 is retired by this contract, not renamed.
 */
export interface SanctionedOverrides {
  chrome?: TenantThemeChrome;
}

export type { TenantThemeChrome };
