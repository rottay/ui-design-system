'use client';

import type { ReactNode } from 'react';
import type { ImplementedEngineName } from '@rottay/design-system';
import {
  DesignSystemProvider,
  getKnownTenantConfig,
  type ProductProfileKey,
} from '@rottay/design-system';
import { getShowroomVerticalKey, type ShowroomTenant } from '@/components/showroom-context';
import { SHOWROOM_CATALOG } from '@/components/showroom-context/catalog';
import { useFirstPartyEngineVisual } from '@/components/engine-visual';
import { ShowroomShell } from '../../shell';

export function DocsProviderShell({
  children,
  engine,
  productProfile,
  tenantSlug,
}: {
  children: ReactNode;
  engine: ImplementedEngineName;
  productProfile: ProductProfileKey;
  tenantSlug: ShowroomTenant;
}) {
  const tenantConfig = getKnownTenantConfig(tenantSlug);
  const engineVisual = useFirstPartyEngineVisual(tenantSlug, engine);
  const runtimeKey = `${tenantSlug}:${engine}:${productProfile}`;

  return (
    <DesignSystemProvider
      key={runtimeKey}
      tenantConfig={tenantConfig ?? undefined}
      forceEngine={engine}
      forceTheme={SHOWROOM_CATALOG[tenantSlug].mode}
      engineVisual={engineVisual}
      productProfile={productProfile}
      vertical={getShowroomVerticalKey(tenantSlug)}
    >
      <ShowroomShell>{children}</ShowroomShell>
    </DesignSystemProvider>
  );
}
