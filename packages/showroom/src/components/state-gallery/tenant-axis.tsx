'use client';

import type { ReactNode } from 'react';
import { DesignSystemProvider, getKnownTenantConfig } from '@rottay/design-system';
import { getShowroomVerticalKey, type ShowroomTenant } from '@/composition/components/showroom-context';

// ---------------------------------------------------------------------------
// Tenant palette surface
//
// Renders children under a single tenant's modern-engine palette. Tenant and
// theme are anchored on <html> (ThemeProvider writes document.documentElement),
// so exactly ONE tenant can own a DOM — two nested same-DOM providers would both
// write <html> and the last one would silently win (rottay would render light).
// The dark (rottay) and light (bithire) grounds are therefore the SAME route
// captured twice, driven by the ?tenant= param, not two side-by-side columns.
// This is a capture-surface decision, not a product toggle (owner 2026-07-07:
// the tenant palette decides; there is no user-facing light/dark switch).
// ---------------------------------------------------------------------------

export type SurfaceTenant = 'rottay' | 'bithire' | 'evnto';

const SURFACE_THEME: Record<SurfaceTenant, 'dark' | 'light'> = {
  rottay: 'dark',
  bithire: 'light',
  evnto: 'light',
};

export function surfaceLabelFor(tenant: SurfaceTenant): string {
  return SURFACE_THEME[tenant] === 'dark' ? 'Dark surface' : 'Light surface';
}

export function TenantPaletteSurface({
  tenant,
  children,
}: {
  tenant: SurfaceTenant;
  children: ReactNode;
}) {
  const tenantConfig = getKnownTenantConfig(tenant) ?? getKnownTenantConfig('rottay');

  if (!tenantConfig) {
    return null;
  }

  return (
    <DesignSystemProvider
      forceEngine="modern"
      forceTheme={SURFACE_THEME[tenant]}
      tenantConfig={tenantConfig}
      vertical={getShowroomVerticalKey(tenant as ShowroomTenant)}
    >
      {children}
    </DesignSystemProvider>
  );
}
