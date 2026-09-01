'use client';

/**
 * @fileoverview DesignSystemProvider - Rottay Design System
 * @description The root provider that composes all system providers into a single,
 * easy-to-use wrapper for multi-engine, multi-tenant React applications.
 *
 * @remarks
 * The DesignSystemProvider is the recommended entry point that automatically
 * configures and composes:
 *
 * - **TenantProvider**: Tenant configuration and branding
 * - **EngineProvider**: UI rendering engine selection
 * - **ThemeProvider**: Theme variants and CSS tokens
 * - **FeatureProvider**: Feature flag management
 *
 * It handles async tenant resolution and provides loading states.
 *
 * @example Minimal setup
 * ```tsx
 * import { DesignSystemProvider } from '@rottay/design-system';
 *
 * function App() {
 *   return (
 *     <DesignSystemProvider>
 *       <YourApplication />
 *     </DesignSystemProvider>
 *   );
 * }
 * ```
 *
 * @example With explicit tenant config
 * ```tsx
 * const tenantConfig = {
 *   slug: 'acme',
 *   name: 'ACME Corp',
 *   theme: 'dark',
 *   plan: 'enterprise',
 *   features: ['advanced-analytics', 'export'],
 *   branding: { companyName: 'ACME', primaryColor: '#FF5500' },
 * };
 *
 * <DesignSystemProvider tenantConfig={tenantConfig}>
 *   <App />
 * </DesignSystemProvider>
 * ```
 *
 * @example With forced overrides
 * ```tsx
 * <DesignSystemProvider
 *   tenantConfig={config}
 *   forceEngine="modern"
 *   forceTheme="light"
 * >
 *   <App />
 * </DesignSystemProvider>
 * ```
 *
 * @example With callbacks
 * ```tsx
 * <DesignSystemProvider
 *   onTenantResolved={(tenant) => analytics.identify(tenant.slug)}
 *   onError={(error) => errorTracker.capture(error)}
 * >
 *   <App />
 * </DesignSystemProvider>
 * ```
 *
 * @see {@link TenantProvider} - Tenant configuration
 * @see {@link EngineProvider} - Engine selection
 * @see {@link ThemeProvider} - Theme management
 * @see {@link FeatureProvider} - Feature flags
 * @module System/Providers/Root
 * @category System
 * @package @rottay/design-system
 */

import React, {
  ReactNode,
  useState,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useMemo,
  useSyncExternalStore,
  memo,
} from 'react';
import { EngineProvider } from '../../../../engines/composition/react/provider';
import { ThemeProvider } from '../../../../theming';
import type {
  PreparedTenantThemeArtifactClaim,
  VisualAuthorityDeclaration,
} from '../../../../theming';
import {
  censusRuntimeVisualPayload,
  prepareMountedTenantThemeArtifactClaim,
  reportVisualAuthorityConflict,
  resolveVisualAuthority,
} from '../../../../theming';
import {
  TenantProvider,
  assertProviderTenantConfig,
} from '../../../../tenant/composition/react/provider';
import { ProductProfileProvider } from '../../../../product-profiles/composition/react/provider';
import { FeatureProvider } from '../../../../features';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { toSupportedLocale } from '@/foundation/i18n/runtime/resolution';
import type {
  EngineName,
  MotionProfile,
  ProductProfile,
  ProductProfileKey,
  TenantConfig,
  TenantMotionDial,
  VerticalKey,
  VerticalPreset,
} from '../../../../../../foundation/contracts';
import type {
  LocaleTranslations,
  SupportedLocale,
} from '@/foundation/i18n/kernel/contracts';
import { getVerticalPreset } from '@/foundation/presets/verticals';
import {
  getTenantConfig as resolveTenantConfig,
  DEFAULT_TENANT_SLUG,
} from '../../../../tenant/runtime/store';
import {
  getCodeOwnedGovernedBehavior,
  getCodeOwnedRuntimeConfig,
  isCodeOwnedTenantConfig,
  type CodeOwnedGovernedBehavior,
} from '../../../../tenant/foundation/configuration/registry';
import { ReservedTenantIdentityError } from '@/foundation/tokens/ts/presentation/brand-themes';
import { getUnresolvedTenantConfig } from '../../../../tenant/foundation/configuration/defaults';
import { SystemCssVariablesBridge } from '@/infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge';
import { ResponsiveProvider } from '../../../../responsive';
import { MotionProvider } from '../../../../motion';
import { AntdConfigProvider } from '../../../../engines/presentation/adapters/antd';
import { resolveEngine } from '../../../../engines/runtime/resolution';
import { CommandRegistryProvider } from '../../../../application/commands';
import {
  RecipeProfileProvider,
  RECIPE_PROFILE_SCHEMA_VERSION,
} from '../../../../foundation/recipes/profiles';
import {
  RootDensityProvider,
  deriveDensityPosture,
} from '../../../../foundation/density';
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from '@/foundation/tokens/ts/presentation/expressive-profiles';
import { expandExpressiveProfiles } from '@/foundation/tokens/ts/presentation/expressive-profiles/expansion';
import { IconExpressiveProfileContext } from '@/infrastructure/runtime/foundation/icons/active-profile/foundation/read';
import { resolveActiveIconExpressiveProfile } from '@/infrastructure/runtime/foundation/icons/active-profile/runtime/resolution';

export interface DesignSystemProviderProps {
  children: ReactNode;
  /**
   * Tenant slug to resolve config from registry/API.
   * Use this when you want the design system to handle config resolution.
   * An unresolved slug retains its own identity with generic DS defaults.
   */
  tenantSlug?: string | null;
  /**
   * Provide tenant config directly (standalone mode).
   * Takes precedence over tenantSlug if both are provided.
   */
  tenantConfig?: TenantConfig;
  /**
   * Selects the owner of each tenant visual channel.
   *
   * Prefer the typed declaration. `{ authority: 'compiled-artifact', artifact }`
   * carries the artifact's coverage and compiled appearance, so the provider
   * suppresses exactly the channels the artifact owns, recognises its own
   * compiled appearance echoed back through the config, and leaves uncovered
   * channels (personality) to their subordinate emitters.
   *
   * The declaration is EVIDENCE, not a switch, so there is no string form.
   * `'compiled-artifact'` as a bare string used to mean "trust me, it is
   * mounted"; it now resolves as `invalid-declaration` and the provider blocks,
   * because a string carries neither the coverage to suppress nor the bytes to
   * verify. `{ authority: 'provider' }` is the explicit context-only escape
   * hatch and is refused if the config still carries runtime visual payload.
   *
   * Omitting the prop is the honest default for a tenant with no visual
   * payload. It is NOT a way to skip the proof: a config carrying branding
   * colors, tokenOverrides, appearance, personality or brandTheme with no
   * declaration resolves `uncompiled-visual-payload` and blocks as well.
   */
  visualAuthority?: VisualAuthorityDeclaration;
  /**
   * Runtime tenant overrides applied on top of the resolved tenant.
   *
   * The prop has TWO lanes, and the split is a contract, not an optimization.
   *
   * BEHAVIOR lane — exactly `locale`, `fallbackLocale`, `customTranslations`,
   * `features` and `theme`. None of these is paint: they select a dictionary, a
   * capability set, or a light/dark/auto MODE. They are delivered at the read
   * sites that consume them (I18nProvider, FeatureProvider, ThemeProvider) and
   * are NEVER folded into the published `TenantConfig`. A behavior-only
   * override therefore publishes the SAME object it received — the exact
   * code-owned instance keeps its registry identity, its governed motion dial
   * and its `isCodeOwnedTenantConfig` membership. `theme` lands in the
   * `explicitTenantTheme` slot, under `forceTheme`, and passes the same
   * light/dark/auto validation the config's own `theme` passes; it can never
   * introduce a raw token.
   *
   * VISUAL/IDENTITY lane — every other key (`branding`, `tokenOverrides`,
   * `personality`, `brandTheme`, `appearance`, `slug`, ...). Supplying any of
   * them REBUILDS the config, which is exactly what makes it visible to the
   * runtime visual census and to the reserved-identity assert. That is the
   * intended outcome, not a regression: an app that wants to paint must publish
   * a compiled artifact, and an app that touches a code-owned tenant gets a
   * `ReservedTenantIdentityError`.
   *
   * The rebuild is key-conditional and transparent: a section absent from the
   * override is never fabricated, and a key present in the override is never
   * pruned. `tokenOverrides: {}` stays `{}` — zero census keys, so it mounts —
   * instead of expanding into seven empty sections that the census would read
   * as a real visual payload.
   */
  tenantOverrides?: Partial<TenantConfig>;
  /**
   * Product profile that sits between engine defaults and tenant overrides.
   *
   * The provider accepts either a registered key or an inline object so teams
   * can move fast locally without turning the DS into a bottleneck.
   */
  productProfile?: ProductProfileKey | ProductProfile;
  /**
   * Industry vertical preset.
   *
   * Accepts a registered vertical key (e.g., 'evnto', 'bithire', 'rottay')
   * or an inline VerticalPreset object. When provided, the vertical's engine
   * is used as the default (unless forceEngine overrides it) and the vertical's
   * defaultProductProfile is used when no explicit productProfile is given.
   *
   * The vertical personality is merged into the personality chain between
   * DEFAULT_PERSONALITY and the product profile personality.
   */
  vertical?: VerticalKey | VerticalPreset;
  /** Force a specific engine */
  forceEngine?: EngineName;
  /** Force a specific theme */
  forceTheme?: string;
  /** Force a specific locale on top of tenant defaults */
  locale?: SupportedLocale;
  /** Locale used when a key is missing in the active locale */
  fallbackLocale?: SupportedLocale;
  /** App-level translation overrides merged with tenant translations */
  customTranslations?: Partial<LocaleTranslations>;
  /** Callback when locale changes */
  onLocaleChange?: (locale: SupportedLocale) => void;
  /** Callback when tenant is resolved */
  onTenantResolved?: (tenant: TenantConfig) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /**
   * Skip loading individual tenant CSS files.
   * Defaults to true - assumes you import @rottay/design-system/styles in your app.
   * Set to false if you want to load tenant CSS dynamically from a URL.
   */
  skipCssLoading?: boolean;
  /** Base URL for tenant CSS files (only used when skipCssLoading=false) */
  cssBaseUrl?: string;
}

/**
 * Simple loading component - minimal to avoid SSR issues
 */
const LoadingScreen: React.FC = () => null;

// Stable identities for the no-artifact case. useSyncExternalStore resubscribes
// whenever the subscribe function changes, so these must not be inline.
const NO_RETENTION_SUBSCRIPTION = (): (() => void) => () => {};
const NO_RETENTION_REVOCATION = (): string | null => null;

/**
 * PHASE ONE. Arm the retained-artifact watch, from a commit, before anything
 * below it exists.
 *
 * `useInsertionEffect` is the earliest committed moment React offers: it runs
 * in the mutation phase, ahead of every descendant's insertion effect, every
 * layout effect in the tree, and the paint. Arming here closes the window a
 * descendant would otherwise have to touch the artifact unobserved, rather
 * than narrowing it.
 *
 * It is a COMMITTED moment, which is the other half of the reason. Arming
 * during render looked equivalent and was not: React abandons renders, and an
 * abandoned arm leaves an observer and a permanent ledger entry that no
 * cleanup will ever reach. The claim's `commit` hands back the release for
 * exactly the hold it took, so React's own cleanup contract does the rest.
 *
 * The sentinel renders nothing. It is a position in the tree, and the position
 * is the point.
 */
function RetainedArtifactArm({
  claim,
}: {
  claim: PreparedTenantThemeArtifactClaim;
}): null {
  useInsertionEffect(() => claim.commit(), [claim]);
  return null;
}

/**
 * PHASE TWO. Settle the verdict after the whole subtree has run, before paint.
 *
 * A `MutationObserver` reports in a microtask, and a React commit yields none:
 * the mutation phase, every layout effect and the browser's paint are one task.
 * So a descendant can detach the artifact in its layout effect, restore it, and
 * have the frame painted from a document the runtime is still vouching for --
 * with the observer's records still sitting in a queue nobody has read.
 *
 * As the LAST child of the provider's own output, this sentinel's layout effect
 * runs after every descendant's and before the provider's own hooks. It drains
 * those records and re-audits the admitted node; the provider's store check --
 * a parent layout effect, running immediately after this one -- sees the new
 * verdict and re-renders synchronously into the block. No frame in between.
 *
 * THE EXACT REACH OF THIS SENTINEL, because an overstated law is worse than a
 * narrow one. It runs in every commit the provider is PART OF: the mount, the
 * provider's own updates, a StrictMode replay. A descendant that updates its
 * own state commits without re-rendering the provider, and React runs only that
 * subtree's effects -- this sentinel is not in that commit and does not fire.
 * Nothing can change that; a component React did not render has no effect to
 * run.
 *
 * That case is not uncovered, it is covered by the other half of the mechanism
 * and one step later. The observer armed at mount is persistent and still
 * judging; its records arrive in a microtask, and the store change that follows
 * schedules React's sync lane in another. Both drain at the checkpoint that
 * ends the task, and the event loop reaches its rendering step only after that
 * checkpoint -- so the tampered frame still never paints. What the seal adds,
 * and adds only here, is that the verdict is settled BEFORE CONTROL RETURNS,
 * with no reliance on that ordering at all.
 */
function RetainedArtifactSeal({
  claim,
}: {
  claim: PreparedTenantThemeArtifactClaim;
}): null {
  // Deliberately dependency-free: every commit is a fresh opportunity for a
  // descendant to have touched the artifact, so every commit is sealed.
  useLayoutEffect(() => { claim.seal(); });
  return null;
}

const LEGACY_PROFILE_DURATION_MS: Readonly<Record<MotionProfile, number>> = {
  precise: 180,
  calm: 200,
  expressive: 350,
};

/**
 * The static expressive selection for a config.
 *
 * A code-owned config reaches the runtime as an identity-only projection with
 * `brandTheme` stripped, so its governed selection arrives through
 * `governed` -- the bounded, non-visual slice the registry keeps keyed to the
 * projection's identity. Nothing else changes: the selection is the same
 * object the theme authored, resolved by the same fail-closed registry.
 */
function resolveStaticExpressiveDefaults(
  config: TenantConfig | null,
  governed?: CodeOwnedGovernedBehavior,
) {
  const selection = governed?.expressive ?? config?.brandTheme?.expressive;
  if (!selection) return undefined;
  return expandExpressiveProfiles(
    resolveExpressiveAxes(
      selection.experienceProfile,
      sanitizeExpressiveOverrides(selection.profiles),
      selection.schemaVersion,
    ),
  ).fieldDefaults;
}

/**
 * One-minor compatibility bridge from the old open-ended BrandMotion shape to
 * the bounded tenant dial. New DB configs write appearance.general.motion.
 */
function resolveTenantMotionDial(
  config: TenantConfig | null,
  profile: MotionProfile,
  governed?: CodeOwnedGovernedBehavior,
): TenantMotionDial | undefined {
  if (!config) return undefined;

  const explicit = config.appearance?.general?.motion;
  const legacy = governed?.motion ?? config.brandTheme?.motion;
  const legacyDurationScale = config.tokenOverrides?.motion?.durationScale;
  const expressive = resolveStaticExpressiveDefaults(config, governed)?.motion;
  if (!explicit && !legacy && legacyDurationScale === undefined && !expressive) {
    return undefined;
  }

  const derivedDurationScale = legacyDurationScale
    ?? (typeof legacy?.entranceDuration === 'number'
      ? legacy.entranceDuration / LEGACY_PROFILE_DURATION_MS[profile]
      : undefined);

  return {
    intensity: explicit?.intensity ?? legacy?.intensity ?? expressive?.intensity,
    durationScale:
      explicit?.durationScale ?? derivedDurationScale ?? expressive?.durationScale,
    ambient: explicit?.ambient ?? expressive?.ambient,
  };
}

/**
 * Memoized children boundary.
 *
 * Prevents the entire children subtree from re-rendering when a provider
 * higher in the composition chain re-renders due to its own state changes
 * (e.g., ThemeProvider loading state). Children will only re-render when
 * they consume a context whose value actually changed.
 */
const MemoizedChildren = memo(function MemoizedChildren({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
});

/**
 * The exact keys of `tenantOverrides` that select BEHAVIOR rather than paint.
 *
 * The membership test is what makes a behavior-only override non-destructive,
 * so the set is closed and deliberately small. Each member is a selection the
 * runtime can honour without rebuilding the tenant config:
 *
 * - `locale` / `fallbackLocale` — which dictionary I18nProvider reads
 * - `customTranslations`        — copy layered over that dictionary
 * - `features`                  — the capability set FeatureProvider unions
 * - `theme`                     — the light/dark/auto MODE, validated exactly
 *                                 like the config's own `theme` and seated in
 *                                 the same `explicitTenantTheme` slot, under
 *                                 `forceTheme`. A mode is not a token, so this
 *                                 admits no raw paint.
 *
 * Everything else — branding, tokenOverrides, personality, brandTheme,
 * appearance, identity, `engine`, `componentPack` — is visual or identity
 * payload and MUST travel through the config so the census and the
 * reserved-identity assert can see it.
 *
 * Exported so the drill can assert against THIS declaration instead of a copy.
 * A test that restates the tuple proves only that it agrees with itself, and
 * would stay green through any widening of the real set. The export is
 * module-internal by construction: every barrel above this file enumerates its
 * exports by name (`bootstrap/facade/index.ts`, `entrypoints/public/runtime/
 * provider/index.ts`), so nothing reaches the package API.
 */
export const BEHAVIOR_OVERRIDE_KEYS = [
  'locale',
  'fallbackLocale',
  'customTranslations',
  'features',
  'theme',
] as const;

type BehaviorOverrideKey = (typeof BEHAVIOR_OVERRIDE_KEYS)[number];

/**
 * Partial by nature, not by convenience: the overlay holds whichever behavior
 * keys the caller actually wrote. `TenantConfig['features']` is REQUIRED, so a
 * total `Pick` claimed every overlay carries a feature list and could only be
 * produced through a cast — a type that lied about the value it described.
 */
type TenantBehaviorOverlay = Partial<Pick<TenantConfig, BehaviorOverrideKey>>;

const BEHAVIOR_OVERRIDE_KEY_SET: ReadonlySet<string> = new Set(
  BEHAVIOR_OVERRIDE_KEYS,
);

interface TenantOverridePartition {
  /** Behavior selections, delivered at read sites. `null` when none present. */
  readonly behavior: TenantBehaviorOverlay | null;
  /** Visual/identity payload, folded into the config. `null` when none. */
  readonly config: Partial<TenantConfig> | null;
}

/**
 * Splits the prop into its two lanes by OWN keys whose value is not
 * `undefined`.
 *
 * `undefined` is treated as absence on purpose: `{ locale: undefined }` is what
 * a caller writes when a conditional produced nothing, and reading it as "the
 * key is present" would make a no-op override rebuild the config and take a
 * code-owned tenant down with it.
 */
function partitionTenantOverrides(
  tenantOverrides?: Partial<TenantConfig>,
): TenantOverridePartition {
  if (!tenantOverrides) return { behavior: null, config: null };

  let behavior: Record<string, unknown> | null = null;
  let config: Record<string, unknown> | null = null;

  for (const key of Object.keys(tenantOverrides)) {
    const value = (tenantOverrides as Record<string, unknown>)[key];
    if (value === undefined) continue;
    if (BEHAVIOR_OVERRIDE_KEY_SET.has(key)) {
      (behavior ??= {})[key] = value;
    } else {
      (config ??= {})[key] = value;
    }
  }

  return {
    behavior: behavior as TenantBehaviorOverlay | null,
    config: config as Partial<TenantConfig> | null,
  };
}

/**
 * THE undefined discipline, in one place, for every object merge in this
 * partition.
 *
 * Start from the base, copy only the override's OWN entries whose value is
 * actually defined. Never delete a base key, never keep a new own key holding
 * `undefined`, never invent a sibling neither side wrote.
 *
 * A plain `{ ...base, ...override }` fails all three at once, and it fails them
 * SILENTLY: `{ logo: undefined }` is an own key, so the spread overwrites a real
 * base logo with `undefined` and leaves the key standing. The tenant loses
 * identity it never asked to drop, and the census gains a key to count.
 *
 * `undefined` means "I wrote nothing here" everywhere else in this file —
 * `partitionTenantOverrides` is built on exactly that reading, because it is
 * what a caller produces when a conditional yields nothing. This helper is that
 * reading applied one level down, so branding and token sections cannot drift
 * from the top-level rule they sit under.
 */
export function mergeDefinedOwnEntries<T extends object>(base: T, override: Partial<T>): T {
  // Entries over a stated plain-record shape, not computed reads and writes on
  // `T`. `T extends object` includes functions, so `override[key]` and
  // `merged[key] = value` are indistinguishable from a capability escape
  // (`obj[k].constructor` reaching `Function`) to the dependency-honesty
  // analyser that guards this package's runtime edges. `Object.entries` yields
  // exactly the own enumerable string keys the `for...in` + `hasOwnProperty`
  // pair yielded, in the same order, so the merge is unchanged.
  const merged: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (value === undefined) continue;
    merged[key] = value;
  }
  return merged as T;
}

const TOKEN_OVERRIDE_SECTIONS: ReadonlySet<string> = new Set([
  'surface',
  'motion',
  'borderRadius',
  'shadows',
  'glass',
  'gradients',
  'overlays',
]);

/**
 * Section-wise merge that FABRICATES NOTHING and PRUNES NOTHING.
 *
 * An earlier implementation spread all seven sections unconditionally, so any
 * override at all produced `{ surface: {}, motion: {}, ... }` — seven keys the
 * caller never wrote. `censusRuntimeVisualPayload` counts `tokenOverrides` keys,
 * so that fabrication reported a runtime visual payload for a tenant that had
 * none, and the provider blocked on `uncompiled-visual-payload`.
 *
 * Replacing it with `{ ...base, ...override }` fixed the fabrication and opened
 * the mirror hole: `{ surface: undefined, motion: real }` is an own key, so the
 * spread overwrote a REAL base surface with `undefined` and left the key behind
 * — the tenant lost tokens it never asked to drop, and gained an artificial key
 * for the census to count. `undefined` means "I wrote nothing here" everywhere
 * else in this file (see `partitionTenantOverrides`); it means the same here.
 *
 * So: start from the base verbatim, copy only override entries whose value is
 * actually defined, merge a section only when BOTH sides declare an object, and
 * never invent a sibling neither side wrote.
 *
 * The SAME rule then applies one level further down. A section merged with a raw
 * `{ ...baseValue, ...overrideValue }` reopens the identical hole a field at a
 * time: `{ surface: { useGlass: undefined } }` would erase a real
 * `surface.useGlass` and leave an undefined field in its place. `mergeTokenOverrides`
 * would look correct at the top level and still lose tokens inside a section, so
 * both levels run through `mergeDefinedOwnEntries`.
 */
export function mergeTokenOverrides(
  base: TenantConfig['tokenOverrides'],
  override: NonNullable<TenantConfig['tokenOverrides']>,
): NonNullable<TenantConfig['tokenOverrides']> {
  const merged: Record<string, unknown> = { ...base };

  for (const key of Object.keys(override)) {
    const overrideValue = (override as Record<string, unknown>)[key];
    if (overrideValue === undefined) continue;

    const baseValue = merged[key];
    merged[key] =
      TOKEN_OVERRIDE_SECTIONS.has(key) &&
      isPlainObject(baseValue) &&
      isPlainObject(overrideValue)
        ? mergeDefinedOwnEntries(baseValue, overrideValue)
        : overrideValue;
  }

  return merged as NonNullable<TenantConfig['tokenOverrides']>;
}

/**
 * Applies the visual/identity lane on top of a resolved tenant.
 *
 * Called ONLY when that lane is non-empty, which is what preserves the object
 * identity of a behavior-only mount. The merge is transparent: last write wins
 * for scalars, `branding` and `tokenOverrides` merge field-wise under the
 * undefined discipline when the override declares them, and no key the caller
 * omitted is invented.
 *
 * The top-level spread below needs no such guard: `configOverrides` is the
 * partition's config lane, already built by skipping every own key whose value
 * was `undefined`. `branding` is where the rule has to be re-stated, because the
 * caller's nested object arrives verbatim — `{ branding: { companyName, favicon:
 * '/f.ico', logo: undefined } }` is the shape that erased a tenant's real logo
 * while publishing a favicon, and the census would then have counted the key.
 *
 * `personality` is intentionally replaced rather than deep-merged. It is stored
 * as a partial shape and `useTokens()` is where it becomes fully resolved;
 * re-materializing the nested structure here would add type friction and no
 * behavior. Note the replacement is key-conditional now — `personality: {}`
 * publishes an empty object, which the census correctly reads as a declared
 * personality channel, instead of silently falling back to the base value.
 */
function applyTenantConfigOverrides(
  baseTenantConfig: TenantConfig,
  configOverrides: Partial<TenantConfig>,
): TenantConfig {
  const merged: Record<string, unknown> = {
    ...baseTenantConfig,
    ...configOverrides,
  };

  if (configOverrides.branding !== undefined) {
    // `TenantBranding` in, `TenantBranding` out: the helper is generic over the
    // base's own shape, so `companyName` stays required and every identity and
    // visual field keeps its declared type. Nothing here is cast.
    merged.branding = mergeDefinedOwnEntries(
      baseTenantConfig.branding,
      configOverrides.branding,
    );
  }

  if (configOverrides.tokenOverrides !== undefined) {
    merged.tokenOverrides = mergeTokenOverrides(
      baseTenantConfig.tokenOverrides,
      configOverrides.tokenOverrides,
    );
  }

  return merged as unknown as TenantConfig;
}

/**
 * THE single derivation shared by the sync path, the async render path and the
 * async `onTenantResolved` notification.
 *
 * Returning the base object untouched when the visual/identity lane is empty is
 * the whole point: `Object.is(resolved, base)` stays true, so the registry
 * WeakSet still recognises the config, `getCodeOwnedRuntimeConfig` still finds
 * its cached projection, and the governed-behavior WeakMap still resolves the
 * authored motion dial.
 */
function resolveTenantConfigWithOverrides(
  baseTenantConfig: TenantConfig,
  partition: TenantOverridePartition,
): TenantConfig {
  return partition.config === null
    ? baseTenantConfig
    : applyTenantConfigOverrides(baseTenantConfig, partition.config);
}

/** Runtime context never carries a second copy of tenant visual source. */
function buildResolvedRuntimeConfig(
  config: TenantConfig,
  compiledAppearance: TenantConfig['appearance'],
): TenantConfig {
  const {
    branding,
    tokenOverrides: _tokenOverrides,
    appearance: _appearance,
    personality: _personality,
    brandTheme: _brandTheme,
    ...identityAndBehavior
  } = config;
  const identityBranding = {
    companyName: branding.companyName,
    ...(branding.logo === undefined ? {} : { logo: branding.logo }),
    ...(branding.logoMark === undefined ? {} : { logoMark: branding.logoMark }),
    ...(branding.favicon === undefined ? {} : { favicon: branding.favicon }),
  };
  return {
    ...identityAndBehavior,
    branding: identityBranding,
    ...(compiledAppearance === undefined ? {} : { appearance: compiledAppearance }),
  } as TenantConfig;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Pure predicate used by the async tenant effect to decide whether a pending
 * request still belongs to the committed tree.
 *
 * The effect reads `committedAsyncRequestKeyRef` from a layout effect that runs
 * after every commit, so the ref is authoritative before any child layout
 * effect can settle a stale request. `cancelled` is the effect's own local
 * cleanup flag. Both conditions must hold: a mutant that drops the key
 * comparison (`!cancelled`) survives only because React's passive cleanup may
 * run before the async continuation in test harnesses.
 *
 * Exported only so the integration drill can assert the exact predicate, not
 * restate it. The facade barrel enumerates its exports by name and keeps this
 * module-internal.
 */
export function isCommittedTenantRequest(
  cancelled: boolean,
  requestKey: string,
  committedKey: string | null,
): boolean {
  return !cancelled && committedKey === requestKey;
}

/**
 * Recursively merges locale dictionaries while preserving namespace structure.
 *
 * A plain object spread would replace an entire translation namespace when an
 * app only wants to override one key. This helper keeps overrides surgical,
 * which is especially important for tenant-specific copy tweaks.
 */
function mergeLocaleTranslations(
  baseTranslations?: Partial<LocaleTranslations>,
  overrideTranslations?: Partial<LocaleTranslations>
): Partial<LocaleTranslations> | undefined {
  if (!baseTranslations && !overrideTranslations) {
    return undefined;
  }

  if (!baseTranslations) {
    return overrideTranslations;
  }

  if (!overrideTranslations) {
    return baseTranslations;
  }

  const result: Record<string, unknown> = {
    ...baseTranslations,
  };

  for (const [key, value] of Object.entries(overrideTranslations)) {
    // `undefined` means "I wrote nothing here" at every layer of this merge,
    // just like it does in the config and token override partitions. It must
    // not erase a base value, a sibling, or a sibling branch.
    if (value === undefined) continue;

    const currentValue = result[key];

    if (isPlainObject(currentValue) && isPlainObject(value)) {
      result[key] = mergeLocaleTranslations(
        currentValue as Partial<LocaleTranslations>,
        value as Partial<LocaleTranslations>
      );
    } else {
      result[key] = value;
    }
  }

  return result as Partial<LocaleTranslations>;
}

export function DesignSystemProvider({
  children,
  tenantSlug: propTenantSlug,
  tenantConfig: propTenantConfig,
  visualAuthority: explicitVisualAuthority,
  tenantOverrides,
  productProfile,
  vertical,
  forceEngine,
  forceTheme,
  locale: forcedLocale,
  fallbackLocale: forcedFallbackLocale,
  customTranslations: appCustomTranslations,
  onLocaleChange,
  onTenantResolved,
  onError,
}: DesignSystemProviderProps): React.ReactElement {
  // ONE partition, shared by the sync path, the async render path, the async
  // resolution callback and every behavior read site below. Deriving it twice
  // would let the published config and the delivered behavior disagree.
  const overridePartition = useMemo(
    () => partitionTenantOverrides(tenantOverrides),
    [tenantOverrides],
  );
  const behaviorOverlay = overridePartition.behavior;

  // SYNC PATH: When propTenantConfig is provided, derive config with useMemo
  const syncTenantConfig = useMemo(() => {
    if (!propTenantConfig) return null;
    const resolved = resolveTenantConfigWithOverrides(
      propTenantConfig,
      overridePartition,
    );
    assertProviderTenantConfig(resolved);
    return resolved;
  }, [propTenantConfig, overridePartition]);

  // ASYNC PATH: When only tenantSlug is provided, resolve via storage facade
  const asyncRequestSlug = propTenantSlug ?? DEFAULT_TENANT_SLUG;
  const asyncRequestKey = propTenantConfig ? null : asyncRequestSlug;
  const overridePartitionRef = useRef(overridePartition);
  const onTenantResolvedRef = useRef(onTenantResolved);
  const onErrorRef = useRef(onError);
  // The request key of the committed tree. The async effect belongs to the
  // tree that committed this key; if a new key commits while it is still
  // pending, the old effect must not publish state or call callbacks for the
  // new tree even if its passive cleanup has not run yet.
  const committedAsyncRequestKeyRef = useRef(asyncRequestKey);

  // Committed-state only: these refs are read from the async effect, so they
  // must track the props of the committed tree. Writing them during render
  // would let an abandoned concurrent render overwrite the state that the
  // running effect belongs to, allowing a discarded request to publish or call
  // back. The layout effect runs after every commit, which is exactly the
  // moment the new values become authoritative for this tree.
  useLayoutEffect(() => {
    overridePartitionRef.current = overridePartition;
    onTenantResolvedRef.current = onTenantResolved;
    onErrorRef.current = onError;
    committedAsyncRequestKeyRef.current = asyncRequestKey;
  }, [overridePartition, onTenantResolved, onError, asyncRequestKey]);

  const [asyncRequestState, setAsyncRequestState] = useState<{
    key: string | null;
    config: TenantConfig | null;
    loading: boolean;
    error: Error | null;
  }>(() => ({
    key: asyncRequestKey,
    config: null,
    loading: asyncRequestKey !== null,
    error: null,
  }));

  useEffect(() => {
    if (!asyncRequestKey) return;
    const requestKey = asyncRequestKey;
    let cancelled = false;
    setAsyncRequestState({ key: requestKey, config: null, loading: true, error: null });

    // A request may resolve in the window between a new key committing and the
    // old effect's passive cleanup running. The committed-key ref is updated in
    // the provider's layout effect, so it is authoritative before any child
    // layout effect can settle a stale request.
    const isStillCommitted = () =>
      isCommittedTenantRequest(
        cancelled,
        requestKey,
        committedAsyncRequestKeyRef.current,
      );

    const loadTenant = async () => {
      let resolvedTenantConfig: TenantConfig;
      let resolvedFromSource = true;
      try {
        resolvedTenantConfig = await resolveTenantConfig(requestKey);
        if (!isStillCommitted()) return;
        if (resolvedTenantConfig.slug !== requestKey) {
          throw new Error('Resolved tenant payload identity mismatch');
        }
      } catch (error) {
        if (!isStillCommitted()) return;
        if (error instanceof ReservedTenantIdentityError) {
          onErrorRef.current?.(error as Error);
          if (!isStillCommitted()) return;
          setAsyncRequestState({
            key: requestKey,
            config: null,
            loading: false,
            error,
          });
          return;
        }
        resolvedFromSource = false;
        onErrorRef.current?.(error as Error);
        resolvedTenantConfig = getUnresolvedTenantConfig(requestKey);
      }

      if (!isStillCommitted()) return;
      setAsyncRequestState({
        key: requestKey,
        config: resolvedTenantConfig,
        loading: false,
        error: null,
      });
      if (resolvedFromSource) {
        // Same derivation as the render path, so the callback observes exactly
        // the object the tree will publish -- the untouched base (code-owned
        // identity intact) whenever the override is behavior-only.
        const resolvedForCallback = resolveTenantConfigWithOverrides(
          resolvedTenantConfig,
          overridePartitionRef.current,
        );
        try {
          assertProviderTenantConfig(resolvedForCallback);
          if (!isStillCommitted()) return;
          onTenantResolvedRef.current?.(resolvedForCallback);
        } catch (error) {
          if (!isStillCommitted()) return;
          onErrorRef.current?.(error as Error);
        }
      }
    };

    void loadTenant();
    return () => {
      cancelled = true;
    };
  }, [asyncRequestKey]);

  const asyncTenantConfig = useMemo(() => {
    if (
      !asyncRequestKey
      || asyncRequestState.key !== asyncRequestKey
      || !asyncRequestState.config
    ) {
      return null;
    }
    const resolved = resolveTenantConfigWithOverrides(
      asyncRequestState.config,
      overridePartition,
    );
    assertProviderTenantConfig(resolved);
    return resolved;
  }, [asyncRequestKey, asyncRequestState, overridePartition]);
  const loading = asyncRequestKey !== null && (
    asyncRequestState.key !== asyncRequestKey || asyncRequestState.loading
  );

  // Final resolved config: sync path takes priority
  const tenantConfig = syncTenantConfig ?? asyncTenantConfig;

  // Vertical can come from the app explicitly or from the resolved tenant
  // record itself. Resolve it before visual normalization so runtime and static
  // BrandTheme compilation share the same vertical baseline.
  const resolvedVertical: VerticalPreset | undefined = useMemo(() => {
    const verticalSource = vertical ?? tenantConfig?.vertical ?? undefined;
    return verticalSource == null
      ? undefined
      : typeof verticalSource === 'string'
        ? getVerticalPreset(verticalSource)
        : verticalSource;
  }, [vertical, tenantConfig?.vertical]);

  // The resolved tenant config, RAW.
  //
  // This provider used to pre-merge it: it compiled the BrandTheme, folded the
  // compiled personality and tokenOverrides back into the config, and
  // back-filled `branding` from the theme's palette. Every one of those merges
  // already existed downstream — `useTokens` resolves engine -> vertical ->
  // brandTheme -> tenant for both structural tokens and personality, from the
  // BrandTheme itself. Pre-merging meant the same chain ran twice on two
  // different inputs, and the second run could not tell an authored tenant
  // value from a value the first run had just derived.
  //
  // One resolution, downstream, from the raw config. Nothing is normalized here.
  const normalizedConfig = tenantConfig;
  const codeOwnedConfig = normalizedConfig && isCodeOwnedTenantConfig(normalizedConfig)
    ? getCodeOwnedRuntimeConfig(normalizedConfig)
    : null;

  // Which emitter owns each tenant visual channel. Resolved from a declaration
  // that carries the artifact's provenance rather than defaulted, so an app
  // that mounted a server-compiled artifact and omitted the prop is no longer
  // silently painted over, and an app that mounted one correctly is no longer
  // reported for echoing the artifact's own compiled appearance back.
  const {
    conflict: admissionConflict,
    artifact: verifiedArtifact,
    mountedArtifact,
  } = useMemo(
    () =>
      resolveVisualAuthority({
        declaration: explicitVisualAuthority,
        slug: normalizedConfig?.slug ?? asyncRequestSlug,
        verticalKey:
          typeof normalizedConfig?.vertical === 'string'
            ? normalizedConfig.vertical
            : resolvedVertical?.key,
        payload: censusRuntimeVisualPayload(codeOwnedConfig ?? normalizedConfig),
      }),
    [
      explicitVisualAuthority,
      normalizedConfig?.slug,
      normalizedConfig?.branding,
      normalizedConfig?.appearance,
      normalizedConfig?.tokenOverrides,
      normalizedConfig?.personality,
      normalizedConfig?.brandTheme,
      codeOwnedConfig,
      resolvedVertical?.key,
      asyncRequestSlug,
    ],
  );

  // Admission proves the exact bytes are mounted at resolve time; retention
  // keeps that proof alive for every moment in between. The invariant the two
  // hold together: at any instant the runtime either has a byte-exact,
  // uniquely-scoped artifact element mounted, or it blocks.
  //
  // RENDER PREPARES; A COMMIT ARMS. Everything this component does here is
  // read-only: it resolves the admission and captures the claim it WOULD make.
  // The arm itself belongs to `RetainedArtifactArm` below, because a render is
  // not an event that happened -- React throws renders away when a sibling
  // throws, a child suspends, or a concurrent pass is superseded -- and an arm
  // performed by a discarded render leaves a permanent ledger entry no cleanup
  // will ever reach. The claim is idempotent per (document, artifact identity),
  // so a StrictMode replay joins the one live watch and never forks it.
  //
  // The subscription is an external store because the verdict has to outlive
  // the admission it revoked -- see armMountedTenantThemeArtifact for why a
  // re-resolve is not a re-proof. Reading it through useSyncExternalStore is
  // NOT by itself the prepaint barrier -- that hook installs its listener from
  // a passive effect -- so the explicit layout check below is what makes a
  // revocation raised anywhere in this commit -- the arm's own audit, or the
  // seal's drain in the last child's layout effect -- visible before the frame
  // paints. The server snapshot is pinned to "not revoked" so hydration
  // reproduces the server's markup instead of mismatching on a barrier the
  // server could never have raised.
  const claim = useMemo(
    () =>
      verifiedArtifact && mountedArtifact
        ? prepareMountedTenantThemeArtifactClaim(verifiedArtifact, mountedArtifact)
        : null,
    [verifiedArtifact, mountedArtifact],
  );
  const revocation = useSyncExternalStore(
    claim?.subscribe ?? NO_RETENTION_SUBSCRIPTION,
    claim?.revocation ?? NO_RETENTION_REVOCATION,
    NO_RETENTION_REVOCATION,
  );

  // THE PREPAINT BARRIER, and the reason the subscription cannot be it.
  //
  // `useSyncExternalStore` installs its listener from a PASSIVE effect. On an
  // initial or default-lane commit React flushes passive work in a LATER task,
  // after the frame that commit produced -- so the seal can record a revocation
  // in the last child's layout effect and find nobody listening. The store is
  // right, the store is unread, and the tampered frame paints anyway. A
  // synchronous harness hides this precisely because `act` and the sync lane
  // flush passive effects before returning control.
  //
  // So the provider reads the verdict a second time, from its OWN layout
  // effect. React runs a parent's layout effect after every descendant's, the
  // seal's included, so this is the first moment in the commit where the
  // subtree's whole behaviour is already on the record. If the live verdict has
  // moved away from the snapshot this render read, a plain state update is
  // enough: React treats an update scheduled during the commit phase as
  // synchronous work and flushes it before the browser paints. `flushSync` is
  // deliberately NOT used -- it is invalid inside insertion, layout and
  // lifecycle work, and it would buy nothing React does not already guarantee.
  const [, forceRetentionRecheck] = useReducer(
    (recheck: number): number => recheck + 1,
    0,
  );
  // Dependency-free on purpose: every commit is a fresh opportunity for a
  // descendant to have touched the artifact, so every commit re-reads the
  // verdict. The update is raised only on a real disagreement, so the render it
  // forces agrees with itself and no second one follows.
  useLayoutEffect(() => {
    if ((claim?.revocation() ?? null) !== revocation) forceRetentionRecheck();
  });

  const visualAuthorityConflict =
    admissionConflict ??
    (revocation && verifiedArtifact
      ? `Tenant "${verifiedArtifact.slug}" ${revocation}.`
      : null);

  useEffect(() => {
    if (visualAuthorityConflict) reportVisualAuthorityConflict(visualAuthorityConflict);
  }, [visualAuthorityConflict]);

  if (
    asyncRequestKey
    && asyncRequestState.key === asyncRequestKey
    && asyncRequestState.error
  ) {
    throw asyncRequestState.error;
  }

  if (loading || !normalizedConfig || visualAuthorityConflict) {
    return <LoadingScreen />;
  }

  const resolvedRuntimeConfig = codeOwnedConfig ?? buildResolvedRuntimeConfig(
    normalizedConfig,
    verifiedArtifact?.normalizedAppearance as TenantConfig['appearance'] | undefined,
  );

  const recipeProfileSelection = (() => {
    const dbProfile = resolvedRuntimeConfig.appearance?.recipeProfile;
    return dbProfile
      ? { profileId: dbProfile, schemaVersion: RECIPE_PROFILE_SCHEMA_VERSION }
      : undefined;
  })();
  // C2b: governed icon posture — dual-source precedence (explicit DB Pro
  // axis or DB experience composition win over the static BrandTheme
  // selection). Delivered through the RSC-safe seam: assigned to the CLIENT
  // context below (client/SSR worlds); Server Component trees receive the
  // same value through the per-request box the application fills via
  // `provideServerIconExpressiveProfile` — both integration points share
  // this one pure resolver.
  // Governed, non-visual behavior of a code-owned vertical. The runtime
  // projection above strips `brandTheme` so static CSS stays the sole visual
  // emitter; motion, density and icon posture are BEHAVIOR no stylesheet can
  // express, so they arrive here instead of riding on the published config.
  const governedBehavior = getCodeOwnedGovernedBehavior(resolvedRuntimeConfig);

  const iconExpressiveProfile = resolveActiveIconExpressiveProfile(
    governedBehavior
      // A local read-model, never published: `resolveActiveIconExpressiveProfile`
      // is structural and consumes exactly `{ expressive }` off this slot.
      ? { appearance: resolvedRuntimeConfig.appearance, brandTheme: governedBehavior }
      : resolvedRuntimeConfig,
  );

  const motionProfile = resolvedVertical?.motionProfile ?? 'calm';
  const tenantMotionDial = resolveTenantMotionDial(
    resolvedRuntimeConfig,
    motionProfile,
    governedBehavior,
  );

  // Appearance is READ here (density posture, motion dial, backgroundMode,
  // recipe profile, icon posture) and COMPILED nowhere. `compileAppearanceVariables`
  // used to run in this provider and hand its output to ThemeProvider as
  // inline root variables — a third compiler, competing with whichever
  // artifact the application had already mounted. The appearance a tenant
  // paints with is compiled once, by `compileTenantThemeConfig`, into the
  // artifact; this provider consumes the artifact's `normalizedAppearance`
  // through the config it is given.

  // Final precedence used by the runtime:
  // force props -> explicit tenant theme (light/dark/auto) -> appearance.backgroundMode -> DS fallback.
  const engine = resolveEngine({
    forceEngine,
    verticalEngine: resolvedVertical?.engine,
    tenantEngine: resolvedRuntimeConfig.engine,
    tenantSlug: resolvedRuntimeConfig.slug,
  });
  // backgroundMode maps: 'light' -> 'light', 'dark' -> 'dark', 'auto' -> 'auto'.
  // tenant.theme only wins if it's explicitly set to a real mode (not the default 'base').
  const appearanceBackgroundMode = resolvedRuntimeConfig.appearance?.general?.palette?.backgroundMode;
  const VALID_THEME_MODES = new Set(['light', 'dark', 'auto']);
  const toExplicitThemeMode = (mode: string | undefined): string | undefined =>
    mode && VALID_THEME_MODES.has(mode) ? mode : undefined;
  // The behavior overlay's `theme` occupies the SAME slot as the config's own
  // `theme`, under `forceTheme`, and passes the SAME validation. A mode that is
  // not light/dark/auto (including the 'base' sentinel) resolves to `undefined`
  // and falls through, so an override can select a mode and nothing else -- it
  // can neither reach `appearanceBackgroundMode` nor introduce a raw token.
  const explicitTenantTheme =
    toExplicitThemeMode(behaviorOverlay?.theme)
    ?? toExplicitThemeMode(resolvedRuntimeConfig.theme);
  const theme = forceTheme ?? explicitTenantTheme ?? appearanceBackgroundMode ?? resolvedRuntimeConfig.theme ?? 'base';
  // Normalized, not taken on trust. `normalizedConfig.locale` reaches here from
  // tenant DB branding and from application props, so it can be any string --
  // `'de'`, `'en-GB'`, `''`. An unsupported value used to flow straight through
  // to `LOCALE_CONFIGS[locale]`, which returns `undefined`, and the very next
  // read of `config.code` THREW. An unknown language is not a crash; it is a
  // fallback, and `toSupportedLocale` is the one place that decides so.
  //
  // The literal `'en'` that stood here also bypassed `DEFAULT_LOCALE` entirely,
  // which made the constant's own claim -- "every default in the subsystem
  // resolves through this ONE declaration" -- false for the primary mount point
  // of the whole design system.
  //
  // Behavior precedence throughout: app prop > tenantOverrides > tenant config.
  // The overlay is an app-owned runtime tune, so it outranks what the tenant
  // record shipped and yields to what this mount explicitly forced.
  const locale = toSupportedLocale(
    forcedLocale ?? behaviorOverlay?.locale ?? resolvedRuntimeConfig.locale,
  );
  const fallbackLocale = toSupportedLocale(
    forcedFallbackLocale
      ?? behaviorOverlay?.fallbackLocale
      ?? resolvedRuntimeConfig.fallbackLocale,
    locale,
  );
  // Three layers, each surgical: the tenant's dictionary, the override's, then
  // the app prop's. `mergeLocaleTranslations` recurses, so a single key can be
  // replaced at any layer without forking the namespace above it.
  const customTranslations = mergeLocaleTranslations(
    mergeLocaleTranslations(
      resolvedRuntimeConfig.customTranslations,
      behaviorOverlay?.customTranslations,
    ),
    appCustomTranslations
  );
  // Union, not replacement: an override adds capabilities to whatever the
  // tenant registry shipped. Deduped here because FeatureProvider is the one
  // consumer and the published config must stay untouched.
  const features = behaviorOverlay?.features
    ? Array.from(
        new Set([
          ...(resolvedRuntimeConfig.features ?? []),
          ...behaviorOverlay.features,
        ]),
      )
    : resolvedRuntimeConfig.features ?? [];

  // Product profile intentionally resolves after vertical. Vertical answers
  // "which kind of product is this?", while product profile answers
  // "which UX preset should we apply within that product space?".
  const resolvedProductProfile = productProfile ?? resolvedVertical?.defaultProductProfile;

  // Root density mirrors the semantic posture from DB, then the explicitly
  // authored static posture, then its expressive-profile default. Structural
  // `densityScale` remains a separate multiplier and is never reinterpreted.
  const rootDensityPosture = deriveDensityPosture(
    resolvedRuntimeConfig.appearance?.general?.density ??
      resolveStaticExpressiveDefaults(resolvedRuntimeConfig, governedBehavior)?.density,
  );

  // The provider is a client component, so the context object always exists
  // in this world; the null branch is the react-server flavor, where this
  // component never executes.
  const IconProfileCarrier = IconExpressiveProfileContext;
  if (!IconProfileCarrier) {
    throw new Error(
      'DesignSystemProvider rendered in a React world without createContext'
    );
  }
  return (
    <>
    {/*
      The two sentinels bracket the entire tree, and the bracketing IS the
      mechanism: the arm is the first thing committed, the seal the last thing
      run before paint, and every descendant sits between them. Both render
      null, so neither costs a node, a commit, or a byte of server markup --
      and on a request with no DOM there is no claim to make, so neither is
      rendered at all and hydration has nothing extra to reconcile.
    */}
    {claim ? <RetainedArtifactArm claim={claim} /> : null}
    <IconProfileCarrier.Provider value={iconExpressiveProfile}>
    <TenantProvider config={resolvedRuntimeConfig} vertical={resolvedVertical}>
      <RecipeProfileProvider
        profileId={recipeProfileSelection?.profileId}
        schemaVersion={recipeProfileSelection?.schemaVersion}
      >
      <RootDensityProvider posture={rootDensityPosture}>
        <ProductProfileProvider profile={resolvedProductProfile}>
          <I18nProvider
            locale={locale}
            fallbackLocale={fallbackLocale}
            customTranslations={customTranslations}
            onLocaleChange={onLocaleChange}
          >
            <EngineProvider defaultEngine={engine}>
              <ThemeProvider
                theme={theme}
                tenant={resolvedRuntimeConfig.slug}
              >
                <FeatureProvider features={features}>
                  <MotionProvider profile={motionProfile} tenantDial={tenantMotionDial}>
                    <ResponsiveProvider>
                      <CommandRegistryProvider>
                        <AntdConfigProvider>
                          {/*
                            Personality is a subordinate product/vertical data
                            axis, never a second tenant authority, so the bridge
                            is mounted unconditionally: it publishes namespaced
                            inputs only and the static projection owns canonical
                            aliases. It is not conditional on
                            `suppressedChannels` because it cannot be -- an
                            artifact is admitted only when its coverage is the
                            exact ordered v1 coverage, and `personality` is
                            deliberately outside that set. A guard here would
                            read as a suppression that no input can produce.
                          */}
                          <SystemCssVariablesBridge />
                          <MemoizedChildren>{children}</MemoizedChildren>
                        </AntdConfigProvider>
                      </CommandRegistryProvider>
                    </ResponsiveProvider>
                  </MotionProvider>
                </FeatureProvider>
              </ThemeProvider>
            </EngineProvider>
          </I18nProvider>
        </ProductProfileProvider>
      </RootDensityProvider>
      </RecipeProfileProvider>
    </TenantProvider>
    </IconProfileCarrier.Provider>
    {claim ? <RetainedArtifactSeal claim={claim} /> : null}
    </>
  );
}
