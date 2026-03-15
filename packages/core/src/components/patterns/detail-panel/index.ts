'use client';

/**
 * DetailPanel<T> - Pattern Component
 *
 * Master-detail panel with tabs, sidebar info, and action buttons.
 * Supports breadcrumbs, status badges, and configurable sidebar layout.
 */

import { createEngineComponent } from '../../../core/engines/factory';
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
