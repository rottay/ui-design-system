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
import { BOX_DEFAULTS, SPACING_MAP, RADIUS_MAP, SHADOW_MAP, isVoidElement } from '../Box.types';
import { isResponsiveValue, generateResponsiveCSS } from '../../shared/responsive-props';
import { scalarOrUndefined, collectBoxResponsiveEntries } from '../../shared/responsive-helpers.js';

// Inline style builder for properties that cannot be expressed as static
// Tailwind classes (dimensions, colors, transforms, etc.).
function resolveSpacing(value: BoxSpacing | undefined): string | undefined {
  if (!value || value === 'none') return undefined;
  return SPACING_MAP[value];
}

function buildBoxStyles(props: BoxProps): CSSProperties {
  const style: CSSProperties = {};

  // Spacing — resolved via DS CSS custom properties (tenant-overrideable)
  const padding = scalarOrUndefined(props.padding) || scalarOrUndefined(props.p);
  if (padding && padding !== 'none') style.padding = SPACING_MAP[padding];
  const pxVal = scalarOrUndefined(props.paddingX) || scalarOrUndefined(props.px);
  const pyVal = scalarOrUndefined(props.paddingY) || scalarOrUndefined(props.py);
  if (pxVal && pxVal !== 'none') { style.paddingLeft = SPACING_MAP[pxVal]; style.paddingRight = SPACING_MAP[pxVal]; }
  if (pyVal && pyVal !== 'none') { style.paddingTop = SPACING_MAP[pyVal]; style.paddingBottom = SPACING_MAP[pyVal]; }
  const ptVal = scalarOrUndefined(props.paddingTop) || scalarOrUndefined(props.pt);
  if (ptVal && ptVal !== 'none') style.paddingTop = SPACING_MAP[ptVal];
  const prVal = scalarOrUndefined(props.paddingRight) || scalarOrUndefined(props.pr);
  if (prVal && prVal !== 'none') style.paddingRight = SPACING_MAP[prVal];
  const pbVal = scalarOrUndefined(props.paddingBottom) || scalarOrUndefined(props.pb);
  if (pbVal && pbVal !== 'none') style.paddingBottom = SPACING_MAP[pbVal];
  const plVal = scalarOrUndefined(props.paddingLeft) || scalarOrUndefined(props.pl);
  if (plVal && plVal !== 'none') style.paddingLeft = SPACING_MAP[plVal];

  const margin = scalarOrUndefined(props.margin) || scalarOrUndefined(props.m);
  if (margin && margin !== 'none') style.margin = SPACING_MAP[margin];
  const mxVal = scalarOrUndefined(props.marginX) || scalarOrUndefined(props.mx);
  const myVal = scalarOrUndefined(props.marginY) || scalarOrUndefined(props.my);
  if (mxVal && mxVal !== 'none') { style.marginLeft = SPACING_MAP[mxVal]; style.marginRight = SPACING_MAP[mxVal]; }
  if (myVal && myVal !== 'none') { style.marginTop = SPACING_MAP[myVal]; style.marginBottom = SPACING_MAP[myVal]; }
  const mtVal = scalarOrUndefined(props.marginTop) || scalarOrUndefined(props.mt);
  if (mtVal && mtVal !== 'none') style.marginTop = SPACING_MAP[mtVal];
  const mrVal = scalarOrUndefined(props.marginRight) || scalarOrUndefined(props.mr);
  if (mrVal && mrVal !== 'none') style.marginRight = SPACING_MAP[mrVal];
  const mbVal = scalarOrUndefined(props.marginBottom) || scalarOrUndefined(props.mb);
  if (mbVal && mbVal !== 'none') style.marginBottom = SPACING_MAP[mbVal];
  const mlVal = scalarOrUndefined(props.marginLeft) || scalarOrUndefined(props.ml);
  if (mlVal && mlVal !== 'none') style.marginLeft = SPACING_MAP[mlVal];

  // Border radius — resolved via DS CSS custom properties
  const radiusValue = props.borderRadius || props.rounded;
  if (radiusValue && radiusValue !== 'none') style.borderRadius = RADIUS_MAP[radiusValue];

  // Shadow — resolved via DS CSS custom properties
  if (props.shadow && props.shadow !== 'none') style.boxShadow = SHADOW_MAP[props.shadow];

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

// Spacing, radius, and shadow are now resolved via inline styles using
// DS CSS custom properties (SPACING_MAP, RADIUS_MAP, SHADOW_MAP from types).
// This replaces the old Tailwind class maps so tenant overrides flow through.

function buildTailwindClasses(props: BoxProps): string[] {
  const classes: string[] = [];

  // Spacing, radius, and shadow are now handled as inline styles via
  // buildBoxStyles using DS CSS custom properties. This ensures tenant
  // overrides flow through the --ds-spacing-*, --ds-radius-*, and
  // --ds-elevation-* token system.

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

  // Box stamps NO data-part of its own. It is the style-injection escape hatch
  // every other component composes with, so a default part would put
  // `data-part='root'` on every nested Box in the fleet: a skin rule of the form
  // `.rottay-x [data-part='root']` would then reach into X's Boxes, and any query
  // for X's own root would match them too. Box's skin anchors on its class.
  const ElementType = Component as ElementType;
  const elementProps = {
    ...htmlAttributes,
    ref: ref as Ref<HTMLElement>,
    className: classNames,
    style: computedStyle,
    ...(responsive ? responsive.attrs : {}),
  };

  // Void elements (input, img, br, hr, ...) have no content model: React-DOM
  // throws "<tag> is a void element tag and must neither have children nor use
  // dangerouslySetInnerHTML" if a children argument is passed — even an empty
  // one. Void elements therefore get NO children argument. Every other element
  // receives `children` unwrapped so a caller's child array keeps its own key
  // identity and React's dev key check points at the caller rather than at Box.
  const element = isVoidElement(Component)
    ? React.createElement(ElementType, elementProps)
    : React.createElement(ElementType, elementProps, children);

  return (
    <>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      {element}
    </>
  );
});

ModernBox.displayName = 'ModernBox';

export default ModernBox;
