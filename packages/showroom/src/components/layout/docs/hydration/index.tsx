import type { ReactNode } from 'react';
import { DocsRuntimeShell } from '../runtime';

export function DocsHydrationBoundary({
  children,
}: {
  children: ReactNode;
}) {
  return <DocsRuntimeShell>{children}</DocsRuntimeShell>;
}
