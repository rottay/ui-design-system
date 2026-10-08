import type { TenantConfig } from '../../../../../../../foundation/contracts';

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
 * Everything else — branding, identity, `componentPack` — is visual or
 * identity payload and MUST travel through the config so the census and the
 * reserved-identity assert can see it.
 *
 * Exported so the drill can assert against THIS declaration instead of a copy.
 * A test that restates the tuple proves only that it agrees with itself, and
 * would stay green through any widening of the real set. The export is
 * module-internal by construction: the barrel above this file enumerates its
 * exports by name (`bootstrap/facade/index.ts`), so nothing reaches the package
 * API.
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
export function partitionTenantOverrides(
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

/**
 * Applies the visual/identity lane on top of a resolved tenant.
 *
 * Called ONLY when that lane is non-empty, which is what preserves the object
 * identity of a behavior-only mount. The merge is transparent: last write wins
 * for scalars, `branding` merges field-wise under the undefined discipline when
 * the override declares it, and no key the caller omitted is invented.
 *
 * The top-level spread below needs no such guard: `configOverrides` is the
 * partition's config lane, already built by skipping every own key whose value
 * was `undefined`. `branding` is where the rule has to be re-stated, because the
 * caller's nested object arrives verbatim — `{ branding: { companyName, favicon:
 * '/f.ico', logo: undefined } }` is the shape that erased a tenant's real logo
 * while publishing a favicon, and the census would then have counted the key.
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
export function resolveTenantConfigWithOverrides(
  baseTenantConfig: TenantConfig,
  partition: TenantOverridePartition,
): TenantConfig {
  return partition.config === null
    ? baseTenantConfig
    : applyTenantConfigOverrides(baseTenantConfig, partition.config);
}

/**
 * The config a component is handed: identity and identity-only branding.
 *
 * A transport may still carry seed colours and fonts on `branding` -- that is
 * the last visual channel `TenantConfig` has -- and they are dropped here,
 * because the mounted artifact already compiled them. The artifact's own
 * normalized appearance travels beside this config on the tenant context, not
 * inside it.
 */
export function buildResolvedRuntimeConfig(config: TenantConfig): TenantConfig {
  const { branding, ...identityAndBehavior } = config;
  const identityBranding = {
    companyName: branding.companyName,
    ...(branding.logo === undefined ? {} : { logo: branding.logo }),
    ...(branding.logoMark === undefined ? {} : { logoMark: branding.logoMark }),
    ...(branding.favicon === undefined ? {} : { favicon: branding.favicon }),
  };
  return {
    ...identityAndBehavior,
    branding: identityBranding,
  } as TenantConfig;
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
