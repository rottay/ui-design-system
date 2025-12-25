/**
 * Pagination Component Types
 *
 * Unified type definitions for Pagination component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface PaginationBaseProps {
  // Current page number (1-indexed)
  current?: number;
  defaultCurrent?: number;

  // Total number of items
  total: number;

  // Page size
  pageSize?: number;
  defaultPageSize?: number;

  // Change handlers
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;

  // Basic configuration
  disabled?: boolean;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Accessibility
  id?: string;
  'aria-label'?: string;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface PaginationProps extends PaginationBaseProps {
  // Visual variants
  size?: 'small' | 'default' | 'large';
  simple?: boolean;

  // UI elements visibility
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);

  // Page size options
  pageSizeOptions?: number[];

  // Hide on single page
  hideOnSinglePage?: boolean;

  // Responsive behavior (engine-specific)
  responsive?: boolean;

  // Custom item render (engine-specific)
  itemRender?: (
    page: number,
    type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
    element: ReactNode
  ) => ReactNode;

  // Show less page items (engine-specific)
  showLessItems?: boolean;

  // Total boundary and sibling count (controls how many page numbers to show)
  showFirstButton?: boolean;
  showLastButton?: boolean;
  boundaryCount?: number;
  siblingCount?: number;
}

/**
 * Type guard to check if pagination is controlled
 */
export function isControlledPagination(props: PaginationProps): boolean {
  return props.current !== undefined;
}

/**
 * Type guard to check if pagination is uncontrolled
 */
export function isUncontrolledPagination(props: PaginationProps): boolean {
  return props.current === undefined && props.defaultCurrent !== undefined;
}
