/**
 * Stack Component Types
 *
 * Unified type definitions for Stack layout (vertical Flex).
 * Works with titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Stack justify options
 */
export type StackJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

/**
 * Stack align options
 */
export type StackAlign = 'start' | 'end' | 'center' | 'stretch';

/**
 * Stack gap size
 */
export type StackGap = number | 'small' | 'middle' | 'large';

/**
 * Base Stack props supported by all engines
 */
export interface StackBaseProps {
  /** Stack children */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Extended Stack props
 */
export interface StackProps extends StackBaseProps {
  /** Gap between items (alias: spacing) */
  gap?: StackGap;
  /** Spacing between items (alias for gap) */
  spacing?: StackGap;
  /** Justify content */
  justify?: StackJustify;
  /** Align items */
  align?: StackAlign;
  /** Whether items should wrap */
  wrap?: boolean;
  /** Divider between items */
  divider?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert gap to CSS value
 */
export function getStackGapValue(gap?: StackGap): string | undefined {
  if (gap === undefined) return undefined;
  if (typeof gap === 'number') return `${gap}px`;

  const gapSizes: Record<string, string> = {
    small: '8px',
    middle: '16px',
    large: '24px',
  };
  return gapSizes[gap];
}

/**
 * Get justify class for Tailwind
 */
export function getStackJustifyClass(justify?: StackJustify): string {
  const justifyMap: Record<StackJustify, string> = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };
  return justify ? justifyMap[justify] : '';
}

/**
 * Get align class for Tailwind
 */
export function getStackAlignClass(align?: StackAlign): string {
  const alignMap: Record<StackAlign, string> = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    stretch: 'items-stretch',
  };
  return align ? alignMap[align] : '';
}
