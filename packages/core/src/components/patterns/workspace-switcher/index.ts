'use client';

/**
 * WorkspaceSwitcher - Pattern Component
 *
 * Engine-aware workspace/tenant switcher with dropdown, badges, and keyboard navigation.
 * Follows the Slack/Vercel/Notion pattern.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { WorkspaceSwitcherProps } from './WorkspaceSwitcher.types';

export type { WorkspaceSwitcherProps, Workspace } from './WorkspaceSwitcher.types';

export const PatternWorkspaceSwitcher = createEngineComponent<WorkspaceSwitcherProps>(
  'PatternWorkspaceSwitcher',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
