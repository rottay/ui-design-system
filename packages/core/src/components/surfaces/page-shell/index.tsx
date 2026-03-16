'use client';

/**
 * @fileoverview PageShellSurface -- Rottay Design System.
 *
 * @description Minimal surface wrapper around the generic `PatternPageShell`
 * pattern component. This is the lowest-level surface and serves as the
 * shared page chrome foundation for every other page-level surface.
 *
 * @remarks
 * Other surfaces (ListSurface, DashboardSurface, FormSurface, etc.) compose
 * this component internally so page chrome (title, breadcrumbs, back button,
 * badge, maxWidth) stays consistent while the actual body content remains
 * surface-specific.
 *
 * This wrapper is intentionally small. Its value is in naming and ownership:
 * surfaces compose pages, patterns render reusable chunks. By delegating
 * to `PatternPageShell`, the surface layer avoids duplicating layout logic
 * while maintaining a clear architectural boundary.
 */

import type { ReactNode } from 'react';
import { PatternPageShell } from '../../patterns';
import type { SurfacePageChrome } from '../types';

/**
 * Props for the PageShellSurface component.
 *
 * Maps `SurfacePageChrome` to the underlying `PatternPageShell` props so
 * other surfaces do not need to destructure chrome fields manually.
 */
export interface PageShellSurfaceProps {
  /** Page chrome configuration (title, breadcrumbs, back, badge, maxWidth). */
  chrome: SurfacePageChrome;
  /** Action nodes rendered in the page header (e.g., buttons, dropdowns). */
  actions?: ReactNode;
  /** When true, the shell renders in a loading/skeleton state. */
  loading?: boolean;
  /** Page body content rendered inside the shell. */
  children: ReactNode;
}

/**
 * Thin page-chrome adapter that maps `SurfacePageChrome` to `PatternPageShell`.
 *
 * Surfaces use this component so they only need to pass a single `chrome`
 * object instead of spreading individual shell props in every surface file.
 *
 * @param props - Page shell surface props.
 * @returns A `PatternPageShell` element wrapping the children.
 *
 * @example
 * ```tsx
 * <PageShellSurface chrome={config.presentation.chrome} actions={actionButtons}>
 *   <ListContent />
 * </PageShellSurface>
 * ```
 */
export function PageShellSurface({
  chrome,
  actions,
  loading = false,
  children,
}: PageShellSurfaceProps): React.ReactElement {
  // Destructure chrome into PatternPageShell's flat prop interface.
  // This mapping is the entire raison d'etre of this component -- it
  // prevents every surface from repeating the same destructure.
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
