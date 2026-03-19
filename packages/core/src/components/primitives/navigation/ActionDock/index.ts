'use client';

/**
 * @fileoverview ActionDock Component - Rottay Design System
 * @description A floating action bar for sticky bottom (or top) mobile actions.
 * Renders children in a horizontal Flex row with padding and safe area insets.
 *
 * Engine-agnostic: composes DS primitives (Box, Flex) which resolve through
 * the engine system themselves.
 *
 * @module ActionDock
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { ActionDockProps } from './ActionDock.types';

export type { ActionDockProps } from './ActionDock.types';
export { ACTION_DOCK_DEFAULTS } from './ActionDock.types';

/** Public ActionDock entry point resolved through the current engine. */
export const ActionDock = createEngineComponent<ActionDockProps>(
  'ActionDock',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  },
);
