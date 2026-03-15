/**
 * Tenant Creation Utilities
 *
 * Generates a complete TenantConfig from minimal input (slug, name, primaryColor)
 * and provides runtime CSS injection for dynamic tenant creation.
 *
 * This removes the need for manual CSS file creation and registry updates
 * when onboarding new tenants.
 */

import type { TenantConfig, EngineName, TenantPlan } from '../contracts';
import type { PersonalityTokens } from '../contracts/tokens/personality';
import type { TenantTokenOverrides } from '../contracts/tenants';
import { resolvePersonalityPreset, type PersonalityPreset } from './personality-presets';

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
  /** UI engine to use */
  engine?: EngineName;
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
 * Generates a complete TenantConfig from minimal input.
 *
 * Only `slug`, `name`, and `primaryColor` are required. Everything else
 * receives sensible defaults derived from the chosen personality preset.
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
    engine = 'classic',
    personality: personalityPreset = 'neutral',
    density = 'comfortable',
    plan = 'starter',
    features = [],
    domain,
  } = config;

  const personalityTokens = resolvePersonalityPreset(personalityPreset) as PersonalityTokens;
  const { densityScale, paddingDensity } = resolveDensity(density);

  // Merge density into personality card tokens
  const mergedPersonality: Partial<PersonalityTokens> = {
    ...personalityTokens,
    card: {
      ...personalityTokens.card!,
      paddingDensity,
    },
  };

  const tokenOverrides: TenantTokenOverrides | undefined =
    densityScale !== 1.0 ? { densityScale } : undefined;

  // Apply spacious border radius for spacious density
  if (density === 'spacious' && tokenOverrides) {
    tokenOverrides.borderRadius = {
      sm: '10px',
      md: '14px',
      lg: '18px',
      xl: '24px',
    };
  }

  return {
    slug,
    name,
    domain,
    engine,
    theme: 'base',
    plan,
    features,
    branding: {
      companyName: name,
      primaryColor,
      secondaryColor,
      logo,
    },
    personality: mergedPersonality,
    tokenOverrides,
  };
}

