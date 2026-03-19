/**
 * @fileoverview Box Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Box component.
 * Provides utility-first Box using Tailwind CSS classes.
 *
 * @module Box/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useId, type ElementType, type Ref, type CSSProperties } from 'react';
import type { BoxProps, BoxSpacing, BoxBorderRadius, BoxShadow } from '../Box.types';
import { BOX_DEFAULTS, SPACING_MAP, RADIUS_MAP, SHADOW_MAP } from '../Box.types';
import { isResponsiveValue, generateResponsiveCSS } from '../../shared/responsive-props';
import { scalarOrUndefined, collectBoxResponsiveEntries } from '../../shared/responsive-helpers.js';

// Inline style builder for properties that cannot be expressed as static
// Tailwind classes (dimensions, colors, transforms, etc.).
function buildBoxStyles(props: BoxProps): CSSProperties {
  const style: CSSProperties = {};

  // Dimensions - only inline when NOT responsive
  const widthValue = scalarOrUndefined(props.width) || scalarOrUndefined(props.w);
  if (widthValue !== undefined) {
    style.width = widthValue;
  }
  const heightValue = props.height || props.h;
  if (heightValue !== undefined) {
    style.height = heightValue;
  }
  const minWidthValue = scalarOrUndefined(props.minWidth) || scalarOrUndefined(props.minW);
  if (minWidthValue !== undefined) {
    style.minWidth = minWidthValue;
  }
  const maxWidthValue = scalarOrUndefined(props.maxWidth) || scalarOrUndefined(props.maxW);
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

function buildTailwindClasses(props: BoxProps): string[] {
  const classes: string[] = [];

  // Only use Tailwind classes for scalar (non-responsive) props
  const padding = scalarOrUndefined(props.padding) || scalarOrUndefined(props.p);
  if (padding && padding !== 'none') {
    classes.push(`p-${SPACING_CLASS_MAP[padding]}`);
  }
  const pxVal = scalarOrUndefined(props.paddingX) || scalarOrUndefined(props.px);
  if (pxVal && pxVal !== 'none') {
    classes.push(`px-${SPACING_CLASS_MAP[pxVal]}`);
  }
  const pyVal = scalarOrUndefined(props.paddingY) || scalarOrUndefined(props.py);
  if (pyVal && pyVal !== 'none') {
    classes.push(`py-${SPACING_CLASS_MAP[pyVal]}`);
  }
  const ptVal = scalarOrUndefined(props.paddingTop) || scalarOrUndefined(props.pt);
  if (ptVal && ptVal !== 'none') {
    classes.push(`pt-${SPACING_CLASS_MAP[ptVal]}`);
  }
  const prVal = scalarOrUndefined(props.paddingRight) || scalarOrUndefined(props.pr);
  if (prVal && prVal !== 'none') {
    classes.push(`pr-${SPACING_CLASS_MAP[prVal]}`);
  }
  const pbVal = scalarOrUndefined(props.paddingBottom) || scalarOrUndefined(props.pb);
  if (pbVal && pbVal !== 'none') {
    classes.push(`pb-${SPACING_CLASS_MAP[pbVal]}`);
  }
  const plVal = scalarOrUndefined(props.paddingLeft) || scalarOrUndefined(props.pl);
  if (plVal && plVal !== 'none') {
    classes.push(`pl-${SPACING_CLASS_MAP[plVal]}`);
  }

  // Margin
  const margin = scalarOrUndefined(props.margin) || scalarOrUndefined(props.m);
  if (margin && margin !== 'none') {
    classes.push(`m-${SPACING_CLASS_MAP[margin]}`);
  }
  const mxVal = scalarOrUndefined(props.marginX) || scalarOrUndefined(props.mx);
  if (mxVal && mxVal !== 'none') {
    classes.push(`mx-${SPACING_CLASS_MAP[mxVal]}`);
  }
  const myVal = scalarOrUndefined(props.marginY) || scalarOrUndefined(props.my);
  if (myVal && myVal !== 'none') {
    classes.push(`my-${SPACING_CLASS_MAP[myVal]}`);
  }
  const mtVal = scalarOrUndefined(props.marginTop) || scalarOrUndefined(props.mt);
  if (mtVal && mtVal !== 'none') {
    classes.push(`mt-${SPACING_CLASS_MAP[mtVal]}`);
  }
  const mrVal = scalarOrUndefined(props.marginRight) || scalarOrUndefined(props.mr);
  if (mrVal && mrVal !== 'none') {
    classes.push(`mr-${SPACING_CLASS_MAP[mrVal]}`);
  }
  const mbVal = scalarOrUndefined(props.marginBottom) || scalarOrUndefined(props.mb);
  if (mbVal && mbVal !== 'none') {
    classes.push(`mb-${SPACING_CLASS_MAP[mbVal]}`);
  }
  const mlVal = scalarOrUndefined(props.marginLeft) || scalarOrUndefined(props.ml);
  if (mlVal && mlVal !== 'none') {
    classes.push(`ml-${SPACING_CLASS_MAP[mlVal]}`);
  }

  // Border radius
  const radiusValue = props.borderRadius || props.rounded;
  if (radiusValue && radiusValue !== 'none') {
    classes.push(ROUNDED_CLASS_MAP[radiusValue]);
  }

  // Shadow
  if (props.shadow && props.shadow !== 'none') {
    classes.push(SHADOW_CLASS_MAP[props.shadow]);
  }

  // Display - only scalar
  const display = scalarOrUndefined(props.display);
  if (display) {
    classes.push(display as string);
  }

  // Position
  if (props.position) {
    classes.push(props.position);
  }

  // Overflow
  if (props.overflow) {
    classes.push(`overflow-${props.overflow}`);
  }
  if (props.overflowX) {
    classes.push(`overflow-x-${props.overflowX}`);
  }
  if (props.overflowY) {
    classes.push(`overflow-y-${props.overflowY}`);
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

  // Responsive CSS generation
  const reactId = useId();
  const responsiveEntries = collectBoxResponsiveEntries(props);
  const needsResponsiveCSS = responsiveEntries.length > 0;

  const elementId = needsResponsiveCSS ? `box-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  // Build class names with Modern-specific prefixes and Tailwind classes
  const classNames = [
    'rottay-box',
    'rottay-box--modern',
    ...tailwindClasses,
    className,
  ].filter(Boolean).join(' ');

  const ElementType = Component as ElementType;

  return (
    <>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      {React.createElement(
        ElementType,
        {
          ...htmlAttributes,
          ref: ref as Ref<HTMLElement>,
          className: classNames,
          style: computedStyle,
          ...(responsive ? responsive.attrs : {}),
        },
        children
      )}
    </>
  );
});

ModernBox.displayName = 'ModernBox';

export default ModernBox;
