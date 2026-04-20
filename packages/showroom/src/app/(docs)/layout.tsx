'use client';

import { DesignSystemProvider } from '@rottay/design-system';
import { ShowroomShell } from '@/components/layout/shell';
import { ShowroomProvider, useShowroom } from '@/components/showroom-context';

function ShowroomInner({ children }: { children: React.ReactNode }) {
  const { engine, tenantSlug } = useShowroom();

  return (
    <DesignSystemProvider forceEngine={engine} tenantSlug={tenantSlug}>
      <ShowroomShell>
        {children}
      </ShowroomShell>
    </DesignSystemProvider>
  );
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShowroomProvider>
      <ShowroomInner>
        {children}
      </ShowroomInner>
    </ShowroomProvider>
  );
}
