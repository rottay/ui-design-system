'use client';

/**
 * @fileoverview MobileHeader Component - Rottay Design System
 * @description A compact mobile header with left action, centered title, and
 * right action slots. Supports sticky positioning and safe area insets.
 *
 * Engine-agnostic: composes DS primitives (Box, Flex, Text) which resolve
 * through the engine system themselves.
 *
 * @module Structures/Headers/MobileHeader
 * @category Structure
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { MobileHeaderProps } from './contracts';

export type { MobileHeaderProps } from './contracts';
export { MOBILE_HEADER_DEFAULTS } from './contracts';

/** Public MobileHeader entry point resolved through the current engine. */
export const MobileHeader = createEngineComponent<MobileHeaderProps>(
  'MobileHeader',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  },
);
