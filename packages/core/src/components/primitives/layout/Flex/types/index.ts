/**
 * @fileoverview Flex Types - Rottay Design System
 * @description Type definitions for the Flex layout component.
 * Provides comprehensive typing for flexbox direction, alignment, justification, and wrapping.
 *
 * @remarks
 * The Flex component uses CSS Flexbox terminology directly, making it intuitive
 * for developers familiar with CSS. The type system ensures valid combinations
 * of flexbox properties while providing helpful documentation.
 *
 * Key type mappings:
 * - `FlexDirection`: Maps to CSS flex-direction (row, column, row-reverse, column-reverse)
 * - `FlexWrap`: Maps to CSS flex-wrap (nowrap, wrap, wrap-reverse)
 * - `FlexJustify`: Maps to CSS justify-content with shorthand names
 * - `FlexAlign`: Maps to CSS align-items with shorthand names
 *
 * @example Type Usage
 * ```tsx
 * import type { FlexProps, FlexDirection, FlexJustify } from '@rottay/design-system';
 *
 * // Create a custom flex wrapper
 * interface CardRowProps extends Partial<FlexProps> {
 *   title: string;
 * }
 *
 * // Use types for state management
 * const [direction, setDirection] = useState<FlexDirection>('row');
 * const [justify, setJustify] = useState<FlexJustify>('between');
 * ```
 *
 * @see {@link Flex} - The main Flex component
 * @module Flex/Types
 * @category Layout
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
export type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

export interface FlexProps {
  /** Flex direction */
  direction?: FlexDirection;
  /** Flex wrap behavior */
  wrap?: FlexWrap;
  /** Justify content alignment */
  justify?: FlexJustify;
  /** Align items alignment */
  align?: FlexAlign;
  /** Gap between items: number (px) or [horizontal, vertical] */
  gap?: number | [number, number];
  /** Flex property value */
  flex?: string | number;
  /** Use inline-flex instead of flex */
  inline?: boolean;
  /** Flex content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: 'classic' | 'modern' | 'rustic';
}

export const FLEX_DEFAULTS: Partial<FlexProps> = {
  direction: 'row',
  wrap: 'nowrap',
  justify: 'start',
  align: 'stretch',
  inline: false,
};

/** CSS justify-content mapping */
export const FLEX_JUSTIFY_MAP: Record<FlexJustify, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

/** CSS align-items mapping */
export const FLEX_ALIGN_MAP: Record<FlexAlign, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  baseline: 'baseline',
  stretch: 'stretch',
};
