'use client';

/**
 * ShortcutsOverlay - Pattern Component
 *
 * A modal overlay that displays all registered keyboard shortcuts
 * organized by category with search. Uses the Kbd primitive for
 * key display. Inspired by Linear/Figma shortcuts dialog.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { ShortcutsOverlayProps } from './ShortcutsOverlay.types';

export type { ShortcutsOverlayProps, ShortcutDisplayItem } from './ShortcutsOverlay.types';

export const PatternShortcutsOverlay = createEngineComponent<ShortcutsOverlayProps>(
  'PatternShortcutsOverlay',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
