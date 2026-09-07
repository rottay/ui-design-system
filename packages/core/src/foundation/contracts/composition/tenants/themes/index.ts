/**
 * @fileoverview Theme contracts - Rottay Design System
 * @description Runtime theming types describing loaded theme state (ThemeConfig,
 * ThemeContextValue) rather than the lower-level token catalogs.
 *
 * @module Contracts/Themes
 * @category Types
 * @package @rottay/design-system
 */

import type { EngineName } from "../../../runtime/engine";
import type { TenantMotionDial } from "../../../runtime/motion";
import type { FirstPartyVerticalId } from "../../../kernel/verticals";
import type {
  SurfaceTokens,
  ChartPersonalityTokens,
  CardPersonalityTokens,
  AccentPersonalityTokens,
  PartialPersonalityTokens,
  PersonalityTokens,
  SemanticSurfaceRoleMap,
  SemanticTypographyTokens,
} from "../../../kernel/tokens";
import type {
  TenantGlassTokens,
  TenantGradientTokens,
  TenantOverlayTokens,
  TenantTokenOverrides,
} from "..";

export interface ThemeConfig {
  name: string;
  extends?: string;
  /** Raw CSS variable/value map produced by the current theme source */
  variables: Record<string, string>;
  /** Optional engine-specific values if a theme needs renderer tuning */
  engineOverrides?: Partial<Record<EngineName, Record<string, unknown>>>;
  tenant?: string;
  cssUrl?: string;
  isLoaded?: boolean;
  isError?: boolean;
  isFallback?: boolean;
}

export interface ThemeContextValue {
  theme: string;
  /**
   * The mode the root actually resolves to: `auto` collapsed against the OS
   * preference, and `base` meaning "whatever default mode the vertical's own
   * compile declared". Computed once, here, so a consumer that needs the mode
   * never re-derives it from the theme string or from the DOM.
   */
  resolvedTheme: 'light' | 'dark' | 'base';
  setTheme: (theme: string) => void;
  config: ThemeConfig | null;
  tenant?: string;
  setTenant?: (tenant: string) => void;
  isLoading?: boolean;
  isFallback?: boolean;
}

// ── BrandTheme ──────────────────────────────────────────
// The canonical premium visual source of truth.
// Merge precedence: DS base -> vertical baseline -> BrandTheme -> generated artifacts.
//
// A BrandTheme captures the full visual identity that was previously split across
// TenantBranding (colors/fonts), TenantTokenOverrides (structural), and
// PersonalityTokens (animation/chart/typography/accent/card). It does NOT include
// tenant identity (logos, company name, plan, features) — those stay in TenantConfig.

/**
 * Governed recipe-profile selection (DS-S001). The id must exist in the
 * closed first-party registry
 * (`foundation/tokens/ts/presentation/recipe-profiles`); the compiler
 * validates fail-closed, so an unknown id or foreign schema version compiles
 * to engine defaults instead of painting garbage. Contracts stay `string`
 * here because foundation contracts cannot depend on the registry module.
 */
export interface BrandRecipeSelection {
  /** Selection-contract version; see RECIPE_PROFILE_SCHEMA_VERSION. */
  schemaVersion: number;
  /** Namespaced versioned id, e.g. `rottay/technical-sharp@1`. */
  profile: string;
}

/**
 * Governed responsive-posture selection (E2) — the static counterpart of the
 * document's `visualFoundation.advanced.responsivePosture`, so a vertical can
 * author the ladder its product actually needs without a DB row. The id must
 * exist in the closed registry
 * (`foundation/tokens/ts/presentation/responsive-postures`); the runtime
 * resolves fail-closed to the baseline ladder. `string` here for the same
 * reason as `BrandRecipeSelection.profile`: foundation contracts cannot depend
 * on the registry module.
 */
export interface BrandResponsiveSelection {
  /** Selection-contract version; see RESPONSIVE_POSTURE_SCHEMA_VERSION. */
  schemaVersion: number;
  /** Bare registry id: `compact`, `balanced` or `expansive`. */
  posture: string;
}

/**
 * Explicit per-axis expressive overrides layered over the selected
 * experience profile. Values stay `string` for the same reason as
 * `BrandRecipeSelection.profile`: contracts cannot depend on the registry
 * module, so the compilers sanitize every axis against the closed
 * vocabularies fail-closed (an unknown value is dropped, never painted).
 */
export interface BrandExpressiveAxisOverrides {
  type?: string;
  geometry?: string;
  edge?: string;
  material?: string;
  elevation?: string;
  motif?: string;
  /** Declared vocabulary; carries no v1 expansion rows (not open yet). */
  icon?: string;
}

/**
 * Governed expressive-profile selection (C1b). A theme SELECTS a versioned
 * experience id and may override individual axes; it never authors profile
 * content. Resolution is fail-closed against the closed registry in
 * `foundation/tokens/ts/presentation/expressive-profiles`.
 */
export interface BrandExpressiveSelection {
  /** Selection-contract version; see EXPRESSIVE_PROFILE_SCHEMA_VERSION. */
  schemaVersion: number;
  /** Namespaced versioned id, e.g. `rottay/bithire-technical@1`. */
  experienceProfile?: string;
  /** Explicit per-axis overrides; each axis wins over the experience id. */
  profiles?: BrandExpressiveAxisOverrides;
}

/**
 * Mode posture of the palette a BrandTheme actually authors.
 *
 * A theme declares one default mode and its values ARE that mode: bithire and
 * evnto author light palettes, rottay authors a dark one. The compiler emits
 * `color-scheme: <defaultMode>` on the base block so form controls, scrollbars
 * and the UA canvas agree with the paint, and the root-state contract resolves
 * a `data-theme` of `base` (or absent) through this field instead of assuming
 * light. Non-default-mode values are authored as declared mode blocks.
 */
export interface BrandAppearance {
  defaultMode: "light" | "dark";
}

/** The two modes a theme can be authored for. */
export type BrandThemeMode = "light" | "dark";

/**
 * One mode's values, as deep partials of the semantic families.
 *
 * A vertical authors its DEFAULT mode in the main BrandTheme body — those
 * fields are unchanged and a theme without `modes` compiles exactly as before.
 * The NON-default mode is authored here, and only where it diverges: the
 * compiler merges this over the base theme, runs the SAME family compilers,
 * and emits the difference. That is what makes a second mode a typed brand
 * decision instead of a hand-written stylesheet block — one source per
 * channel per mode, with no per-vertical branch anywhere in the compiler.
 *
 * `palette` is `Partial` only because `primaryColor` is required on the base;
 * every other family is already all-optional, so it is its own deep partial.
 */
export interface BrandThemeModeOverlay {
  palette?: Partial<BrandPalette>;
  typography?: BrandTypography;
  surfaces?: BrandSurfaces;
  chrome?: BrandChrome;
}

/** Typed per-mode overlays keyed by the mode they describe. */
export type BrandThemeModes = Partial<
  Record<BrandThemeMode, BrandThemeModeOverlay>
>;

/**
 * The optional BrandTheme families whose presence is a BRAND DECISION rather
 * than a schema accident.
 *
 * Every one of these is `?` on `BrandTheme` because a DB patch or a fixture may
 * legitimately omit it. That optionality is wrong for a first-party vertical:
 * "evnto ships no recipe selection" and "someone forgot to author evnto's
 * recipe selection" are indistinguishable from the source alone, and silent
 * absence is exactly how a vertical loses a capability without anyone noticing.
 * A first-party theme therefore states a disposition for each id instead of
 * omitting the key.
 */
export type BrandCapabilityId =
  | "motion"
  | "recipes"
  | "expressive"
  | "responsive";

/**
 * Why a capability is not active. Owned by its own leaf so that `themes/iso`
 * can read the runtime list without taking a value edge on this barrel.
 *
 * Only the TYPE is republished here, which is exactly what this barrel
 * published before the vocabulary gained a runtime list: re-exporting the
 * value would add a public runtime symbol to the package's supplier contract
 * for the sake of one internal validator.
 */
export type { BrandCapabilityAbsenceReason } from "./iso/capability-absence";
import type { BrandCapabilityAbsenceReason } from "./iso/capability-absence";

/**
 * A capability is either active (the corresponding BrandTheme field is
 * authored and live) or explicitly not — with a reason and a human note.
 *
 * `disabled` means the decision is made and closed. `unassigned` means the
 * decision is still open, which is what an art-direction proposal looks like
 * BEFORE a governed profile exists to select. Neither may be represented by
 * simply leaving the field out.
 */
export type BrandCapabilityDisposition =
  | { readonly status: "active" }
  | {
      readonly status: "disabled";
      readonly reason: BrandCapabilityAbsenceReason;
      readonly note: string;
    }
  | {
      readonly status: "unassigned";
      readonly reason: BrandCapabilityAbsenceReason;
      readonly note: string;
    };

/**
 * The complete disposition catalog. Every `BrandCapabilityId` must be keyed —
 * `Record` (not `Partial<Record>`) is the point: a missing key is a type error,
 * so the catalog cannot regress back into silent absence.
 */
export type BrandCapabilityCatalog = Readonly<
  Record<BrandCapabilityId, BrandCapabilityDisposition>
>;

export interface BrandTheme {
  /** Unique identifier for this brand theme */
  id: string;
  /** Display name */
  name: string;

  /** Which mode this theme's values are; drives the emitted `color-scheme`. */
  appearance?: BrandAppearance;
  /**
   * Values for the mode this theme is NOT authored in. Absent means the
   * vertical ships one mode.
   */
  modes?: BrandThemeModes;
  /** Light/dark palettes and semantic colors */
  palette?: BrandPalette;
  /** Font families and heading/label strategies */
  typography?: BrandTypography;
  /** Backgrounds, borders, elevation, glass/gradient/material posture */
  surfaces?: BrandSurfaces;
  /** Duration, entrance, hover energy, pulse/skeleton */
  motion?: BrandMotion;
  /** Chart palette posture, line style, tooltip style */
  charts?: Partial<ChartPersonalityTokens>;
  /** Governed recipe-profile selection (DS-S001). */
  recipes?: BrandRecipeSelection;
  /** Governed expressive-profile selection (C1b). */
  expressive?: BrandExpressiveSelection;
  /** Governed responsive-posture (container-ladder) selection (E2). */
  responsive?: BrandResponsiveSelection;
  /** Card and accent visual chrome */
  chrome?: BrandChrome;
  /**
   * Explicit disposition for every optional capability family.
   *
   * Optional on `BrandTheme` because DB documents stay partial patches and
   * fixtures author only what they exercise. REQUIRED on
   * `FirstPartyBrandTheme`, which is the shape the three code-owned verticals
   * must satisfy.
   */
  capabilities?: BrandCapabilityCatalog;
}

/**
 * The mandatory common inventory every first-party BrandTheme authors, in the
 * order it must be authored.
 *
 * `motion` is deliberately NOT here. `BrandMotion` is deprecated (see its
 * declaration below): runtime choreography resolves through the vertical
 * `MotionProfile` plus the bounded `TenantMotionDial`, so promoting the
 * compatibility field to a required family would re-entrench the authority it
 * is being retired from. It is governed as a capability disposition instead.
 *
 * The order is load-bearing, not cosmetic: a normalizer that walks families in
 * a per-theme order produces per-theme output orderings, and the artifact
 * digests are order-sensitive by construction.
 */
export const FIRST_PARTY_BRAND_THEME_REQUIRED_KEYS = [
  "id",
  "name",
  "appearance",
  "modes",
  "palette",
  "typography",
  "surfaces",
  "charts",
  "chrome",
  "capabilities",
] as const;

export type FirstPartyBrandThemeRequiredKey =
  (typeof FIRST_PARTY_BRAND_THEME_REQUIRED_KEYS)[number];

/**
 * A code-owned vertical's BrandTheme.
 *
 * Narrows `BrandTheme`'s all-optional visual families to required for the three
 * first-party identities. Product-specific EXTRAS (`recipes`, `expressive`,
 * `responsive`) stay optional on purpose — the law is equality of the common
 * required inventory, not equality of extras count. What makes
 * their absence honest is `capabilities`, which must state a disposition for
 * each of them regardless.
 */
export interface FirstPartyBrandTheme extends BrandTheme {
  /**
   * The vertical this theme IS.
   *
   * Narrowed from `BrandTheme.id`'s open `string` to the closed contract
   * union. This is what makes the roster's `theme.id` -> slug derivation a
   * compile-time fact instead of a cast: a theme authored in `rottay/` whose
   * id says something else no longer type-checks, so the folder, the artifact
   * directory and the registry key cannot drift apart again.
   */
  readonly id: FirstPartyVerticalId;
  readonly name: string;
  readonly appearance: BrandAppearance;
  readonly modes: BrandThemeModes;
  readonly palette: BrandPalette;
  readonly typography: BrandTypography;
  readonly surfaces: BrandSurfaces;
  readonly charts: Partial<ChartPersonalityTokens>;
  readonly chrome: BrandChrome;
  readonly capabilities: BrandCapabilityCatalog;
}

/** Palette roles that carry a `--ds-color-{role}-{50..900}` ramp. */
export type BrandRampRole =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

/** The nine steps of a ramp, plus the 50 tint. */
export type BrandRampStep =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

/** Hand-authored ramp steps for one role. Absent steps stay derived. */
export type BrandColorRamp = Partial<Record<BrandRampStep, string>>;

/**
 * Ramp steps authored by hand instead of derived from the role's seed.
 *
 * `deriveTenantColorRamps` turns one seed into a perceptually even ramp, which
 * is what a tenant with no design capacity should get. A brand that HAS tuned
 * its ramp could not express it: the seed field owned all ten steps, so the
 * only way to ship hand values was a stylesheet block outside the contract —
 * which is precisely the duplicate authority this contract exists to remove.
 * An authored step wins over the derived one; the rest of the ramp keeps
 * deriving. `neutral` has no seed of its own and is therefore authored-only.
 */
export type BrandColorRamps = Partial<Record<BrandRampRole, BrandColorRamp>>;

export interface BrandPalette {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  /** Hand-authored ramp steps; anything absent stays derived from the seed. */
  ramps?: BrandColorRamps;
  /** Hover state of the primary seed. */
  primaryHoverColor?: string;
  /** Hover state of the secondary seed. */
  secondaryHoverColor?: string;
  /** Hover state of the accent seed. */
  accentHoverColor?: string;
  /** Ink that stays legible ON the primary color. */
  onPrimaryColor?: string;
  /** Ink for solid primary surfaces (Badge and every filled primary fill). */
  primaryForegroundColor?: string;
  /** Global reading ink used on the tenant canvas and neutral surfaces. */
  textPrimaryColor?: string;
  /** Supporting copy that must remain readable at normal text sizes. */
  textSecondaryColor?: string;
  /**
   * Ink of the page/navigation tier: sidebar items, table headers, form labels
   * and the rest of the chrome that reads as page furniture rather than as
   * content. Authored in F4A-6 (nudo K3) porque los 42 canales de `tier.page.fg`
   * no tenian raiz: coincidian en valor con `--ds-color-accent`,
   * `--ds-color-neutral-500` y `--ds-color-secondary`, y elegir cualquiera de
   * las tres habria sido una coincidencia, no una derivacion.
   */
  textPageColor?: string;
  /** Quiet metadata/captions; still expected to meet accessible text contrast. */
  textMutedColor?: string;
  /** The third ink step, between muted and disabled. */
  textTertiaryColor?: string;
  /** Disabled ink. Components remain responsible for non-color disabled cues. */
  textDisabledColor?: string;
  /** Default neutral separator on cards, controls, rows and page regions. */
  borderPrimaryColor?: string;
  /** Quieter nested separator used inside already-bounded surfaces. */
  borderSecondaryColor?: string;
  /** The unqualified separator token components fall back to. */
  borderColor?: string;
  /** Third separator step for deeply nested bounded surfaces. */
  borderTertiaryColor?: string;
  /** The quietest separator: a hairline that reads as texture, not structure. */
  borderSubtleColor?: string;
  /** Separator of the focused control. Not the focus ring itself. */
  borderFocusColor?: string;
  /**
   * The page ground of the mode this palette authors. Reaches
   * `--ds-color-bg-primary`, `--ds-color-bg` and `--ds-color-background`.
   *
   * There is no `dark`-prefixed twin. A palette authors exactly one mode --
   * the theme's `appearance.defaultMode` at the top level, or the overlay's
   * own mode inside `modes.{light,dark}` -- so "the ground" is never
   * ambiguous and never needs a second field to disambiguate it. Without this
   * field a tenant cannot choose the surface its product sits on, which is
   * the most visible thing a white-label system owns.
   */
  backgroundColor?: string;
  /** The ground one step off the page: panels, wells, quiet bands. */
  backgroundSecondaryColor?: string;
  /** The ground two steps off the page. */
  backgroundTertiaryColor?: string;
  /** The ground of a surface that reads as lifted (menus, popovers, cards). */
  backgroundElevatedColor?: string;
  /** The ground of a bounded content surface. */
  backgroundSurfaceColor?: string;
  /** The scrim drawn over the page behind a modal or drawer. */
  backgroundOverlayColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  /** Ground of a success surface (alert/banner/tag fill). */
  successBgColor?: string;
  /** Separator of a success surface. */
  successBorderColor?: string;
  /** Ground of a warning surface. */
  warningBgColor?: string;
  /** Separator of a warning surface. */
  warningBorderColor?: string;
  /** Ground of an error surface. */
  errorBgColor?: string;
  /** Separator of an error surface. */
  errorBorderColor?: string;
  /** Ground of an informational surface. */
  infoBgColor?: string;
  /** Separator of an informational surface. */
  infoBorderColor?: string;
  /**
   * Ink written ON an informational surface. Defaults to `infoColor` in the
   * base layer; a dark mode that keeps the accent readable against a tinted
   * ground overrides it independently.
   */
  infoInkColor?: string;
  /** Link ink at rest. */
  linkColor?: string;
  /** Link ink on hover. */
  linkHoverColor?: string;
  /** Link ink once visited. */
  linkVisitedColor?: string;
  /** Separator of a generic interactive affordance. */
  interactiveBorderColor?: string;
  /** Ground an interactive affordance takes on hover. */
  interactiveBgHoverColor?: string;
  /** Ground an interactive affordance takes while active/pressed. */
  interactiveBgActiveColor?: string;
  /** The quietest interactive ground: selected-but-inactive rows and chips. */
  interactiveBgMutedColor?: string;
  /**
   * Translucent wash steps. These are the tint/scrim layers a skin paints ON
   * a ground rather than a ground themselves, so they carry an alpha channel
   * by construction and cannot be derived from an opaque seed without knowing
   * what sits underneath.
   */
  alphaBlack50?: string;
  alphaBlack100?: string;
  alphaWhite50?: string;
  alphaPrimary10?: string;
  alphaPrimary20?: string;
  alphaSecondary10?: string;
  alphaSecondary20?: string;
  alphaSuccess10?: string;
  alphaSuccess20?: string;
  alphaWarning10?: string;
  alphaWarning20?: string;
  alphaError10?: string;
  alphaError20?: string;
  alphaInfo10?: string;
  /** Ground a neutral region takes on hover. */
  bgHoverColor?: string;
  /** Ground of an informational region, on the `--ds-color-bg-*` spelling. */
  bgInfoColor?: string;
  /** The quietest ground step off the page. */
  bgSubtleColor?: string;
  /**
   * Step 0 of the neutral ramp. A dark-first theme inverts this end of the
   * ramp, so it is authored rather than derived from the light-mode white.
   */
  neutralZeroColor?: string;
  /** The primary seed at wash strength, used for selected/active grounds. */
  primarySubtleColor?: string;
  /** The tint every elevation shadow is mixed from. */
  shadowColor?: string;
  /** Ground of a bounded content surface, on the `--ds-color-surface` name. */
  surfaceColor?: string;
  /** Quieted content surface. */
  surfaceMutedColor?: string;
  /** Second content surface step. */
  surfaceSecondaryColor?: string;
  /** Reading ink on the `--ds-color-text` name. */
  textColor?: string;
  /** Ink that stays legible on an inverted ground. */
  textInverseColor?: string;
  /**
   * Component-facing alias channels. These are separate CSS names from the
   * semantic palette above (`--ds-text-primary` is not `--ds-color-text-primary`),
   * and a theme that moves one without the other is making two decisions, so
   * they get their own typed leaves instead of being folded into the semantic
   * field they usually track.
   */
  aliases?: BrandPaletteAliases;
}

/**
 * The unprefixed `--ds-text-*` / `--ds-border-color*` alias namespace.
 *
 * Every one of these has a `:root` floor in the DS theme that forwards to the
 * semantic palette. A tenant that authors here overrides the forward, which is
 * exactly what a skin whose ink ladder differs from its semantic ladder needs.
 */
export interface BrandPaletteAliases {
  textPrimary?: string;
  textSecondary?: string;
  textTertiary?: string;
  textDisabled?: string;
  textInverse?: string;
  borderColor?: string;
  borderColorDefault?: string;
  borderColorMuted?: string;
  borderColorStrong?: string;
  borderColorHover?: string;
  borderColorFocus?: string;
}

export interface BrandTypography {
  /** Governed family preset shared by static and DB Theme transports. */
  typePairing?: "sober" | "editorial" | "geometric" | "technical";
  /** Bounded multiplier for the canonical type ramp. */
  scale?: number;
  fontFamilyBase?: string;
  fontFamilyHeading?: string;
  fontFamilyMono?: string;
  fontFamilyDisplay?: string;
  headingWeightBias?: "lighter" | "normal" | "heavier";
  headingLetterSpacing?: string;
  labelStyle?: "uppercase" | "sentence" | "capitalize";
  /** Per-role type system consumed by components instead of ad-hoc triples. */
  roles?: SemanticTypographyTokens;
  /** Per-context letter spacing */
  letterSpacing?: {
    display?: string;
    heading?: string;
    body?: string;
    mono?: string;
  };
  /** Per-context line height */
  lineHeight?: {
    display?: number;
    heading?: number;
    body?: number;
    tight?: number;
    relaxed?: number;
  };
}

export interface BrandSurfaces {
  /** Governed button silhouette shared by static and DB Theme transports. */
  buttonStyle?: "sharp" | "soft" | "pill";
  /** Bounded multiplier for the canonical radius ramp. */
  radiusScale?: number;
  /** Governed elevation posture; values lower through the shared posture table. */
  elevation?: "flat" | "soft" | "elevated";
  surface?: Partial<SurfaceTokens>;
  /** Coordinated semantic surface roles shared by every component family. */
  surfaceRoles?: SemanticSurfaceRoleMap;
  /**
   * @deprecated Use `surfaceRoles`. Read-only compatibility for schema v1;
   * new static themes and DB payloads must not author this field.
   */
  materials?: SemanticSurfaceRoleMap;
  /** `full` is the pill/circle radius, not a fifth step of the scale. */
  borderRadius?: Partial<Record<"sm" | "md" | "lg" | "xl" | "full", string>>;
  shadows?: Partial<
    Record<
      | "xs"
      | "sm"
      | "md"
      | "lg"
      | "xl"
      | "xxl"
      | "inner"
      | "focusRing"
      | "focusRingError",
      string
    >
  >;
  /**
   * The closed `--ds-elevation-0..5` ladder.
   *
   * Distinct from `elevation`, which selects a governed posture preset: this
   * is the ladder itself. A dark-first skin cannot reach its shadow stack
   * through the posture table, because a shadow that reads on a light ground
   * is not the same expression tinted differently — it carries an inset top
   * light the light-mode ladder has no term for.
   */
  elevations?: Partial<
    Record<
      "level0" | "level1" | "level2" | "level3" | "level4" | "level5",
      string
    >
  >;
  glass?: TenantGlassTokens;
  gradients?: TenantGradientTokens;
  overlays?: TenantOverlayTokens;
  densityScale?: number;
  /**
   * Semantic density posture for a code-owned static vertical: the BrandTheme
   * equivalent of `appearance.general.density`, resolved through the same
   * canonical factor table and emitted on the same `--ds-density-mode-factor`
   * channel. Without it a static vertical has a structural `densityScale` but
   * no posture authority at all, so a root `data-density` boundary is its only
   * semantic source.
   *
   * This is the semantic axis, NOT the structural one: `densityScale` remains
   * the independent white-labelable brand multiplier and must never be
   * reinterpreted as a posture — that would apply one brand decision twice.
   */
  density?: "compact" | "comfortable" | "normal" | "spacious";
  /**
   * Premium effect-intensity dial. Emitted as `--ds-effect-intensity` and
   * multiplies the gradient/glass/glow layer (engines/modern spec section 5):
   * `1` = full Quiet Premium (DS/rottay default), `0` = flat/zero-decoration.
   * First-party verticals may choose a restrained nonzero value; customer
   * tenant overrides remain bounded by their compiled policy. Defaults to `1`.
   */
  effectIntensity?: number;
  /**
   * Layout rhythm posture: the BrandTheme equivalent of `appearance.rhythm`,
   * resolved through the same `TENANT_THEME_RHYTHM_FACTORS` table and emitted
   * on the same `--ds-rhythm-scale` channel.
   *
   * ORTHOGONAL to `density`/`densityScale` and never a restatement of them.
   * Density owns how big a control is; rhythm owns how much room sits between
   * controls. `airy` on a compact vertical is a coherent, deliberate posture:
   * small controls with generous breathing room. Rhythm reaches only gap and
   * layout-padding chains, never a control height or touch target, so the
   * coarse-pointer floors are untouched by construction.
   *
   * Absent → `normal` (factor 1), which is byte-identical to today.
   *
   * The posture vocabulary is spelled out here rather than imported because
   * `tenant-theme` already imports this module; the union mirrors `density`
   * above. The MULTIPLIERS have exactly one source,
   * `TENANT_THEME_RHYTHM_FACTORS`.
   */
  rhythm?: "tight" | "normal" | "airy";
}

/**
 * @deprecated Open-ended brand motion is retained for one compatibility minor
 * while bundled themes migrate. Runtime choreography now resolves through the
 * vertical MotionProfile plus the bounded TenantMotionDial; DB tenants must
 * not author springs, bounce, keyframes or loop topology.
 */
export interface BrandMotion {
  intensity?: number;
  /** Bounded duration multiplier shared with the tenant motion dial. */
  durationScale?: number;
  /** Behavioral motion policy; intentionally emits no CSS custom property. */
  ambient?: TenantMotionDial["ambient"];
  entrance?: "none" | "fade" | "slideUp" | "spring" | "bounce";
  entranceDuration?: number;
  hoverLift?: number;
  hoverScale?: number;
  useSpring?: boolean;
  springTension?: number;
  springFriction?: number;
  pulseSpeed?: "none" | "slow" | "normal" | "fast";
  skeletonStyle?: "pulse" | "shimmer" | "wave";
  staggerDelay?: number;
  staggerMax?: number;
  countUpEnabled?: boolean;
}

export interface BrandChrome {
  /** Card elevation, hover, border, padding personality */
  card?: Partial<CardPersonalityTokens>;
  /** Shared semantic surface paint consumed across component families */
  surface?: BrandSurfaceChrome;
  /** Accent bars, icon containers, badge shapes, dividers */
  accent?: Partial<AccentPersonalityTokens>;
  /** Sidebar navigation chrome (bg, text, item sizing, group headers) */
  sidebar?: BrandSidebarChrome;
  /** Layout header and sider shell chrome */
  layout?: BrandLayoutChrome;
  /** Shell background grid (for premium grid-overlay effects) */
  shell?: BrandShellChrome;
  /** Workspace/search/list toolbar chrome */
  toolbar?: BrandToolbarChrome;
  /** Filter pill/toggle chrome used by dense list filters */
  filterPill?: BrandFilterPillChrome;
  /** Badge / Chip / Pill microchannel chrome. */
  badge?: BrandBadgeChrome;
  /** Breadcrumb and breadcrumb-bar chrome */
  breadcrumb?: BrandBreadcrumbChrome;
  /** Global/local search chrome */
  search?: BrandSearchChrome;
  /** Button variant colors, input chrome, disabled states */
  controls?: BrandControlsChrome;
  /** Table header, row, and cell styling */
  table?: BrandTableChrome;
  /** Card component chrome (bg, border, shadow, header/body/footer) */
  cardComponent?: BrandCardChrome;
  /**
   * Base premium-card paint. The named card families below are specialisations
   * of the same anatomy; this slot paints the unspecialised `--ds-premium-card-*`
   * namespace they all fall back through.
   */
  premiumCard?: BrandPremiumCardChrome;
  /** Metric/stat cards used in dashboards and command headers */
  metricCard?: BrandMetricCardChrome;
  /** Signal/status cards used for operational insights */
  signalCard?: BrandSignalCardChrome;
  /** Workspace cards used inside command/list/detail workspaces */
  workspaceCard?: BrandPremiumCardChrome;
  /** Dense cards for compact lists, rails, and mobile fallbacks */
  compactCard?: BrandPremiumCardChrome;
  /** Tall cards for rich records, summaries, and media-forward layouts */
  tallCard?: BrandPremiumCardChrome;
  /** Collection item cards used by cards/grid view modes */
  collectionCard?: BrandPremiumCardChrome;
  /** Listing grid chrome shared by collection cards and skeleton/empty states */
  listingGrid?: BrandListingGridChrome;
  /** Collection list shell and preview-rail chrome */
  list?: BrandListChrome;
  /** Detail record surface chrome (hero header, section panels, rail width) */
  detail?: BrandDetailChrome;
  /** Modal/dialog chrome */
  modal?: BrandModalChrome;
  /** Tooltip micro-overlay chrome */
  tooltip?: BrandTooltipChrome;
  /** Popover contextual-surface chrome */
  popover?: BrandPopoverChrome;
  /** Tabs chrome */
  tabs?: BrandTabsChrome;
  /** Alert banner chrome: per-intent surface, border, text and icon paint */
  alert?: BrandAlertChrome;
  /** Anchor navigation chrome: ink rail and link states */
  anchor?: BrandAnchorChrome;
  /** Avatar chrome: default/semantic fills, ring, group overflow paint */
  avatar?: BrandAvatarChrome;
  /** Back-to-top affordance chrome */
  backTop?: BrandBackTopChrome;
  /** Calendar chrome: surface, border, header and out-of-month days */
  calendar?: BrandCalendarChrome;
  /** Collapse/accordion chrome: panel, header and content paint */
  collapse?: BrandCollapseChrome;
  /** Descriptions list chrome: surface, border, label and content */
  descriptions?: BrandDescriptionsChrome;
  /** Drawer chrome: surface, header/footer rules, title and elevation */
  drawer?: BrandDrawerChrome;
  /** Dropdown menu chrome: surface, elevation and item states */
  dropdown?: BrandDropdownChrome;
  /** Empty-state chrome: illustration and description paint */
  empty?: BrandEmptyChrome;
  /** Float button chrome: default/primary fills and badge paint */
  floatButton?: BrandFloatButtonChrome;
  /** Live feed chrome: surface, new-item highlight and loading paint */
  liveFeed?: BrandLiveFeedChrome;
  /** Menu chrome: surface, item states, dividers and the inverse variant */
  menu?: BrandMenuChrome;
  /** Transient message chrome: surface, elevation and close affordance */
  message?: BrandMessageChrome;
  /** Notification chrome: surface, elevation and title paint */
  notification?: BrandNotificationChrome;
  /** Pagination chrome: item states and the active page treatment */
  pagination?: BrandPaginationChrome;
  /** Progress chrome: track and per-intent fill paint */
  progress?: BrandProgressChrome;
  /** Result page chrome: icon, title and subtitle paint */
  result?: BrandResultChrome;
  /** Skeleton chrome: base fill, highlight and wave gradient */
  skeleton?: BrandSkeletonChrome;
  /** Spinner chrome: indicator and track paint */
  spinner?: BrandSpinnerChrome;
  /** Statistic chrome: title, value and affix paint */
  statistic?: BrandStatisticChrome;
  /** Stats grid chrome: card variants, trend paint and skeletons */
  statsGrid?: BrandStatsGridChrome;
  /** Steps chrome: connector, and the wait/process/finish item states */
  steps?: BrandStepsChrome;
  /** Tag chrome: default and per-intent surface, border and text paint */
  tag?: BrandTagChrome;
  /** Timeline chrome: rail, dot and content paint */
  timeline?: BrandTimelineChrome;
  /** Tree chrome: node states for hover and selection */
  tree?: BrandTreeChrome;
}

/**
 * Semantic surface paint shared by every component family that draws a raised
 * sheet: the generic `--ds-surface-*` channels, the card grid overlay, and the
 * floating-panel elevation.
 *
 * Distinct from top-level `BrandSurfaces`, which owns the STRUCTURAL posture
 * (radius scale, elevation posture, density, rhythm). This owns the painted
 * result those postures are expressed through.
 */
export interface BrandSurfaceChrome {
  /** Corner radius of the shared medium surface step. */
  radiusMd?: string;
  /** Resting and hovered elevation of a generic raised surface. */
  shadow?: string;
  shadowHover?: string;
  /** Icon tile hosted on a surface. */
  iconBg?: string;
  iconBorder?: string;
  /** Inline chip/metadata pill hosted on a surface. */
  chipBg?: string;
  /** Soft wash of the card's leading side accent. */
  cardSideAccentSoft?: string;
  /**
   * Card grid overlay. `cardGridBg` composes the two hairline gradients built
   * from `cardGridLine` at `cardGridSize` spacing.
   */
  cardGridSize?: string;
  cardGridLine?: string;
  cardGridBg?: string;
  /**
   * Elevation shared by every floating panel. Lowered to the shadow-scale name
   * and to the date/time picker panels, which are the same decision under
   * component-shaped spellings.
   */
  popoverShadow?: string;
  /** Scrim gradient drawn over a card's cover image so its caption stays legible. */
  cardCoverOverlayBg?: string;
  /** The full-bleed environment gradient a dark-first page ground is painted with. */
  gradientDark?: string;
  /** Scrim over a standalone image (lightbox, preview, media tile). */
  imageOverlayBg?: string;
  /** Scrim drawn over the page behind a modal, drawer or command surface. */
  overlayBg?: string;
  /** Ink of a page-shell watermark: present, never competing with content. */
  watermarkColor?: string;
  /** Supporting ink under a page-shell title. */
  pageShellSubtitleColor?: string;
}

export interface BrandSidebarChrome {
  /** Bounded data-only anatomy selection; never emitted as CSS. */
  anatomy?: "default" | "rail" | "panel";
  /** Semantic sidebar posture. Explicit chrome fields below override its defaults. */
  tone?: "subtle" | "strong" | "inverse";
  bg?: string;
  border?: string;
  text?: string;
  textMuted?: string;
  width?: string;
  collapsedWidth?: string;
  headerHeight?: string;
  groupFontSize?: string;
  groupFontWeight?: string | number;
  groupColor?: string;
  groupLetterSpacing?: string;
  /** Space above a group label, separating it from the group before it. */
  groupMarginTop?: string;
  /** Space below a group label, before its first item. */
  groupMarginBottom?: string;
  /** Inner space above a group label. */
  groupPaddingTop?: string;
  itemFontSize?: string;
  itemFontWeight?: string | number;
  itemFontWeightActive?: string | number;
  itemColor?: string;
  itemColorActive?: string;
  itemBgActive?: string;
  itemBgHover?: string;
  itemPadding?: string;
  /** Extra leading inset for nested items. */
  itemIndent?: string;
  iconSize?: string;
  footerBg?: string;
  /**
   * Optical geometry of the navigation column itself.
   *
   * `itemPadding` above is the shorthand every anatomy shares; these are the
   * axis-specific channels the rail and panel anatomies size independently,
   * which is why a single shorthand cannot express them.
   */
  shellPaddingInline?: string;
  shellPaddingCollapsed?: string;
  itemHeight?: string;
  itemChildHeight?: string;
  itemFontSizeChild?: string;
  itemPaddingInline?: string;
  iconColumnSize?: string;
  itemGap?: string;
  childPaddingInline?: string;
}

export interface BrandLayoutChrome {
  /** Bounded data-only anatomy selection; never emitted as CSS. */
  anatomy?: "default" | "flat" | "floating";
  bg?: string;
  headerBg?: string;
  headerHeight?: string;
  headerBackdrop?: string;
  headerBorder?: string;
  siderBg?: string;
  siderBorder?: string;
  /** Optional finish for the structural Container primitive. */
  containerBackground?: string;
  containerBorder?: string;
  containerRadius?: string;
  containerShadow?: string;
  containerMotionDuration?: string;
  containerMotionEasing?: string;
  /** Optional finish for responsive media frames. */
  aspectRatioBackground?: string;
  aspectRatioBorder?: string;
  aspectRatioRadius?: string;
  aspectRatioShadow?: string;
  aspectRatioOverflow?: string;
  aspectRatioMotionDuration?: string;
  aspectRatioMotionEasing?: string;
  /** Divider rhythm, line and localized label craft. */
  dividerColor?: string;
  /** Ink of a divider's inline label. Separate decision from the line itself. */
  dividerTextColor?: string;
  dividerThicknessThin?: string;
  dividerThicknessMedium?: string;
  dividerThicknessThick?: string;
  dividerContentGap?: string;
  dividerEdgeSegment?: string;
  dividerMinSegment?: string;
  dividerLabelMaxWidth?: string;
  dividerLabelFontSize?: string;
  dividerLabelFontWeight?: string;
  dividerLabelLineHeight?: string;
  dividerLabelTransform?: string;
  dividerLabelTracking?: string;
  dividerMotionDuration?: string;
  dividerMotionEasing?: string;
  /** Stack separators and Space transitions share the layout personality. */
  stackDividerSize?: string;
  stackDividerColor?: string;
  stackDividerOpacity?: string;
  spaceMotionDuration?: string;
  spaceMotionEasing?: string;
}

export interface BrandShellChrome {
  gridSize?: string;
  gridLine?: string;
  gridOpacity?: number;
  bg?: string;
  border?: string;
  overlay?: string;
  shadow?: string;
  activeBg?: string;
  activeGradient?: string;
  dropdownShadow?: string;
  shimmerFaint?: string;
  shimmerSoft?: string;
  shimmerMedium?: string;
  shimmerStrong?: string;
  commandFont?: string;
  commandLetterSpacing?: string;
  commandGridSize?: string;
  commandGridLineSoft?: string;
  commandGridLine?: string;
  commandGridLineStrong?: string;
  commandGridBg?: string;
  commandGridBgStrong?: string;
  commandGlow?: string;
  commandLine?: string;
  commandRailBg?: string;
  commandHomeMaxWidth?: string;
  commandHomeGap?: string;
  commandHomePanelGap?: string;
  commandHomeGridLine?: string;
  commandHomePanelBorder?: string;
  commandHomePanelBorderSoft?: string;
  commandHomePanelShadow?: string;
  commandHomePanelBg?: string;
  commandHomePanelBgStrong?: string;
  commandHomeCompactActionHeight?: string;
  commandHomeConsoleMinHeight?: string;
  commandHomeConsolePadding?: string;
  commandHomeConsoleBg?: string;
  commandHomeSurfaceBg?: string;
  commandHomeHeroBg?: string;
  commandHomeIconBg?: string;
  commandHomeIconBorder?: string;
  commandHomeControlBg?: string;
  commandHomeControlBorder?: string;
  commandHomeControlHoverBg?: string;
  commandHomeControlHoverBorder?: string;
  commandHomeMeterBg?: string;
  commandHomeMeterFill?: string;
}

export interface BrandToolbarChrome {
  bg?: string;
  border?: string;
  borderBottom?: string;
  color?: string;
  shadow?: string;
  radius?: string;
  padding?: string;
  gap?: string;
  controlBg?: string;
  controlBorder?: string;
  controlColor?: string;
  divider?: string;
}

export interface BrandFilterPillChrome {
  bg?: string;
  border?: string;
  color?: string;
  shadow?: string;
  frameBg?: string;
  frameBorder?: string;
  frameShadow?: string;
  hoverBg?: string;
  hoverBorder?: string;
  activeBg?: string;
  activeBorder?: string;
  activeColor?: string;
  activeShadow?: string;
  focusRing?: string;
  countBg?: string;
  countActiveBg?: string;
  countBorder?: string;
  countActiveBorder?: string;
  countRing?: string;
  countActiveRing?: string;
}

/**
 * Dedicated compact-label chrome for Badge, Chip and Pill.
 *
 * This family is intentionally independent from `filterPill`: a badge can be
 * passive, semantic, removable, identity-bearing or an anchored count. DB
 * tenants therefore need one bounded, compiler-owned channel that covers the
 * complete anatomy without product CSS or inline paint.
 */
export interface BrandBadgeChrome {
  fontFamily?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  gap?: string;
  /** Overall pill geometry, independent of the tone/variant paint below. */
  height?: string;
  paddingX?: string;
  /**
   * Semantic tone paint. This is the status vocabulary (`default`/`primary`/
   * `secondary`/`success`/`warning`/`error`/`info`) and is orthogonal to the
   * `solid`/`soft`/`ghost`/`outline` EMPHASIS vocabulary further down: a badge
   * picks one tone and one emphasis.
   */
  defaultBg?: string;
  defaultColor?: string;
  primaryBg?: string;
  primaryColor?: string;
  secondaryBg?: string;
  secondaryColor?: string;
  successBg?: string;
  successColor?: string;
  warningBg?: string;
  warningColor?: string;
  errorBg?: string;
  errorColor?: string;
  infoBg?: string;
  infoColor?: string;
  /**
   * Tone-independent frame and ink. A skin that draws every badge on one
   * hairline and one reading ink sets these once instead of restating the
   * same pair across all seven tones.
   */
  borderColor?: string;
  textColor?: string;
  maxInlineSize?: string;
  chipMaxInlineSize?: string;
  pillMaxInlineSize?: string;
  frameWidth?: string;
  radius?: string;
  chipRadius?: string;
  pillRadius?: string;
  surface?: string;
  ink?: string;
  frame?: string;
  highlight?: string;
  shadow?: string;
  solidBg?: string;
  solidColor?: string;
  solidBorder?: string;
  softBg?: string;
  softColor?: string;
  softBorder?: string;
  ghostBg?: string;
  ghostColor?: string;
  ghostBorder?: string;
  ghostShadow?: string;
  outlineBg?: string;
  outlineColor?: string;
  outlineBorder?: string;
  outlineShadow?: string;
  surfaceHover?: string;
  inkHover?: string;
  frameHover?: string;
  highlightHover?: string;
  shadowHover?: string;
  hoverTransform?: string;
  surfacePressed?: string;
  inkPressed?: string;
  framePressed?: string;
  shadowPressed?: string;
  pressTransform?: string;
  focusRing?: string;
  selectedSurface?: string;
  selectedInk?: string;
  selectedFrame?: string;
  selectedShadow?: string;
  borderedRing?: string;
  iconSize?: string;
  iconColor?: string;
  iconBg?: string;
  iconBorder?: string;
  iconBorderWidth?: string;
  iconRadius?: string;
  iconShadow?: string;
  avatarSize?: string;
  avatarBleed?: string;
  avatarBg?: string;
  avatarBorder?: string;
  avatarBorderWidth?: string;
  avatarRadius?: string;
  avatarShadow?: string;
  dotSize?: string;
  dotBg?: string;
  dotBorder?: string;
  dotBorderWidth?: string;
  dotShadow?: string;
  countMinSize?: string;
  countSize?: string;
  countPaddingInline?: string;
  countBg?: string;
  countColor?: string;
  countBorder?: string;
  countBorderWidth?: string;
  countRadius?: string;
  countRing?: string;
  countFontFamily?: string;
  countFontSize?: string;
  countFontWeight?: string | number;
  countSelectedBg?: string;
  countSelectedBorder?: string;
  countSelectedRing?: string;
  removeSize?: string;
  removeTouchSize?: string;
  removeBleed?: string;
  removeBg?: string;
  removeColor?: string;
  removeBorder?: string;
  removeBorderWidth?: string;
  removeRadius?: string;
  removeOpacity?: number;
  removeHoverBg?: string;
  removeHoverTransform?: string;
  removeFocusRing?: string;
  disabledOpacity?: number;
  disabledFilter?: string;
  loadingOpacity?: number;
  motionDuration?: string;
  motionEasing?: string;
  pulseDuration?: string;
  pulseTiming?: string;
  pulseScale?: number;
  spinnerDuration?: string;
  touchTarget?: string;
  containerPaddingInline?: string;
  indicatorMaxInlineSize?: string;
  indicatorRadius?: string;
}

export interface BrandBreadcrumbChrome {
  bg?: string;
  border?: string;
  color?: string;
  linkColor?: string;
  itemColor?: string;
  colorHover?: string;
  colorActive?: string;
  separatorColor?: string;
  fontSize?: string;
  fontWeight?: string | number;
  padding?: string;
}

export interface BrandSearchChrome {
  bg?: string;
  border?: string;
  color?: string;
  shadow?: string;
  radius?: string;
  inputBg?: string;
  inputBorder?: string;
  inputColor?: string;
  placeholderColor?: string;
  iconColor?: string;
  clearColor?: string;
  clearColorHover?: string;
  resultBg?: string;
  resultBgHover?: string;
  resultBorder?: string;
  resultShadow?: string;
  resultTitleColor?: string;
  resultMetaColor?: string;
  categoryColor?: string;
  emptyBg?: string;
  /**
   * The modal spelling of the same capability. A command palette is search
   * lifted off the page onto its own scrim, so it belongs to this family and
   * not to a parallel top-level owner.
   */
  commandPalette?: BrandCommandPaletteChrome;
}

/** Command-palette chrome: the scrim, the floating panel, and its row states. */
export interface BrandCommandPaletteChrome {
  backdrop?: string;
  bg?: string;
  border?: string;
  emptyColor?: string;
  groupColor?: string;
  itemHoverBg?: string;
  shortcutBorder?: string;
}

export interface BrandButtonVariantChrome {
  bg?: string;
  bgHover?: string;
  bgActive?: string;
  color?: string;
  colorHover?: string;
  colorActive?: string;
  text?: string;
  border?: string;
  borderHover?: string;
  borderActive?: string;
  shadow?: string;
  shadowHover?: string;
  shadowActive?: string;
}

/**
 * Optical geometry for one control size. Unlike palette chrome, these values
 * tune the actual rhythm of a product: control height, horizontal economy and
 * the type/icon relationship. Keeping them in BrandTheme makes a vertical's
 * density authored instead of being frozen inside an engine implementation.
 */
export interface BrandControlSizeChrome {
  height?: string;
  paddingX?: string;
  paddingY?: string;
  fontSize?: string;
  lineHeight?: string;
  iconSize?: string;
  gap?: string;
  radius?: string;
}

/** Shared geometry for Button across its five public sizes. */
export interface BrandButtonGeometryChrome {
  fontFamily?: string;
  fontWeight?: string | number;
  letterSpacing?: string;
  textTransform?: string;
  gap?: string;
  radius?: string;
  borderWidth?: string;
  touchTargetMin?: string;
  groupGap?: string;
  groupMobileDirection?: "row" | "column";
  groupMobileGap?: string;
  groupMobileWidth?: string;
  hoverTransform?: string;
  activeTransform?: string;
  iconHoverTransform?: string;
  iconActiveTransform?: string;
  labelOffsetY?: string;
  hoverFilter?: string;
  activeFilter?: string;
  focusRingOffset?: string;
  spinnerDuration?: string;
  surfaceHighlight?: string;
  surfaceHighlightOpacity?: string;
  surfaceHighlightHoverOpacity?: string;
  surfaceHighlightActiveOpacity?: string;
  gradient?: string;
  aiTexture?: string;
  transitionDuration?: string;
  transitionTiming?: string;
  xs?: BrandControlSizeChrome;
  sm?: BrandControlSizeChrome;
  md?: BrandControlSizeChrome;
  lg?: BrandControlSizeChrome;
  xl?: BrandControlSizeChrome;
}

/** Shared geometry for field-like controls across their public sizes. */
export interface BrandFieldGeometryChrome {
  gap?: string;
  radius?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  letterSpacing?: string;
  borderWidth?: string;
  borderStyle?: string;
  messageGap?: string;
  groupGap?: string;
  groupGapSeparated?: string;
  groupOverlap?: string;
  groupMinItemWidth?: string;
  formFieldGap?: string;
  horizontalGap?: string;
  labelOffsetY?: string;
  requiredGap?: string;
  formFieldDisabledOpacity?: number;
  labelFontSize?: string;
  labelFontWeight?: string | number;
  labelFontFamily?: string;
  labelLetterSpacing?: string;
  labelLineHeight?: string;
  helperFontSize?: string;
  helperLineHeight?: string;
  affixSize?: string;
  affixSizeCompact?: string;
  affixRadius?: string;
  actionSize?: string;
  actionRadius?: string;
  touchTargetMin?: string;
  loadingSize?: string;
  loadingStroke?: string;
  loadingDuration?: string;
  textareaMinHeight?: string;
  textareaMaxHeight?: string;
  textareaPaddingX?: string;
  textareaPaddingY?: string;
  textareaRadius?: string;
  textareaResize?: string;
  transitionDuration?: string;
  transitionTiming?: string;
  xs?: BrandControlSizeChrome;
  sm?: BrandControlSizeChrome;
  md?: BrandControlSizeChrome;
  lg?: BrandControlSizeChrome;
  xl?: BrandControlSizeChrome;
}

/** Refined grouped-choice chrome for the Modern Segmented primitive. */
export interface BrandSegmentedChrome {
  bg?: string;
  border?: string;
  radius?: string;
  padding?: string;
  gap?: string;
  shadow?: string;
  itemBg?: string;
  itemBgHover?: string;
  itemBgSelected?: string;
  itemColor?: string;
  itemColorHover?: string;
  itemColorSelected?: string;
  itemRadius?: string;
  itemFontWeight?: string | number;
  itemFontWeightSelected?: string | number;
  sm?: BrandControlSizeChrome;
  md?: BrandControlSizeChrome;
  lg?: BrandControlSizeChrome;
}

/**
 * Canonical semantic algebra shared by every control family.
 *
 * These are public `--ds-*` channels, not product aliases. Static first-party
 * themes and DB Theme patches author the same keypaths and the common chrome
 * lowering emits the same CSS variables for both transports.
 */
export interface BrandSemanticControlChrome {
  ink?: string;
  inkMuted?: string;
  onBrand?: string;
  surface?: string;
  surfaceRaised?: string;
  brandTint?: string;
  brandTintHover?: string;
  brandBorder?: string;
  iconTileBorder?: string;
}

export interface BrandControlsChrome {
  /** Shared semantic paint consumed by buttons, pills and dense controls. */
  semantic?: BrandSemanticControlChrome;
  /**
   * Multi-line field chrome. A textarea is not a tall Input: it carries its
   * own resting/filled grounds and a character-count ink that the single-line
   * field has no term for, so it does not inherit `input` here.
   */
  textarea?: BrandTextareaChrome;
  /** Field-label, help, and validation-message ink shared by every form row. */
  form?: BrandFormChrome;
  /** Button optical geometry. Paint stays in the variant blocks below. */
  buttonGeometry?: BrandButtonGeometryChrome;
  /** Input/select optical geometry shared by field-like controls. */
  fieldGeometry?: BrandFieldGeometryChrome;
  /** Grouped-choice geometry and paint for Segmented. */
  segmented?: BrandSegmentedChrome;
  /** Primary button chrome */
  buttonPrimary?: BrandButtonVariantChrome;
  /** Secondary button chrome */
  buttonSecondary?: BrandButtonVariantChrome;
  /** Default button chrome */
  buttonDefault?: BrandButtonVariantChrome;
  /** Ghost button chrome */
  buttonGhost?: BrandButtonVariantChrome;
  /** Text button chrome */
  buttonText?: BrandButtonVariantChrome;
  /** Dashed-outline button chrome */
  buttonDashed?: BrandButtonVariantChrome;
  /** Link button chrome */
  buttonLink?: BrandButtonVariantChrome;
  /** Success semantic button */
  buttonSuccess?: BrandButtonVariantChrome;
  /** Warning semantic button */
  buttonWarning?: BrandButtonVariantChrome;
  /** Error/danger semantic button */
  buttonError?: BrandButtonVariantChrome;
  /** Info semantic button */
  buttonInfo?: BrandButtonVariantChrome;
  /** AI-assisted action. Palette is authored independently from primary. */
  buttonAI?: BrandButtonVariantChrome;
  /** Disabled state treatment (shared across control types) */
  disabled?: {
    opacity?: number;
    bg?: string;
    text?: string;
    border?: string;
    borderColor?: string;
  };
  /** Focus ring */
  focusRing?: string;
  /**
   * Focus ring COLOR, independent of the composed `focusRing` shadow above.
   * Components that build their own ring geometry read the colour alone.
   */
  focusRingColor?: string;
  /** Input field chrome */
  input?: BrandInputChrome;
  /** Select/combobox chrome (trigger, dropdown panel, options) */
  select?: BrandSelectChrome;
  /**
   * ROTTAY-T2 MASS. Twelve control families that had no typed owner and were
   * therefore authored as raw `--ds-*` rows inside the rottay artifact
   * extension. Each is a CLOSED interface over the channels its family
   * actually paints -- not an open map, and not a per-brand dialect: the
   * common `chromeToVariables` lowering emits the same names for the static
   * `BrandTheme` transport and the DB `TenantThemeDocument` transport.
   *
   * The field name is the camelCase of the channel suffix; the lowering keeps
   * each family's HISTORICAL channel spelling, which is why `datePicker`
   * lowers to `--ds-datepicker-*`, `inputNumber` to `--ds-inputnumber-*` and
   * `timePicker` to `--ds-timepicker-*`. The contract reads in the repo's
   * casing; the stylesheet keeps the name its readers already consume.
   */
  autocomplete?: BrandAutocompleteChrome;
  checkbox?: BrandCheckboxChrome;
  datePicker?: BrandDatePickerChrome;
  inputNumber?: BrandInputNumberChrome;
  radio?: BrandRadioChrome;
  rate?: BrandRateChrome;
  slider?: BrandSliderChrome;
  switch?: BrandSwitchChrome;
  timePicker?: BrandTimePickerChrome;
  toggle?: BrandToggleChrome;
  transfer?: BrandTransferChrome;
  upload?: BrandUploadChrome;
}

/**
 * Select/combobox chrome. Distinct from `BrandInputChrome` because a select
 * owns a floating dropdown panel and an option list that a text field has no
 * equivalent of; folding them together would give inputs dead keypaths.
 */
/** Multi-line text field chrome. */
export interface BrandTextareaChrome {
  bg?: string;
  bgDisabled?: string;
  filledBg?: string;
  border?: string;
  borderHover?: string;
  borderFocus?: string;
  shadowFocus?: string;
  successBorder?: string;
  warningBorder?: string;
  errorBorder?: string;
  color?: string;
  colorPlaceholder?: string;
  /** Ink of the character counter under a length-bounded textarea. */
  countColor?: string;
}

/** Form row chrome: the ink around a field, not the field itself. */
export interface BrandFormChrome {
  labelColor?: string;
  labelFontWeight?: string | number;
  helpColor?: string;
  /** Ink of the secondary note a field may carry alongside its help text. */
  extraColor?: string;
  requiredColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
}

export interface BrandSelectChrome {
  /** Trigger */
  bg?: string;
  bgHover?: string;
  bgFocus?: string;
  color?: string;
  colorPlaceholder?: string;
  borderColor?: string;
  borderColorHover?: string;
  borderColorFocus?: string;
  /** Dropdown panel */
  dropdownBg?: string;
  dropdownBorderColor?: string;
  dropdownShadow?: string;
  /** Options */
  optionBgHover?: string;
  optionBgSelected?: string;
  optionColor?: string;
  optionColorSelected?: string;
  /**
   * ROTTAY-T2 MASS. The eighteen select channels the rottay extension still
   * declared after the T1 P0 repair, now typed.
   *
   * `border` is NOT `borderColor`. The two are different channels with
   * different readers: `--ds-select-border-color` is the colour channel the
   * C3 keyset already owned, and `--ds-select-border` is the shorthand the
   * rustic-shaped select stylesheet resolves from it. Folding them together
   * would silently drop one of the two readers, so both stay.
   */
  arrowColor?: string;
  bgDisabled?: string;
  border?: string;
  borderFocus?: string;
  borderHover?: string;
  checkColor?: string;
  clearColor?: string;
  clearColorHover?: string;
  colorDisabled?: string;
  /** Panel border shorthand, distinct from `dropdownBorderColor` above. */
  dropdownBorder?: string;
  errorBorder?: string;
  filledBg?: string;
  optionColorDisabled?: string;
  shadowFocus?: string;
  successBorder?: string;
  tagBg?: string;
  tagColor?: string;
  warningBorder?: string;
}

/**
 * ROTTAY-T2 MASS -- twelve control families given a typed owner.
 *
 * Every field below is a public `--ds-*` channel that the rottay artifact
 * extension declared by hand until this tranche. The interfaces are closed:
 * a channel with no field cannot be authored, and a field with no channel
 * cannot exist, because the lowering in
 * `compilers/kernel/foundation/css/chrome-variables` is the single producer
 * for BOTH the static `BrandTheme` and the DB `TenantThemeDocument`
 * transports.
 */
/**
 * Type-ahead field. A combobox that files its own dropdown, empty-state ink
 * and clear affordance; it does not inherit `select` because the two families
 * paint different panels and the extension declared both separately.
 */
export interface BrandAutocompleteChrome {
  /** `--ds-autocomplete-bg` */
  bg?: string;
  /** `--ds-autocomplete-border` */
  border?: string;
  /** `--ds-autocomplete-border-focus` */
  borderFocus?: string;
  /** `--ds-autocomplete-clear-color` */
  clearColor?: string;
  /** `--ds-autocomplete-dropdown-bg` */
  dropdownBg?: string;
  /** `--ds-autocomplete-dropdown-shadow` */
  dropdownShadow?: string;
  /** `--ds-autocomplete-empty-color` */
  emptyColor?: string;
  /** `--ds-autocomplete-error-border` */
  errorBorder?: string;
  /** `--ds-autocomplete-option-bg-hover` */
  optionBgHover?: string;
  /** `--ds-autocomplete-warning-border` */
  warningBorder?: string;
}

/**
 * Binary tick. Owns its box, its checked ground, its focus ring COLOR as a
 * channel independent of the composed ring, and the label ink beside it.
 */
export interface BrandCheckboxChrome {
  /** `--ds-checkbox-bg` */
  bg?: string;
  /** `--ds-checkbox-bg-disabled` */
  bgDisabled?: string;
  /** `--ds-checkbox-border` */
  border?: string;
  /** `--ds-checkbox-border-hover` */
  borderHover?: string;
  /** `--ds-checkbox-checked-bg` */
  checkedBg?: string;
  /** `--ds-checkbox-checked-border` */
  checkedBorder?: string;
  /** `--ds-checkbox-checked-color` */
  checkedColor?: string;
  /** `--ds-checkbox-error-border` */
  errorBorder?: string;
  /** `--ds-checkbox-error-color` */
  errorColor?: string;
  /** `--ds-checkbox-focus-ring` */
  focusRing?: string;
  /** `--ds-checkbox-focus-ring-color` */
  focusRingColor?: string;
  /** `--ds-checkbox-label-color` */
  labelColor?: string;
  /** `--ds-checkbox-label-color-disabled` */
  labelColorDisabled?: string;
}

/**
 * Date field. A field-shaped control with an icon, a range separator and a
 * clear affordance the plain input has no term for. Lowers to the historical
 * `--ds-datepicker-*` spelling.
 */
export interface BrandDatePickerChrome {
  /** `--ds-datepicker-bg` */
  bg?: string;
  /** `--ds-datepicker-bg-disabled` */
  bgDisabled?: string;
  /** `--ds-datepicker-border` */
  border?: string;
  /** `--ds-datepicker-border-focus` */
  borderFocus?: string;
  /** `--ds-datepicker-border-hover` */
  borderHover?: string;
  /** `--ds-datepicker-clear-color` */
  clearColor?: string;
  /** `--ds-datepicker-color` */
  color?: string;
  /** `--ds-datepicker-error-border` */
  errorBorder?: string;
  /** `--ds-datepicker-icon-color` */
  iconColor?: string;
  /** `--ds-datepicker-separator-color` */
  separatorColor?: string;
  /** `--ds-datepicker-shadow-focus` */
  shadowFocus?: string;
  /** `--ds-datepicker-warning-border` */
  warningBorder?: string;
}

/**
 * Numeric stepper. Shares the field grammar with `input` but owns addon,
 * affix and stepper-control ink of its own. Lowers to `--ds-inputnumber-*`.
 *
 * There is no `controlBg` field: the extension declared
 * `--ds-inputnumber-control-bg: transparent` in both modes, which is exactly
 * what the cascade already resolves. Typing a field for it would create an
 * authority for a value nobody is authoring.
 */
export interface BrandInputNumberChrome {
  /** `--ds-inputnumber-addon-bg` */
  addonBg?: string;
  /** `--ds-inputnumber-addon-border` */
  addonBorder?: string;
  /** `--ds-inputnumber-addon-color` */
  addonColor?: string;
  /** `--ds-inputnumber-affix-color` */
  affixColor?: string;
  /** `--ds-inputnumber-bg` */
  bg?: string;
  /** `--ds-inputnumber-bg-disabled` */
  bgDisabled?: string;
  /** `--ds-inputnumber-border` */
  border?: string;
  /** `--ds-inputnumber-border-focus` */
  borderFocus?: string;
  /** `--ds-inputnumber-color` */
  color?: string;
  /** `--ds-inputnumber-control-color` */
  controlColor?: string;
  /** `--ds-inputnumber-error-border` */
  errorBorder?: string;
  /** `--ds-inputnumber-shadow-focus` */
  shadowFocus?: string;
  /** `--ds-inputnumber-warning-border` */
  warningBorder?: string;
}

/**
 * Single choice. Distinct from `checkbox`: the checked mark is a dot with its
 * own channel, and a radio row carries a description ink a checkbox has no
 * slot for.
 */
export interface BrandRadioChrome {
  /** `--ds-radio-bg` */
  bg?: string;
  /** `--ds-radio-bg-disabled` */
  bgDisabled?: string;
  /** `--ds-radio-border` */
  border?: string;
  /** `--ds-radio-border-hover` */
  borderHover?: string;
  /** `--ds-radio-checked-bg` */
  checkedBg?: string;
  /** `--ds-radio-checked-border` */
  checkedBorder?: string;
  /** `--ds-radio-checked-dot` */
  checkedDot?: string;
  /** `--ds-radio-description-color` */
  descriptionColor?: string;
  /** `--ds-radio-error-border` */
  errorBorder?: string;
  /** `--ds-radio-error-color` */
  errorColor?: string;
  /** `--ds-radio-focus-ring` */
  focusRing?: string;
  /** `--ds-radio-focus-ring-color` */
  focusRingColor?: string;
  /** `--ds-radio-label-color` */
  labelColor?: string;
  /** `--ds-radio-label-color-disabled` */
  labelColorDisabled?: string;
}

/**
 * Star rating. ONE field. `--ds-rate-color-active` and
 * `--ds-rate-color-hover` are not here because both modes declared the same
 * literal the cascade already produces; only the resting ink diverges.
 */
export interface BrandRateChrome {
  /** `--ds-rate-color` */
  color?: string;
}

/**
 * Range control: rail, filled track, handle, and the tick-mark ink.
 */
export interface BrandSliderChrome {
  /** `--ds-slider-focus-ring` */
  focusRing?: string;
  /** `--ds-slider-handle-bg` */
  handleBg?: string;
  /** `--ds-slider-handle-bg-disabled` */
  handleBgDisabled?: string;
  /** `--ds-slider-handle-border` */
  handleBorder?: string;
  /** `--ds-slider-handle-shadow` */
  handleShadow?: string;
  /** `--ds-slider-mark-color` */
  markColor?: string;
  /** `--ds-slider-rail-color` */
  railColor?: string;
  /** `--ds-slider-track-color` */
  trackColor?: string;
  /** `--ds-slider-track-color-disabled` */
  trackColorDisabled?: string;
}

/**
 * iOS-style switch. Separate family from `toggle`: this one paints a track and
 * a thumb, `toggle` paints a track and a dot plus semantic status grounds.
 */
export interface BrandSwitchChrome {
  /** `--ds-switch-bg` */
  bg?: string;
  /** `--ds-switch-bg-hover` */
  bgHover?: string;
  /** `--ds-switch-checked-bg` */
  checkedBg?: string;
  /** `--ds-switch-checked-bg-hover` */
  checkedBgHover?: string;
  /** `--ds-switch-focus-ring` */
  focusRing?: string;
  /** `--ds-switch-label-color` */
  labelColor?: string;
  /** `--ds-switch-thumb-bg` */
  thumbBg?: string;
  /** `--ds-switch-thumb-shadow` */
  thumbShadow?: string;
}

/**
 * Time field. Same shape as `datePicker`, different family, own channels.
 * Lowers to the historical `--ds-timepicker-*` spelling.
 */
export interface BrandTimePickerChrome {
  /** `--ds-timepicker-bg` */
  bg?: string;
  /** `--ds-timepicker-bg-disabled` */
  bgDisabled?: string;
  /** `--ds-timepicker-border` */
  border?: string;
  /** `--ds-timepicker-border-focus` */
  borderFocus?: string;
  /** `--ds-timepicker-clear-color` */
  clearColor?: string;
  /** `--ds-timepicker-color` */
  color?: string;
  /** `--ds-timepicker-error-border` */
  errorBorder?: string;
  /** `--ds-timepicker-icon-color` */
  iconColor?: string;
  /** `--ds-timepicker-separator-color` */
  separatorColor?: string;
  /** `--ds-timepicker-shadow-focus` */
  shadowFocus?: string;
  /** `--ds-timepicker-warning-border` */
  warningBorder?: string;
}

/**
 * Labelled toggle row. Owns semantic status grounds (`successBg`,
 * `warningBg`, `errorBg`) and the inner label ink that rides on the track --
 * neither of which the plain `switch` has a term for.
 */
export interface BrandToggleChrome {
  /** `--ds-toggle-description-color` */
  descriptionColor?: string;
  /** `--ds-toggle-dot-bg` */
  dotBg?: string;
  /** `--ds-toggle-dot-shadow` */
  dotShadow?: string;
  /** `--ds-toggle-error-bg` */
  errorBg?: string;
  /** `--ds-toggle-error-color` */
  errorColor?: string;
  /** `--ds-toggle-focus-ring` */
  focusRing?: string;
  /** `--ds-toggle-inner-label-color` */
  innerLabelColor?: string;
  /** `--ds-toggle-label-color` */
  labelColor?: string;
  /** `--ds-toggle-success-bg` */
  successBg?: string;
  /** `--ds-toggle-track-bg` */
  trackBg?: string;
  /** `--ds-toggle-track-bg-checked` */
  trackBgChecked?: string;
  /** `--ds-toggle-warning-bg` */
  warningBg?: string;
}

/**
 * Dual-list transfer. Two panels with a header each; five channels total.
 */
export interface BrandTransferChrome {
  /** `--ds-transfer-bg` */
  bg?: string;
  /** `--ds-transfer-border` */
  border?: string;
  /** `--ds-transfer-header-bg` */
  headerBg?: string;
  /** `--ds-transfer-header-border` */
  headerBorder?: string;
  /** `--ds-transfer-item-bg-hover` */
  itemBgHover?: string;
}

/**
 * File upload. The widest family in this tranche: a dropzone (dragger), a
 * trigger button, a file list, card previews, a progress meter and a preview
 * overlay, each with its own channels.
 */
export interface BrandUploadChrome {
  /** `--ds-upload-bg` */
  bg?: string;
  /** `--ds-upload-border` */
  border?: string;
  /** `--ds-upload-border-hover` */
  borderHover?: string;
  /** `--ds-upload-button-bg` */
  buttonBg?: string;
  /** `--ds-upload-button-border` */
  buttonBorder?: string;
  /** `--ds-upload-button-color` */
  buttonColor?: string;
  /** `--ds-upload-card-bg` */
  cardBg?: string;
  /** `--ds-upload-card-border` */
  cardBorder?: string;
  /** `--ds-upload-dragger-bg` */
  draggerBg?: string;
  /** `--ds-upload-dragger-bg-hover` */
  draggerBgHover?: string;
  /** `--ds-upload-dragger-border` */
  draggerBorder?: string;
  /** `--ds-upload-dragger-border-active` */
  draggerBorderActive?: string;
  /** `--ds-upload-dragger-icon-color` */
  draggerIconColor?: string;
  /** `--ds-upload-dragger-text-color` */
  draggerTextColor?: string;
  /** `--ds-upload-error-border` */
  errorBorder?: string;
  /** `--ds-upload-file-bg` */
  fileBg?: string;
  /** `--ds-upload-file-color` */
  fileColor?: string;
  /** `--ds-upload-file-remove-color` */
  fileRemoveColor?: string;
  /** `--ds-upload-preview-backdrop` */
  previewBackdrop?: string;
  /** `--ds-upload-preview-overlay` */
  previewOverlay?: string;
  /** `--ds-upload-progress-bar` */
  progressBar?: string;
  /** `--ds-upload-progress-track` */
  progressTrack?: string;
}

export interface BrandInputChrome {
  bg?: string;
  bgHover?: string;
  bgFocus?: string;
  bgDisabled?: string;
  color?: string;
  colorPlaceholder?: string;
  colorDisabled?: string;
  border?: string;
  borderHover?: string;
  borderFocus?: string;
  borderDisabled?: string;
  /**
   * Border COLOR channel, upstream of the shorthand `border*` fields above.
   * `input.css` resolves `--ds-input-border` from `--ds-input-border-color`, so
   * a brand that only paints the colour authors these and leaves the shorthand
   * to the base layer. `borderColorDisabled` already flows from
   * `controls.disabled.borderColor` and is not restated here.
   */
  borderColor?: string;
  borderColorHover?: string;
  borderColorFocus?: string;
  disabledOpacity?: number;
  shadowRest?: string;
  shadowHover?: string;
  shadowFocus?: string;
  insetShadow?: string;
  caretColor?: string;
  selectionBg?: string;
  selectionColor?: string;
  placeholderOpacity?: number;
  /** Filled variant */
  filled?: { bg?: string; bgHover?: string; bgFocus?: string; border?: string };
  /** Addon (prefix/suffix) */
  addon?: {
    bg?: string;
    color?: string;
    border?: string;
    radius?: string;
    fontWeight?: string | number;
  };
  /** Inline prefix/suffix treatment inside the field shell. */
  affix?: { bg?: string; color?: string; border?: string; paddingX?: string };
  /** Label */
  label?: { color?: string; requiredColor?: string; disabledColor?: string };
  /** Helper and validation message text */
  helper?: {
    color?: string;
    errorColor?: string;
    errorFontWeight?: string | number;
  };
  /** Clear button */
  clear?: {
    color?: string;
    colorHover?: string;
    bg?: string;
    bgHover?: string;
    border?: string;
    borderHover?: string;
    shadowHover?: string;
    focusRing?: string;
    activeTransform?: string;
  };
  readOnly?: {
    bg?: string;
    color?: string;
    border?: string;
    borderStyle?: string;
    cursor?: string;
  };
  loadingColor?: string;
  autofill?: { bg?: string; color?: string; caret?: string };
  count?: { color?: string; colorWarning?: string; colorError?: string };
  /** Validation states */
  successBorder?: string;
  successBg?: string;
  successShadowFocus?: string;
  warningBorder?: string;
  warningBg?: string;
  warningShadowFocus?: string;
  errorBorder?: string;
  errorBg?: string;
  errorShadowFocus?: string;
  errorColor?: string;
}

export interface BrandTableChrome {
  anatomy?: "default" | "ruled" | "zebra" | "open";
  bg?: string;
  border?: string;
  radius?: string;
  /** Header */
  headerBg?: string;
  headerBgHover?: string;
  headerColor?: string;
  headerFontWeight?: string | number;
  headerFontSize?: string;
  headerLetterSpacing?: string;
  headerTextTransform?: string;
  headerBlockSize?: string;
  headerBorder?: string;
  headerShadow?: string;
  /** Rows */
  rowBg?: string;
  rowBgHover?: string;
  rowBgStriped?: string;
  rowBgSelected?: string;
  rowBgExpanded?: string;
  rowBorder?: string;
  rowHoverShadow?: string;
  /** Keyboard-focus treatment for a row, independent of hover. */
  rowFocusShadow?: string;
  /** Cells */
  cellPadding?: string;
  /** Density-specific cell padding. These win over the legacy global value. */
  cellPaddingCompact?: string;
  cellPaddingComfortable?: string;
  cellPaddingSpacious?: string;
  cellFontSize?: string;
  cellColor?: string;
  /** Filter/header utilities */
  filterRowBg?: string;
  filterFocusShadow?: string;
  /** Drag/resize/action affordances */
  resizeBg?: string;
  resizeBgHover?: string;
  reorderBg?: string;
  actionBg?: string;
  actionBorder?: string;
  sheen?: string;
  pageButtonHoverShadow?: string;
  /** Loading */
  loadingOverlayBg?: string;
}

export interface BrandCardChrome {
  anatomy?: "default" | "framed" | "underline" | "ghost";
  padding?: string;
  paddingSm?: string;
  paddingMd?: string;
  paddingLg?: string;
  paddingXl?: string;
  bg?: string;
  bgHover?: string;
  bgActive?: string;
  bgSelected?: string;
  bgDisabled?: string;
  color?: string;
  colorHover?: string;
  colorActive?: string;
  colorSelected?: string;
  colorDisabled?: string;
  colorMuted?: string;
  border?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderHover?: string;
  borderColorHover?: string;
  borderActive?: string;
  borderSelected?: string;
  borderDisabled?: string;
  borderAccentHover?: string;
  radius?: string;
  radiusSm?: string;
  radiusLg?: string;
  radiusXl?: string;
  shadow?: string;
  shadowHover?: string;
  shadowActive?: string;
  shadowSelected?: string;
  shadowElevated?: string;
  focusRing?: string;
  focusRingColor?: string;
  focusRingWidth?: string;
  focusRingOffset?: string;
  selectedOutlineWidth?: string;
  hoverTransform?: string;
  activeTransform?: string;
  transitionDuration?: string;
  transitionTiming?: string;
  disabledOpacity?: number;
  texture?: string;
  textureSize?: string;
  textureOpacity?: number;
  overlay?: string;
  surfaceGradient?: string;
  stateOverlay?: string;
  stateOverlayHoverOpacity?: number;
  stateOverlayActiveOpacity?: number;
  stateOverlaySelectedOpacity?: number;
  /** Per-material variant channels. */
  elevatedBg?: string;
  elevatedBorderWidth?: string;
  elevatedShadow?: string;
  elevatedShadowHover?: string;
  outlinedBg?: string;
  outlinedBorderWidth?: string;
  outlinedBorderColor?: string;
  outlinedShadow?: string;
  filledBg?: string;
  filledBorderWidth?: string;
  filledShadow?: string;
  ghostBg?: string;
  ghostBorderColor?: string;
  ghostShadow?: string;
  /** Header */
  headerBorder?: string;
  headerBorderColor?: string;
  headerBorderWidth?: string;
  headerBg?: string;
  headerColor?: string;
  headerPadding?: string;
  headerPaddingSm?: string;
  headerPaddingLg?: string;
  headerGap?: string;
  headerActionsGap?: string;
  headerMinHeight?: string;
  headerCopyMaxWidth?: string;
  headerEyebrowSize?: string;
  headerEyebrowTracking?: string;
  headerIconSize?: string;
  headerIconRadius?: string;
  headerIconBg?: string;
  headerIconBorder?: string;
  headerIconColor?: string;
  headerExtraBg?: string;
  headerExtraBorder?: string;
  headerExtraRadius?: string;
  headerExtraPadding?: string;
  titleColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string | number;
  titleLineHeight?: string;
  titleLetterSpacing?: string;
  subtitleColor?: string;
  subtitleFontSize?: string;
  subtitleMarginTop?: string;
  /** Body */
  bodyColor?: string;
  bodyPadding?: string;
  bodyPaddingSm?: string;
  bodyPaddingLg?: string;
  bodyFontSize?: string;
  bodyLineHeight?: string;
  /** Footer */
  footerBorder?: string;
  footerBorderColor?: string;
  footerBorderWidth?: string;
  footerBg?: string;
  footerColor?: string;
  footerPadding?: string;
  footerPaddingSm?: string;
  footerPaddingLg?: string;
  footerActionsGap?: string;
  actionsGap?: string;
  actionsMarginTop?: string;
  actionsPaddingTop?: string;
  /** Image */
  coverInlineSize?: string;
  coverInlineMinSize?: string;
  coverBlockMinSize?: string;
  coverAspectRatio?: string;
  coverObjectPosition?: string;
  coverObjectFit?: string;
  bodyInlineMinSize?: string;
  imagePlaceholderBg?: string;
  imagePlaceholderColor?: string;
  imageHeight?: string;
  imageLoadingTrack?: string;
  imageLoadingActive?: string;
  imageLoadingSize?: string;
  imageLoadingStroke?: string;
  imageLoadingDuration?: string;
  imageErrorIconSize?: string;
  spinnerSize?: string;
  spinnerStroke?: string;
  spinnerTrack?: string;
  spinnerColor?: string;
  spinnerDuration?: string;
  loadingOverlayBg?: string;
  loadingBackdropBlur?: string;
  loadingCoverOpacity?: number;
  loadingSkeletonOpacity?: number;
  skeletonBg?: string;
  skeletonHighlight?: string;
  skeletonRadius?: string;
  skeletonDuration?: string;
}

export interface BrandPremiumCardChrome {
  bg?: string;
  bgHover?: string;
  border?: string;
  borderHover?: string;
  selectedBorder?: string;
  selectedRing?: string;
  shadow?: string;
  shadowHover?: string;
  radius?: string;
  padding?: string;
  gap?: string;
  minHeight?: string;
  glassBg?: string;
  gridSize?: string;
  gridLine?: string;
  gridBg?: string;
  overlay?: string;
  sheen?: string;
  depth?: string;
  hoverTransform?: string;
  transition?: string;
  iconBg?: string;
  iconBorder?: string;
  iconColor?: string;
  titleColor?: string;
  bodyColor?: string;
  labelColor?: string;
  valueColor?: string;
  valueHoverColor?: string;
  footerBg?: string;
  footerBorder?: string;
  footerColor?: string;
  statusBg?: string;
  statusBorder?: string;
  statusColor?: string;
  actionBg?: string;
  actionBorder?: string;
  actionColor?: string;
  meterTrack?: string;
  meterTrackBorder?: string;
  meterFill?: string;
  numberMinWidth?: string;
  numberFontVariant?: string;
  /**
   * Banded interior: the header strip and the alternating body sections a rich
   * card uses to separate its regions without drawing nested card frames.
   */
  headerBg?: string;
  sectionBg?: string;
  sectionAltBg?: string;
}

export interface BrandMetricCardChrome extends BrandPremiumCardChrome {
  trendColor?: string;
  trendColorWarning?: string;
  trendColorError?: string;
  trendErrorBg?: string;
  trendErrorBorder?: string;
  meterFillSuccess?: string;
  meterFillWarning?: string;
  meterFillError?: string;
  meterFillNeutral?: string;
  meterHeight?: string;
}

export interface BrandSignalCardChrome extends BrandPremiumCardChrome {
  accent?: string;
  soft?: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeColor?: string;
  sectionBg?: string;
  sectionAltBg?: string;
  topLineDisplay?: string;
}

export interface BrandListingGridChrome {
  gap?: string;
  minCardWidth?: string;
  minCompactWidth?: string;
  minTallWidth?: string;
  columns?: string;
  cardGap?: string;
  cardBg?: string;
  cardBorder?: string;
  cardShadow?: string;
  selectedRing?: string;
  emptyBg?: string;
  emptyBorder?: string;
  skeletonBg?: string;
}

/**
 * Collection list shell and preview-rail chrome.
 *
 * The collection workspace renders one list shell and one preview rail; the
 * tenant tunes the rail's material, the gutter it opens against the list, the
 * choreography of its resize, and the band that separates the toolbar row from
 * the section above it. Anatomy inside the rail belongs to the caller's own
 * render slot, so nothing here names a lane, meter or quick-action part.
 */
export interface BrandListChrome {
  /** Preview rail */
  previewRailGap?: string;
  previewPanelBg?: string;
  previewPanelBorder?: string;
  previewPanelShadow?: string;
  previewMotionDuration?: string;
  previewMotionEase?: string;
  /** List shell */
  shellSectionGap?: string;
  /**
   * Row and container paint.
   *
   * `bg`/`backgroundColor` and `itemBgHover`/`itemHoverBackgroundColor` are
   * two spellings of one decision that both ship as separate CSS names today.
   * They are declared as separate leaves because a theme that set only one of
   * them would silently leave the other on its DS floor; collapsing them is a
   * name-retirement ruling, not a contract shape.
   */
  bg?: string;
  backgroundColor?: string;
  borderColor?: string;
  itemBackgroundColor?: string;
  itemBgHover?: string;
  itemHoverBackgroundColor?: string;
  metaDescriptionColor?: string;
  secondaryTextColor?: string;
  skeletonBg?: string;
  splitColor?: string;
  textColor?: string;
}

/**
 * Detail record surface chrome.
 *
 * A detail page is a hero header over a set of section panels beside a rail.
 * The tenant owns the material of the two framed regions and the rail's resting
 * width; the caller's `sidebarWidth` prop still outranks the rail channel, and
 * the panel-level anatomy stays with the DetailPanel component.
 */
export interface BrandDetailChrome {
  /** Hero header */
  heroBg?: string;
  heroBorder?: string;
  heroShadow?: string;
  /** Accent spine drawn along the hero's leading edge. */
  heroSpine?: string;
  /** Section panels (tab panel + sidebar) */
  sectionBg?: string;
  sectionBorder?: string;
  sectionShadow?: string;
  /** Inline controls hosted by the detail hero and section headers. */
  controlBg?: string;
  controlBorder?: string;
  controlBorderHover?: string;
  /**
   * Continuous-record treatment: the hairline and surface used when hero and
   * sections read as one uninterrupted sheet rather than stacked cards.
   */
  continuousBoundary?: string;
  continuousSurface?: string;
  /** Rail */
  railWidth?: string;
}

export interface BrandModalChrome {
  bg?: string;
  color?: string;
  shadow?: string;
  /** Overlay */
  overlayBg?: string;
  overlayBackdrop?: string;
  /** Header */
  headerBg?: string;
  headerBorder?: string;
  titleColor?: string;
  subtitleColor?: string;
  /** Body */
  bodyColor?: string;
  /** Footer */
  footerBorder?: string;
  footerBg?: string;
  /** Close button */
  closeColor?: string;
  closeColorHover?: string;
  closeBgHover?: string;
}

/**
 * Tooltip visual contract shared by static vertical themes and DB appearance.
 * The component owns behavior and anatomy; tenants tune reviewed material,
 * density, geometry and motion channels only.
 */
export interface BrandTooltipChrome {
  /**
   * Tone paint, orthogonal to the recipe blocks below. A recipe
   * (`bordered`/`minimal`/`inverse`/`rich`) chooses the tooltip's material;
   * a tone chooses what it is saying. `bg`/`color` are the unqualified pair a
   * tooltip falls back to when neither axis is set.
   */
  bg?: string;
  color?: string;
  defaultBg?: string;
  defaultColor?: string;
  primaryBg?: string;
  primaryColor?: string;
  secondaryBg?: string;
  secondaryColor?: string;
  successBg?: string;
  warningBg?: string;
  errorBg?: string;
  /** Elevation shared by every tone, before a recipe overrides it. */
  shadow?: string;
  /**
   * Stacking order for the tooltip layer. Lowered to both the scale-shaped
   * name (`--ds-z-index-tooltip`) and the component-shaped one
   * (`--ds-tooltip-z-index`); they are two spellings of one decision, so the
   * contract carries a single field.
   */
  zIndex?: string | number;
  borderedBackground?: string;
  borderedForeground?: string;
  borderedBorder?: string;
  borderedBorderWidth?: string;
  borderedShadow?: string;
  borderedTexture?: string;
  borderedHighlight?: string;
  borderedRadius?: string;
  borderedMaxWidth?: string;
  borderedPaddingBlock?: string;
  borderedPaddingInline?: string;
  minimalBackground?: string;
  minimalForeground?: string;
  minimalBorder?: string;
  minimalBorderWidth?: string;
  minimalShadow?: string;
  minimalTexture?: string;
  minimalHighlight?: string;
  minimalRadius?: string;
  minimalMaxWidth?: string;
  minimalPaddingBlock?: string;
  minimalPaddingInline?: string;
  inverseBackground?: string;
  inverseForeground?: string;
  inverseBorder?: string;
  inverseBorderWidth?: string;
  inverseShadow?: string;
  inverseTexture?: string;
  inverseHighlight?: string;
  inverseRadius?: string;
  inverseMaxWidth?: string;
  inversePaddingBlock?: string;
  inversePaddingInline?: string;
  richBackground?: string;
  richForeground?: string;
  richBorder?: string;
  richBorderWidth?: string;
  richShadow?: string;
  richTexture?: string;
  richHighlight?: string;
  richRadius?: string;
  richMaxWidth?: string;
  richPaddingBlock?: string;
  richPaddingInline?: string;
  richType?: string;
  richLetterSpacing?: string;
  compactPaddingBlock?: string;
  compactPaddingInline?: string;
  compactType?: string;
  comfortablePaddingBlock?: string;
  comfortablePaddingInline?: string;
  spaciousPaddingBlock?: string;
  spaciousPaddingInline?: string;
  spaciousType?: string;
  arrowSize?: string;
  arrowHalfSize?: string;
  arrowOverlap?: string;
  viewportGap?: string;
  touchTarget?: string;
  shortcutGap?: string;
  shortcutChipGap?: string;
  shortcutKeyBackground?: string;
  shortcutKeyBorder?: string;
  shortcutKeyBorderWidth?: string;
  shortcutKeyRadius?: string;
  shortcutKeyShadow?: string;
  shortcutKeyType?: string;
  motionDistance?: string;
  motionScale?: string;
  enterDuration?: string;
  enterEasing?: string;
  exitDuration?: string;
  exitEasing?: string;
}

/**
 * Popover visual contract. It deliberately excludes positioning, focus and
 * dismissal behavior: those remain engine-owned and consistent per tenant.
 *
 * It also excludes a per-recipe `*Highlight`, which the tooltip contract does
 * expose. A popover surface carries exactly one top-light — the
 * intensity-governed zenith keyline the skin declares as a literal — and
 * OVL-PV-01 struck the family sheen that a highlight channel used to feed,
 * because a second gradient on the same surface is the stacked-decoration
 * smell both tenant directions forbid. The per-recipe decoration axis a tenant
 * does own here is `*Texture`, which drives the motif slot on all four
 * recipes; a highlight would be a redundant second one. Retuning the top-light
 * is a change to the keyline, not a new channel.
 */
export interface BrandPopoverChrome {
  /**
   * Unqualified panel paint, before a recipe block below overrides it. A skin
   * that ships one popover material sets these four and stops; the recipe
   * vocabulary stays available for skins that ship several.
   */
  bg?: string;
  border?: string;
  contentColor?: string;
  shadow?: string;
  /** Separator under the title region. Pairs with the existing `titleColor`. */
  titleBorder?: string;
  borderedBackground?: string;
  borderedForeground?: string;
  borderedMutedForeground?: string;
  borderedBorder?: string;
  borderedBorderWidth?: string;
  borderedShadow?: string;
  borderedTexture?: string;
  borderedRadius?: string;
  borderedMaxWidth?: string;
  borderedPaddingBlock?: string;
  borderedPaddingInline?: string;
  borderedTitleGap?: string;
  minimalBackground?: string;
  minimalForeground?: string;
  minimalMutedForeground?: string;
  minimalBorder?: string;
  minimalBorderWidth?: string;
  minimalShadow?: string;
  minimalTexture?: string;
  minimalRadius?: string;
  minimalMaxWidth?: string;
  minimalPaddingBlock?: string;
  minimalPaddingInline?: string;
  inverseBackground?: string;
  inverseForeground?: string;
  inverseMutedForeground?: string;
  inverseBorder?: string;
  inverseShadow?: string;
  inverseTexture?: string;
  inverseRadius?: string;
  richBackground?: string;
  richForeground?: string;
  richMutedForeground?: string;
  richBorder?: string;
  richShadow?: string;
  richTexture?: string;
  richRadius?: string;
  richMaxWidth?: string;
  richPaddingBlock?: string;
  richPaddingInline?: string;
  compactPaddingBlock?: string;
  compactPaddingInline?: string;
  compactTitleGap?: string;
  compactMaxHeight?: string;
  comfortablePaddingBlock?: string;
  comfortablePaddingInline?: string;
  spaciousPaddingBlock?: string;
  spaciousPaddingInline?: string;
  spaciousTitleGap?: string;
  minWidth?: string;
  maxWidth?: string;
  maxHeight?: string;
  bodyMaxHeight?: string;
  viewportGap?: string;
  touchTarget?: string;
  arrowSize?: string;
  titleBackground?: string;
  titleColor?: string;
  titleDivider?: string;
  titleDividerWidth?: string;
  titlePaddingBlock?: string;
  titlePaddingInline?: string;
  titleGap?: string;
  titleType?: string;
  titleLetterSpacing?: string;
  bodyType?: string;
  motionDistance?: string;
  motionScale?: string;
  enterDuration?: string;
  enterEasing?: string;
  exitDuration?: string;
  exitEasing?: string;
}

export interface BrandTabsChrome {
  /** Shared root and destination colors. */
  border?: string;
  color?: string;
  colorHover?: string;
  colorActive?: string;
  bgHover?: string;
  borderActive?: string;
  /** Recipe trays. `listBg` remains the shared fallback. */
  listBg?: string;
  underlineListBg?: string;
  containedListBg?: string;
  segmentedListBg?: string;
  pillsListBg?: string;
  underlineHoverBg?: string;
  underlineActiveBg?: string;
  underlineItemRadius?: string;
  listBorder?: string;
  listRadius?: string;
  listPadding?: string;
  listWidth?: string;
  listMaxWidth?: string;
  underlineListWidth?: string;
  listShadow?: string;
  listBlur?: string;
  /** Optional, subtle material grain. Kept separate from list paint. */
  listTexture?: string;
  listTextureOpacity?: number;
  listTextureSize?: string;
  /** Optical highlight painted inside the tray without changing its border. */
  listHighlight?: string;
  gap?: string;
  /** Destination anatomy and typography. */
  itemGap?: string;
  itemRadius?: string;
  itemMaxWidth?: string;
  itemFontFamily?: string;
  itemLineHeight?: string;
  itemLetterSpacing?: string;
  itemFontWeight?: string | number;
  itemFontWeightActive?: string | number;
  activeBg?: string;
  activeShadow?: string;
  activeTransform?: string;
  /** One-shot selection clarity layer; never a looping decoration. */
  activeHighlight?: string;
  activeHighlightOpacity?: number;
  pressedTransform?: string;
  containedActiveBg?: string;
  containedActiveShadow?: string;
  segmentedActiveBg?: string;
  segmentedActiveShadow?: string;
  pillsActiveBg?: string;
  pillsActiveColor?: string;
  pillsActiveBorder?: string;
  pillsActiveShadow?: string;
  /** Disabled destinations remain legible while clearly unavailable. */
  disabledColor?: string;
  disabledBg?: string;
  disabledOpacity?: number;
  /** Icon container. */
  iconColor?: string;
  iconBg?: string;
  iconBgActive?: string;
  iconPadding?: string;
  iconRadius?: string;
  iconShadow?: string;
  iconShadowActive?: string;
  iconTransformActive?: string;
  /** Component-owned compact badge. */
  badgeBg?: string;
  badgeColor?: string;
  badgeBorder?: string;
  badgeRadius?: string;
  badgeHeight?: string;
  badgeMinWidth?: string;
  badgePadding?: string;
  badgeFontSize?: string;
  badgeFontWeight?: string | number;
  badgeBgActive?: string;
  badgeColorActive?: string;
  badgeBorderActive?: string;
  /** Active indicator. */
  indicatorHeight?: string;
  indicatorGradient?: string;
  indicatorRadius?: string;
  indicatorShadow?: string;
  /** Tab panel framing and focus. */
  panelPadding?: string;
  panelGap?: string;
  panelBg?: string;
  panelBorder?: string;
  panelRadius?: string;
  panelShadow?: string;
  panelFocusRing?: string;
  panelTexture?: string;
  panelHighlight?: string;
  panelMotionDistance?: string;
  /** Overflow affordances and edge fades. */
  overflowControlSize?: string;
  overflowControlBg?: string;
  overflowControlColor?: string;
  overflowControlBorder?: string;
  overflowControlShadow?: string;
  overflowControlBgHover?: string;
  overflowControlShadowHover?: string;
  overflowFadeWidth?: string;
  overflowFadeColor?: string;
  mobilePadding?: string;
  mobileGap?: string;
  mobileItemMaxWidth?: string;
  /** Intent motion, independently tenant-tunable and reduced-motion safe. */
  motionDuration?: string;
  motionEasing?: string;
  activeRevealDuration?: string;
  panelMotionDuration?: string;
  panelMotionEasing?: string;
  /** Per-size control geometry. */
  smHeight?: string;
  smPadding?: string;
  smFontSize?: string;
  smIconSize?: string;
  mdHeight?: string;
  mdPadding?: string;
  mdFontSize?: string;
  mdIconSize?: string;
  lgHeight?: string;
  lgPadding?: string;
  lgFontSize?: string;
  lgIconSize?: string;
}

/** Alert banner chrome: per-intent surface, border, text and icon paint. */
export interface BrandAlertChrome {
  errorBg?: string;
  errorBorder?: string;
  errorColor?: string;
  errorIcon?: string;
  infoBg?: string;
  infoBorder?: string;
  infoColor?: string;
  infoIcon?: string;
  successBg?: string;
  successBorder?: string;
  successColor?: string;
  successIcon?: string;
  warningBg?: string;
  warningBorder?: string;
  warningColor?: string;
  warningIcon?: string;
}

/** Anchor navigation chrome: ink rail and link states. */
export interface BrandAnchorChrome {
  inkColor?: string;
  linkColor?: string;
  linkColorActive?: string;
}

/** Avatar chrome: default/semantic fills, ring, group overflow paint. */
export interface BrandAvatarChrome {
  borderColor?: string;
  defaultBg?: string;
  defaultColor?: string;
  errorBg?: string;
  errorColor?: string;
  gradientBg?: string;
  gradientColor?: string;
  groupBorder?: string;
  groupOverflowBg?: string;
  groupOverflowColor?: string;
  primaryBg?: string;
  primaryColor?: string;
  ringColor?: string;
  secondaryBg?: string;
  secondaryColor?: string;
  statusBorder?: string;
  successBg?: string;
  successColor?: string;
  warningBg?: string;
  warningColor?: string;
}

/** Back-to-top affordance chrome. */
export interface BrandBackTopChrome {
  bg?: string;
  color?: string;
  shadow?: string;
}

/** Calendar chrome: surface, border, header and out-of-month days. */
export interface BrandCalendarChrome {
  bg?: string;
  border?: string;
  dayColorOther?: string;
  headerColor?: string;
}

/** Collapse/accordion chrome: panel, header and content paint. */
export interface BrandCollapseChrome {
  bg?: string;
  border?: string;
  contentBg?: string;
  headerBg?: string;
  headerBgHover?: string;
  headerColor?: string;
}

/** Descriptions list chrome: surface, border, label and content. */
export interface BrandDescriptionsChrome {
  bg?: string;
  border?: string;
  contentColor?: string;
  labelColor?: string;
}

/** Drawer chrome: surface, header/footer rules, title and elevation. */
export interface BrandDrawerChrome {
  bg?: string;
  bodyColor?: string;
  footerBorder?: string;
  headerBorder?: string;
  shadow?: string;
  titleColor?: string;
}

/** Dropdown menu chrome: surface, elevation and item states. */
export interface BrandDropdownChrome {
  bg?: string;
  itemBgActive?: string;
  itemBgHover?: string;
  itemColor?: string;
  itemColorActive?: string;
  itemColorHover?: string;
  shadow?: string;
}

/** Empty-state chrome: illustration and description paint. */
export interface BrandEmptyChrome {
  descriptionColor?: string;
  iconColor?: string;
}

/** Float button chrome: default/primary fills and badge paint. */
export interface BrandFloatButtonChrome {
  badgeBg?: string;
  badgeColor?: string;
  defaultBg?: string;
  defaultColor?: string;
  descriptionColor?: string;
  primaryBg?: string;
  primaryColor?: string;
}

/** Live feed chrome: surface, new-item highlight and loading paint. */
export interface BrandLiveFeedChrome {
  badgeBg?: string;
  badgeColor?: string;
  bg?: string;
  border?: string;
  emptyColor?: string;
  loadMoreColor?: string;
  newBg?: string;
  newBorder?: string;
  newColor?: string;
  refreshColor?: string;
  skeletonBg?: string;
}

/** Menu chrome: surface, item states, dividers and the inverse variant. */
export interface BrandMenuChrome {
  bg?: string;
  /** The INVERSE menu variant (`--ds-menu-dark-*`), not the dark mode. Both modes author it. */
  darkBg?: string;
  darkItemColor?: string;
  dividerColor?: string;
  focusRingColor?: string;
  groupTitleColor?: string;
  itemBgActive?: string;
  itemBgHover?: string;
  itemColor?: string;
  itemColorActive?: string;
  itemColorHover?: string;
  itemDangerColor?: string;
  itemHoverBg?: string;
  itemSelectedBg?: string;
  itemSelectedColor?: string;
  submenuBg?: string;
}

/** Transient message chrome: surface, elevation and close affordance. */
export interface BrandMessageChrome {
  bg?: string;
  closeColor?: string;
  closeColorHover?: string;
  shadow?: string;
}

/** Notification chrome: surface, elevation and title paint. */
export interface BrandNotificationChrome {
  bg?: string;
  shadow?: string;
  titleColor?: string;
}

/** Pagination chrome: item states and the active page treatment. */
export interface BrandPaginationChrome {
  activeBg?: string;
  activeColor?: string;
  itemBg?: string;
  itemBgActive?: string;
  itemBgHover?: string;
  itemBorder?: string;
  itemColor?: string;
  itemColorActive?: string;
  itemColorHover?: string;
}

/** Progress chrome: track and per-intent fill paint. */
export interface BrandProgressChrome {
  bg?: string;
  fillError?: string;
  fillPrimary?: string;
  fillSuccess?: string;
  fillWarning?: string;
}

/** Result page chrome: icon, title and subtitle paint. */
export interface BrandResultChrome {
  iconColor?: string;
  subtitleColor?: string;
  titleColor?: string;
}

/** Skeleton chrome: base fill, highlight and wave gradient. */
export interface BrandSkeletonChrome {
  bg?: string;
  highlight?: string;
  waveGradient?: string;
}

/** Spinner chrome: indicator and track paint. */
export interface BrandSpinnerChrome {
  color?: string;
  track?: string;
}

/** Statistic chrome: title, value and affix paint. */
export interface BrandStatisticChrome {
  prefixColor?: string;
  suffixColor?: string;
  titleColor?: string;
  valueColor?: string;
}

/** Stats grid chrome: card variants, trend paint and skeletons. */
export interface BrandStatsGridChrome {
  cardBg?: string;
  cardBorder?: string;
  cardFilledBg?: string;
  cardGlassBg?: string;
  cardGlassBorder?: string;
  descriptionColor?: string;
  labelColor?: string;
  skeletonBg?: string;
  skeletonWaveGradient?: string;
  trendNegative?: string;
  trendNeutral?: string;
  trendPositive?: string;
  valueColor?: string;
}

/** Steps chrome: connector, and the wait/process/finish item states. */
export interface BrandStepsChrome {
  connectorColor?: string;
  connectorColorActive?: string;
  finishBg?: string;
  finishBorder?: string;
  itemBg?: string;
  itemBgActive?: string;
  itemColor?: string;
  itemColorActive?: string;
  processBg?: string;
  processBorder?: string;
  waitBg?: string;
  waitBorder?: string;
}

/** Tag chrome: default and per-intent surface, border and text paint. */
export interface BrandTagChrome {
  border?: string;
  defaultBg?: string;
  defaultBorder?: string;
  defaultColor?: string;
  errorBg?: string;
  errorBorder?: string;
  errorColor?: string;
  primaryBg?: string;
  primaryBorder?: string;
  primaryColor?: string;
  secondaryBg?: string;
  secondaryBorder?: string;
  secondaryColor?: string;
  successBg?: string;
  successBorder?: string;
  successColor?: string;
  warningBg?: string;
  warningBorder?: string;
  warningColor?: string;
}

/** Timeline chrome: rail, dot and content paint. */
export interface BrandTimelineChrome {
  contentColor?: string;
  dotBg?: string;
  dotBorder?: string;
  lineColor?: string;
}

/** Tree chrome: node states for hover and selection. */
export interface BrandTreeChrome {
  nodeBgHover?: string;
  nodeBgSelected?: string;
  nodeColor?: string;
  nodeColorSelected?: string;
}

// ── Vertical Theme ──────────────────────────────────────
// Code-owned premium identity for a vertical. Same shape as BrandTheme
// because verticals carry the deepest premium decisions. The distinction
// is ownership: VerticalTheme is code-owned, BrandTheme is the generic
// authored source shape.

/** Code-owned vertical premium identity. Same shape as BrandTheme. */
export type VerticalTheme = BrandTheme;

// ── Tenant Appearance ───────────────────────────────────
// DB-owned customization layered on top of the vertical theme.
// Split into General (safe presets) and Advanced (fine-grained).
// See docs/premium-styling-track/02-customization-model.md.

/**
 * Code-owned presentation recipes a tenant theme may select.
 *
 * A profile selects a reviewed DS presentation posture; it does not open a
 * tenant-authored CSS, component-topology, icon-glyph or motion-recipe channel.
 */
/**
 * Safe, high-signal customization for most tenant admins.
 *
 * Every field in this interface has a real runtime consumer. Fields that
 * were declared but never wired have been removed or narrowed:
 * - typography.scale and shape.radiusScale resolve through the calc()-wrapped
 *   ramp definitions (`--ds-type-scale` / `--ds-radius-scale` multipliers)
 * - motion is deliberately bounded to a semantic dial; arbitrary timing,
 *   springs, keyframes and topology remain owned by the vertical envelope
 * - media (logo/logoMark/favicon): removed (no CSS reader — re-add when
 *   sidebar/header components consume --ds-tenant-logo vars)
 * - data.chartColorFamily: removed (no chart palette system)
 */
export interface TenantAppearanceGeneral {
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    /** Clear-scheme page canvas. Advanced remains available for nested surfaces. */
    background?: string;
    /** Global reading hierarchy for ordinary tenant-authored surfaces. */
    foreground?: {
      primary?: string;
      secondary?: string;
      muted?: string;
      disabled?: string;
    };
    /** Neutral separator hierarchy; component-specific borders stay in chrome. */
    border?: {
      primary?: string;
      secondary?: string;
    };
    /**
     * Status tone seeds. VOCABULARIO CERRADO: estas cuatro y ninguna mas.
     *
     * Agrupadas en un sub-objeto y no como hermanas de `primary` por la misma
     * gramatica que ya usan `foreground` y `border`: agrupar por eje hace el
     * vocabulario cerrado VISIBLE en el tipo, de modo que una quinta clave no
     * compila en vez de descubrirse en runtime.
     *
     * `neutral` NO vive aqui y no es un olvido: no tiene semilla en ninguna via
     * (`neutral has no seed of its own and is therefore authored-only`), asi que
     * darle un dial seria una perilla que no mueve nada. Su adjudicacion subio
     * al owner; hasta que vuelva, se gobierna dentro de `palette.seeds`.
     *
     * Sin gemelo en `dark`: el modo oscuro de estas semillas es un lote propio
     * con su propio cero-delta, y `dark.status` se rechaza fail-closed.
     */
    status?: {
      success?: string;
      warning?: string;
      error?: string;
      info?: string;
    };
    /** Feeds ThemeProvider theme resolution (not a CSS variable). */
    backgroundMode?: "light" | "dark" | "auto";
    /**
     * Optional dark-scheme seeds. Under backgroundMode `auto` they enable
     * dual-ramp `light-dark()` emission; under `light`/`dark` they are inert
     * so single-mode tenants keep their deterministic single-value artifact.
     */
    dark?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      foreground?: {
        primary?: string;
        secondary?: string;
        muted?: string;
        disabled?: string;
      };
      border?: {
        primary?: string;
        secondary?: string;
      };
    };
  };
  typography?: {
    fontFamilyBase?: string;
    fontFamilyHeading?: string;
    /**
     * Compiler-owned font pairing preset applied before the free-form
     * families; explicit fontFamilyBase/Heading always win.
     */
    typePairing?: "sober" | "editorial" | "geometric" | "technical";
    /** Multiplies the font-size ramp through `--ds-type-scale`. */
    scale?: number;
  };
  shape?: {
    buttonStyle?: "sharp" | "soft" | "pill";
    /** Multiplies the radius ramp through `--ds-radius-scale`. */
    radiusScale?: number;
  };
  /** Semantic spacing mode shared by CSS and numeric useTokens consumers. */
  density?: "compact" | "normal" | "spacious";
  /**
   * Layout rhythm posture, emitted as `--ds-rhythm-scale`.
   *
   * A SECOND, orthogonal spacing axis, not a restatement of `density`:
   * density scales control SIZES, rhythm scales the space BETWEEN them. Both
   * factors can appear in one chain without double-counting, because they
   * multiply different things. Rhythm never reaches a control height or a
   * touch target, so the coarse-pointer floors hold by construction.
   *
   * Absent → `normal` (factor 1), byte-identical to today.
   */
  rhythm?: "tight" | "normal" | "airy";
  /**
   * Tenant-owned motion preference. Values are clamped by the runtime policy;
   * tenants cannot inject choreography, loops, keyframes or spring physics.
   */
  motion?: TenantMotionDial;
  surfaces?: {
    elevation?: "flat" | "soft" | "elevated";
    /**
     * Coordinated visual-detail dial consumed by every Modern material.
     * `0` produces flat operational chrome; `1` enables the full reviewed
     * gradient, glass, glow and texture layer. The tenant compiler clamps it
     * to both the global safety bounds and the owning vertical envelope.
     */
    effectIntensity?: number;
  };
  navigation?: {
    sidebarTone?: "subtle" | "strong" | "inverse";
  };
  /**
   * Governed experience-profile selection (C1b): one namespaced versioned id
   * from the closed first-party registry, e.g. `rottay/management-editorial@1`.
   * The schema closes the enum over published ids and the compilers revalidate
   * fail-closed; the value never carries CSS or profile content.
   */
  experienceProfile?: string;
}

/**
 * Pro-tier, fine-grained customization for DB-driven tenants.
 *
 * Every field maps directly to a CSS variable compiled by the appearance
 * compiler. All fields are optional and additive - tenants only set what
 * they want to override. Everything else inherits from BrandTheme or DS base.
 *
 * ~140 CSS variables exposed across all chrome categories.
 * Previously: ~20 fields. Now: full chrome parity with BrandTheme.
 */
export interface TenantAppearanceAdvanced {
  chrome?: {
    /** Full sidebar chrome (17 fields) */
    sidebar?: Partial<BrandSidebarChrome>;
    /** Layout header and sider shell chrome */
    layout?: Partial<BrandLayoutChrome>;
    /** Shell background grid (premium atmosphere effects) */
    shell?: Partial<BrandShellChrome>;
    /** Workspace/search/list toolbar chrome */
    toolbar?: Partial<BrandToolbarChrome>;
    /** Filter pill/toggle chrome used by dense list filters */
    filterPill?: Partial<BrandFilterPillChrome>;
    /** Badge / Chip / Pill microchannel chrome */
    badge?: Partial<BrandBadgeChrome>;
    /** Breadcrumb and breadcrumb-bar chrome */
    breadcrumb?: Partial<BrandBreadcrumbChrome>;
    /** Global/local search chrome */
    search?: Partial<BrandSearchChrome>;
    /** All button variants + full input chrome + disabled + focus */
    controls?: Partial<BrandControlsChrome>;
    /** Table header, row, cell, loading chrome */
    table?: Partial<BrandTableChrome>;
    /** Card component chrome (bg, border, shadow, header/body/footer) */
    cardComponent?: Partial<BrandCardChrome>;
    /** Metric/stat cards used in dashboards and command headers */
    metricCard?: Partial<BrandMetricCardChrome>;
    /** Signal/status cards used for operational insights */
    signalCard?: Partial<BrandSignalCardChrome>;
    /** Workspace cards used inside command/list/detail workspaces */
    workspaceCard?: Partial<BrandPremiumCardChrome>;
    /** Dense cards for compact lists, rails, and mobile fallbacks */
    compactCard?: Partial<BrandPremiumCardChrome>;
    /** Tall cards for rich records, summaries, and media-forward layouts */
    tallCard?: Partial<BrandPremiumCardChrome>;
    /** Collection item cards used by cards/grid view modes */
    collectionCard?: Partial<BrandPremiumCardChrome>;
    /** Listing grid chrome shared by collection cards and skeleton/empty states */
    listingGrid?: Partial<BrandListingGridChrome>;
    /** Modal/dialog chrome (bg, overlay, header/body/footer, close) */
    modal?: Partial<BrandModalChrome>;
    /** Tooltip material, geometry, density and motion chrome */
    tooltip?: Partial<BrandTooltipChrome>;
    /** Popover material, geometry, density and motion chrome */
    popover?: Partial<BrandPopoverChrome>;
    /** Tabs chrome (border, color states) */
    tabs?: Partial<BrandTabsChrome>;
    /** Alert banner chrome: per-intent surface, border, text and icon paint */
    alert?: Partial<BrandAlertChrome>;
    /** Anchor navigation chrome: ink rail and link states */
    anchor?: Partial<BrandAnchorChrome>;
    /** Avatar chrome: default/semantic fills, ring, group overflow paint */
    avatar?: Partial<BrandAvatarChrome>;
    /** Back-to-top affordance chrome */
    backTop?: Partial<BrandBackTopChrome>;
    /** Calendar chrome: surface, border, header and out-of-month days */
    calendar?: Partial<BrandCalendarChrome>;
    /** Collapse/accordion chrome: panel, header and content paint */
    collapse?: Partial<BrandCollapseChrome>;
    /** Descriptions list chrome: surface, border, label and content */
    descriptions?: Partial<BrandDescriptionsChrome>;
    /** Drawer chrome: surface, header/footer rules, title and elevation */
    drawer?: Partial<BrandDrawerChrome>;
    /** Dropdown menu chrome: surface, elevation and item states */
    dropdown?: Partial<BrandDropdownChrome>;
    /** Empty-state chrome: illustration and description paint */
    empty?: Partial<BrandEmptyChrome>;
    /** Float button chrome: default/primary fills and badge paint */
    floatButton?: Partial<BrandFloatButtonChrome>;
    /** Live feed chrome: surface, new-item highlight and loading paint */
    liveFeed?: Partial<BrandLiveFeedChrome>;
    /** Menu chrome: surface, item states, dividers and the inverse variant */
    menu?: Partial<BrandMenuChrome>;
    /** Transient message chrome: surface, elevation and close affordance */
    message?: Partial<BrandMessageChrome>;
    /** Notification chrome: surface, elevation and title paint */
    notification?: Partial<BrandNotificationChrome>;
    /** Pagination chrome: item states and the active page treatment */
    pagination?: Partial<BrandPaginationChrome>;
    /** Progress chrome: track and per-intent fill paint */
    progress?: Partial<BrandProgressChrome>;
    /** Result page chrome: icon, title and subtitle paint */
    result?: Partial<BrandResultChrome>;
    /** Skeleton chrome: base fill, highlight and wave gradient */
    skeleton?: Partial<BrandSkeletonChrome>;
    /** Spinner chrome: indicator and track paint */
    spinner?: Partial<BrandSpinnerChrome>;
    /** Statistic chrome: title, value and affix paint */
    statistic?: Partial<BrandStatisticChrome>;
    /** Stats grid chrome: card variants, trend paint and skeletons */
    statsGrid?: Partial<BrandStatsGridChrome>;
    /** Steps chrome: connector, and the wait/process/finish item states */
    steps?: Partial<BrandStepsChrome>;
    /** Tag chrome: default and per-intent surface, border and text paint */
    tag?: Partial<BrandTagChrome>;
    /** Timeline chrome: rail, dot and content paint */
    timeline?: Partial<BrandTimelineChrome>;
    /** Tree chrome: node states for hover and selection */
    tree?: Partial<BrandTreeChrome>;
  };
  /** Allowlisted raw token overrides. Keys must start with `--ds-`. Max 200. */
  tokenOverrides?: Record<`--ds-${string}`, string | number>;
  /**
   * Pro explicit per-axis expressive overrides (C1b), mirrored from the
   * document write-contract so the normalized compiler/compat shape carries
   * the same selection the artifact was compiled from.
   */
  profiles?: BrandExpressiveAxisOverrides;
  /**
   * Governed responsive-posture selection (E2), mirrored from the document
   * write-contract for the same reason as `profiles`: the adaptive runtime
   * reads the ladder id off this shape, so it must survive normalization.
   */
  responsivePosture?: string;
}

/** Combined tenant appearance (General + Advanced). */
export interface TenantAppearance {
  general?: TenantAppearanceGeneral;
  advanced?: TenantAppearanceAdvanced;
  /**
   * Governed recipe-profile selection compiled from the DB-owned appearance
   * document. The value is validated against the closed DS registry before it
   * reaches this runtime-facing shape.
   */
  recipeProfile?: string;
}
