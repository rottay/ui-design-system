'use client';

/**
 * @fileoverview DetailPanel pattern -- engine-aware master-detail panel with
 * tabs, sidebar info, action buttons, breadcrumbs, and status badges.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { DetailPanelProps } from './contracts';

export type { DetailPanelProps, DetailTab, DetailAction } from './contracts';

export const PatternDetailPanel = createEngineComponent<DetailPanelProps<any>>(
  'PatternDetailPanel',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
