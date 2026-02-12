'use client';

/**
 * TreeView - Pattern Component
 *
 * Interactive tree hierarchy with expand/collapse, checkboxes, drag, and search.
 * Used by: OrgCharts (bh), CategoryHierarchy (bar), PermissionTree (pl), MenuEditor (pl)
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { TreeViewProps } from './types';

export type { TreeViewProps, TreeNode } from './types';

export const PatternTreeView = createEngineComponent<TreeViewProps>(
  'PatternTreeView',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
