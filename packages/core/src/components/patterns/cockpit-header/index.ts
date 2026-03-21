'use client';

/**
 * @fileoverview CockpitHeader pattern -- engine-aware rich header for
 * detail/workbench pages with back navigation, breadcrumbs, title + status
 * cluster, action buttons, and optional sticky compact mode on scroll.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
import type { CockpitHeaderProps } from './CockpitHeader.types';

export type {
  CockpitHeaderProps,
  CockpitBreadcrumb,
  CockpitStatus,
} from './CockpitHeader.types';

/** Engine-resolved CockpitHeader pattern component. */
export const PatternCockpitHeader = createEngineComponent<CockpitHeaderProps>(
  'PatternCockpitHeader',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/classic'),
    rustic: () => import('./engines/classic'),
  }
);
