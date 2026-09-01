'use client';

/**
 * @fileoverview Empty - Placeholder for empty data states.
 * Displays an illustration, description, and optional action CTA when
 * no content is available. Supports "default" and "simple" image variants.
 *
 * @example
 * ```tsx
 * import { Empty } from '@rottay/design-system';
 *
 * <Empty description="Your cart is empty">
 *   <Button>Start Shopping</Button>
 * </Empty>
 * ```
 *
 * @module Empty
 * @category Display
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { EmptyProps } from './contracts';

export type { EmptyProps, EmptyImageType } from './contracts';
export { EMPTY_DEFAULTS } from './contracts';

/** No compound sub-components; a single engine-routed component. */
export const Empty = createEngineComponent<EmptyProps>('Empty', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export default Empty;
