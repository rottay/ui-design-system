/**
 * Flex Component Types
 *
 * Unified type definitions for Flex layout.
 * Works with titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Flex justify content options
 */
export type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

/**
 * Flex align items options
 */
export type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

/**
 * Flex wrap options
 */
export type FlexWrap = boolean | 'nowrap' | 'wrap' | 'wrap-reverse';

/**
 * Flex gap size
 */
export type FlexGap = number | 'small' | 'middle' | 'large';

/**
 * Base Flex props supported by all engines
 */
export interface FlexBaseProps {
  /** Flex children */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Extended Flex props with engine-specific features
 */
export interface FlexProps extends FlexBaseProps {
  /** Whether to use vertical (column) direction */
  vertical?: boolean;
  /** Justify content alignment */
  justify?: FlexJustify;
  /** Align items */
  align?: FlexAlign;
  /** Gap between items */
  gap?: FlexGap;
  /** Whether items should wrap */
  wrap?: FlexWrap;
  /** Flex property for the container */
  flex?: string | number;
  /** Whether to use inline-flex instead of flex */
  inline?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert gap to CSS value
 */
export function getGapValue(gap?: FlexGap): string | undefined {
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
 * Convert justify to CSS value
 */
export function getJustifyClass(justify?: FlexJustify): string {
  const justifyMap: Record<FlexJustify, string> = {
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
 * Convert align to CSS value
 */
export function getAlignClass(align?: FlexAlign): string {
  const alignMap: Record<FlexAlign, string> = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };
  return align ? alignMap[align] : '';
}

/**
 * Convert wrap to CSS class
 */
export function getWrapClass(wrap?: FlexWrap): string {
  if (wrap === true || wrap === 'wrap') return 'flex-wrap';
  if (wrap === false || wrap === 'nowrap') return 'flex-nowrap';
  if (wrap === 'wrap-reverse') return 'flex-wrap-reverse';
  return '';
}
