'use client';

/**
 * @fileoverview TreeView pattern -- engine-aware interactive tree hierarchy
 * with expand/collapse, checkboxes, drag-and-drop, and search filtering.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
import type { TreeViewProps } from './TreeView.types';

export type { TreeViewProps, TreeNode } from './TreeView.types';

export const PatternTreeView = createEngineComponent<TreeViewProps>(
  'PatternTreeView',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
