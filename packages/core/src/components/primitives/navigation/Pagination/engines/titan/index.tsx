/**
 * @fileoverview Pagination Titan Engine - Rottay Design System
 * @description Ant Design implementation of the Pagination component.
 * Provides full-featured pagination with advanced capabilities.
 *
 * @remarks
 * The Titan engine leverages Ant Design's Pagination component, offering:
 * - Smooth animations and transitions
 * - Built-in page size changer
 * - Total items display
 * - Quick jumper input
 * - Comprehensive accessibility
 *
 * This is the default engine and provides the most feature-rich experience.
 * Use this when you need advanced pagination features out of the box.
 *
 * @example Basic Usage
 * ```tsx
 * import { Pagination } from '@rottay/design-system';
 *
 * <Pagination current={1} total={100} onChange={handleChange} />
 * ```
 *
 * @example With All Features
 * ```tsx
 * <Pagination
 *   engine="titan"
 *   current={page}
 *   total={500}
 *   pageSize={20}
 *   size="lg"
 *   showSizeChanger
 *   showTotal
 *   onChange={(page, size) => {
 *     setPage(page);
 *     setPageSize(size);
 *   }}
 * />
 * ```
 *
 * @see {@link PaginationProps} for prop definitions
 * @see {@link HermesPagination} for DaisyUI alternative
 * @see {@link ApolloPagination} for Vanilla alternative
 *
 * @module Pagination/Engines/Titan
 * @category Navigation
 * @package @rottay/design-system
 */

import React from 'react';
import { Pagination as AntPagination } from 'antd';
import type { PaginationProps, PaginationSize } from '../../types';
import { PAGINATION_DEFAULTS } from '../../types';

// ============================================================================
// Size Mapping
// ============================================================================

/**
 * Maps Rottay size variants to Ant Design size values.
 *
 * @remarks
 * Ant Design only supports 'small' and 'default' sizes.
 * Both 'md' and 'lg' map to 'default' with custom styling applied.
 */
const SIZE_MAP: Record<PaginationSize, 'small' | 'default'> = {
  sm: 'small',
  md: 'default',
  lg: 'default',
};

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * Titan engine implementation of Pagination.
 *
 * @description
 * Wraps Ant Design's Pagination component with Rottay's prop interface.
 * Provides seamless integration with the design system while leveraging
 * Ant Design's battle-tested implementation.
 *
 * @param props - {@link PaginationProps}
 * @returns Ant Design Pagination element
 *
 * @example
 * ```tsx
 * <TitanPagination
 *   current={5}
 *   total={200}
 *   pageSize={20}
 *   showSizeChanger
 *   onChange={handlePageChange}
 * />
 * ```
 */
export default function TitanPagination(props: PaginationProps): React.ReactElement {
  const {
    current,
    total,
    pageSize = PAGINATION_DEFAULTS.pageSize,
    size = PAGINATION_DEFAULTS.size,
    showSizeChanger = PAGINATION_DEFAULTS.showSizeChanger,
    showTotal = PAGINATION_DEFAULTS.showTotal,
    disabled,
    onChange,
    className,
    style,
  } = props;

  return (
    <AntPagination
      current={current}
      total={total}
      pageSize={pageSize}
      size={SIZE_MAP[size ?? 'md']}
      showSizeChanger={showSizeChanger}
      showTotal={showTotal ? (total) => `Total ${total} items` : undefined}
      disabled={disabled}
      onChange={onChange}
      className={className}
      style={style}
    />
  );
}
