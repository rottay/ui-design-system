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

import type { EngineAwareProps, WithChildrenProps, BaseComponentProps } from '../../../../../foundation/contracts';
import type { CSSProperties, ElementType, HTMLAttributes } from 'react';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';

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
export interface BoxProps extends EngineAwareProps, WithChildrenProps, BaseComponentProps, Omit<HTMLAttributes<HTMLElement>, 'style' | 'className' | 'color'> {
  /**
   * The HTML element or React component to render as
   * @default 'div'
   */
  as?: ElementType;

  /**
   * Associates a label with a control. Meaningful only when `as="label"`.
   *
   * `BoxProps` extends `HTMLAttributes<HTMLElement>`, which carries no
   * element-specific attributes, so a polymorphic `as` cannot type them. A label
   * without this is not a label, and the design system forbids raw HTML.
   */
  htmlFor?: string;

  /**
   * Padding on all sides. Accepts a responsive object for breakpoint-aware values.
   * @default 'none'
   */
  padding?: ResponsiveValue<BoxSpacing>;

  /**
   * Shorthand for padding. Accepts a responsive object for breakpoint-aware values.
   */
  p?: ResponsiveValue<BoxSpacing>;

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
   * Padding on horizontal axis (left and right). Accepts a responsive object.
   */
  paddingX?: ResponsiveValue<BoxSpacing>;

  /**
   * Shorthand for paddingX. Accepts a responsive object.
   */
  px?: ResponsiveValue<BoxSpacing>;

  /**
   * Padding on vertical axis (top and bottom). Accepts a responsive object.
   */
  paddingY?: ResponsiveValue<BoxSpacing>;

  /**
   * Shorthand for paddingY. Accepts a responsive object.
   */
  py?: ResponsiveValue<BoxSpacing>;

  /**
   * Margin on all sides. Accepts a responsive object for breakpoint-aware values.
   * @default 'none'
   */
  margin?: ResponsiveValue<BoxSpacing>;

  /**
   * Shorthand for margin. Accepts a responsive object for breakpoint-aware values.
   */
  m?: ResponsiveValue<BoxSpacing>;

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
   * Margin on horizontal axis (left and right). Accepts a responsive object.
   */
  marginX?: ResponsiveValue<BoxSpacing>;

  /**
   * Shorthand for marginX. Accepts a responsive object.
   */
  mx?: ResponsiveValue<BoxSpacing>;

  /**
   * Margin on vertical axis (top and bottom). Accepts a responsive object.
   */
  marginY?: ResponsiveValue<BoxSpacing>;

  /**
   * Shorthand for marginY. Accepts a responsive object.
   */
  my?: ResponsiveValue<BoxSpacing>;

  /**
   * CSS display property. Accepts a responsive object for breakpoint-aware values.
   */
  display?: ResponsiveValue<BoxDisplay>;

  /**
   * Width of the box. Accepts a responsive object for breakpoint-aware values.
   */
  width?: ResponsiveValue<CSSProperties['width']>;

  /**
   * Shorthand for width. Accepts a responsive object for breakpoint-aware values.
   */
  w?: ResponsiveValue<CSSProperties['width']>;

  /**
   * Height of the box
   */
  height?: CSSProperties['height'];

  /**
   * Shorthand for height
   */
  h?: CSSProperties['height'];

  /**
   * Minimum width of the box. Accepts a responsive object for breakpoint-aware values.
   */
  minWidth?: ResponsiveValue<CSSProperties['minWidth']>;

  /**
   * Shorthand for minWidth. Accepts a responsive object for breakpoint-aware values.
   */
  minW?: ResponsiveValue<CSSProperties['minWidth']>;

  /**
   * Maximum width of the box. Accepts a responsive object for breakpoint-aware values.
   */
  maxWidth?: ResponsiveValue<CSSProperties['maxWidth']>;

  /**
   * Shorthand for maxWidth. Accepts a responsive object for breakpoint-aware values.
   */
  maxW?: ResponsiveValue<CSSProperties['maxWidth']>;

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
 * Spacing value mapping — resolves through DS CSS custom properties so
 * tenant overrides (via brandTheme.surfaces or tokenOverrides) can adjust
 * the entire spacing scale at once. The numeric --ds-spacing-N tokens are
 * the canonical source; hardcoded rem fallbacks ensure rendering before
 * CSS loads.
 */
export const SPACING_MAP: Record<BoxSpacing, string> = {
  none: '0',
  xs: 'var(--ds-spacing-1, 0.25rem)',     // 4px
  sm: 'var(--ds-spacing-2, 0.5rem)',      // 8px
  md: 'var(--ds-spacing-4, 1rem)',        // 16px
  lg: 'var(--ds-spacing-6, 1.5rem)',      // 24px
  xl: 'var(--ds-spacing-8, 2rem)',        // 32px
  '2xl': 'var(--ds-spacing-10, 2.5rem)',  // 40px
  '3xl': 'var(--ds-spacing-12, 3rem)',    // 48px
  '4xl': 'var(--ds-spacing-16, 4rem)',    // 64px
};

/**
 * Border radius value mapping — resolves through DS CSS custom properties.
 */
export const RADIUS_MAP: Record<BoxBorderRadius, string> = {
  none: '0',
  xs: 'var(--ds-radius-xs, 0.1875rem)',   // 3px
  sm: 'var(--ds-radius-sm, 0.375rem)',    // 6px
  md: 'var(--ds-radius-md, 0.5rem)',      // 8px
  lg: 'var(--ds-radius-lg, 0.75rem)',     // 12px
  xl: 'var(--ds-radius-xl, 1rem)',        // 16px
  '2xl': 'var(--ds-radius-2xl, 1.25rem)', // 20px
  full: 'var(--ds-radius-full, 9999px)',
};

/**
 * Shadow value mapping — resolves through DS CSS custom properties.
 */
export const SHADOW_MAP: Record<BoxShadow, string> = {
  none: 'none',
  xs: 'var(--ds-elevation-1, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
  sm: 'var(--ds-elevation-2, 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1))',
  md: 'var(--ds-elevation-3, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1))',
  lg: 'var(--ds-elevation-4, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1))',
  xl: 'var(--ds-elevation-5, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1))',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

/**
 * The complete set of HTML void (self-closing) elements. Per the HTML spec
 * these elements have no content model: the DOM rejects any children on them,
 * and React-DOM throws
 * `"<tag> is a void element tag and must neither have children nor use
 * dangerouslySetInnerHTML"` if a children argument is supplied.
 *
 * A `Box` can render any of these through `as` (e.g. `as="input"`,
 * `as="img"`, `as="hr"`), so every engine must create them WITHOUT a children
 * argument. See {@link isVoidElement}.
 */
export const VOID_ELEMENTS: ReadonlySet<string> = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/**
 * Returns `true` when `as` resolves to an intrinsic HTML void element that must
 * be created without any children argument.
 *
 * Only string tag names can be void — a component `as` (function/class) owns
 * its own children contract, so those always return `false`.
 */
export function isVoidElement(as: ElementType | undefined): boolean {
  return typeof as === 'string' && VOID_ELEMENTS.has(as);
}
