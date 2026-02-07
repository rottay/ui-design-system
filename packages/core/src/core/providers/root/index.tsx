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

import React, { ReactNode, useState, useEffect } from 'react';
import { EngineProvider } from '../engine';
import { ThemeProvider } from '../theme';
import { TenantProvider } from '../tenant';
import { FeatureProvider } from '../features';
import type { TenantConfig, EngineName } from '../../types';
import { getTenantConfig as resolveTenantConfig, DEFAULT_TENANT_SLUG } from '../../../theme/tenants/storage';

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
  /** Force a specific engine */
  forceEngine?: EngineName;
  /** Force a specific theme */
  forceTheme?: string;
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

export function DesignSystemProvider({
  children,
  tenantSlug: propTenantSlug,
  tenantConfig: propTenantConfig,
  forceEngine,
  forceTheme,
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
      setTenantConfig(propTenantConfig);
      setLoading(false);
      onTenantResolved?.(propTenantConfig);
      return;
    }

    // Resolve tenant from slug or use default
    const loadTenant = async () => {
      try {
        const slug = propTenantSlug ?? DEFAULT_TENANT_SLUG;
        const config = await resolveTenantConfig(slug);
        setTenantConfig(config);
        onTenantResolved?.(config);
      } catch (error) {
        onError?.(error as Error);
        // Fallback to default tenant on error
        const defaultConfig = await resolveTenantConfig(DEFAULT_TENANT_SLUG);
        setTenantConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [propTenantSlug, propTenantConfig, onTenantResolved, onError]);

  if (loading || !tenantConfig) {
    return <LoadingScreen />;
  }

  const engine = forceEngine ?? tenantConfig.engine ?? 'classic';
  const theme = forceTheme ?? tenantConfig.theme ?? 'base';

  return (
    <TenantProvider config={tenantConfig}>
      <EngineProvider defaultEngine={engine}>
        <ThemeProvider
          theme={theme}
          tenant={tenantConfig.slug}
          branding={tenantConfig.branding}
          skipCssLoading={skipCssLoading}
          cssBaseUrl={cssBaseUrl}
        >
          <FeatureProvider features={tenantConfig.features ?? []}>
            {children}
          </FeatureProvider>
        </ThemeProvider>
      </EngineProvider>
    </TenantProvider>
  );
}
