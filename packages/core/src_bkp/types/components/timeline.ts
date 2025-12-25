/**
 * Timeline Component Types
 *
 * Unified type definitions for the Timeline component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Timeline Item
 */
export interface TimelineItem {
  /** Unique key for the item */
  key?: string | number;

  /** Content of the timeline item */
  children?: ReactNode;

  /** Custom dot element */
  dot?: ReactNode;

  /** Color of the dot */
  color?: 'blue' | 'red' | 'green' | 'gray' | string;

  /** Label for the item (for alternate/left/right modes) */
  label?: ReactNode;

  /** Position of the item */
  position?: 'left' | 'right';

  /** Additional class name */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Timeline Mode
 */
export type TimelineMode = 'left' | 'right' | 'alternate';

/**
 * Timeline Props
 */
export interface TimelineProps {
  /** Timeline items */
  items?: TimelineItem[];

  /** Children (alternative to items) */
  children?: ReactNode;

  /** Timeline mode - left, right, or alternate */
  mode?: TimelineMode;

  /** Whether to show pending item */
  pending?: ReactNode | boolean;

  /** Custom pending dot */
  pendingDot?: ReactNode;

  /** Whether to reverse items order */
  reverse?: boolean;

  /** Additional class name */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get dot color class
 */
export function getDotColorClass(color?: string): string {
  switch (color) {
    case 'blue':
      return 'bg-blue-500';
    case 'red':
      return 'bg-red-500';
    case 'green':
      return 'bg-green-500';
    case 'gray':
      return 'bg-gray-400';
    default:
      return color ? '' : 'bg-blue-500';
  }
}

/**
 * Get dot color style (for custom colors)
 */
export function getDotColorStyle(color?: string): CSSProperties | undefined {
  if (!color) return undefined;
  if (['blue', 'red', 'green', 'gray'].includes(color)) return undefined;
  return { backgroundColor: color };
}

/**
 * Calculate item position in alternate mode
 */
export function getItemPosition(
  index: number,
  mode?: TimelineMode,
  itemPosition?: 'left' | 'right'
): 'left' | 'right' {
  if (itemPosition) return itemPosition;
  if (mode === 'left') return 'left';
  if (mode === 'right') return 'right';
  if (mode === 'alternate') {
    return index % 2 === 0 ? 'left' : 'right';
  }
  return 'left';
}
