/**
 * Pagination - Engine Router
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
