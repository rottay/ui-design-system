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

import { createEngineComponent } from '../../../../engines/factory';
import type { EmptyProps } from './Empty.types';

export type { EmptyProps, EmptyImageType } from './Empty.types';
export { EMPTY_DEFAULTS } from './Empty.types';

/** No compound sub-components; a single engine-routed component. */
export const Empty = createEngineComponent<EmptyProps>('Empty', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export default Empty;
