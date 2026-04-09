'use client';

/**
 * @fileoverview DetailPanel pattern -- engine-aware master-detail panel with
 * tabs, sidebar info, action buttons, breadcrumbs, and status badges.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { DetailPanelProps } from './DetailPanel.types';

export type { DetailPanelProps, DetailTab, DetailAction } from './DetailPanel.types';

export const PatternDetailPanel = createEngineComponent<DetailPanelProps<any>>(
  'PatternDetailPanel',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
