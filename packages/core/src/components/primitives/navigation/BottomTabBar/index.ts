'use client';

/**
 * @fileoverview BottomTabBar Component - Rottay Design System
 * @description A fixed-bottom tab bar for mobile app-style navigation with
 * icon + label items, active state, and optional badge indicators.
 *
 * Engine-agnostic: composes DS primitives (Box, Flex, Text) which resolve
 * through the engine system themselves.
 *
 * @module BottomTabBar
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { BottomTabBarProps } from './BottomTabBar.types';

export type { BottomTabBarProps, BottomTabBarItem } from './BottomTabBar.types';
export { BOTTOM_TAB_BAR_DEFAULTS } from './BottomTabBar.types';

/** Public BottomTabBar entry point resolved through the current engine. */
export const BottomTabBar = createEngineComponent<BottomTabBarProps>(
  'BottomTabBar',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  },
);
