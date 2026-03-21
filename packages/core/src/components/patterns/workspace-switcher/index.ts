'use client';

/**
 * @fileoverview WorkspaceSwitcher pattern - Rottay Design System
 * @description Engine-aware workspace and tenant switcher with badges,
 * keyboard navigation, and account-style menu affordances.
 *
 * @remarks
 * This pattern packages the common "current workspace + recent destinations"
 * UX so apps do not each rebuild switching, badges, and menu state from scratch.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
import type { WorkspaceSwitcherProps } from './WorkspaceSwitcher.types';

export type { WorkspaceSwitcherProps, Workspace } from './WorkspaceSwitcher.types';

/** Public workspace switcher entry point resolved through the current engine. */
export const PatternWorkspaceSwitcher = createEngineComponent<WorkspaceSwitcherProps>(
  'PatternWorkspaceSwitcher',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
