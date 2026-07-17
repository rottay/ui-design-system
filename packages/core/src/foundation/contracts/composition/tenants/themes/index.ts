/**
 * @fileoverview Theme contracts - Rottay Design System
 * @description Runtime theming types describing loaded theme state (ThemeConfig,
 * ThemeContextValue) rather than the lower-level token catalogs.
 *
 * @module Contracts/Themes
 * @category Types
 * @package @rottay/design-system
 */

import type { EngineName } from '../../../runtime/engine';
import type { TenantMotionDial } from '../../../runtime/motion';
import type {
  SurfaceTokens,
  ChartPersonalityTokens,
  CardPersonalityTokens,
  AccentPersonalityTokens,
  PersonalityTokens,
} from '../../../kernel/tokens';
import type {
  TenantGlassTokens,
  TenantGradientTokens,
  TenantOverlayTokens,
  TenantTokenOverrides,
} from '..';

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

export interface BrandTheme {
  /** Unique identifier for this brand theme */
  id: string;
  /** Display name */
  name: string;
  /** Optional preset key to inherit defaults from (e.g. 'corporate-clean') */
  extends?: string;

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
  /** Card and accent visual chrome */
  chrome?: BrandChrome;
  /** DaisyUI variables, engine-specific values */
  engineBridge?: Partial<Record<EngineName, Record<string, unknown>>>;
}

export interface BrandPalette {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
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
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
}

export interface BrandTypography {
  fontFamilyBase?: string;
  fontFamilyHeading?: string;
  fontFamilyMono?: string;
  fontFamilyDisplay?: string;
  headingWeightBias?: 'lighter' | 'normal' | 'heavier';
  headingLetterSpacing?: string;
  labelStyle?: 'uppercase' | 'sentence' | 'capitalize';
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
  borderRadius?: Partial<Record<'sm' | 'md' | 'lg' | 'xl', string>>;
  shadows?: Partial<Record<'sm' | 'md' | 'lg' | 'xl', string>>;
  glass?: TenantGlassTokens;
  gradients?: TenantGradientTokens;
  overlays?: TenantOverlayTokens;
  densityScale?: number;
  /**
   * Premium effect-intensity dial. Emitted as `--ds-effect-intensity` and
   * multiplies the gradient/glass/glow layer (engines/modern spec section 5):
   * `1` = full Quiet Premium (DS/rottay default), `0` = flat/zero-decoration
   * (BitHire's Evidence-Ledger law). Defaults to `1` when unset.
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
  entrance?: 'none' | 'fade' | 'slideUp' | 'spring' | 'bounce';
  entranceDuration?: number;
  hoverLift?: number;
  hoverScale?: number;
  useSpring?: boolean;
  springTension?: number;
  springFriction?: number;
  pulseSpeed?: 'none' | 'slow' | 'normal' | 'fast';
  skeletonStyle?: 'pulse' | 'shimmer' | 'wave';
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
  itemFontSize?: string;
  itemFontWeight?: string | number;
  itemFontWeightActive?: string | number;
  itemColor?: string;
  itemColorActive?: string;
  itemBgActive?: string;
  itemBgHover?: string;
  itemPadding?: string;
  iconSize?: string;
  footerBg?: string;
}

export interface BrandLayoutChrome {
  bg?: string;
  headerBg?: string;
  headerBackdrop?: string;
  headerBorder?: string;
  siderBg?: string;
  siderBorder?: string;
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
  text?: string;
  border?: string;
  borderHover?: string;
  shadow?: string;
  shadowHover?: string;
}

export interface BrandControlsChrome {
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
  /** Link button chrome */
  buttonLink?: { color?: string; colorHover?: string; colorActive?: string };
  /** Success semantic button */
  buttonSuccess?: BrandButtonVariantChrome;
  /** Warning semantic button */
  buttonWarning?: BrandButtonVariantChrome;
  /** Error/danger semantic button */
  buttonError?: BrandButtonVariantChrome;
  /** Info semantic button */
  buttonInfo?: BrandButtonVariantChrome;
  /** Disabled state treatment (shared across control types) */
  disabled?: { opacity?: number; bg?: string; text?: string; border?: string; borderColor?: string };
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
  shadowFocus?: string;
  /** Filled variant */
  filled?: { bg?: string; bgHover?: string; bgFocus?: string };
  /** Addon (prefix/suffix) */
  addon?: { bg?: string; color?: string; border?: string };
  /** Label */
  label?: { color?: string };
  /** Helper text */
  helper?: { color?: string };
  /** Clear button */
  clear?: { color?: string; colorHover?: string };
  /** Validation states */
  successBorder?: string;
  successShadowFocus?: string;
  warningBorder?: string;
  warningShadowFocus?: string;
  errorBorder?: string;
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
  color?: string;
  colorMuted?: string;
  border?: string;
  borderColor?: string;
  borderHover?: string;
  borderColorHover?: string;
  borderAccentHover?: string;
  radius?: string;
  shadow?: string;
  shadowHover?: string;
  shadowElevated?: string;
  focusRing?: string;
  hoverTransform?: string;
  /** Header */
  headerBorder?: string;
  headerBorderColor?: string;
  headerBg?: string;
  headerColor?: string;
  headerPadding?: string;
  titleColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string | number;
  subtitleColor?: string;
  /** Body */
  bodyColor?: string;
  bodyPadding?: string;
  /** Footer */
  footerBorder?: string;
  footerBorderColor?: string;
  footerBg?: string;
  footerColor?: string;
  footerPadding?: string;
  /** Image */
  imagePlaceholderBg?: string;
  imagePlaceholderColor?: string;
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

export interface BrandTabsChrome {
  border?: string;
  color?: string;
  colorHover?: string;
  colorActive?: string;
  bgHover?: string;
  borderActive?: string;
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
export const TENANT_PRESENTATION_PROFILE_IDS = [
  'editorial-ledger',
  'ambient-command',
] as const;

export type TenantPresentationProfileId =
  (typeof TENANT_PRESENTATION_PROFILE_IDS)[number];

/**
 * Safe, high-signal customization for most tenant admins.
 *
 * Every field in this interface has a real runtime consumer. Fields that
 * were declared but never wired have been removed or narrowed:
 * - typography.scale: removed (needs calc() adoption across all primitives)
 * - shape.radiusScale: removed (same reason)
 * - motion is deliberately bounded to a semantic dial; arbitrary timing,
 *   springs, keyframes and topology remain owned by the vertical envelope
 * - media (logo/logoMark/favicon): removed (no CSS reader — re-add when
 *   sidebar/header components consume --ds-tenant-logo vars)
 * - data.chartColorFamily: removed (no chart palette system)
 */
export interface TenantAppearanceGeneral {
  /** Selects one code-owned, vertical-allowlisted presentation recipe. */
  presentationProfile?: TenantPresentationProfileId;
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    /** Feeds ThemeProvider theme resolution (not a CSS variable). */
    backgroundMode?: 'light' | 'dark' | 'auto';
  };
  typography?: {
    fontFamilyBase?: string;
    fontFamilyHeading?: string;
  };
  shape?: {
    buttonStyle?: 'sharp' | 'soft' | 'pill';
  };
  /** Multiplies the spacing array in useTokens(). Not a CSS variable. */
  density?: 'compact' | 'normal' | 'spacious';
  /**
   * Tenant-owned motion preference. Values are clamped by the runtime policy;
   * tenants cannot inject choreography, loops, keyframes or spring physics.
   */
  motion?: TenantMotionDial;
  surfaces?: {
    elevation?: 'flat' | 'soft' | 'elevated';
  };
  navigation?: {
    sidebarTone?: 'subtle' | 'strong' | 'inverse';
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
  baseTheme?: 'light' | 'dark';
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
}

/**
 * Brand compiler function signature.
 *
 * Both runtime (ThemeProvider) and static generation (generateTenantCss)
 * must use an implementation conforming to this signature so the merge
 * chain is consistent regardless of execution context.
 */
export type CompileBrandTheme = (input: BrandCompilerInput) => CompiledBrand;
