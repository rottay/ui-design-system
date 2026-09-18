/**
 * @fileoverview Tenant authoring utilities.
 * @description Projects one minimal draft (slug, name, primaryColor) into the
 * two things an onboarding flow needs and which are deliberately NOT the same
 * object: the tenant's IDENTITY (`createTenantConfig`) and its VISUAL SOURCE
 * (`createTenantTheme`). A `TenantConfig` carries no paint, so a draft's
 * personality preset and density posture land on the theme the compiler lowers,
 * never back on the config.
 */

import type { TenantConfig, TenantPlan } from '../../../../../../foundation/contracts';
import type { PersonalityTokens } from '../../../../../../foundation/contracts/kernel/tokens/personality';
import type {
  BrandChrome,
  BrandSurfaces,
  FlatTheme,
  BrandTypography,
} from '../../../../../../foundation/contracts/composition/tenants/themes';
import type { Theme } from '../../../../../../foundation/contracts/composition/tenants/themes/iso';
import { assertTenantIdentityAllowed } from '@/foundation/presets/verticals/roster';
import { governedTenantTheme } from '@/infrastructure/compilers/runtime/theme';
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
 * Only `slug`, `name`, and `primaryColor` are required. It carries no visual
 * payload beyond the bounded branding seeds.
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
 * Generates the tenant's VISUAL SOURCE from the same input, as the governed
 * `Theme` the compile door takes.
 *
 * The preset lands on the channels the lowering's read view reports back, and
 * density on `surfaces`, so one draft produces one theme. The bounded values are
 * assembled in the flat vocabulary the intake's lift DECLARES as its input and
 * lifted once through the ingress: a `Theme` assembled field by field here would
 * be a second interpretation of the same bounded set. The flat value therefore
 * never leaves this function -- it is the lift's argument, not a transport.
 */
export function createTenantTheme(config: TenantCreationConfig): Theme {
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

  // Stated only when it differs from the 1.0 baseline, so the engine's own
  // scale applies otherwise. Spacious layouts read better when radius scales
  // with density, so that pair travels together.
  const surfaces: BrandSurfaces = {
    ...(densityScale === 1.0 ? {} : { densityScale }),
    ...(density === 'spacious'
      ? { borderRadius: { sm: '10px', md: '14px', lg: '18px', xl: '24px' } }
      : {}),
  };

  const flat: FlatTheme = {
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
  return governedTenantTheme(flat);
}
