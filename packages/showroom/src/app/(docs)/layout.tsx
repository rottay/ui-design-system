'use client';

import { useState } from 'react';
import { DesignSystemProvider } from '@rottay/design-system';
import { ShowroomShell } from '@/components/layout/shell';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [engine, setEngine] = useState<'classic' | 'modern' | 'rustic'>('modern');
  const [tenantSlug, setTenantSlug] = useState('rottay');

  return (
    <DesignSystemProvider forceEngine={engine} tenantSlug={tenantSlug}>
      <ShowroomShell>
        {children}
      </ShowroomShell>
    </DesignSystemProvider>
  );
}
