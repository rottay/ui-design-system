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
import type { PersonalityTokens } from '@/foundation/contracts/kernel/tokens/personality';
import type {
  BrandExpressiveSelection,
  BrandTheme,
} from '@/foundation/contracts/composition/tenants/themes';
import { FIRST_PARTY_VERTICAL_ROSTER } from '@/foundation/tokens/ts/presentation/brand-themes';
import { brandThemeToPersonality } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/personality';
import { validateRecipeProfileSelection } from '@/foundation/tokens/ts/presentation/recipe-profiles';

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
  /**
   * The personality channels this tenant DECIDED -- names only, no values.
   *
   * A code-owned vertical's authored theme is read once, at registration, and
   * never reaches the config; the instance-override policy still has to know
   * which channels the tenant decided in order to refuse an instance selection
   * on one of them. The names travel here for the same reason the motion dial
   * does: it is a governed fact no stylesheet can express, and a list of
   * channel names is not a visual payload -- nothing here can paint.
   */
  readonly decidedChannels?: readonly string[];
  /**
   * The validated recipe-profile id this tenant's artifact compiled (D-26).
   *
   * `rottay` selects `technical-sharp` and `bithire` `network-professional`;
   * both were invisible in the product because the provider read the profile
   * only from a DB appearance, so every first-party vertical resolved `NONE`.
   * The id is a SELECTION, not paint --
   * the same id the recipes deriver publishes as its provenance channel -- so
   * it travels on the identity-keyed behavior slot beside the motion dial
   * rather than re-entering the config as a visual field.
   */
  readonly recipeProfile?: string;
}

const CODE_OWNED_GOVERNED_BEHAVIOR = new WeakMap<object, CodeOwnedGovernedBehavior>();

const PERSONALITY_DIMENSIONS = ['animation', 'typography', 'accent', 'card'] as const;

function collectDeclaredChannels(
  personality: {
    [K in (typeof PERSONALITY_DIMENSIONS)[number]]?: Partial<PersonalityTokens[K]>;
  } | undefined,
  into: Set<string>,
): void {
  if (!personality) return;
  for (const dimension of PERSONALITY_DIMENSIONS) {
    const values = personality[dimension];
    if (!values) continue;
    for (const [field, value] of Object.entries(values as Record<string, unknown>)) {
      // A BrandTheme lowering emits a whole dimension the moment one field of
      // it is authored, with the rest left `undefined`. Only a declared value
      // is a decision.
      if (value !== undefined) into.add(`${dimension}.${field}`);
    }
  }
}

/**
 * The personality channels a tenant decided, from the ONE place a decision can
 * now come from: the compile that produced the tenant's artifact.
 *
 * A `TenantConfig` carries no visual payload at all, so it declares nothing.
 * A code-owned vertical's decisions are captured at registration -- while the
 * authored BrandTheme is still in hand -- and travel on the identity-keyed
 * behavior slot; a tenant that published an artifact declares them through the
 * compiled `ThemeCompilation.runtime.personality` the mount carries, plus the
 * semantic density posture of its normalized appearance, which decides the
 * same padding channel the personality card dimension carries.
 */
export function tenantDecidedChannels(
  config: TenantConfig | undefined,
  compiled?: CompiledTenantDecisions,
): ReadonlySet<string> {
  const decided = new Set<string>();
  if (config) {
    for (const channel of getCodeOwnedGovernedBehavior(config)?.decidedChannels ?? []) {
      decided.add(channel);
    }
  }
  collectDeclaredChannels(compiled?.personality, decided);
  if (compiled?.density !== undefined) decided.add('card.paddingDensity');
  return decided;
}

/** What a mounted artifact's compile says this tenant decided. */
export interface CompiledTenantDecisions {
  /** `ThemeCompilation.runtime.personality` of the mounted artifact. */
  readonly personality?: {
    [K in (typeof PERSONALITY_DIMENSIONS)[number]]?: Partial<PersonalityTokens[K]>;
  };
  /** The artifact's normalized semantic density posture, when it compiled one. */
  readonly density?: string;
}

/** The channels an authored BrandTheme declares, read once at registration. */
function declaredChannels(theme: BrandTheme): Set<string> {
  const decided = new Set<string>();
  collectDeclaredChannels(brandThemeToPersonality(theme), decided);
  if (theme.surfaces?.density !== undefined) decided.add('card.paddingDensity');
  return decided;
}

function projectGovernedBehavior(
  theme: BrandTheme,
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
  const decidedChannels = [...declaredChannels(theme)];
  // One validation, one answer: the same validator the recipes deriver calls for
  // its provenance channel, so the JS selection and the compiled one cannot
  // disagree about which profile this tenant chose. Fail-closed by the same
  // rule -- an unknown id or a foreign schema version yields no selection.
  const selection = validateRecipeProfileSelection(
    theme?.recipes?.profile,
    theme?.recipes?.schemaVersion,
  );
  const recipeProfile = selection.ok ? selection.profile?.id : undefined;
  if (
    motion === undefined &&
    expressive === undefined &&
    recipeProfile === undefined &&
    decidedChannels.length === 0
  ) {
    return undefined;
  }
  return deepFreeze({
    ...(motion === undefined ? {} : { motion }),
    ...(expressive === undefined ? {} : { expressive }),
    ...(recipeProfile === undefined ? {} : { recipeProfile }),
    ...(decidedChannels.length === 0 ? {} : { decidedChannels }),
  }) as CodeOwnedGovernedBehavior;
}

/**
 * First-party tenants that ship with the DS.
 *
 * Each entry is an identity-only `TenantConfig`. Visual differentiation comes
 * from the vertical's authored theme, compiled once into the artifact this
 * package bundles; only the governed, non-visual half of that theme travels
 * beside the config.
 */
function createKnownTenant(
  entry: (typeof FIRST_PARTY_VERTICAL_ROSTER)[number],
): TenantConfig {
  // The authored theme is READ here and never placed on the config: a
  // `TenantConfig` carries no visual payload, and the governed, non-visual
  // half of what the theme decides travels on the identity-keyed slot below.
  const config = deepFreeze({
    slug: entry.slug,
    name: entry.name,
    vertical: entry.verticalKey,
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: { companyName: entry.name },
  }) as TenantConfig;
  const behavior = projectGovernedBehavior(entry.theme);
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
 * code-owned config.
 *
 * It DISCARDS NOTHING VISUAL, because there is nothing visual left to discard:
 * `TenantConfig` carries no `brandTheme`, `tokenOverrides`, `personality` or
 * `appearance`, so the only narrowing left is branding, reduced to identity.
 * The visual authority is the mounted artifact; static CSS remains the sole
 * emitter for a code-owned vertical.
 */
export function getCodeOwnedRuntimeConfig(config: TenantConfig): TenantConfig {
  if (!isCodeOwnedTenantConfig(config)) {
    throw new TypeError('[design-system] Cannot project a non-code-owned tenant config.');
  }
  const cached = CODE_OWNED_RUNTIME_CONFIGS.get(config);
  if (cached) return cached;

  const { branding, ...identityAndBehavior } = config;
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
  const behavior = CODE_OWNED_GOVERNED_BEHAVIOR.get(config);
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
