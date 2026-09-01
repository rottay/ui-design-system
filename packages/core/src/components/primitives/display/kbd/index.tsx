'use client';

/**
 * @fileoverview Kbd - Renders a keyboard key in monospace with subtle styling.
 * A simple display primitive with no compound sub-components.
 *
 * @example
 * ```tsx
 * import { Kbd } from '@rottay/design-system';
 *
 * <p>Press <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> to save</p>
 * ```
 *
 * @module Kbd
 * @category Display
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { KbdProps } from './contracts';

export {
  type KbdProps,
  type KbdSize,
  KBD_DEFAULTS,
} from './contracts';

/** Single engine-routed component with no compound sub-components. */
export const Kbd = createEngineComponent<KbdProps>('Kbd', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

Kbd.displayName = 'Kbd';
