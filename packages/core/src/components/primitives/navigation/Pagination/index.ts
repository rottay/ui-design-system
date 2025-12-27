/**
 * Pagination - Engine Router
 *
 * This module exports the Pagination component with multi-engine support.
 * Pagination enables navigation through pages of content.
 *
 * @module Pagination
 * @example
 * ```tsx
 * import { Pagination } from '@rottay/design-system';
 *
 * // Basic usage
 * <Pagination current={1} total={100} onChange={handleChange} />
 *
 * // With page size changer
 * <Pagination current={1} total={100} showSizeChanger />
 *
 * // With total display
 * <Pagination current={1} total={100} showTotal />
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { PaginationProps } from './types';

export { type PaginationProps, type PaginationSize, PAGINATION_DEFAULTS } from './types';


// Export base component
export { BasePagination } from './base';

export const Pagination = createEngineComponent<PaginationProps>('Pagination', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
