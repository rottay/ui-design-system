'use client';

/**
 * @fileoverview WorkbenchHeader pattern -- engine-aware role-home header with
 * briefing title, exception count badge, saved view selector, and quick
 * action buttons. Designed as the top-level entry point for workbench pages.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { WorkbenchHeaderProps } from './contracts';

export type {
  WorkbenchHeaderProps,
  WorkbenchQuickAction,
  WorkbenchSavedView,
} from './contracts';

/** Engine-resolved WorkbenchHeader pattern component. */
export const PatternWorkbenchHeader = createEngineComponent<WorkbenchHeaderProps>(
  'PatternWorkbenchHeader',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/classic'),
  }
);
