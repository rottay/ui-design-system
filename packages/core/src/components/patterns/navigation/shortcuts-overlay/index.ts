'use client';

/**
 * @fileoverview ShortcutsOverlay pattern -- engine-aware modal overlay
 * displaying registered keyboard shortcuts organized by category with search.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { ShortcutsOverlayProps } from './contracts';

export type { ShortcutsOverlayProps, ShortcutDisplayItem } from './contracts';

export const PatternShortcutsOverlay = createEngineComponent<ShortcutsOverlayProps>(
  'PatternShortcutsOverlay',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
