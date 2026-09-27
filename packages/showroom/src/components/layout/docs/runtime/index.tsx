'use client';

import type { ReactNode } from 'react';
import {
  getShowroomProductProfileKey,
  ShowroomProvider,
  useShowroom,
  type ShowroomSelection,
} from '@/components/showroom-context';
import type { DocsGroundStamps } from '../ground';
import { DocsProviderShell } from '../provider';

function DocsRuntimeInner({
  children,
  stamps,
}: {
  children: ReactNode;
  stamps: DocsGroundStamps;
}) {
  const { engine, tenantSlug } = useShowroom();
  const productProfile = getShowroomProductProfileKey(tenantSlug);

  return (
    <>
      {/* A body script waits for the head's stylesheets, so a frame can paint before it runs;
          render stays blocked until the parser has passed the stamp (Chromium honours it). */}
      <link rel="expect" href="#docs-ground-ready" blocking="render" />
      <script
        data-testid="docs-ground-stamp"
        data-docs-tenant={tenantSlug}
        dangerouslySetInnerHTML={{ __html: stamps[tenantSlug] }}
      />
      <template id="docs-ground-ready" />
      <DocsProviderShell
        engine={engine}
        tenantSlug={tenantSlug}
        productProfile={productProfile}
      >
        {children}
      </DocsProviderShell>
    </>
  );
}

export function DocsRuntimeShell({
  children,
  stored,
  stamps,
}: {
  children: ReactNode;
  stored: ShowroomSelection;
  stamps: DocsGroundStamps;
}) {
  return (
    <ShowroomProvider stored={stored}>
      <DocsRuntimeInner stamps={stamps}>{children}</DocsRuntimeInner>
    </ShowroomProvider>
  );
}
