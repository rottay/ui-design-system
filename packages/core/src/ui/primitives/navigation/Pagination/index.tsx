'use client';

/**
 * @fileoverview Pagination -- page navigation control with size changer,
 * total display, and three size variants (sm/md/lg).
 *
 * @example
 * ```tsx
 * import { Pagination } from '@rottay/design-system';
 *
 * const [page, setPage] = useState(1);
 * <Pagination
 *   current={page}
 *   total={500}
 *   pageSize={10}
 *   showSizeChanger
 *   showTotal
 *   onChange={(p, size) => setPage(p)}
 * />
 * ```
 *
 * @module Pagination
 * @category Navigation
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { PaginationProps } from './contracts';

export { type PaginationProps, type PaginationSize, PAGINATION_DEFAULTS } from './contracts';

/** Page navigation primitive resolved through the active engine. */
export const Pagination = createEngineComponent<PaginationProps>('Pagination', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic'),
  /** Rottay-native premium implementation - token-driven, skin-painted */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic'),
});
