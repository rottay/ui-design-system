/**
 * @fileoverview Box Types - Rottay Design System
 * @description Type definitions for the Box layout primitive component.
 * Provides comprehensive typing for spacing, borders, shadows, and layout properties.
 *
 * @remarks
 * The Box component uses a design token-based approach for spacing, border radius,
 * and shadow values. This ensures consistency across the design system while
 * allowing custom CSS values when needed.
 *
 * Key features:
 * - **Shorthand props**: `p`, `m`, `bg`, etc. for rapid development
 * - **Directional spacing**: `pt`, `px`, `my`, etc. for precise control
 * - **Design tokens**: Predefined values that map to CSS custom properties
 * - **Full CSS support**: Direct CSS property passthrough when needed
 *
 * @example Type Usage
 * ```tsx
 * import type { BoxProps, BoxSpacing, BoxShadow } from '@rottay/design-system';
 *
 * // Create a custom card component with Box props
 * interface CardProps extends Partial<BoxProps> {
 *   title: string;
 * }
 *
 * // Use spacing types for custom components
 * const spacing: BoxSpacing = 'md'; // '16px' equivalent
 * const shadow: BoxShadow = 'lg';   // Large elevation
 * ```
 *
 * @see {@link Box} - The main Box component
 * @module Box/Types
 * @category Layout
 * @package @rottay/design-system
 */

import type { EngineAwareProps, WithChildrenProps, BaseComponentProps } from '../../../../../types';
import type { CSSProperties, ElementType, HTMLAttributes } from 'react';

/**
 * Spacing values for padding and margin
 */
export type BoxSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

/**
 * Border radius values
 */
export type BoxBorderRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/**
 * Shadow values
 */
export type BoxShadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Display values
 */
export type BoxDisplay = CSSProperties['display'];

/**
 * Position values
 */
export type BoxPosition = CSSProperties['position'];

/**
 * Overflow values
 */
export type BoxOverflow = CSSProperties['overflow'];

/**
 * Props for the Box component.
 * A versatile container component that provides a styled box with configurable spacing,
 * borders, shadows, and other layout properties.
 */
export interface BoxProps extends EngineAwareProps, WithChildrenProps, BaseComponentProps, Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> {
  /**
   * The HTML element or React component to render as
   * @default 'div'
   */
  as?: ElementType;

  /**
   * Padding on all sides
   * @default 'none'
   */
  padding?: BoxSpacing;

  /**
   * Shorthand for padding
   */
  p?: BoxSpacing;

  /**
   * Padding on top
   */
  paddingTop?: BoxSpacing;

  /**
   * Shorthand for paddingTop
   */
  pt?: BoxSpacing;

  /**
   * Padding on right
   */
  paddingRight?: BoxSpacing;

  /**
   * Shorthand for paddingRight
   */
  pr?: BoxSpacing;

  /**
   * Padding on bottom
   */
  paddingBottom?: BoxSpacing;

  /**
   * Shorthand for paddingBottom
   */
  pb?: BoxSpacing;

  /**
   * Padding on left
   */
  paddingLeft?: BoxSpacing;

  /**
   * Shorthand for paddingLeft
   */
  pl?: BoxSpacing;

  /**
   * Padding on horizontal axis (left and right)
   */
  paddingX?: BoxSpacing;

  /**
   * Shorthand for paddingX
   */
  px?: BoxSpacing;

  /**
   * Padding on vertical axis (top and bottom)
   */
  paddingY?: BoxSpacing;

  /**
   * Shorthand for paddingY
   */
  py?: BoxSpacing;

  /**
   * Margin on all sides
   * @default 'none'
   */
  margin?: BoxSpacing;

  /**
   * Shorthand for margin
   */
  m?: BoxSpacing;

  /**
   * Margin on top
   */
  marginTop?: BoxSpacing;

  /**
   * Shorthand for marginTop
   */
  mt?: BoxSpacing;

  /**
   * Margin on right
   */
  marginRight?: BoxSpacing;

  /**
   * Shorthand for marginRight
   */
  mr?: BoxSpacing;

  /**
   * Margin on bottom
   */
  marginBottom?: BoxSpacing;

  /**
   * Shorthand for marginBottom
   */
  mb?: BoxSpacing;

  /**
   * Margin on left
   */
  marginLeft?: BoxSpacing;

  /**
   * Shorthand for marginLeft
   */
  ml?: BoxSpacing;

  /**
   * Margin on horizontal axis (left and right)
   */
  marginX?: BoxSpacing;

  /**
   * Shorthand for marginX
   */
  mx?: BoxSpacing;

  /**
   * Margin on vertical axis (top and bottom)
   */
  marginY?: BoxSpacing;

  /**
   * Shorthand for marginY
   */
  my?: BoxSpacing;

  /**
   * CSS display property
   */
  display?: BoxDisplay;

  /**
   * Width of the box
   */
  width?: CSSProperties['width'];

  /**
   * Shorthand for width
   */
  w?: CSSProperties['width'];

  /**
   * Height of the box
   */
  height?: CSSProperties['height'];

  /**
   * Shorthand for height
   */
  h?: CSSProperties['height'];

  /**
   * Minimum width of the box
   */
  minWidth?: CSSProperties['minWidth'];

  /**
   * Shorthand for minWidth
   */
  minW?: CSSProperties['minWidth'];

  /**
   * Maximum width of the box
   */
  maxWidth?: CSSProperties['maxWidth'];

  /**
   * Shorthand for maxWidth
   */
  maxW?: CSSProperties['maxWidth'];

  /**
   * Minimum height of the box
   */
  minHeight?: CSSProperties['minHeight'];

  /**
   * Shorthand for minHeight
   */
  minH?: CSSProperties['minHeight'];

  /**
   * Maximum height of the box
   */
  maxHeight?: CSSProperties['maxHeight'];

  /**
   * Shorthand for maxHeight
   */
  maxH?: CSSProperties['maxHeight'];

  /**
   * Background color or CSS background value
   */
  background?: CSSProperties['background'];

  /**
   * Shorthand for background
   */
  bg?: CSSProperties['background'];

  /**
   * Background color
   */
  backgroundColor?: CSSProperties['backgroundColor'];

  /**
   * Shorthand for backgroundColor
   */
  bgColor?: CSSProperties['backgroundColor'];

  /**
   * Border shorthand (e.g., '1px solid #ccc')
   */
  border?: CSSProperties['border'];

  /**
   * Border width
   */
  borderWidth?: CSSProperties['borderWidth'];

  /**
   * Border color
   */
  borderColor?: CSSProperties['borderColor'];

  /**
   * Border style
   */
  borderStyle?: CSSProperties['borderStyle'];

  /**
   * Border radius
   * @default 'none'
   */
  borderRadius?: BoxBorderRadius;

  /**
   * Shorthand for borderRadius
   */
  rounded?: BoxBorderRadius;

  /**
   * Box shadow
   * @default 'none'
   */
  shadow?: BoxShadow;

  /**
   * Overflow behavior
   */
  overflow?: BoxOverflow;

  /**
   * Overflow behavior on X axis
   */
  overflowX?: CSSProperties['overflowX'];

  /**
   * Overflow behavior on Y axis
   */
  overflowY?: CSSProperties['overflowY'];

  /**
   * CSS position property
   */
  position?: BoxPosition;

  /**
   * Top position (requires position to be set)
   */
  top?: CSSProperties['top'];

  /**
   * Right position (requires position to be set)
   */
  right?: CSSProperties['right'];

  /**
   * Bottom position (requires position to be set)
   */
  bottom?: CSSProperties['bottom'];

  /**
   * Left position (requires position to be set)
   */
  left?: CSSProperties['left'];

  /**
   * Z-index for stacking context
   */
  zIndex?: CSSProperties['zIndex'];

  /**
   * Opacity of the box
   */
  opacity?: CSSProperties['opacity'];

  /**
   * CSS transform
   */
  transform?: CSSProperties['transform'];

  /**
   * CSS transition
   */
  transition?: CSSProperties['transition'];

  /**
   * Cursor style
   */
  cursor?: CSSProperties['cursor'];

  /**
   * Flex properties
   */
  flex?: CSSProperties['flex'];
  flexGrow?: CSSProperties['flexGrow'];
  flexShrink?: CSSProperties['flexShrink'];
  flexBasis?: CSSProperties['flexBasis'];

  /**
   * Grid properties
   */
  gridColumn?: CSSProperties['gridColumn'];
  gridRow?: CSSProperties['gridRow'];
  gridArea?: CSSProperties['gridArea'];

  /**
   * Text alignment
   */
  textAlign?: CSSProperties['textAlign'];

  /**
   * Color (text color)
   */
  color?: CSSProperties['color'];

  /**
   * Visibility
   */
  visibility?: CSSProperties['visibility'];

  /**
   * Pointer events
   */
  pointerEvents?: CSSProperties['pointerEvents'];

  /**
   * User select behavior
   */
  userSelect?: CSSProperties['userSelect'];
}

/**
 * Default values for Box props
 */
export const BOX_DEFAULTS: Partial<BoxProps> = {
  as: 'div',
  padding: 'none',
  margin: 'none',
  borderRadius: 'none',
  shadow: 'none',
};

/**
 * Spacing value mapping (matches design tokens)
 */
export const SPACING_MAP: Record<BoxSpacing, string> = {
  none: '0',
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
};

/**
 * Border radius value mapping
 */
export const RADIUS_MAP: Record<BoxBorderRadius, string> = {
  none: '0',
  xs: '0.125rem',   // 2px
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
};

/**
 * Shadow value mapping
 */
export const SHADOW_MAP: Record<BoxShadow, string> = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};
