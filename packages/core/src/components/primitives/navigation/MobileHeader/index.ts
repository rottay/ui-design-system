'use client';

/**
 * @fileoverview MobileHeader Component - Rottay Design System
 * @description A compact mobile header with left action, centered title, and
 * right action slots. Supports sticky positioning and safe area insets.
 *
 * Engine-agnostic: composes DS primitives (Box, Flex, Text) which resolve
 * through the engine system themselves.
 *
 * @module MobileHeader
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { MobileHeaderProps } from './MobileHeader.types';

export type { MobileHeaderProps } from './MobileHeader.types';
export { MOBILE_HEADER_DEFAULTS } from './MobileHeader.types';

/** Public MobileHeader entry point resolved through the current engine. */
export const MobileHeader = createEngineComponent<MobileHeaderProps>(
  'MobileHeader',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  },
);
