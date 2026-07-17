'use client';

/**
 * @fileoverview PageShell pattern -- engine-aware standard page layout
 * wrapper with title, breadcrumbs, tabs, and action buttons.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { PageShellProps } from './contracts';

export type { PageShellProps } from './contracts';

export const PatternPageShell = createEngineComponent<PageShellProps>(
  'PatternPageShell',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
