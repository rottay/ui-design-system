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
  useState,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { EngineProvider } from '../../../../engines/composition/react/provider';
import { RenderedFamiliesRoot } from '../../../../engines/composition/react/rendered-families';
import { ThemeProvider } from '../../../../theming';
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
  MotionProfile,
  TenantConfig,
  TenantMotionDial,
  VerticalPreset,
} from '../../../../../../foundation/contracts';
import { getVerticalPreset } from '@/foundation/presets/verticals';
import {
  getTenantConfig as resolveTenantConfig,
  DEFAULT_TENANT_SLUG,
} from '../../../../tenant/sourcing/store';
import {
  getCodeOwnedGovernedBehavior,
  getCodeOwnedRuntimeConfig,
  isCodeOwnedTenantConfig,
  type CodeOwnedGovernedBehavior,
} from '../../../../tenant/foundation/configuration/registry';
import { ReservedTenantIdentityError } from '@/foundation/presets/verticals/roster';
import { getUnresolvedTenantConfig } from '../../../../tenant/foundation/configuration/defaults';
import { ResponsiveProvider } from '../../../../responsive';
import { MotionProvider } from '../../../../motion';
import { AntdConfigProvider } from '../../../../engines/presentation/adapters/antd';
import {
  EngineVisualDeclarationProvider,
  assertEngineVisualBelongs,
} from '../../../../foundation/engine-visual';
import type { TenantAppearance } from '@/foundation/contracts/composition/tenants/themes';
import { resolveEngine } from '../../../../engines/selection/resolution';
import { resolveAdapter } from '@/infrastructure/compilers/runtime/theme/presentation/adapters/facade/registry';
import { CommandRegistryProvider } from '../../../../application/commands';
import { ShortcutProvider } from '../../../../application/interaction/shortcuts';
import {
  RecipeProfileProvider,
  RECIPE_PROFILE_SCHEMA_VERSION,
} from '../../../../foundation/recipes/profiles';
import { deriveDensityPosture } from '../../../../foundation/density';
import { RootDensityProvider } from '../../../../density';
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from '@/foundation/tokens/ts/presentation/expressive-profiles';
import { expandExpressiveProfiles } from '@/foundation/tokens/ts/presentation/expressive-profiles/expansion';
import { IconExpressiveProfileContext } from '@/infrastructure/runtime/foundation/icons/active-profile/foundation/read';
import { resolveActiveIconExpressiveProfile } from '@/infrastructure/runtime/foundation/icons/active-profile/posture/resolution';
import type { DesignSystemProviderProps } from './props';
import { LoadingScreen, MemoizedChildren } from './boundaries';
import { NO_RETENTION_REVOCATION, NO_RETENTION_SUBSCRIPTION, RetainedArtifactArm, RetainedArtifactSeal } from './retention';
import {
  buildResolvedRuntimeConfig,
  isCommittedTenantRequest,
  partitionTenantOverrides,
  resolveTenantConfigWithOverrides,
} from './tenant-config';
import { mergeLocaleTranslations } from './translations';

export type { DesignSystemProviderProps } from './props';
export { BEHAVIOR_OVERRIDE_KEYS, isCommittedTenantRequest, mergeDefinedOwnEntries } from './tenant-config';

const LEGACY_PROFILE_DURATION_MS: Readonly<Record<MotionProfile, number>> = {
  precise: 180,
  calm: 200,
  expressive: 350,
};

/**
 * The static expressive selection for a code-owned vertical.
 *
 * A `TenantConfig` carries no theme, so the selection arrives only through
 * `governed` -- the bounded, non-visual slice the registry keeps keyed to the
 * projection's identity. It is the same object the theme authored, resolved by
 * the same fail-closed registry.
 */
function resolveStaticExpressiveDefaults(
  governed?: CodeOwnedGovernedBehavior,
) {
  const selection = governed?.expressive;
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
  appearance: TenantAppearance | undefined,
  profile: MotionProfile,
  governed?: CodeOwnedGovernedBehavior,
): TenantMotionDial | undefined {
  const explicit = appearance?.general?.motion;
  const legacy = governed?.motion;
  const expressive = resolveStaticExpressiveDefaults(governed)?.motion;
  if (!explicit && !legacy && !expressive) {
    return undefined;
  }

  const derivedDurationScale =
    typeof legacy?.entranceDuration === 'number'
      ? legacy.entranceDuration / LEGACY_PROFILE_DURATION_MS[profile]
      : undefined;

  return {
    intensity: explicit?.intensity ?? legacy?.intensity ?? expressive?.intensity,
    durationScale:
      explicit?.durationScale ?? derivedDurationScale ?? expressive?.durationScale,
    ambient: explicit?.ambient ?? expressive?.ambient,
  };
}

export function DesignSystemProvider({
  children,
  tenantSlug: propTenantSlug,
  tenantConfig: propTenantConfig,
  visualAuthority: explicitVisualAuthority,
  engineVisual,
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
  ssrViewport,
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
  // FlatTheme compilation share the same vertical baseline.
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
  // This provider used to pre-merge it: it compiled the FlatTheme, folded the
  // compiled personality and tokenOverrides back into the config, and
  // back-filled `branding` from the theme's palette. Every one of those merges
  // already existed downstream — `useTokens` resolves engine -> vertical ->
  // brandTheme -> tenant for both structural tokens and personality, from the
  // FlatTheme itself. Pre-merging meant the same chain ran twice on two
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

  const resolvedRuntimeConfig = codeOwnedConfig ?? buildResolvedRuntimeConfig(normalizedConfig);

  // THE ARTIFACT'S OWN read-model, read where it is proven and published beside
  // the config rather than inside it: a compiled output has to stay
  // distinguishable from a field a transport authored.
  const appearance = verifiedArtifact?.normalizedAppearance as TenantAppearance | undefined;

  // Governed, non-visual behavior of a code-owned vertical. The runtime
  // projection above strips `brandTheme` so static CSS stays the sole visual
  // emitter; motion, density, icon posture and the recipe-profile SELECTION are
  // behavior no stylesheet can express, so they arrive here instead of riding
  // on the published config.
  const governedBehavior = getCodeOwnedGovernedBehavior(resolvedRuntimeConfig);

  // C2b: governed icon posture — dual-source precedence (explicit DB Pro
  // axis or DB experience composition win over the static FlatTheme
  // selection). Delivered through the RSC-safe seam: assigned to the CLIENT
  // context below (client/SSR worlds); Server Component trees receive the
  // same value through the per-request box the application fills via
  // `provideServerIconExpressiveProfile` — both integration points share
  // this one pure resolver.
  const iconExpressiveProfile = resolveActiveIconExpressiveProfile({
    appearance,
    expressive: governedBehavior?.expressive,
  });

  const motionProfile = resolvedVertical?.motionProfile ?? 'calm';
  const tenantMotionDial = resolveTenantMotionDial(
    appearance,
    motionProfile,
    governedBehavior,
  );

  // Appearance is READ here (density posture, motion dial, backgroundMode,
  // recipe profile, icon posture) and COMPILED nowhere. A second appearance
  // compiler used to run in this provider and hand its output to ThemeProvider
  // as inline root variables — competing with whichever artifact the
  // application had already mounted. The appearance a tenant paints with is
  // compiled once, by `compileTenantThemeConfig`, into the artifact; this
  // provider consumes the artifact's `normalizedAppearance` through the config
  // it is given.

  // Final precedence used by the runtime:
  // force props -> explicit tenant theme (light/dark/auto) -> appearance.backgroundMode -> DS fallback.
  const engine = resolveEngine({
    forceEngine,
    verticalEngine: resolvedVertical?.engine,
    tenantSlug: resolvedRuntimeConfig.slug,
  });
  // FAIL-CLOSED ENGINE BASELINE. An engine with no registered adapter has no
  // token baseline, so a realm that mounts anyway renders on another engine's.
  // The refusal used to be a side effect of the personality bridge calling
  // `useTokens()`; deleting that painter would have deleted the law with it.
  resolveAdapter(engine);
  // THE RUNTIME HALF OF THE MOUNTED COMPILE. The artifact carries the non-CSS
  // half of the same lowering its CSS came from, so the numbers `useTokens`
  // returns and the variables the document paints are two projections of one
  // answer. It outranks the prop because it is the half the mount proof
  // covers; the prop remains for a compile that publishes no artifact, and for
  // an artifact compiled before the block existed.
  //
  // A projection seeds ONE library, so the artifact's half is published only to
  // the engine it was compiled for. An explicitly passed declaration compiled
  // for another engine is still refused by name below: passing one is a claim.
  const artifactEngineVisual =
    verifiedArtifact?.runtime && verifiedArtifact.runtime.engine === engine
      ? verifiedArtifact.runtime
      : undefined;
  const publishedEngineVisual = artifactEngineVisual ?? engineVisual;
  // A projection compiled for one engine cannot seed another, and the compile's
  // own governed profiles cannot contradict the tenant it is mounted against.
  if (publishedEngineVisual) {
    assertEngineVisualBelongs(publishedEngineVisual, engine, appearance);
  }
  // ONE TRANSPORT FOR THE PROFILE (D-26), and it is the ARTIFACT in all three
  // arms. The compiled runtime block comes first because it is the half the
  // mount proof covers and the half `assertEngineVisualBelongs` has just
  // verified against this tenant; `normalizedAppearance` answers for an
  // artifact compiled before that block existed; and a code-owned vertical
  // reads its own artifact's generated runtime block off the identity-keyed
  // slot, because its stylesheet ships inside the package and there is no row
  // to admit. No arm re-derives the selection from an authored theme: doing so
  // let the document and the product disagree about which recipes are active.
  const recipeProfileSelection = (() => {
    const profileId =
      publishedEngineVisual?.runtime.recipeProfile
      ?? appearance?.recipeProfile
      ?? governedBehavior?.recipeProfile;
    return profileId
      ? { profileId, schemaVersion: RECIPE_PROFILE_SCHEMA_VERSION }
      : undefined;
  })();
  // backgroundMode maps: 'light' -> 'light', 'dark' -> 'dark', 'auto' -> 'auto'.
  // tenant.theme only wins if it's explicitly set to a real mode (not the default 'base').
  const appearanceBackgroundMode = appearance?.general?.palette?.backgroundMode;
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
    appearance?.general?.density ??
      resolveStaticExpressiveDefaults(governedBehavior)?.density,
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
    <RenderedFamiliesRoot>
    <IconProfileCarrier.Provider value={iconExpressiveProfile}>
    <TenantProvider
      config={resolvedRuntimeConfig}
      vertical={resolvedVertical}
      {...(appearance ? { appearance } : {})}
    >
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
              <EngineVisualDeclarationProvider declaration={publishedEngineVisual}>
              <ThemeProvider
                theme={theme}
                tenant={resolvedRuntimeConfig.slug}
              >
                <FeatureProvider features={features}>
                  <MotionProvider profile={motionProfile} tenantDial={tenantMotionDial}>
                    <ResponsiveProvider ssrViewport={ssrViewport}>
                      <CommandRegistryProvider>
                        {/*
                          The single keyboard owner. `ShortcutProvider` used to
                          be a standalone provider an app had to mount itself,
                          so `useGlobalShortcut` threw unless it did -- which is
                          why four DS owners hand-rolled their own document
                          `keydown` listeners instead. It is mounted here, once,
                          inside the command registry: the registry's own
                          shortcut listener is bubble-phase and this one is
                          capture-phase, so a chord registered in both fires in
                          the shortcut registry and never twice.
                        */}
                        <ShortcutProvider>
                        <AntdConfigProvider>
                          {/*
                            The provider paints nothing. It used to mount a
                            personality bridge here that wrote ~60 `:root`
                            custom properties on every render, unconditionally,
                            which made "the provider does not paint under
                            `compiled-artifact`" false. Personality now reaches
                            CSS only through the static projection and the
                            compiled artifact.
                          */}
                          <MemoizedChildren>{children}</MemoizedChildren>
                        </AntdConfigProvider>
                        </ShortcutProvider>
                      </CommandRegistryProvider>
                    </ResponsiveProvider>
                  </MotionProvider>
                </FeatureProvider>
              </ThemeProvider>
              </EngineVisualDeclarationProvider>
            </EngineProvider>
          </I18nProvider>
        </ProductProfileProvider>
      </RootDensityProvider>
      </RecipeProfileProvider>
    </TenantProvider>
    </IconProfileCarrier.Provider>
    </RenderedFamiliesRoot>
    {claim ? <RetainedArtifactSeal claim={claim} /> : null}
    </>
  );
}
