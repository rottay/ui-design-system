/**
 * @fileoverview Surface test utilities -- render helpers for testing surfaces
 * with a pre-configured DesignSystemProvider, tenant config, and product profile.
 */

import React, { Suspense, type ReactElement } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { EngineName, ProductProfileKey, TenantConfig } from '../../../../../foundation/contracts';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../../infrastructure/runtime/responsive';

const SURFACE_TEST_TENANT: TenantConfig = {
  slug: 'surface-test',
  name: 'Surface Test Tenant',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: {
    companyName: 'Surface Test Tenant',
    primaryColor: '#0a66c2',
    accentColor: '#0f766e',
    darkPrimaryColor: '#60a5fa',
    darkAccentColor: '#5eead4',
  },
};

export interface RenderSurfaceOptions extends Omit<RenderOptions, 'wrapper'> {
  tenantConfig?: TenantConfig;
  tenantOverrides?: Partial<TenantConfig>;
  productProfile?: ProductProfileKey;
  /** Override the engine used for rendering. Defaults to 'rustic'. */
  engine?: EngineName;
  /** Deterministic responsive snapshot for behavior fixtures. */
  responsiveContext?: ResponsiveContextValue;
}

export const RESOLVED_PHONE_TEST_CONTEXT: ResponsiveContextValue = {
  hasResolvedViewport: true,
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isTablet: false,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: true,
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
  virtualKeyboardInset: 0,
  isVirtualKeyboardOpen: false,
};

/**
 * Surface tests should run through the real provider stack so they exercise the
 * same token, engine, and tenant resolution path that apps will use in
 * production. By default tests pin to the rustic engine to keep DOM behavior
 * stable, but callers can pass a different engine to exercise other paths.
 */
export function renderSurface(
  ui: ReactElement,
  options: RenderSurfaceOptions = {}
): RenderResult {
  const {
    tenantConfig = SURFACE_TEST_TENANT,
    tenantOverrides,
    productProfile = 'generic.default',
    engine = 'rustic',
    responsiveContext,
    ...renderOptions
  } = options;

  const content = responsiveContext ? (
    <ResponsiveContext.Provider value={responsiveContext}>{ui}</ResponsiveContext.Provider>
  ) : (
    ui
  );

  const providerTree = (
    <DesignSystemProvider
      tenantConfig={tenantConfig}
      tenantOverrides={tenantOverrides}
      productProfile={productProfile}
      forceEngine={engine}
      skipCssLoading
    >
      <Suspense fallback={<div data-testid="surface-loading">Loading...</div>}>
        {content}
      </Suspense>
    </DesignSystemProvider>
  );

  return render(
    responsiveContext ? (
      <ResponsiveContext.Provider value={responsiveContext}>
        {providerTree}
      </ResponsiveContext.Provider>
    ) : (
      providerTree
    ),
    renderOptions
  );
}
