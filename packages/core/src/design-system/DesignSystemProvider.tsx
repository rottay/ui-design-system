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
 *   engine: 'classic',
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

import React, { ReactNode, useState, useEffect, memo } from 'react';
import { EngineProvider } from '../engines/EngineProvider';
import { ThemeProvider } from '../core/providers/theme';
import { TenantProvider } from '../tenancy/TenantProvider';
import { ProductProfileProvider } from '../product-profiles/ProductProfileProvider';
import { FeatureProvider } from '../core/providers/features';
import { I18nProvider } from '../i18n';
import type { TenantConfig, EngineName, ProductProfile, ProductProfileKey } from '../core/types';
import type { LocaleTranslations, SupportedLocale } from '../i18n/types';
import { getTenantConfig as resolveTenantConfig, DEFAULT_TENANT_SLUG } from '../tenancy/storage';
import { SystemCssVariablesBridge } from './SystemCssVariablesBridge';

export interface DesignSystemProviderProps {
  children: ReactNode;
  /**
   * Tenant slug to resolve config from registry/API.
   * Use this when you want the design system to handle config resolution.
   * Falls back to default tenant (rottay) if not found.
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
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(
    propTenantConfig ?? null
  );
  const [loading, setLoading] = useState(!propTenantConfig);

  useEffect(() => {
    // If tenant config provided via props, use it (takes precedence)
    if (propTenantConfig) {
      const mergedTenantConfig = mergeTenantConfig(propTenantConfig, tenantOverrides);
      setTenantConfig(mergedTenantConfig);
      setLoading(false);
      onTenantResolved?.(mergedTenantConfig);
      return;
    }

    // Resolve tenant from slug or use default
    const loadTenant = async () => {
      try {
        const slug = propTenantSlug ?? DEFAULT_TENANT_SLUG;
        const resolvedTenantConfig = await resolveTenantConfig(slug);
        const mergedTenantConfig = mergeTenantConfig(resolvedTenantConfig, tenantOverrides);
        setTenantConfig(mergedTenantConfig);
        onTenantResolved?.(mergedTenantConfig);
      } catch (error) {
        onError?.(error as Error);
        // Fallback to default tenant on error
        const defaultTenantConfig = await resolveTenantConfig(DEFAULT_TENANT_SLUG);
        setTenantConfig(mergeTenantConfig(defaultTenantConfig, tenantOverrides));
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [propTenantSlug, propTenantConfig, tenantOverrides, onTenantResolved, onError]);

  if (loading || !tenantConfig) {
    return <LoadingScreen />;
  }

  const engine = forceEngine ?? tenantConfig.engine ?? 'classic';
  const theme = forceTheme ?? tenantConfig.theme ?? 'base';
  const locale = forcedLocale ?? tenantConfig.locale ?? 'en';
  const fallbackLocale = forcedFallbackLocale ?? tenantConfig.fallbackLocale ?? locale;
  const customTranslations = mergeLocaleTranslations(
    tenantConfig.customTranslations,
    appCustomTranslations
  );

  return (
    <TenantProvider config={tenantConfig}>
      <ProductProfileProvider profile={productProfile}>
        <I18nProvider
          locale={locale}
          fallbackLocale={fallbackLocale}
          customTranslations={customTranslations}
          onLocaleChange={onLocaleChange}
        >
          <EngineProvider defaultEngine={engine}>
            <ThemeProvider
              theme={theme}
              tenant={tenantConfig.slug}
              branding={tenantConfig.branding}
              skipCssLoading={skipCssLoading}
              cssBaseUrl={cssBaseUrl}
            >
              <FeatureProvider features={tenantConfig.features ?? []}>
                <SystemCssVariablesBridge />
                <MemoizedChildren>{children}</MemoizedChildren>
              </FeatureProvider>
            </ThemeProvider>
          </EngineProvider>
        </I18nProvider>
      </ProductProfileProvider>
    </TenantProvider>
  );
}
