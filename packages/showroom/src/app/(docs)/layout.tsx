import type { ReactNode } from 'react';
import { DocsHydrationBoundary } from '@/composition/components/layout/docs-hydration-boundary';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsHydrationBoundary>{children}</DocsHydrationBoundary>;
}
