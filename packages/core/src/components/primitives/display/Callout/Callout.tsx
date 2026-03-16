'use client';

/**
 * @fileoverview Callout - Rich message box for info/warning/error/success states.
 * A richer alternative to Alert with title, icon, closable state, and action
 * slots. No compound sub-components -- a single engine-routed primitive.
 *
 * @example
 * ```tsx
 * import { Callout } from '@rottay/design-system';
 *
 * <Callout variant="warning" title="Attention" closable>
 *   Your subscription expires in 3 days.
 * </Callout>
 * ```
 *
 * @module Callout
 * @category Display
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { CalloutProps } from './Callout.types';

export {
  type CalloutProps,
  type CalloutVariant,
  CALLOUT_DEFAULTS,
  CALLOUT_COLORS,
} from './Callout.types';

/** Single engine-routed component with no compound sub-components. */
export const Callout = createEngineComponent<CalloutProps>('Callout', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

Callout.displayName = 'Callout';
