'use client';

/**
 * CommandPalette - Pattern Component
 *
 * Modal command palette with search, grouping, keyboard navigation,
 * and shortcut display. Inspired by VS Code / Spotlight.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { CommandPaletteProps } from './types';

export type { CommandPaletteProps, CommandItem } from './types';

export const PatternCommandPalette = createEngineComponent<CommandPaletteProps>(
  'PatternCommandPalette',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
