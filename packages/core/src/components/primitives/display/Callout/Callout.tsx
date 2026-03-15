'use client';

/**
 * @fileoverview Callout - Rottay Design System
 * @description Rich callout box for info/warning/error/success messages.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Callout component provides a richer alternative to Alert with
 * support for title, icon, closable state, and action elements.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Styled div with Ant Design tokens
 * - **Modern**: DaisyUI alert with enhancements
 * - **Rustic**: Semantic aside element with pure CSS
 *
 * @example Basic Usage
 * ```tsx
 * import { Callout } from '@rottay/design-system';
 *
 * <Callout variant="warning" title="Attention">
 *   Your subscription expires in 3 days.
 * </Callout>
 * ```
 *
 * @example With Action
 * ```tsx
 * <Callout
 *   variant="info"
 *   title="New Feature"
 *   closable
 *   action={<Button size="sm">Learn More</Button>}
 * >
 *   Check out the new dashboard analytics.
 * </Callout>
 * ```
 *
 * @module Callout
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { CalloutProps } from './Callout.types';

export {
  type CalloutProps,
  type CalloutVariant,
  CALLOUT_DEFAULTS,
  CALLOUT_COLORS,
} from './Callout.types';

export const Callout = createEngineComponent<CalloutProps>('Callout', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

Callout.displayName = 'Callout';
