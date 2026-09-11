/**
 * @fileoverview Tenant contracts - Rottay Design System
 * @description Defines the white-label boundary: TenantConfig, TenantBranding,
 * TenantPlan, token overrides, and the TenantContext value exposed by TenantProvider.
 *
 * @remarks
 * Everything that the Rottay app or product teams should be able to change at
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
import type { PersonalityTokens } from '../../kernel/tokens/personality';
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

/**
 * Tenant IDENTITY, bounded branding, and a reference to the artifact that
 * paints it. Never a visual payload.
 *
 * WHAT IT NO LONGER CARRIES, and why. `brandTheme`, `tokenOverrides`,
 * `personality`, `appearance` and `engine` were removed: each was a second
 * authority over a question the compiled artifact already answers. Visual
 * identity is lowered ONCE -- `Theme -> compileTheme -> artifact` -- and
 * reaches the runtime as that artifact's CSS plus its
 * `ThemeCompilation.runtime`; the engine is the vertical roster's.
 *
 * HOW A TENANT REFERENCES ITS ARTIFACT. By identity: `slug` and `vertical` are
 * the keys the compiled artifact is published and admitted under
 * (`TenantThemeArtifact.slug` / `.verticalKey`), which is what
 * `resolveVisualAuthority` matches a mount against. The artifact's own compiled
 * read-model travels BESIDE this config, on `TenantContextValue.appearance`,
 * rather than inside it.
 *
 * It stays a flat JSON-serializable object so it can be loaded from the remote
 * storage API and the static file loader without custom transformations.
 */
export interface TenantConfig {
  slug: string;
  name: string;
  domain?: string;

  theme: string;
  locale?: TenantSupportedLocale;
  fallbackLocale?: TenantSupportedLocale;

  plan: TenantPlan;
  features: string[];

  /**
   * Bounded tenant branding: company name, logos, and the seed colours/fonts a
   * transport may carry. The compiled artifact is what PAINTS them; a runtime
   * projection reduces this to identity (`companyName` and the three logo
   * fields) before any component sees it.
   */
  branding: TenantBranding;

  /** Optional tenant-owned copy overrides merged on top of DS locale dictionaries */
  customTranslations?: Partial<TenantLocaleTranslations>;

  /** Industry vertical this tenant belongs to (evnto, bithire, platform, etc.) */
  vertical?: string;
  /** Pack key used by the custom engine to resolve tenant-specific implementations */
  componentPack?: string;
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
  // A `suggestedPalette` field lived here and was authored by all three
  // first-party presets with seeds that contradicted every shipped BrandTheme.
  // It is removed rather than corrected: a second place to author brand colour
  // is the defect, and leaving the slot open invites the next author to refill
  // it. Colour belongs to the BrandTheme source.
}

export interface TenantContextValue {
  config: TenantConfig;
  isLoading: boolean;
  /** Resolved vertical preset, if one was provided to DesignSystemProvider */
  vertical?: VerticalPreset;
  /**
   * The mounted artifact's own normalized appearance, published beside the
   * config instead of folded into it. It is a COMPILED read-model -- density
   * posture, background mode, responsive posture, recipe profile -- never an
   * authoring channel, and it is absent when no artifact is mounted.
   */
  appearance?: import('./themes').TenantAppearance;
}
