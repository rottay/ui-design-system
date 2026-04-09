'use client';

/**
 * @fileoverview CommandPalette pattern - Rottay Design System
 * @description Modal command palette with search, grouping, keyboard
 * navigation, and shortcut display.
 *
 * @remarks
 * This pattern centralizes a recurring power-user interaction model so apps
 * can plug in commands without rebuilding the full Spotlight-style shell.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { CommandPaletteProps } from './CommandPalette.types';

export type { CommandPaletteProps, CommandItem } from './CommandPalette.types';

/** Public command-palette entry point resolved through the engine factory. */
export const PatternCommandPalette = createEngineComponent<CommandPaletteProps>(
  'PatternCommandPalette',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
