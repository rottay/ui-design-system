'use client';

import type { ReactNode } from 'react';
import {
  DesignSystemProvider,
  getKnownTenantConfig,
  type ProductProfileKey,
} from '@rottay/design-system';
import { getShowroomVerticalKey } from '@/components/showroom-context';
import { ShowroomShell } from './shell';

export function DocsProviderShell({
  children,
  engine,
  productProfile,
  tenantSlug,
}: {
  children: ReactNode;
  engine: 'classic' | 'modern' | 'rustic';
  productProfile: ProductProfileKey;
  tenantSlug: 'rottay' | 'bithire' | 'evnto';
}) {
  const tenantConfig = getKnownTenantConfig(tenantSlug);
  const runtimeKey = `${tenantSlug}:${engine}:${productProfile}`;

  return (
    <DesignSystemProvider
      key={runtimeKey}
      tenantConfig={tenantConfig ?? undefined}
      forceEngine={engine}
      productProfile={productProfile}
      vertical={getShowroomVerticalKey(tenantSlug)}
    >
      <ShowroomShell>{children}</ShowroomShell>
    </DesignSystemProvider>
  );
}
