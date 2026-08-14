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

import type { TenantConfig } from '../../../../../../foundation/contracts';
import type {
  BrandExpressiveSelection,
} from '@/foundation/contracts/composition/tenants/themes';
import { FIRST_PARTY_VERTICAL_ROSTER } from '@/foundation/tokens/ts/presentation/brand-themes';

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested);
  }
  return Object.isFrozen(value) ? value : Object.freeze(value);
}

/**
 * The bounded, NON-VISUAL behavior a code-owned theme governs.
 *
 * Stripping `brandTheme` off the runtime projection is what keeps static CSS
 * the sole visual emitter, but the same field also carried three governed
 * BEHAVIOR channels that no stylesheet can express: the motion dial, the
 * root density posture, and the icon expressive posture. Stripping it
 * wholesale silently demoted every first-party vertical to its motion-profile
 * envelope default -- bithire's authored 0.55 intensity fell to calm's 0.3.
 *
 * This is deliberately NOT a `TenantConfig` field. Adding one would widen the
 * public/DB-writable contract and give a customer tenant a second, uncensused
 * behavior channel. It is instead keyed off the projection's IDENTITY, so only
 * an object this module itself produced can ever carry it, and it is narrowed
 * to exactly the fields the runtime resolvers read: `intensity` and
 * `entranceDuration` from the authored dial, plus the governed expressive
 * selection. Visual personality (`entrance`, `hoverLift`, `skeletonStyle`,
 * palette, chrome, ...) does not ride along.
 */
export interface CodeOwnedGovernedBehavior {
  /** Authored static motion inputs, narrowed to the dial the runtime resolves. */
  readonly motion?: {
    readonly intensity?: number;
    readonly entranceDuration?: number;
  };
  /** Governed expressive selection: density posture, icon posture, motion defaults. */
  readonly expressive?: BrandExpressiveSelection;
}

const CODE_OWNED_GOVERNED_BEHAVIOR = new WeakMap<object, CodeOwnedGovernedBehavior>();

function projectGovernedBehavior(
  theme: TenantConfig['brandTheme'],
): CodeOwnedGovernedBehavior | undefined {
  const intensity = theme?.motion?.intensity;
  const entranceDuration = theme?.motion?.entranceDuration;
  const expressive = theme?.expressive;
  const motion =
    intensity === undefined && entranceDuration === undefined
      ? undefined
      : {
          ...(intensity === undefined ? {} : { intensity }),
          ...(entranceDuration === undefined ? {} : { entranceDuration }),
        };
  if (motion === undefined && expressive === undefined) return undefined;
  return deepFreeze({
    ...(motion === undefined ? {} : { motion }),
    ...(expressive === undefined ? {} : { expressive }),
  }) as CodeOwnedGovernedBehavior;
}

/**
 * First-party tenants that ship with the DS.
 *
 * Each entry is a complete `TenantConfig` including full `personality` tokens.
 * The personality section drives all visual differentiation -- animation timing,
 * chart rendering, typography casing, accent decorations, and card behavior --
 * without any per-tenant branching in component code.
 */
function createKnownTenant(
  entry: (typeof FIRST_PARTY_VERTICAL_ROSTER)[number],
): TenantConfig {
  const config = deepFreeze({
    slug: entry.slug,
    name: entry.name,
    engine: entry.engine,
    vertical: entry.verticalKey,
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: { companyName: entry.name },
    brandTheme: entry.theme,
  }) as TenantConfig;
  const behavior = projectGovernedBehavior(config.brandTheme);
  if (behavior) CODE_OWNED_GOVERNED_BEHAVIOR.set(config, behavior);
  return config;
}

const KNOWN_TENANTS: Readonly<Record<string, TenantConfig>> = Object.freeze(
  Object.fromEntries(
    FIRST_PARTY_VERTICAL_ROSTER.map((entry) => [
      entry.slug,
      createKnownTenant(entry),
    ]),
  ),
);

const CODE_OWNED_TENANT_CONFIGS = new WeakSet<object>(
  Object.values(KNOWN_TENANTS),
);
const CODE_OWNED_RUNTIME_CONFIGS = new WeakMap<object, TenantConfig>();

/**
 * Proves that a config is the exact immutable object projected by this module.
 * A caller-provided object with a reserved slug is deliberately not trusted.
 */
export function isCodeOwnedTenantConfig(
  config: unknown,
): config is TenantConfig {
  return typeof config === 'object'
    && config !== null
    && CODE_OWNED_TENANT_CONFIGS.has(config);
}

/**
 * Returns the immutable, identity-only runtime projection of an exact
 * code-owned config. Static CSS remains the sole visual emitter.
 */
export function getCodeOwnedRuntimeConfig(config: TenantConfig): TenantConfig {
  if (!isCodeOwnedTenantConfig(config)) {
    throw new TypeError('[design-system] Cannot project a non-code-owned tenant config.');
  }
  const cached = CODE_OWNED_RUNTIME_CONFIGS.get(config);
  if (cached) return cached;

  const {
    branding,
    tokenOverrides: _tokenOverrides,
    appearance: _appearance,
    personality: _personality,
    brandTheme: _brandTheme,
    ...identityAndBehavior
  } = config;
  const projected = deepFreeze({
    ...identityAndBehavior,
    branding: {
      companyName: branding.companyName,
      ...(branding.logo === undefined ? {} : { logo: branding.logo }),
      ...(branding.logoMark === undefined ? {} : { logoMark: branding.logoMark }),
      ...(branding.favicon === undefined ? {} : { favicon: branding.favicon }),
    },
  }) as TenantConfig;
  CODE_OWNED_TENANT_CONFIGS.add(projected);
  CODE_OWNED_RUNTIME_CONFIGS.set(config, projected);
  // Governed behavior travels with the projection's identity, not inside it.
  const behavior = CODE_OWNED_GOVERNED_BEHAVIOR.get(config)
    ?? projectGovernedBehavior(config.brandTheme);
  if (behavior) CODE_OWNED_GOVERNED_BEHAVIOR.set(projected, behavior);
  return projected;
}

/**
 * The governed, non-visual behavior attached to an exact code-owned config or
 * its runtime projection. Returns `undefined` for every caller-provided object,
 * including one that forged a reserved slug: membership is proven by identity.
 */
export function getCodeOwnedGovernedBehavior(
  config: unknown,
): CodeOwnedGovernedBehavior | undefined {
  if (!isCodeOwnedTenantConfig(config)) return undefined;
  return CODE_OWNED_GOVERNED_BEHAVIOR.get(config as object);
}

/**
 * Slug used when no tenant is specified. Rottay is the flagship product so it
 * makes sense as the implicit default for development, Storybook, and CI.
 */
export const DEFAULT_TENANT_SLUG = 'rottay';

/**
 * Tenants whose CSS is bundled in the DS styles output.
 * This matches the foundation/tokens/css/facade/artifacts/ directories — the actual CSS bundle.
 * Used to determine whether a tenant needs runtime-generated chrome CSS
 * (unbundled tenants do, bundled tenants already have it in their CSS file).
 *
 * Every member of this set MUST have bundled CSS on disk at
 * foundation/tokens/css/facade/artifacts/<slug>/index.css; host-tenancy-boundary.test.ts asserts
 * this mechanically so the set cannot silently drift from the shipped bundle.
 */
export const BUNDLED_TENANT_SLUGS: ReadonlySet<string> = new Set(
  FIRST_PARTY_VERTICAL_ROSTER.map((entry) => entry.slug),
);

/** Check if a tenant has pre-bundled CSS in the DS styles output. */
export function isBundledTenant(slug: string): boolean {
  return BUNDLED_TENANT_SLUGS.has(slug);
}

/**
 * Looks up a first-party tenant by slug.
 *
 * Only canonical code-owned slugs resolve; display-name variants are not aliases.
 * Returns `undefined` for customer tenants that are not in the built-in set;
 * the storage facade will then fall through to static/remote sources.
 *
 * @param slug - Tenant identifier (e.g. 'rottay', 'bithire', 'evnto').
 * @returns The full TenantConfig if found, otherwise `undefined`.
 */
export function getKnownTenantConfig(slug: string): TenantConfig | undefined {
  return KNOWN_TENANTS[slug];
}

/**
 * Checks whether a tenant slug has a built-in configuration in this registry.
 *
 * @param slug - Tenant identifier to check.
 * @returns `true` if the tenant ships with the DS bundle.
 */
export function isKnownTenant(slug: string): boolean {
  return slug in KNOWN_TENANTS;
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
