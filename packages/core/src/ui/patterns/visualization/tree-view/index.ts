'use client';

/**
 * @fileoverview TreeView pattern -- engine-aware interactive tree hierarchy
 * with expand/collapse, checkboxes, drag-and-drop, and search filtering.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { TreeViewProps } from './contracts';

export type { TreeViewProps, TreeNode } from './contracts';

export const PatternTreeView = createEngineComponent<TreeViewProps>(
  'PatternTreeView',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
