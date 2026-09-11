/**
 * @fileoverview Tenant authoring utilities.
 * @description Projects one minimal authoring draft (slug, name, primaryColor)
 * into the two things an onboarding flow needs and which are deliberately NOT
 * the same object: the tenant's IDENTITY (`createTenantConfig`) and its VISUAL
 * SOURCE (`createTenantBrandTheme`). A `TenantConfig` carries no paint, so the
 * personality preset and density posture a draft chooses are projected onto the
 * BrandTheme the compiler lowers -- never back onto the config.
 */

import type { TenantConfig, TenantPlan } from '../../../../../../foundation/contracts';
import type { PersonalityTokens } from '../../../../../../foundation/contracts/kernel/tokens/personality';
import type {
  BrandChrome,
  BrandSurfaces,
  BrandTheme,
  BrandTypography,
} from '../../../../../../foundation/contracts/composition/tenants/themes';
import { assertTenantIdentityAllowed } from '@/foundation/tokens/ts/presentation/brand-themes';
import {
  resolvePersonalityPreset,
  type PersonalityPreset,
} from '../../../foundation/personality/presets';

export interface TenantCreationConfig {
  /** Unique slug identifier for the tenant */
  slug: string;
  /** Display name of the tenant */
  name: string;
  /** Primary brand color in hex format (e.g. '#3B82F6') */
  primaryColor: string;
  /** Optional secondary brand color in hex */
  secondaryColor?: string;
  /** Optional logo URL */
  logo?: string;
  /** Personality preset for quick visual identity */
  personality?: PersonalityPreset;
  /** Layout density */
  density?: 'compact' | 'comfortable' | 'spacious';
  /** Subscription plan */
  plan?: TenantPlan;
  /** Feature flags */
  features?: string[];
  /** Custom domain */
  domain?: string;
  /** Optional vertical preset key used by the app/platform layer */
  vertical?: string;
  /** Optional custom component pack for the custom engine */
  componentPack?: string;
}

/**
 * Maps a density keyword to a densityScale multiplier and corresponding
 * card padding personality override.
 */
function resolveDensity(
  density: 'compact' | 'comfortable' | 'spacious'
): {
  densityScale: number;
  paddingDensity: 'compact' | 'normal' | 'spacious';
} {
  switch (density) {
    case 'compact':
      return { densityScale: 0.95, paddingDensity: 'compact' };
    case 'spacious':
      return { densityScale: 1.1, paddingDensity: 'spacious' };
    default:
      return { densityScale: 1.0, paddingDensity: 'normal' };
  }
}

/**
 * Generates the tenant's IDENTITY from minimal input.
 *
 * Only `slug`, `name`, and `primaryColor` are required. The result carries no
 * visual payload beyond the bounded branding seeds: the preset and density a
 * draft chooses become the BrandTheme `createTenantBrandTheme` builds from the
 * same input, which is what the compiler lowers.
 *
 * @example
 * ```ts
 * const config = createTenantConfig({
 *   slug: 'acme',
 *   name: 'ACME Corp',
 *   primaryColor: '#3B82F6',
 *   personality: 'formal',
 * });
 * ```
 */
export function createTenantConfig(config: TenantCreationConfig): TenantConfig {
  const {
    slug,
    name,
    primaryColor,
    secondaryColor,
    logo,
    plan = 'starter',
    features = [],
    domain,
    vertical,
    componentPack,
  } = config;

  assertTenantIdentityAllowed({
    slug,
    name,
    companyName: name,
    verticalKey: vertical,
  });

  return {
    slug,
    name,
    domain,
    theme: 'base',
    plan,
    features,
    branding: {
      companyName: name,
      primaryColor,
      secondaryColor,
      logo,
    },
    vertical,
    componentPack,
  };
}

/**
 * Generates the tenant's VISUAL SOURCE from the same minimal input.
 *
 * This is the half a compiler accepts. The personality preset lands on the
 * BrandTheme channels `brandThemeToPersonality` reads back -- `typography`,
 * `motion`, `chrome.card`, `chrome.accent` -- and density lands on `surfaces`,
 * so one draft produces one theme and the lowering stays the only place a
 * value becomes paint.
 */
export function createTenantBrandTheme(config: TenantCreationConfig): BrandTheme {
  const {
    slug,
    name,
    primaryColor,
    secondaryColor,
    personality: personalityPreset = 'neutral',
    density = 'comfortable',
  } = config;

  const personalityTokens = resolvePersonalityPreset(personalityPreset) as PersonalityTokens;
  const { densityScale, paddingDensity } = resolveDensity(density);

  const typography: BrandTypography = { ...personalityTokens.typography };
  const chrome: BrandChrome = {
    card: { ...personalityTokens.card, paddingDensity },
    accent: { ...personalityTokens.accent },
  };

  // Density scale is only stated when it differs from the 1.0 baseline, so the
  // generated theme stays minimal and the engine's own scale applies otherwise.
  // Spacious layouts read better when radius scales with density, so that pair
  // travels together rather than being wired by every caller.
  const surfaces: BrandSurfaces = {
    ...(densityScale === 1.0 ? {} : { densityScale }),
    ...(density === 'spacious'
      ? { borderRadius: { sm: '10px', md: '14px', lg: '18px', xl: '24px' } }
      : {}),
  };

  return {
    id: slug,
    name,
    palette: {
      primaryColor,
      ...(secondaryColor ? { secondaryColor } : {}),
    },
    typography,
    motion: { ...personalityTokens.animation },
    chrome,
    ...(Object.keys(surfaces).length > 0 ? { surfaces } : {}),
  };
}
