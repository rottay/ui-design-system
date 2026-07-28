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
import type {
  SurfaceTokens,
  ChartPersonalityTokens,
  CardPersonalityTokens,
  AccentPersonalityTokens,
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

export interface BrandTheme {
  /** Unique identifier for this brand theme */
  id: string;
  /** Display name */
  name: string;
  /** Optional preset key to inherit defaults from (e.g. 'corporate-clean') */
  extends?: string;

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
  /** Card and accent visual chrome */
  chrome?: BrandChrome;
  /** DaisyUI variables, engine-specific values */
  engineBridge?: Partial<Record<EngineName, Record<string, unknown>>>;
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
  darkPrimaryColor?: string;
  darkSecondaryColor?: string;
  darkAccentColor?: string;
  /**
   * The page ground in clear mode. Its dark twin is `darkBackgroundColor`.
   * Without this field a tenant cannot choose the surface its product sits
   * on, which is the most visible thing a white-label system owns.
   */
  backgroundColor?: string;
  /** The page ground in dark mode. Reaches `--ds-color-bg-primary`. */
  darkBackgroundColor?: string;
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
}

export interface BrandTypography {
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
  shadows?: Partial<Record<"sm" | "md" | "lg" | "xl", string>>;
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
}

/**
 * @deprecated Open-ended brand motion is retained for one compatibility minor
 * while bundled themes migrate. Runtime choreography now resolves through the
 * vertical MotionProfile plus the bounded TenantMotionDial; DB tenants must
 * not author springs, bounce, keyframes or loop topology.
 */
export interface BrandMotion {
  intensity?: number;
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
  /** Modal/dialog chrome */
  modal?: BrandModalChrome;
  /** Tooltip micro-overlay chrome */
  tooltip?: BrandTooltipChrome;
  /** Popover contextual-surface chrome */
  popover?: BrandPopoverChrome;
  /** Tabs chrome */
  tabs?: BrandTabsChrome;
}

export interface BrandSidebarChrome {
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
}

export interface BrandLayoutChrome {
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
  itemShadowSelected?: string;
  itemFontWeight?: string | number;
  itemFontWeightSelected?: string | number;
  focusRing?: string;
  sm?: BrandControlSizeChrome;
  md?: BrandControlSizeChrome;
  lg?: BrandControlSizeChrome;
}

export interface BrandControlsChrome {
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
  /** Input field chrome */
  input?: BrandInputChrome;
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
 */
export interface BrandPopoverChrome {
  borderedBackground?: string;
  borderedForeground?: string;
  borderedMutedForeground?: string;
  borderedBorder?: string;
  borderedBorderWidth?: string;
  borderedShadow?: string;
  borderedTexture?: string;
  borderedHighlight?: string;
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
  minimalHighlight?: string;
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
  inverseHighlight?: string;
  inverseRadius?: string;
  richBackground?: string;
  richForeground?: string;
  richMutedForeground?: string;
  richBorder?: string;
  richShadow?: string;
  richTexture?: string;
  richHighlight?: string;
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
}

/**
 * Expert-level, fine-grained customization for DB-driven tenants.
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
  };
  /** Allowlisted raw token overrides. Keys must start with `--ds-`. Max 200. */
  tokenOverrides?: Record<`--ds-${string}`, string | number>;
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

// ── Brand Compiler Contract ─────────────────────────────
// Runtime theming and static generation must share one compiler.
//
// Implemented merge chain:
//   DS base -> vertical baseline -> BrandTheme -> branding/tokenOverrides
//   -> Appearance General -> Appearance Advanced -> runtime
//
// The brand-theme compiler operates on BrandTheme. The appearance compiler
// (infrastructure/compilers/kernel/runtime/appearance/) resolves General and Advanced tiers into CSS
// custom property overrides injected by ThemeProvider. useTokens() reads
// density from appearance.general.

export interface BrandCompilerInput {
  /** The brand theme to compile */
  brandTheme: BrandTheme;
  /** Tenant slug used for CSS selector scoping (html[data-tenant='slug']) */
  tenantSlug: string;
  /** Resolved vertical baseline personality (layered before BrandTheme) */
  verticalPersonality?: Partial<PersonalityTokens>;
  /** Resolved vertical baseline token overrides (layered before BrandTheme) */
  verticalTokenOverrides?: TenantTokenOverrides;
  /** Light or dark base theme */
  baseTheme?: "light" | "dark";
}

export interface CompiledBrand {
  /** CSS variable map ready for injection (light + dark combined) */
  cssVariables: Record<string, string>;
  /** Full CSS string with tenant selectors for light, dark, and system-dark */
  cssString: string;
  /** Resolved personality tokens (vertical baseline merged with BrandTheme) */
  personality: Partial<PersonalityTokens>;
  /** Resolved structural token overrides (vertical baseline merged with BrandTheme) */
  tokenOverrides: Partial<TenantTokenOverrides>;
  /** Resolved engine-specific values (DaisyUI vars, Ant Design overrides, etc.) */
  engineBridge: Partial<Record<EngineName, Record<string, unknown>>>;
  /** Validated recipe-profile id (DS-S001); absent when none or invalid. */
  recipeProfile?: string;
  /**
   * Declared default mode, emitted as `color-scheme` on the base block. Kept
   * off `cssVariables` because it is a real CSS property, not a custom one:
   * that map is injected as inline custom properties and merged into
   * mode-specific blocks where a default-mode value would be a contradiction.
   */
  colorScheme?: "light" | "dark";
  /**
   * One entry per authored `BrandTheme.modes` overlay: the channels whose
   * value differs from the base block, and nothing else. The base block still
   * supplies every channel the mode does not restate, so a `var()` chain
   * authored once re-resolves against the mode's own ground.
   */
  modeBlocks?: readonly CompiledBrandModeBlock[];
}

/** A non-default mode's compiled delta over the base block. */
export interface CompiledBrandModeBlock {
  mode: BrandThemeMode;
  /** Only the channels this mode changes. */
  cssVariables: Record<string, string>;
  /** Always the block's own mode. */
  colorScheme: BrandThemeMode;
}

/**
 * Brand compiler function signature.
 *
 * Both runtime (ThemeProvider) and static generation (generateTenantCss)
 * must use an implementation conforming to this signature so the merge
 * chain is consistent regardless of execution context.
 */
export type CompileBrandTheme = (input: BrandCompilerInput) => CompiledBrand;
