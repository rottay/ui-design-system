'use client';

/**
 * @fileoverview ActionDock Component - Rottay Design System
 * @description A floating action bar for sticky bottom (or top) mobile actions.
 * Renders children in a horizontal Flex row with padding and safe area insets.
 *
 * Engine-agnostic: composes DS primitives (Box, Flex, Button, Dropdown) which
 * resolve through the engine system themselves.
 *
 * @module Structures/Workspace/ActionDock
 * @category Structure
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { ActionDockProps } from './contracts';

export type {
  ActionDockAction,
  ActionDockDensity,
  ActionDockOverflow,
  ActionDockPriority,
  ActionDockProps,
} from './contracts';
export { ACTION_DOCK_DEFAULTS } from './contracts';

/** Public ActionDock entry point resolved through the current engine. */
export const ActionDock = createEngineComponent<ActionDockProps>(
  'ActionDock',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  },
);
