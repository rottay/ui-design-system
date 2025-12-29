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
 *   engine: 'titan',
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
 *   forceEngine="hermes"
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

// Default tenant config for standalone mode
const DEFAULT_TENANT_CONFIG: TenantConfig = {
  slug: 'default',
  name: 'Default Tenant',
  engine: 'titan',
  theme: 'base',
  plan: 'starter',
  features: ['*'],
  branding: {
    companyName: 'Rottay DS',
  },
};

export interface DesignSystemProviderProps {
  children: ReactNode;
  /** Provide tenant config directly (standalone mode) */
  tenantConfig?: TenantConfig;
  /** Force a specific engine */
  forceEngine?: EngineName;
  /** Force a specific theme */
  forceTheme?: string;
  /** Callback when tenant is resolved */
  onTenantResolved?: (tenant: TenantConfig) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Simple loading component
 */
const LoadingScreen: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      Loading...
    </div>
  );
};

export function DesignSystemProvider({
  children,
  tenantConfig: propTenantConfig,
  forceEngine,
  forceTheme,
  onTenantResolved,
  onError,
}: DesignSystemProviderProps): React.ReactElement {
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(
    propTenantConfig ?? null
  );
  const [loading, setLoading] = useState(!propTenantConfig);

  useEffect(() => {
    // If tenant config provided via props, use it
    if (propTenantConfig) {
      setTenantConfig(propTenantConfig);
      setLoading(false);
      onTenantResolved?.(propTenantConfig);
      return;
    }

    // Async tenant resolution placeholder.
    // Currently uses DEFAULT_TENANT_CONFIG for standalone mode.
    // Future enhancement: integrate with external tenant resolution service
    // using resolveTenant() and getTenantConfig() APIs when available.
    const loadTenant = async () => {
      try {
        const config = DEFAULT_TENANT_CONFIG;
        setTenantConfig(config);
        onTenantResolved?.(config);
      } catch (error) {
        onError?.(error as Error);
        setTenantConfig(DEFAULT_TENANT_CONFIG);
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [propTenantConfig, onTenantResolved, onError]);

  if (loading || !tenantConfig) {
    return <LoadingScreen />;
  }

  const engine = forceEngine ?? tenantConfig.engine ?? 'titan';
  const theme = forceTheme ?? tenantConfig.theme ?? 'base';

  return (
    <TenantProvider config={tenantConfig}>
      <EngineProvider defaultEngine={engine}>
        <ThemeProvider theme={theme} branding={tenantConfig.branding}>
          <FeatureProvider features={tenantConfig.features ?? []}>
            {children}
          </FeatureProvider>
        </ThemeProvider>
      </EngineProvider>
    </TenantProvider>
  );
}
