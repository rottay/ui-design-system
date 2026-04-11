/**
 * @fileoverview Theme contracts - Rottay Design System
 * @description Runtime theming types describing loaded theme state (ThemeConfig,
 * ThemeContextValue) rather than the lower-level token catalogs.
 *
 * @module Contracts/Themes
 * @category Types
 * @package @rottay/design-system
 */

import type { EngineName } from '../engine';
import type {
  SurfaceTokens,
  ChartPersonalityTokens,
  CardPersonalityTokens,
  AccentPersonalityTokens,
  PersonalityTokens,
} from '../tokens';
import type {
  TenantGlassTokens,
  TenantGradientTokens,
  TenantOverlayTokens,
  TenantTokenOverrides,
} from '../tenants';

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
}

export interface BrandSurfaces {
  surface?: Partial<SurfaceTokens>;
  borderRadius?: Partial<Record<'sm' | 'md' | 'lg' | 'xl', string>>;
  shadows?: Partial<Record<'sm' | 'md' | 'lg' | 'xl', string>>;
  glass?: TenantGlassTokens;
  gradients?: TenantGradientTokens;
  overlays?: TenantOverlayTokens;
  densityScale?: number;
}

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
  /** Button variant colors and shadows */
  controls?: BrandControlsChrome;
  /** Table header styling */
  table?: BrandTableChrome;
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
}

export interface BrandControlsChrome {
  /** Primary button chrome */
  buttonPrimary?: { bg?: string; bgHover?: string; text?: string; border?: string; shadow?: string };
  /** Secondary button chrome */
  buttonSecondary?: { bg?: string; bgHover?: string; text?: string; border?: string };
  /** Default button chrome */
  buttonDefault?: { bg?: string; bgHover?: string; text?: string; border?: string };
  /** Ghost button chrome */
  buttonGhost?: { bg?: string; bgHover?: string; text?: string };
  /** Input field chrome */
  input?: { bg?: string; border?: string; borderFocus?: string; shadowFocus?: string };
  /** Disabled state treatment (shared across control types) */
  disabled?: { opacity?: number; bg?: string; text?: string; border?: string };
}

export interface BrandTableChrome {
  headerBg?: string;
  headerColor?: string;
  headerFontWeight?: string | number;
  headerFontSize?: string;
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

/** Safe, high-signal customization for most tenant admins. */
export interface TenantAppearanceGeneral {
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    backgroundMode?: 'light' | 'dark' | 'auto';
  };
  typography?: {
    fontFamilyBase?: string;
    fontFamilyHeading?: string;
    scale?: 'compact' | 'normal' | 'large';
  };
  shape?: {
    radiusScale?: number;
    buttonStyle?: 'sharp' | 'soft' | 'pill';
  };
  density?: 'compact' | 'normal' | 'spacious';
  surfaces?: {
    elevation?: 'flat' | 'soft' | 'elevated';
  };
  navigation?: {
    sidebarTone?: 'subtle' | 'strong' | 'inverse';
  };
  motion?: {
    level?: 'minimal' | 'normal' | 'expressive';
  };
  media?: {
    logo?: string;
    logoMark?: string;
    favicon?: string;
  };
  // data.chartColorFamily was removed — no chart color family system exists
  // in the DS today. Re-add when a real chart palette consumer is implemented.
}

/** Expert-level, fine-grained customization for guarded use cases. */
export interface TenantAppearanceAdvanced {
  chrome?: {
    sidebar?: Partial<BrandSidebarChrome>;
    layout?: Partial<BrandLayoutChrome>;
    shell?: Partial<BrandShellChrome>;
    controls?: Partial<BrandControlsChrome>;
    table?: Partial<BrandTableChrome>;
  };
  motion?: Record<string, unknown>;
  charts?: Record<string, unknown>;
  darkMode?: Record<string, unknown>;
  /** Allowlisted raw token overrides. Keys must start with `--ds-`. */
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
// Current merge chain (implemented):
//   DS base -> vertical baseline -> BrandTheme -> tenant overrides -> artifacts
//
// Target merge chain (TenantAppearance declared but not yet wired):
//   DS base -> vertical baseline -> VerticalTheme -> Tenant Appearance General
//   -> Tenant Appearance Advanced -> runtime safety normalization -> artifacts
//
// The compiler currently operates on BrandTheme. When TenantAppearance is
// wired into the runtime (future wave), the compiler will need to resolve
// General and Advanced tiers into the same compiled output.

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
