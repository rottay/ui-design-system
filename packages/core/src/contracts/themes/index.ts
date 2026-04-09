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
}

export interface BrandTableChrome {
  headerBg?: string;
  headerColor?: string;
  headerFontWeight?: string | number;
  headerFontSize?: string;
}

// ── Brand Compiler Contract ─────────────────────────────
// Runtime theming and static generation must share one compiler.
// The merge chain is: DS base -> vertical baseline -> BrandTheme -> generated artifacts.
// The compiler receives the resolved vertical baseline so it can layer BrandTheme on top.

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
}

/**
 * Brand compiler function signature.
 *
 * Both runtime (ThemeProvider) and static generation (generateTenantCss)
 * must use an implementation conforming to this signature so the merge
 * chain is consistent regardless of execution context.
 */
export type CompileBrandTheme = (input: BrandCompilerInput) => CompiledBrand;
