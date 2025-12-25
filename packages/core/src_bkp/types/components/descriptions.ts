/**
 * Descriptions Component Types
 *
 * Unified type definitions for the Descriptions component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Descriptions Item
 */
export interface DescriptionsItem {
  /** Unique key for the item */
  key?: string | number;

  /** Item label */
  label: ReactNode;

  /** Item content/value */
  children: ReactNode;

  /** Number of columns the item spans */
  span?: number;

  /** Label style */
  labelStyle?: CSSProperties;

  /** Content style */
  contentStyle?: CSSProperties;

  /** Additional class name */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Descriptions Layout
 */
export type DescriptionsLayout = 'horizontal' | 'vertical';

/**
 * Descriptions Size
 */
export type DescriptionsSize = 'default' | 'middle' | 'small';

/**
 * Descriptions Props
 */
export interface DescriptionsProps {
  /** Title of the description list */
  title?: ReactNode;

  /** Extra content in the header */
  extra?: ReactNode;

  /** Whether to show border */
  bordered?: boolean;

  /** Layout mode */
  layout?: DescriptionsLayout;

  /** Number of columns */
  column?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };

  /** Size of the list */
  size?: DescriptionsSize;

  /** Whether to show colon after label */
  colon?: boolean;

  /** Label style */
  labelStyle?: CSSProperties;

  /** Content style */
  contentStyle?: CSSProperties;

  /** Description items */
  items?: DescriptionsItem[];

  /** Children (alternative to items) */
  children?: ReactNode;

  /** Additional class name */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Descriptions Item Props (for Descriptions.Item compound component)
 */
export interface DescriptionsItemProps extends DescriptionsItem {}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get responsive column count
 */
export function getResponsiveColumn(
  column: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number },
  screenWidth: number
): number {
  if (typeof column === 'number') return column;

  if (screenWidth >= 1600 && column.xxl) return column.xxl;
  if (screenWidth >= 1200 && column.xl) return column.xl;
  if (screenWidth >= 992 && column.lg) return column.lg;
  if (screenWidth >= 768 && column.md) return column.md;
  if (screenWidth >= 576 && column.sm) return column.sm;
  if (column.xs) return column.xs;

  return 3; // Default
}

/**
 * Distribute items into rows based on column count and spans
 */
export function distributeItemsIntoRows(
  items: DescriptionsItem[],
  columnCount: number
): DescriptionsItem[][] {
  const rows: DescriptionsItem[][] = [];
  let currentRow: DescriptionsItem[] = [];
  let currentColCount = 0;

  for (const item of items) {
    const span = item.span ?? 1;

    // If item doesn't fit in current row, start a new row
    if (currentColCount + span > columnCount) {
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [item];
      currentColCount = span;
    } else {
      currentRow.push(item);
      currentColCount += span;
    }

    // If row is full, start a new row
    if (currentColCount >= columnCount) {
      rows.push(currentRow);
      currentRow = [];
      currentColCount = 0;
    }
  }

  // Add remaining items
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Get size classes
 */
export function getSizeClasses(size?: DescriptionsSize): {
  padding: string;
  text: string;
} {
  switch (size) {
    case 'small':
      return { padding: 'py-1 px-2', text: 'text-sm' };
    case 'middle':
      return { padding: 'py-2 px-3', text: 'text-sm' };
    case 'default':
    default:
      return { padding: 'py-3 px-4', text: 'text-base' };
  }
}
