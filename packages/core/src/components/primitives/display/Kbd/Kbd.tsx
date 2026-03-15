'use client';

/**
 * @fileoverview Kbd - Rottay Design System
 * @description Keyboard key display component with monospace font and subtle styling.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Kbd component displays keyboard keys or shortcuts in a styled element.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Styled with Ant Design tokens
 * - **Modern**: DaisyUI kbd class
 * - **Rustic**: Pure CSS styled kbd element
 *
 * @example Basic Usage
 * ```tsx
 * import { Kbd } from '@rottay/design-system';
 *
 * <p>Press <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> to save</p>
 * ```
 *
 * @module Kbd
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { KbdProps } from './Kbd.types';

export {
  type KbdProps,
  type KbdSize,
  KBD_DEFAULTS,
} from './Kbd.types';

export const Kbd = createEngineComponent<KbdProps>('Kbd', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

Kbd.displayName = 'Kbd';
