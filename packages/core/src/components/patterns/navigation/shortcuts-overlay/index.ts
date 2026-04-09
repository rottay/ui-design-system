'use client';

/**
 * @fileoverview ShortcutsOverlay pattern -- engine-aware modal overlay
 * displaying registered keyboard shortcuts organized by category with search.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
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
