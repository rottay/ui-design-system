import type { ReactNode } from 'react';
import { DocsRuntimeShell } from './docs-runtime-shell';

export function DocsHydrationBoundary({
  children,
}: {
  children: ReactNode;
}) {
  return <DocsRuntimeShell>{children}</DocsRuntimeShell>;
}
