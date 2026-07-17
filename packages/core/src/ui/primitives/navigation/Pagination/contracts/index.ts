/**
 * @fileoverview Pagination Types - Rottay Design System
 * @description Type definitions for the Pagination component.
 * Provides comprehensive TypeScript interfaces for multi-engine pagination.
 *
 * @remarks
 * These types define the contract for the Pagination component across all
 * rendering engines (Classic, Modern, Rustic). They ensure type safety while
 * allowing engine-specific implementations.
 *
 * @example Type Usage
 * ```tsx
 * import type { PaginationProps, PaginationSize } from '@rottay/design-system';
 *
 * const MyPagination: React.FC<PaginationProps> = (props) => {
 *   const { current, total, onChange } = props;
 *   // Custom implementation
 * };
 * ```
 *
 * @see {@link PaginationProps} for the main props interface
 * @see {@link PaginationSize} for size variants
 * @see {@link PAGINATION_DEFAULTS} for default values
 *
 * @module Pagination/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { CSSProperties, ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../../foundation/contracts';

// ============================================================================
// Size Types
// ============================================================================

/**
 * Available size variants for the Pagination component.
 *
 * @description
 * Defines the visual scale of pagination controls:
 * - `sm` - Compact size for dense UIs (32px height)
 * - `md` - Standard size for most use cases (40px height)
 * - `lg` - Large size for prominent navigation (48px height)
 *
 * @example
 * ```tsx
 * const size: PaginationSize = 'md';
 * <Pagination size={size} current={1} total={100} />
 * ```
 */
export type PaginationSize = 'sm' | 'md' | 'lg';

// ============================================================================
// Props Interface
// ============================================================================

/**
 * Props for the Pagination component.
 *
 * @description
 * Comprehensive interface defining all available properties for the
 * Pagination component. Extends EngineAwareProps for multi-engine support.
 *
 * @example Basic Props
 * ```tsx
 * const props: PaginationProps = {
 *   current: 1,
 *   total: 100,
 *   pageSize: 10,
 *   onChange: (page, pageSize) => console.log(page, pageSize),
 * };
 * ```
 *
 * @example Full Props
 * ```tsx
 * const props: PaginationProps = {
 *   current: 5,
 *   total: 500,
 *   pageSize: 20,
 *   size: 'lg',
 *   showSizeChanger: true,
 *   showTotal: true,
 *   disabled: false,
 *   onChange: handleChange,
 *   className: 'my-pagination',
 *   style: { marginTop: 16 },
 *   engine: 'modern',
 * };
 * ```
 */
export interface PaginationProps extends EngineAwareProps {
  /**
   * Current active page number (1-indexed).
   * @required
   * @example current={1}
   */
  current: number;

  /**
   * Total number of items across all pages.
   * @required
   * @example total={250}
   */
  total: number;

  /**
   * Number of items displayed per page.
   * @default 10
   * @example pageSize={25}
   */
  pageSize?: number;

  /**
   * Size variant of the pagination controls.
   * @default 'md'
   * @example size="lg"
   */
  size?: PaginationSize;

  /**
   * Whether to show a dropdown for changing page size.
   * @default false
   * @example showSizeChanger={true}
   */
  showSizeChanger?: boolean;

  /**
   * Whether to display the total item count.
   * @default false
   * @example showTotal={true}
   */
  showTotal?: boolean;

  /**
   * Whether the pagination is disabled.
   * @default false
   * @example disabled={true}
   */
  disabled?: boolean;

  /**
   * Callback fired when page or page size changes.
   * @param page - The new page number
   * @param pageSize - The current page size
   * @example onChange={(page, size) => setPage(page)}
   */
  onChange?: (page: number, pageSize: number) => void;

  /**
   * Optional CSS class name for custom styling.
   * @example className="my-custom-pagination"
   */
  className?: string;

  /**
   * Optional inline styles for the container.
   * @example style={{ marginTop: 16 }}
   */
  style?: CSSProperties;

  /**
   * Optional children for the base component.
   * Typically not used as pagination renders its own content.
   */
  children?: ReactNode;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for Pagination props.
 *
 * @description
 * These defaults are applied when props are not explicitly provided.
 * Engine implementations should reference these for consistency.
 *
 * @example Using Defaults
 * ```tsx
 * const pageSize = props.pageSize ?? PAGINATION_DEFAULTS.pageSize;
 * const size = props.size ?? PAGINATION_DEFAULTS.size;
 * ```
 */
export const PAGINATION_DEFAULTS: Partial<PaginationProps> = {
  /** Default items per page */
  pageSize: 10,
  /** Default size variant */
  size: 'md',
  /** Page size changer hidden by default */
  showSizeChanger: false,
  /** Total count hidden by default */
  showTotal: false,
};
