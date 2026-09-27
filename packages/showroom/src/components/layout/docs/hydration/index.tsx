import type { ReactNode } from 'react';

import { docsGroundStamps, readDocsSelection } from '../ground';
import { DocsRuntimeShell } from '../runtime';

export async function DocsHydrationBoundary({
  children,
}: {
  children: ReactNode;
}) {
  const [stored, stamps] = await Promise.all([readDocsSelection(), docsGroundStamps()]);
  return (
    <DocsRuntimeShell stored={stored} stamps={stamps}>
      {children}
    </DocsRuntimeShell>
  );
}
