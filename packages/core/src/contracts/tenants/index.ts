/**
 * @fileoverview Tenant contracts - Rottay Design System
 * @description Defines the white-label boundary: TenantConfig, TenantBranding,
 * TenantPlan, token overrides, and the TenantContext value exposed by TenantProvider.
 *
 * @remarks
 * Everything that app-platform or product teams should be able to change at
 * runtime (engine, theme, branding, personality, features, locale, translations)
 * is encoded here rather than in component code. The DesignSystemProvider
 * resolves and merges tenant configuration into the runtime context.
 *
 * @module Contracts/Tenants
 * @category Types
 * @package @rottay/design-system
 */

import type { EngineName } from '../engine';
import type { PersonalityTokens } from '../tokens/personality';
import type { SurfaceTokens, MotionTokens } from '../tokens';
import type { LocaleTranslations, SupportedLocale } from '../../i18n/types';

export type TenantPlan = 'starter' | 'pro' | 'enterprise';

export interface TenantBranding {
  logo?: string;
  logoMark?: string;
  favicon?: string;
  companyName: string;
  // Light mode colors
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  // Dark mode colors
  darkPrimaryColor?: string;
  darkSecondaryColor?: string;
  darkAccentColor?: string;
  darkBackgroundColor?: string;
  // Semantic colors
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  // Fonts
  fontFamilyBase?: string;
  fontFamilyHeading?: string;
  fontFamilyMono?: string;
  fontFamilyDisplay?: string;
}

export interface TenantGlassTokens {
  blur?: string;
  background?: string;
  border?: string;
}

export interface TenantGradientTokens {
  primary?: string;
  surface?: string;
  mesh?: string;
}

export interface TenantOverlayTokens {
  light?: string;
  medium?: string;
  heavy?: string;
}

export interface TenantTokenOverrides {
  /** Surface-level structural tweaks such as border/glass usage */
  surface?: Partial<SurfaceTokens>;
  /** Motion-scale overrides layered on top of engine/profile defaults */
  motion?: Partial<MotionTokens>;
  /** Radius overrides used by branding or density presets */
  borderRadius?: Partial<Record<'sm' | 'md' | 'lg' | 'xl', string>>;
  /** Shadow overrides used by branding or density presets */
  shadows?: Partial<Record<'sm' | 'md' | 'lg' | 'xl', string>>;
  /** Global density multiplier applied to spacing-driven UI */
  densityScale?: number;
  /** Glass/morphism tokens (blur, background, border) */
  glass?: TenantGlassTokens;
  /** Gradient tokens (primary, surface, mesh) */
  gradients?: TenantGradientTokens;
  /** Overlay tokens (light, medium, heavy) */
  overlays?: TenantOverlayTokens;
}

// TenantConfig is intentionally a flat JSON-serializable object so it can be
// loaded from the remote storage API and static file loader without custom
// transformations.
//
// Visual merge chain (implemented):
//   DS base -> vertical baseline -> BrandTheme -> branding/tokenOverrides
//   -> Appearance General -> Appearance Advanced -> runtime
//
// TenantAppearance is wired: DesignSystemProvider resolves config.appearance
// via compilers/appearance, ThemeProvider injects vars inline, useTokens()
// reads density from appearance.general.
//
// The canonical premium source is `brandTheme` (or `brandThemeId` referencing
// a registered BrandTheme). Legacy fields `branding`, `personality`, and
// `tokenOverrides` remain for backward compatibility.
export interface TenantConfig {
  slug: string;
  name: string;
  domain?: string;

  engine: EngineName;
  theme: string;
  locale?: SupportedLocale;
  fallbackLocale?: SupportedLocale;

  plan: TenantPlan;
  features: string[];

  /** Tenant identity and visual branding (logos, colors, fonts).
   *  New tenants should prefer `brandTheme` for rich visual identity.
   *  `branding` remains required for backward compat; at minimum provide
   *  `companyName` and optionally logos. Color/font fields here are
   *  superseded by `brandTheme` when both are present. */
  branding: TenantBranding;

  /** @deprecated Use `brandTheme.motion` / `brandTheme.chrome` instead.
   *  Kept for backward compatibility with existing tenant configs. */
  personality?: Partial<PersonalityTokens>;
  /** @deprecated Use `brandTheme.surfaces` / `brandTheme.chrome.controls` instead.
   *  Kept for backward compatibility with existing tenant configs. */
  tokenOverrides?: TenantTokenOverrides;
  /** Optional tenant-owned copy overrides merged on top of DS locale dictionaries */
  customTranslations?: Partial<LocaleTranslations>;

  /** Industry vertical this tenant belongs to (evnto, bithire, platform, etc.) */
  vertical?: string;
  /** Pack key used by the custom engine to resolve tenant-specific implementations */
  componentPack?: string;

  /** Embedded brand theme — the canonical premium visual source.
   *  Used by bundled first-party verticals (file-first model).
   *  DB tenants use appearance.general/advanced instead. */
  brandTheme?: import('../themes').BrandTheme;

  /** DB-owned tenant appearance (General + Advanced tiers).
   *  Layered on top of the vertical theme in the merge chain.
   *  See docs/premium-styling-track/02-customization-model.md. */
  appearance?: import('../themes').TenantAppearance;
}

export interface TenantContextValue {
  config: TenantConfig;
  isLoading: boolean;
  /** Resolved vertical preset, if one was provided to DesignSystemProvider */
  vertical?: import('../../runtime/verticals/types').VerticalPreset;
}
