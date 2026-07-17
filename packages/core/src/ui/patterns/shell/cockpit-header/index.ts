'use client';

/**
 * @fileoverview CockpitHeader pattern -- engine-aware rich header for
 * detail/workbench pages with back navigation, breadcrumbs, title + status
 * cluster, action buttons, and optional sticky compact mode on scroll.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { CockpitHeaderProps } from './contracts';

export type {
  CockpitHeaderProps,
  CockpitBreadcrumb,
  CockpitStatus,
} from './contracts';

/** Engine-resolved CockpitHeader pattern component. */
export const PatternCockpitHeader = createEngineComponent<CockpitHeaderProps>(
  'PatternCockpitHeader',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/classic'),
  }
);
