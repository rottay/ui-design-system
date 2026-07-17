'use client';

import type { ReactNode } from 'react';
import {
  getShowroomProductProfileKey,
  ShowroomProvider,
  useShowroom,
} from '@/composition/components/showroom-context';
import { DocsProviderShell } from './docs-provider-shell';

function DocsRuntimeInner({ children }: { children: ReactNode }) {
  const { engine, tenantSlug } = useShowroom();
  const productProfile = getShowroomProductProfileKey(tenantSlug, engine);

  return (
    <DocsProviderShell
      engine={engine}
      tenantSlug={tenantSlug}
      productProfile={productProfile}
    >
      {children}
    </DocsProviderShell>
  );
}

export function DocsRuntimeShell({ children }: { children: ReactNode }) {
  return (
    <ShowroomProvider>
      <DocsRuntimeInner>{children}</DocsRuntimeInner>
    </ShowroomProvider>
  );
}
