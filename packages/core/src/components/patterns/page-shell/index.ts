'use client';

/**
 * PageShell - Pattern Component
 *
 * Engine-aware page shell with breadcrumbs, tabs, and actions.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { PageShellProps } from './PageShell.types';

export type { PageShellProps } from './PageShell.types';

export const PatternPageShell = createEngineComponent<PageShellProps>(
  'PatternPageShell',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
