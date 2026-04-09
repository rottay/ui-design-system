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
  card?: Partial<CardPersonalityTokens>;
  accent?: Partial<AccentPersonalityTokens>;
}

// ── Brand Compiler Contract ─────────────────────────────
// Runtime theming and static generation must share one compiler.

export interface BrandCompilerOptions {
  tenantSlug: string;
  baseTheme?: 'light' | 'dark';
}

export interface CompiledBrand {
  /** CSS variable map ready for injection */
  cssVariables: Record<string, string>;
  /** Full CSS string with tenant selectors */
  cssString: string;
  /** Resolved personality tokens for runtime merge */
  personality: Partial<PersonalityTokens>;
  /** Resolved structural token overrides for runtime merge */
  tokenOverrides: Partial<TenantTokenOverrides>;
}
