'use client';

/**
 * @fileoverview PageShell pattern -- engine-aware standard page layout
 * wrapper with title, breadcrumbs, tabs, and action buttons.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
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
