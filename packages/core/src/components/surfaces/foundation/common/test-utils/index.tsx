/**
 * @fileoverview Surface test utilities -- render helpers for testing surfaces
 * with a pre-configured DesignSystemProvider, tenant config, and product profile.
 */

import React, { Suspense, type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '../../../../../infrastructure/compilers/runtime/theme';
import type { EngineName, ProductProfileKey, TenantConfig } from '../../../../../foundation/contracts';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../../infrastructure/runtime/responsive';

/**
 * The shared surface fixture carries NO runtime visual payload.
 *
 * `censusRuntimeVisualPayload` counts `branding.primaryColor`,
 * `accentColor`, `darkPrimaryColor` and `darkAccentColor` (and the other
 * colour/font fields) as runtime paint. A tenant that carries paint without a
 * verified, mounted, compiled artifact is refused by `resolveVisualAuthority`,
 * and `DesignSystemProvider` fails closed on that conflict: it renders
 * `<LoadingScreen />` and never mounts its children. This fixture used to
 * declare four brand colours that no assertion in any surface suite ever read
 * — decorative payload that made every render through this helper block
 * forever once the authority barrier landed.
 *
 * The fix is the honest one: surface suites assert anatomy, not tenant paint,
 * so the fixture stops claiming a paint authority it never had. `companyName`
 * is deliberately kept — it is identity, not paint, and the census ignores it.
 * A suite that genuinely needs compiled tenant paint must mount a verified
 * artifact and declare `visualAuthority`; it must not re-add raw colours here.
 */
const SURFACE_TEST_TENANT: TenantConfig = {
  slug: 'surface-test',
  name: 'Surface Test Tenant',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: {
    companyName: 'Surface Test Tenant',
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

  // `classic` seeds antd from a compiled projection and refuses to guess one.
  // The fixture tenant authors no theme, so the reference vertical's compile for
  // the selected engine is the projection this stack renders with.
  const engineVisual =
    engine === 'custom' ? undefined : firstPartyEngineVisual('rottay', engine);

  // A wrapper rather than a pre-composed tree: `rerender` re-renders the CHILD,
  // so a stack composed here by hand would leave the second render with no
  // provider at all — and an undeclared engine is refused, not defaulted.
  function Wrapper({ children }: { children: ReactNode }): ReactElement {
    const content = responsiveContext ? (
      <ResponsiveContext.Provider value={responsiveContext}>
        {children}
      </ResponsiveContext.Provider>
    ) : (
      children
    );

    const providerTree = (
      <DesignSystemProvider
        tenantConfig={tenantConfig}
        tenantOverrides={tenantOverrides}
        productProfile={productProfile}
        forceEngine={engine}
        {...(engineVisual ? { engineVisual } : {})}
        skipCssLoading
      >
        <Suspense fallback={<div data-testid="surface-loading">Loading...</div>}>
          {content}
        </Suspense>
      </DesignSystemProvider>
    );

    return responsiveContext ? (
      <ResponsiveContext.Provider value={responsiveContext}>
        {providerTree}
      </ResponsiveContext.Provider>
    ) : (
      providerTree
    );
  }

  return render(ui, { ...renderOptions, wrapper: Wrapper });
}
