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

import type { EngineName } from '../../runtime/engine';
import type { ProductProfileKey } from '../../kernel/product-profile-identity';
import type { PartialPersonalityTokens, PersonalityTokens } from '../../kernel/tokens/personality';
import type { SurfaceTokens, MotionTokens } from '../../kernel/tokens';
import type { MotionProfile, VerticalKey } from '../../kernel/verticals';

// Public, data-only customization manifest. Product configurators consume
// this sanctioned contract rather than importing compiler or token internals.
export {
  FOUNDATION_AUTHORITIES,
  TENANT_CAPABILITY_REGISTRY,
  TENANT_INTERNAL_MANIFEST,
  TENANT_PRO_MANIFEST,
  TENANT_STANDARD_MANIFEST,
} from './capabilities';
export type {
  ActiveTenantCapabilityId,
  CapabilityStatus,
  CapabilityTier,
  CapabilityValueType,
  FoundationAuthorityDeclaration,
  TenantCapabilityDeclaration,
  TenantCapabilityEntry,
  TenantCapabilityId,
} from './capabilities';

/**
 * Wire-format locale vocabulary owned by the tenant DTO boundary.
 *
 * These shapes intentionally mirror the i18n subsystem without importing it:
 * contracts are lower-level persisted data, while i18n is a runtime consumer.
 * TypeScript's structural typing keeps both public surfaces compatible.
 */
type TenantSupportedLocale = 'es' | 'en' | 'pt' | 'fr' | 'ar';
type TenantTranslationDictionary = Record<string, any>;
interface TenantLocaleTranslations {
  common: TenantTranslationDictionary;
  components: TenantTranslationDictionary;
  errors: TenantTranslationDictionary;
  validation: TenantTranslationDictionary;
}

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
// via infrastructure/compilers/kernel/runtime/appearance, ThemeProvider injects vars inline, useTokens()
// reads density from appearance.general.
//
// The canonical premium source is `brandTheme` (embedded in TenantConfig).
// Legacy fields `branding`, `personality`, and `tokenOverrides` remain
// for backward compatibility.
export interface TenantConfig {
  slug: string;
  name: string;
  domain?: string;

  /**
   * A deliberate engine pin, honoured only for a bundled first-party tenant
   * rendered with no vertical in play. The vertical owns the engine; a tenant
   * arriving from the database may not set this and it will be ignored if it
   * does. See `runtime/engines/resolution.ts`, which is the only place the
   * engine is decided.
   */
  engine?: EngineName;
  theme: string;
  locale?: TenantSupportedLocale;
  fallbackLocale?: TenantSupportedLocale;

  plan: TenantPlan;
  features: string[];

  /** Tenant identity and visual branding (logos, colors, fonts).
   *  New tenants should prefer `brandTheme` for rich visual identity.
   *  `branding` remains required for backward compat; at minimum provide
   *  `companyName` and optionally logos. Color/font fields here are
   *  superseded by `brandTheme` when both are present. */
  branding: TenantBranding;

  /** @deprecated Use `brandTheme.motion` / `brandTheme.chrome` instead.
   *  Kept for backward compatibility with existing tenant configs.
   *
   *  DEEP-partial: a dimension is optional AND every field inside a present
   *  dimension is independently optional. This mirrors the shape production
   *  already consumes — `resolvePartialPersonalityCssVariables` takes
   *  `PartialPersonalityInput`, which is exactly this, and the compiler
   *  deep-merges through `mergePartialPersonality`. The former
   *  `Partial<PersonalityTokens>` demanded a COMPLETE dimension the moment a
   *  tenant declared one field of it, which no consumer requires and no tenant
   *  config ever satisfied; the type was the broken part, not the data. */
  personality?: PartialPersonalityTokens;
  /** @deprecated Use `brandTheme.surfaces` / `brandTheme.chrome.controls` instead.
   *  Kept for backward compatibility with existing tenant configs. */
  tokenOverrides?: TenantTokenOverrides;
  /** Optional tenant-owned copy overrides merged on top of DS locale dictionaries */
  customTranslations?: Partial<TenantLocaleTranslations>;

  /** Industry vertical this tenant belongs to (evnto, bithire, platform, etc.) */
  vertical?: string;
  /** Pack key used by the custom engine to resolve tenant-specific implementations */
  componentPack?: string;

  /** Embedded brand theme — the canonical premium visual source.
   *  Used by bundled first-party verticals (file-first model).
   *  DB tenants use appearance.general/advanced instead. */
  brandTheme?: import('./themes').BrandTheme;

  /** DB-owned tenant appearance (General + Advanced tiers).
   *  Layered on top of the vertical theme in the merge chain.
   *  See docs/premium-styling-track/02-customization-model.md. */
  appearance?: import('./themes').TenantAppearance;
}

/**
 * A vertical preset bundles design-system defaults for one product domain.
 * Runtime owns registration and lookup; this data-only shape stays in the
 * contract layer consumed by both providers and registries.
 */
export interface VerticalPreset {
  key: VerticalKey;
  label: string;
  description?: string;
  engine: EngineName;
  motionProfile?: MotionProfile;
  density: 'compact' | 'comfortable' | 'spacious';
  personality: PersonalityTokens;
  tokenOverrides?: TenantTokenOverrides;
  defaultProductProfile: ProductProfileKey;
  features: string[];
  surfaceDefaults: {
    listView: 'table' | 'cards';
    density: 'compact' | 'comfortable' | 'spacious';
    schedulerView?: 'month' | 'week' | 'day';
  };
  suggestedPalette?: {
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}

export interface TenantContextValue {
  config: TenantConfig;
  isLoading: boolean;
  /** Resolved vertical preset, if one was provided to DesignSystemProvider */
  vertical?: VerticalPreset;
}
