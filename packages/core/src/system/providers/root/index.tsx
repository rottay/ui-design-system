/**
 * Design System Root Provider
 * Composes all providers into a single provider
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { EngineProvider } from '../engine';
import { ThemeProvider } from '../theme';
import { TenantProvider } from '../tenant';
import { FeatureProvider } from '../features';
import type { TenantConfig, EngineName } from '../../../types';

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

    // For now, use default config
    // In the future, this will call resolveTenant() and getTenantConfig()
    const loadTenant = async () => {
      try {
        // TODO: Implement actual tenant resolution
        // const slug = await resolveTenant();
        // const config = await getTenantConfig(slug);
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
