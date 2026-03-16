/**
 * @fileoverview Box Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Box component.
 * Provides utility-first Box using Tailwind CSS classes.
 *
 * @remarks
 * The Modern engine leverages Tailwind CSS utility classes for styling,
 * making it ideal for projects using the utility-first paradigm. Spacing,
 * shadows, and border-radius values are mapped to Tailwind class names.
 *
 * Tailwind Class Mappings:
 * - Spacing: `p-1` (xs) through `p-16` (4xl)
 * - Shadows: `shadow-xs` through `shadow-2xl`
 * - Border Radius: `rounded-sm` through `rounded-full`
 * - Display: Direct passthrough (`flex`, `grid`, etc.)
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Box } from '@rottay/design-system';
 *
 * // Use Modern engine for Tailwind classes
 * <Box engine="modern" p="md" rounded="lg" shadow="md">
 *   Outputs: class="p-4 rounded-lg shadow"
 * </Box>
 *
 * // Combine with global EngineProvider
 * <EngineProvider engine="modern">
 *   <Box p="sm" m="lg">Tailwind classes applied</Box>
 * </EngineProvider>
 * ```
 *
 * @see {@link Box} - The main engine-aware component
 * @see {@link ClassicBox} - Ant Design implementation
 * @see {@link RusticBox} - Pure HTML/CSS implementation
 * @module Box/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, type ElementType, type Ref, type CSSProperties } from 'react';
import type { BoxProps, BoxSpacing, BoxBorderRadius, BoxShadow } from '../Box.types';
import { BOX_DEFAULTS, SPACING_MAP, RADIUS_MAP, SHADOW_MAP } from '../Box.types';

// Inline style builder for properties that cannot be expressed as static
// Tailwind classes (dimensions, colors, transforms, etc.). This runs in
// parallel with buildTailwindClasses -- classes handle spacing/shadow/radius,
// inline styles handle everything else.
function buildBoxStyles(props: BoxProps): CSSProperties {
  const style: CSSProperties = {};

  // Dimensions
  const widthValue = props.width || props.w;
  if (widthValue !== undefined) {
    style.width = widthValue;
  }
  const heightValue = props.height || props.h;
  if (heightValue !== undefined) {
    style.height = heightValue;
  }
  const minWidthValue = props.minWidth || props.minW;
  if (minWidthValue !== undefined) {
    style.minWidth = minWidthValue;
  }
  const maxWidthValue = props.maxWidth || props.maxW;
  if (maxWidthValue !== undefined) {
    style.maxWidth = maxWidthValue;
  }
  const minHeightValue = props.minHeight || props.minH;
  if (minHeightValue !== undefined) {
    style.minHeight = minHeightValue;
  }
  const maxHeightValue = props.maxHeight || props.maxH;
  if (maxHeightValue !== undefined) {
    style.maxHeight = maxHeightValue;
  }

  // Background
  const bgValue = props.background || props.bg;
  if (bgValue !== undefined) {
    style.background = bgValue;
  }
  const bgColorValue = props.backgroundColor || props.bgColor;
  if (bgColorValue !== undefined) {
    style.backgroundColor = bgColorValue;
  }

  // Border
  if (props.border !== undefined) {
    style.border = props.border;
  }
  if (props.borderWidth !== undefined) {
    style.borderWidth = props.borderWidth;
  }
  if (props.borderColor !== undefined) {
    style.borderColor = props.borderColor;
  }
  if (props.borderStyle !== undefined) {
    style.borderStyle = props.borderStyle;
  }

  // Position offsets
  if (props.top !== undefined) {
    style.top = props.top;
  }
  if (props.right !== undefined) {
    style.right = props.right;
  }
  if (props.bottom !== undefined) {
    style.bottom = props.bottom;
  }
  if (props.left !== undefined) {
    style.left = props.left;
  }
  if (props.zIndex !== undefined) {
    style.zIndex = props.zIndex;
  }

  // Visual
  if (props.opacity !== undefined) {
    style.opacity = props.opacity;
  }
  if (props.transform !== undefined) {
    style.transform = props.transform;
  }
  if (props.transition !== undefined) {
    style.transition = props.transition;
  }
  if (props.cursor !== undefined) {
    style.cursor = props.cursor;
  }
  if (props.visibility !== undefined) {
    style.visibility = props.visibility;
  }
  if (props.pointerEvents !== undefined) {
    style.pointerEvents = props.pointerEvents;
  }
  if (props.userSelect !== undefined) {
    style.userSelect = props.userSelect;
  }

  // Flex
  if (props.flex !== undefined) {
    style.flex = props.flex;
  }
  if (props.flexGrow !== undefined) {
    style.flexGrow = props.flexGrow;
  }
  if (props.flexShrink !== undefined) {
    style.flexShrink = props.flexShrink;
  }
  if (props.flexBasis !== undefined) {
    style.flexBasis = props.flexBasis;
  }

  // Grid
  if (props.gridColumn !== undefined) {
    style.gridColumn = props.gridColumn;
  }
  if (props.gridRow !== undefined) {
    style.gridRow = props.gridRow;
  }
  if (props.gridArea !== undefined) {
    style.gridArea = props.gridArea;
  }

  // Text
  if (props.textAlign !== undefined) {
    style.textAlign = props.textAlign;
  }
  if (props.color !== undefined) {
    style.color = props.color;
  }

  // Merge with style prop
  if (props.style) {
    Object.assign(style, props.style);
  }

  return style;
}

/**
 * Maps spacing values to Tailwind classes
 */
const SPACING_CLASS_MAP: Record<BoxSpacing, string> = {
  none: '0',
  xs: '1',    // 0.25rem
  sm: '2',    // 0.5rem
  md: '4',    // 1rem
  lg: '6',    // 1.5rem
  xl: '8',    // 2rem
  '2xl': '10', // 2.5rem
  '3xl': '12', // 3rem
  '4xl': '16', // 4rem
};

/**
 * Maps border radius to Tailwind classes
 */
const ROUNDED_CLASS_MAP: Record<BoxBorderRadius, string> = {
  none: 'rounded-none',
  xs: 'rounded-sm',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

/**
 * Maps shadow values to Tailwind classes
 */
const SHADOW_CLASS_MAP: Record<BoxShadow, string> = {
  none: 'shadow-none',
  xs: 'shadow-xs',
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
};

// Builds an array of Tailwind utility classes from Box layout props.
// Modern engine prefers classes over inline styles so Tailwind's purge
// can detect them and include only used utilities in the production build.
// Values like dimensions, colors, and transforms fall through to inline
// styles because they are dynamic and not in Tailwind's static class set.
function buildTailwindClasses(props: BoxProps): string[] {
  const classes: string[] = [];
  const {
    padding, p,
    paddingX, px,
    paddingY, py,
    paddingTop, pt,
    paddingRight, pr,
    paddingBottom, pb,
    paddingLeft, pl,
    margin, m,
    marginX, mx,
    marginY, my,
    marginTop, mt,
    marginRight, mr,
    marginBottom, mb,
    marginLeft, ml,
    borderRadius, rounded,
    shadow,
    display,
    position,
    overflow,
    overflowX,
    overflowY,
  } = props;

  // Padding classes
  const paddingValue = padding || p;
  if (paddingValue && paddingValue !== 'none') {
    classes.push(`p-${SPACING_CLASS_MAP[paddingValue]}`);
  }
  const pxValue = paddingX || px;
  if (pxValue && pxValue !== 'none') {
    classes.push(`px-${SPACING_CLASS_MAP[pxValue]}`);
  }
  const pyValue = paddingY || py;
  if (pyValue && pyValue !== 'none') {
    classes.push(`py-${SPACING_CLASS_MAP[pyValue]}`);
  }
  const ptValue = paddingTop || pt;
  if (ptValue && ptValue !== 'none') {
    classes.push(`pt-${SPACING_CLASS_MAP[ptValue]}`);
  }
  const prValue = paddingRight || pr;
  if (prValue && prValue !== 'none') {
    classes.push(`pr-${SPACING_CLASS_MAP[prValue]}`);
  }
  const pbValue = paddingBottom || pb;
  if (pbValue && pbValue !== 'none') {
    classes.push(`pb-${SPACING_CLASS_MAP[pbValue]}`);
  }
  const plValue = paddingLeft || pl;
  if (plValue && plValue !== 'none') {
    classes.push(`pl-${SPACING_CLASS_MAP[plValue]}`);
  }

  // Margin classes
  const marginValue = margin || m;
  if (marginValue && marginValue !== 'none') {
    classes.push(`m-${SPACING_CLASS_MAP[marginValue]}`);
  }
  const mxValue = marginX || mx;
  if (mxValue && mxValue !== 'none') {
    classes.push(`mx-${SPACING_CLASS_MAP[mxValue]}`);
  }
  const myValue = marginY || my;
  if (myValue && myValue !== 'none') {
    classes.push(`my-${SPACING_CLASS_MAP[myValue]}`);
  }
  const mtValue = marginTop || mt;
  if (mtValue && mtValue !== 'none') {
    classes.push(`mt-${SPACING_CLASS_MAP[mtValue]}`);
  }
  const mrValue = marginRight || mr;
  if (mrValue && mrValue !== 'none') {
    classes.push(`mr-${SPACING_CLASS_MAP[mrValue]}`);
  }
  const mbValue = marginBottom || mb;
  if (mbValue && mbValue !== 'none') {
    classes.push(`mb-${SPACING_CLASS_MAP[mbValue]}`);
  }
  const mlValue = marginLeft || ml;
  if (mlValue && mlValue !== 'none') {
    classes.push(`ml-${SPACING_CLASS_MAP[mlValue]}`);
  }

  // Border radius
  const radiusValue = borderRadius || rounded;
  if (radiusValue && radiusValue !== 'none') {
    classes.push(ROUNDED_CLASS_MAP[radiusValue]);
  }

  // Shadow
  if (shadow && shadow !== 'none') {
    classes.push(SHADOW_CLASS_MAP[shadow]);
  }

  // Display
  if (display) {
    classes.push(display as string);
  }

  // Position
  if (position) {
    classes.push(position);
  }

  // Overflow
  if (overflow) {
    classes.push(`overflow-${overflow}`);
  }
  if (overflowX) {
    classes.push(`overflow-x-${overflowX}`);
  }
  if (overflowY) {
    classes.push(`overflow-y-${overflowY}`);
  }

  return classes;
}

/**
 * Modern Box component.
 * Uses DaisyUI/Tailwind styling conventions while maintaining
 * compatibility with the Box API.
 */
const ModernBox = forwardRef<HTMLElement, BoxProps>((props, ref) => {
  const {
    as: Component = BOX_DEFAULTS.as,
    className = '',
    children,
    // Extract all known Box props to separate from HTML attributes
    engine: _engine,
    padding: _padding,
    p: _p,
    paddingTop: _paddingTop,
    pt: _pt,
    paddingRight: _paddingRight,
    pr: _pr,
    paddingBottom: _paddingBottom,
    pb: _pb,
    paddingLeft: _paddingLeft,
    pl: _pl,
    paddingX: _paddingX,
    px: _px,
    paddingY: _paddingY,
    py: _py,
    margin: _margin,
    m: _m,
    marginTop: _marginTop,
    mt: _mt,
    marginRight: _marginRight,
    mr: _mr,
    marginBottom: _marginBottom,
    mb: _mb,
    marginLeft: _marginLeft,
    ml: _ml,
    marginX: _marginX,
    mx: _mx,
    marginY: _marginY,
    my: _my,
    display: _display,
    width: _width,
    w: _w,
    height: _height,
    h: _h,
    minWidth: _minWidth,
    minW: _minW,
    maxWidth: _maxWidth,
    maxW: _maxW,
    minHeight: _minHeight,
    minH: _minH,
    maxHeight: _maxHeight,
    maxH: _maxH,
    background: _background,
    bg: _bg,
    backgroundColor: _backgroundColor,
    bgColor: _bgColor,
    border: _border,
    borderWidth: _borderWidth,
    borderColor: _borderColor,
    borderStyle: _borderStyle,
    borderRadius: _borderRadius,
    rounded: _rounded,
    shadow: _shadow,
    overflow: _overflow,
    overflowX: _overflowX,
    overflowY: _overflowY,
    position: _position,
    top: _top,
    right: _right,
    bottom: _bottom,
    left: _left,
    zIndex: _zIndex,
    opacity: _opacity,
    transform: _transform,
    transition: _transition,
    cursor: _cursor,
    flex: _flex,
    flexGrow: _flexGrow,
    flexShrink: _flexShrink,
    flexBasis: _flexBasis,
    gridColumn: _gridColumn,
    gridRow: _gridRow,
    gridArea: _gridArea,
    textAlign: _textAlign,
    color: _color,
    visibility: _visibility,
    pointerEvents: _pointerEvents,
    userSelect: _userSelect,
    style: _style,
    // Remaining props are HTML attributes (onClick, onMouseEnter, etc.)
    ...htmlAttributes
  } = props;

  const computedStyle = buildBoxStyles(props);
  const tailwindClasses = buildTailwindClasses(props);

  // Build class names with Modern-specific prefixes and Tailwind classes
  const classNames = [
    'rottay-box',
    'rottay-box--modern',
    ...tailwindClasses,
    className,
  ].filter(Boolean).join(' ');

  const ElementType = Component as ElementType;

  return React.createElement(
    ElementType,
    {
      ...htmlAttributes,
      ref: ref as Ref<HTMLElement>,
      className: classNames,
      style: computedStyle,
    },
    children
  );
});

ModernBox.displayName = 'ModernBox';

export default ModernBox;
