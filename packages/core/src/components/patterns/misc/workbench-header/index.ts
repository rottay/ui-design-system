'use client';

/**
 * @fileoverview WorkbenchHeader pattern -- engine-aware role-home header with
 * briefing title, exception count badge, saved view selector, and quick
 * action buttons. Designed as the top-level entry point for workbench pages.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { WorkbenchHeaderProps } from './WorkbenchHeader.types';

export type {
  WorkbenchHeaderProps,
  WorkbenchQuickAction,
  WorkbenchSavedView,
} from './WorkbenchHeader.types';

/** Engine-resolved WorkbenchHeader pattern component. */
export const PatternWorkbenchHeader = createEngineComponent<WorkbenchHeaderProps>(
  'PatternWorkbenchHeader',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/classic'),
  }
);
