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

import React, { ReactNode, useState, useEffect, useRef, useMemo, memo } from 'react';
import { EngineProvider } from '../engines/EngineProvider';
import { ThemeProvider } from '../theming';
import { TenantProvider } from '../tenant/context/TenantProvider';
import { ProductProfileProvider } from '../product-profiles/ProductProfileProvider';
import { FeatureProvider } from '../features';
import { I18nProvider } from '../../i18n';
import type {
  EngineName,
  MotionProfile,
  ProductProfile,
  ProductProfileKey,
  TenantConfig,
  TenantMotionDial,
} from '../../contracts';
import type { LocaleTranslations, SupportedLocale } from '../../i18n/types';
import type { VerticalKey, VerticalPreset } from '../verticals/types';
import { getVerticalPreset } from '../verticals/registry';
import { getTenantConfig as resolveTenantConfig, DEFAULT_TENANT_SLUG } from '../tenant/storage';
import { getUnresolvedTenantConfig } from '../tenant/defaults';
import { SystemCssVariablesBridge } from './SystemCssVariablesBridge';
import { ResponsiveProvider } from '../responsive';
import { MotionProvider } from '../motion';
import { AntdConfigProvider } from '../engines/AntdConfigProvider';
import { appearanceToVariables } from '../../compilers/appearance';
import { isBundledTenant } from '../tenant/registry';
import { resolveEngine } from '../engines/resolution';
import {
  generateTenantCssFromResolvedVisualConfig,
  hasVisualBrandingFields,
  resolveTenantVisualConfig,
} from '../tenant/storage/static/generator';
import { CommandRegistryProvider } from '../../hooks/commands';

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
   * Runtime tenant overrides applied on top of the resolved tenant.
   *
   * This is the app-owned white-label entry point. Product teams can tune
   * branding, token overrides, personality, and features without forking the
   * DS or creating a new tenant package.
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
   * Accepts a registered vertical key (e.g., 'evnto', 'bithire', 'platform')
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

const LEGACY_PROFILE_DURATION_MS: Readonly<Record<MotionProfile, number>> = {
  precise: 180,
  calm: 200,
  expressive: 350,
};

/**
 * One-minor compatibility bridge from the old open-ended BrandMotion shape to
 * the bounded tenant dial. New DB configs write appearance.general.motion.
 */
function resolveTenantMotionDial(
  config: TenantConfig | null,
  profile: MotionProfile,
): TenantMotionDial | undefined {
  if (!config) return undefined;

  const explicit = config.appearance?.general?.motion;
  const legacy = config.brandTheme?.motion;
  const legacyDurationScale = config.tokenOverrides?.motion?.durationScale;
  if (!explicit && !legacy && legacyDurationScale === undefined) return undefined;

  const derivedDurationScale = legacyDurationScale
    ?? (typeof legacy?.entranceDuration === 'number'
      ? legacy.entranceDuration / LEGACY_PROFILE_DURATION_MS[profile]
      : undefined);

  return {
    intensity: explicit?.intensity ?? legacy?.intensity,
    durationScale: explicit?.durationScale ?? derivedDurationScale,
    ambient: explicit?.ambient,
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
 * Merges a resolved tenant with app-level overrides.
 *
 * The rules here are intentional:
 * - scalar values: last write wins
 * - branding/token/personality objects: shallow-merge by section
 * - features: set union so apps can enable additional capabilities without
 *   accidentally dropping defaults shipped by the tenant registry
 */
function mergeTenantConfig(
  baseTenantConfig: TenantConfig,
  tenantOverrides?: Partial<TenantConfig>
): TenantConfig {
  if (!tenantOverrides) {
    return baseTenantConfig;
  }

  return {
    ...baseTenantConfig,
    ...tenantOverrides,
    branding: {
      ...baseTenantConfig.branding,
      ...tenantOverrides.branding,
    },
    tokenOverrides: {
      ...baseTenantConfig.tokenOverrides,
      ...tenantOverrides.tokenOverrides,
      surface: {
        ...baseTenantConfig.tokenOverrides?.surface,
        ...tenantOverrides.tokenOverrides?.surface,
      },
      motion: {
        ...baseTenantConfig.tokenOverrides?.motion,
        ...tenantOverrides.tokenOverrides?.motion,
      },
      borderRadius: {
        ...baseTenantConfig.tokenOverrides?.borderRadius,
        ...tenantOverrides.tokenOverrides?.borderRadius,
      },
      shadows: {
        ...baseTenantConfig.tokenOverrides?.shadows,
        ...tenantOverrides.tokenOverrides?.shadows,
      },
      glass: {
        ...baseTenantConfig.tokenOverrides?.glass,
        ...tenantOverrides.tokenOverrides?.glass,
      },
      gradients: {
        ...baseTenantConfig.tokenOverrides?.gradients,
        ...tenantOverrides.tokenOverrides?.gradients,
      },
      overlays: {
        ...baseTenantConfig.tokenOverrides?.overlays,
        ...tenantOverrides.tokenOverrides?.overlays,
      },
    },
    /**
     * We intentionally do not deep-merge personality sections here.
     *
     * Reason:
     * - `TenantConfig.personality` is stored as a partial shape
     * - `useTokens()` is the place where personality becomes fully resolved
     * - trying to deeply re-materialize the nested structure here creates noisy
     *   type friction without adding real behavioral value
     *
     * In practice this keeps provider logic simple:
     * - registry tenant provides the base partial
     * - app override can replace that partial
     * - token resolution later merges defaults + product profile + tenant
     *
     * Personality is now part of the BrandTheme -> useTokens() pipeline, but
     * the shallow merge here is still correct for the TenantConfig.personality
     * compat field.
     */
    personality: tenantOverrides.personality ?? baseTenantConfig.personality,
    /**
     * Translation dictionaries are nested objects, so a plain spread would make
     * app-level overrides replace an entire namespace. We keep a tiny recursive
     * merge here so teams can override just one surface string without forking
     * the full locale tree.
     */
    customTranslations: mergeLocaleTranslations(
      baseTenantConfig.customTranslations,
      tenantOverrides.customTranslations
    ),
    features: Array.from(
      new Set([...(baseTenantConfig.features ?? []), ...(tenantOverrides.features ?? [])])
    ),
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
  skipCssLoading = true,
  cssBaseUrl = '/themes',
}: DesignSystemProviderProps): React.ReactElement {
  // SYNC PATH: When propTenantConfig is provided, derive config with useMemo
  const syncTenantConfig = useMemo(() => {
    if (!propTenantConfig) return null;
    return mergeTenantConfig(propTenantConfig, tenantOverrides);
  }, [propTenantConfig, tenantOverrides]);

  // ASYNC PATH: When only tenantSlug is provided, resolve via storage facade
  const asyncRequestSlug = (propTenantSlug ?? DEFAULT_TENANT_SLUG)
    .trim()
    .toLowerCase() || DEFAULT_TENANT_SLUG;
  const asyncRequestKey = propTenantConfig ? null : asyncRequestSlug;
  const activeAsyncRequestRef = useRef(asyncRequestKey);
  activeAsyncRequestRef.current = asyncRequestKey;
  const tenantOverridesRef = useRef(tenantOverrides);
  tenantOverridesRef.current = tenantOverrides;
  const onTenantResolvedRef = useRef(onTenantResolved);
  onTenantResolvedRef.current = onTenantResolved;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const [asyncRequestState, setAsyncRequestState] = useState<{
    key: string | null;
    config: TenantConfig | null;
    loading: boolean;
  }>(() => ({
    key: asyncRequestKey,
    config: null,
    loading: asyncRequestKey !== null,
  }));

  useEffect(() => {
    if (!asyncRequestKey) return;
    const requestKey = asyncRequestKey;
    let cancelled = false;
    setAsyncRequestState({ key: requestKey, config: null, loading: true });

    const loadTenant = async () => {
      let resolvedTenantConfig: TenantConfig;
      let resolvedFromSource = true;
      try {
        resolvedTenantConfig = await resolveTenantConfig(requestKey);
        if (resolvedTenantConfig.slug.trim().toLowerCase() !== requestKey) {
          throw new Error('Resolved tenant payload identity mismatch');
        }
      } catch (error) {
        resolvedFromSource = false;
        onErrorRef.current?.(error as Error);
        resolvedTenantConfig = getUnresolvedTenantConfig(requestKey);
      }

      if (cancelled || activeAsyncRequestRef.current !== requestKey) return;
      setAsyncRequestState({
        key: requestKey,
        config: resolvedTenantConfig,
        loading: false,
      });
      if (resolvedFromSource) {
        const mergedTenantConfig = mergeTenantConfig(
          resolvedTenantConfig,
          tenantOverridesRef.current,
        );
        try {
          onTenantResolvedRef.current?.(mergedTenantConfig);
        } catch (error) {
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
    return mergeTenantConfig(asyncRequestState.config, tenantOverrides);
  }, [asyncRequestKey, asyncRequestState, tenantOverrides]);
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

  // When brandTheme is present, normalize via the shared static/runtime visual
  // resolver so branding, tokenOverrides, and compiled BrandTheme CSS follow
  // one precedence path. For bundled first-party tenants, the precompiled CSS
  // artifacts remain the owner of default palette/chrome unless the incoming
  // tenant config explicitly sets visual branding fields.
  // NOTE: This useMemo MUST run before the early return below to satisfy
  // React's Rules of Hooks (hooks must execute in the same order every render).
  const resolvedVisualConfig = useMemo(() => {
    if (!tenantConfig) return null;
    const bundledTenantUsesCssOwnedBranding =
      isBundledTenant(tenantConfig.slug) && !hasVisualBrandingFields(tenantConfig.branding);

    return resolveTenantVisualConfig(tenantConfig, {
      vertical: resolvedVertical,
      useCssOwnedBranding: bundledTenantUsesCssOwnedBranding,
    });
  }, [tenantConfig, resolvedVertical]);

  const normalizedConfig = resolvedVisualConfig?.config ?? null;
  const motionProfile = resolvedVertical?.motionProfile ?? 'calm';
  const tenantMotionDial = useMemo(
    () => resolveTenantMotionDial(normalizedConfig, motionProfile),
    [motionProfile, normalizedConfig],
  );

  // Resolve TenantAppearance (General + Advanced) into CSS custom properties.
  // These are layered ON TOP of brandTheme/tokenOverrides in the merge chain.
  const appearanceCssVars = useMemo(() => {
    if (!normalizedConfig?.appearance) return undefined;
    const vars = appearanceToVariables(normalizedConfig.appearance);
    return Object.keys(vars).length > 0 ? vars : undefined;
  }, [normalizedConfig?.appearance]);

  const generatedTenantCss = useMemo(() => {
    if (!resolvedVisualConfig) return undefined;
    const config = resolvedVisualConfig.config;
    if (!config?.brandTheme || isBundledTenant(config.slug)) return undefined;
    return generateTenantCssFromResolvedVisualConfig(resolvedVisualConfig);
  }, [resolvedVisualConfig]);

  if (loading || !normalizedConfig) {
    return <LoadingScreen />;
  }

  // Final precedence used by the runtime:
  // force props -> explicit tenant theme (light/dark/auto) -> appearance.backgroundMode -> DS fallback.
  const engine = resolveEngine({
    forceEngine,
    verticalEngine: resolvedVertical?.engine,
    tenantEngine: normalizedConfig.engine,
    tenantSlug: normalizedConfig.slug,
  });
  // backgroundMode maps: 'light' -> 'light', 'dark' -> 'dark', 'auto' -> 'auto'.
  // tenant.theme only wins if it's explicitly set to a real mode (not the default 'base').
  const appearanceBackgroundMode = normalizedConfig.appearance?.general?.palette?.backgroundMode;
  const VALID_THEME_MODES = new Set(['light', 'dark', 'auto']);
  const explicitTenantTheme = normalizedConfig.theme && VALID_THEME_MODES.has(normalizedConfig.theme)
    ? normalizedConfig.theme
    : undefined;
  const theme = forceTheme ?? explicitTenantTheme ?? appearanceBackgroundMode ?? normalizedConfig.theme ?? 'base';
  const locale = forcedLocale ?? normalizedConfig.locale ?? 'en';
  const fallbackLocale = forcedFallbackLocale ?? normalizedConfig.fallbackLocale ?? locale;
  const customTranslations = mergeLocaleTranslations(
    normalizedConfig.customTranslations,
    appCustomTranslations
  );

  // Product profile intentionally resolves after vertical. Vertical answers
  // "which kind of product is this?", while product profile answers
  // "which UX preset should we apply within that product space?".
  const resolvedProductProfile = productProfile ?? resolvedVertical?.defaultProductProfile;

  return (
    <TenantProvider config={normalizedConfig} vertical={resolvedVertical}>
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
              tenant={normalizedConfig.slug}
              vertical={normalizedConfig.vertical ?? resolvedVertical?.key}
              branding={normalizedConfig.branding}
              tokenOverrides={normalizedConfig.tokenOverrides}
              appearanceVars={appearanceCssVars}
              generatedChromeCss={generatedTenantCss}
              skipCssLoading={skipCssLoading}
              cssBaseUrl={cssBaseUrl}
            >
              <FeatureProvider features={normalizedConfig.features ?? []}>
                <MotionProvider profile={motionProfile} tenantDial={tenantMotionDial}>
                  <ResponsiveProvider>
                    <CommandRegistryProvider>
                      <AntdConfigProvider>
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
    </TenantProvider>
  );
}
