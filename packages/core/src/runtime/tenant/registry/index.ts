/**
 * @fileoverview Known tenants registry -- first-party tenants recognized by the DS.
 * @description Three built-in vertical baselines ship with authored personality:
 * - `rottay` -- Default/flagship. Monochrome dark, matte premium, fade animations, professional IT/AI SaaS.
 * - `bithire` -- Recruiting platform. Corporate blue, subtle fade animations, structured borders.
 * - `evnto` -- Event management. Black + warm beige, minimal, clean operator aesthetic.
 *
 * Customer tenants must NOT be added here. Their published `TenantThemeConfig`
 * resolves from the owning app/tenancy database and is supplied synchronously
 * to the provider. Checked-in customer themes may exist as migration or test
 * fixtures, but never enter this automatic runtime registry.
 *
 * WHY rottay/bithire/evnto also live in the DS's bundled CSS output:
 * First-party tenants need zero-latency resolution (no API call, no static file fetch)
 * because they are used in development, Storybook, and CI. The storage facade in
 * `tenancy/storage/index.ts` checks this registry (step 3) before attempting
 * slower network-based sources (static files, remote API).
 */

import type { TenantConfig } from '../../../contracts';
import { rottayBrandTheme, bithireBrandTheme, evntoBrandTheme } from '../../../tokens';

/**
 * First-party tenants that ship with the DS.
 *
 * Each entry is a complete `TenantConfig` including full `personality` tokens.
 * The personality section drives all visual differentiation -- animation timing,
 * chart rendering, typography casing, accent decorations, and card behavior --
 * without any per-tenant branching in component code.
 */
const KNOWN_TENANTS: Readonly<Record<string, TenantConfig>> = {
  /**
   * Rottay - Default tenant
   * Professional dark IT/AI SaaS aesthetic
   * Monochrome dark, matte premium
   * References: Vercel, Linear, GitHub Dark, OpenAI
   */
  rottay: {
    slug: 'rottay',
    name: 'Rottay',
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: {
      companyName: 'Rottay',
      // Colors intentionally omitted -- defined in CSS tenant tokens
      // (tokens/css/artifacts/rottay/index.css). Runtime color scale generation
      // is skipped when branding colors are undefined, letting the CSS layer
      // control the full monochrome dark palette without inline style overrides.
      logo: undefined,
    },
    brandTheme: rottayBrandTheme,
    // personality and tokenOverrides removed — brandTheme is the canonical
    // source. The merge chain (useTokens) derives personality and structural
    // tokens from brandTheme when it is present.
  },

  /**
   * BitHire - Tech recruitment platform
   * Formal, LinkedIn-style, professional
   * Corporate blue, subtle animations, structured borders
   */
  bithire: {
    slug: 'bithire',
    name: 'BitHire',
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: {
      companyName: 'BitHire',
      // Colors intentionally omitted -- defined in CSS tenant tokens
      // (tokens/css/artifacts/bithire/index.css). The runtime should only
      // inject visual branding when an app explicitly overrides it.
      logo: undefined,
    },
    brandTheme: bithireBrandTheme,
    // personality and tokenOverrides removed — brandTheme is the canonical source.
  },

  /**
   * Evnto - Event management platform
   * Light minimal, elegant
   * Black text on white backgrounds, warm beige accents
   */
  evnto: {
    slug: 'evnto',
    name: 'Evnto',
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: {
      companyName: 'Evnto',
      // Colors intentionally omitted -- defined in CSS tenant tokens
      // (tokens/css/artifacts/evnto/index.css). The runtime should only
      // inject visual branding when an app explicitly overrides it.
      logo: undefined,
    },
    brandTheme: evntoBrandTheme,
    // personality and tokenOverrides removed — brandTheme is the canonical source.
    // evntoBrandTheme.surfaces already contains densityScale: 1.125 and borderRadius.
  },

};

/**
 * Slug used when no tenant is specified. Rottay is the flagship product so it
 * makes sense as the implicit default for development, Storybook, and CI.
 */
export const DEFAULT_TENANT_SLUG = 'rottay';

/**
 * Tenants whose CSS is bundled in the DS styles output.
 * This matches the tokens/css/artifacts/ directories — the actual CSS bundle.
 * Used to determine whether a tenant needs runtime-generated chrome CSS
 * (unbundled tenants do, bundled tenants already have it in their CSS file).
 *
 * Every member of this set MUST have bundled CSS on disk at
 * tokens/css/artifacts/<slug>/index.css; host-tenancy-boundary.test.ts asserts
 * this mechanically so the set cannot silently drift from the shipped bundle.
 */
export const BUNDLED_TENANT_SLUGS: ReadonlySet<string> = new Set([
  'rottay',
  'bithire',
  'evnto',
]);

/** Check if a tenant has pre-bundled CSS in the DS styles output. */
export function isBundledTenant(slug: string): boolean {
  return BUNDLED_TENANT_SLUGS.has(slug.toLowerCase());
}

/**
 * Looks up a first-party tenant by slug.
 *
 * Slugs are case-insensitive -- the registry normalizes to lowercase internally.
 * Returns `undefined` for customer tenants that are not in the built-in set;
 * the storage facade will then fall through to static/remote sources.
 *
 * @param slug - Tenant identifier (e.g. 'rottay', 'bithire', 'evnto').
 * @returns The full TenantConfig if found, otherwise `undefined`.
 */
export function getKnownTenantConfig(slug: string): TenantConfig | undefined {
  return KNOWN_TENANTS[slug.toLowerCase()];
}

/**
 * Checks whether a tenant slug has a built-in configuration in this registry.
 *
 * @param slug - Tenant identifier to check.
 * @returns `true` if the tenant ships with the DS bundle.
 */
export function isKnownTenant(slug: string): boolean {
  return slug.toLowerCase() in KNOWN_TENANTS;
}

/**
 * Returns an array of all first-party tenant slugs registered in the DS.
 * Useful for build-time asset generation and Storybook tenant selectors.
 *
 * @returns Array of slug strings (e.g. `['rottay', 'bithire', 'evnto']`).
 */
export function getKnownTenantSlugs(): string[] {
  return Object.keys(KNOWN_TENANTS);
}

/**
 * Returns the default tenant configuration for a given vertical.
 * When `vertical` matches a known tenant slug (e.g. 'bithire', 'evnto'),
 * that tenant's config is returned instead of Rottay. This way app-specific
 * fallbacks get their own branding rather than always falling back to Rottay.
 *
 * @param vertical - Optional vertical/app identifier (e.g. 'bithire').
 * @returns The matching TenantConfig, or Rottay if no vertical is specified
 *          or the vertical is not a known tenant.
 */
export function getDefaultTenant(vertical?: string): TenantConfig {
  if (vertical && KNOWN_TENANTS[vertical]) {
    return KNOWN_TENANTS[vertical];
  }
  return KNOWN_TENANTS[DEFAULT_TENANT_SLUG];
}
