'use client';

/**
 * PageShellSurface
 *
 * This wrapper is intentionally small. The value here is naming and ownership:
 * surfaces compose pages, patterns render reusable chunks. Other surfaces use
 * this component so page chrome stays consistent.
 */

import type { ReactNode } from 'react';
import { PatternPageShell } from '../../patterns';
import type { SurfacePageChrome } from '../types';

export interface PageShellSurfaceProps {
  chrome: SurfacePageChrome;
  actions?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

export function PageShellSurface({
  chrome,
  actions,
  loading = false,
  children,
}: PageShellSurfaceProps): React.ReactElement {
  return (
    <PatternPageShell
      title={chrome.title}
      subtitle={chrome.subtitle}
      breadcrumbs={chrome.breadcrumbs}
      actions={actions}
      back={chrome.back}
      badge={chrome.badge}
      maxWidth={chrome.maxWidth}
      loading={loading}
    >
      {children}
    </PatternPageShell>
  );
}
