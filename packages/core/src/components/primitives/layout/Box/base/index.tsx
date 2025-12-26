/**
 * Box - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, type CSSProperties, type ElementType, type Ref } from 'react';
import type { BoxProps, BoxSpacing, BoxBorderRadius, BoxShadow } from '../types';
import { BOX_DEFAULTS, SPACING_MAP, RADIUS_MAP, SHADOW_MAP } from '../types';

/**
 * Resolves spacing value to CSS value
 */
function resolveSpacing(value: BoxSpacing | undefined): string | undefined {
  if (!value || value === 'none') return undefined;
  return SPACING_MAP[value];
}

/**
 * Resolves border radius value to CSS value
 */
function resolveRadius(value: BoxBorderRadius | undefined): string | undefined {
  if (!value || value === 'none') return undefined;
  return RADIUS_MAP[value];
}

/**
 * Resolves shadow value to CSS value
 */
function resolveShadow(value: BoxShadow | undefined): string | undefined {
  if (!value || value === 'none') return undefined;
  return SHADOW_MAP[value];
}

/**
 * Build styles from Box props
 */
export function buildBoxStyles(props: BoxProps): CSSProperties {
  const {
    // Padding props
    padding, p,
    paddingTop, pt,
    paddingRight, pr,
    paddingBottom, pb,
    paddingLeft, pl,
    paddingX, px,
    paddingY, py,

    // Margin props
    margin, m,
    marginTop, mt,
    marginRight, mr,
    marginBottom, mb,
    marginLeft, ml,
    marginX, mx,
    marginY, my,

    // Dimension props
    display,
    width, w,
    height, h,
    minWidth, minW,
    maxWidth, maxW,
    minHeight, minH,
    maxHeight, maxH,

    // Background props
    background, bg,
    backgroundColor, bgColor,

    // Border props
    border,
    borderWidth,
    borderColor,
    borderStyle,
    borderRadius, rounded,

    // Shadow
    shadow,

    // Overflow
    overflow,
    overflowX,
    overflowY,

    // Position
    position,
    top,
    right,
    bottom,
    left,
    zIndex,

    // Visual
    opacity,
    transform,
    transition,
    cursor,
    visibility,
    pointerEvents,
    userSelect,

    // Flex
    flex,
    flexGrow,
    flexShrink,
    flexBasis,

    // Grid
    gridColumn,
    gridRow,
    gridArea,

    // Text
    textAlign,
    color,

    // Style prop
    style,
  } = props;

  // Resolve padding values (shorthand has lower priority)
  const resolvedPadding = resolveSpacing(padding || p);
  const resolvedPaddingTop = resolveSpacing(paddingTop || pt || paddingY || py);
  const resolvedPaddingRight = resolveSpacing(paddingRight || pr || paddingX || px);
  const resolvedPaddingBottom = resolveSpacing(paddingBottom || pb || paddingY || py);
  const resolvedPaddingLeft = resolveSpacing(paddingLeft || pl || paddingX || px);

  // Resolve margin values
  const resolvedMargin = resolveSpacing(margin || m);
  const resolvedMarginTop = resolveSpacing(marginTop || mt || marginY || my);
  const resolvedMarginRight = resolveSpacing(marginRight || mr || marginX || mx);
  const resolvedMarginBottom = resolveSpacing(marginBottom || mb || marginY || my);
  const resolvedMarginLeft = resolveSpacing(marginLeft || ml || marginX || mx);

  // Build computed styles
  const computedStyles: CSSProperties = {
    // Padding - individual values override the all-sides value
    ...(resolvedPadding && { padding: resolvedPadding }),
    ...(resolvedPaddingTop && { paddingTop: resolvedPaddingTop }),
    ...(resolvedPaddingRight && { paddingRight: resolvedPaddingRight }),
    ...(resolvedPaddingBottom && { paddingBottom: resolvedPaddingBottom }),
    ...(resolvedPaddingLeft && { paddingLeft: resolvedPaddingLeft }),

    // Margin
    ...(resolvedMargin && { margin: resolvedMargin }),
    ...(resolvedMarginTop && { marginTop: resolvedMarginTop }),
    ...(resolvedMarginRight && { marginRight: resolvedMarginRight }),
    ...(resolvedMarginBottom && { marginBottom: resolvedMarginBottom }),
    ...(resolvedMarginLeft && { marginLeft: resolvedMarginLeft }),

    // Display
    ...(display && { display }),

    // Dimensions
    ...(width || w) && { width: width || w },
    ...(height || h) && { height: height || h },
    ...(minWidth || minW) && { minWidth: minWidth || minW },
    ...(maxWidth || maxW) && { maxWidth: maxWidth || maxW },
    ...(minHeight || minH) && { minHeight: minHeight || minH },
    ...(maxHeight || maxH) && { maxHeight: maxHeight || maxH },

    // Background
    ...(background || bg) && { background: background || bg },
    ...(backgroundColor || bgColor) && { backgroundColor: backgroundColor || bgColor },

    // Border
    ...(border && { border }),
    ...(borderWidth && { borderWidth }),
    ...(borderColor && { borderColor }),
    ...(borderStyle && { borderStyle }),
    ...(resolveRadius(borderRadius || rounded) && {
      borderRadius: resolveRadius(borderRadius || rounded),
    }),

    // Shadow
    ...(resolveShadow(shadow) && { boxShadow: resolveShadow(shadow) }),

    // Overflow
    ...(overflow && { overflow }),
    ...(overflowX && { overflowX }),
    ...(overflowY && { overflowY }),

    // Position
    ...(position && { position }),
    ...(top !== undefined && { top }),
    ...(right !== undefined && { right }),
    ...(bottom !== undefined && { bottom }),
    ...(left !== undefined && { left }),
    ...(zIndex !== undefined && { zIndex }),

    // Visual
    ...(opacity !== undefined && { opacity }),
    ...(transform && { transform }),
    ...(transition && { transition }),
    ...(cursor && { cursor }),
    ...(visibility && { visibility }),
    ...(pointerEvents && { pointerEvents }),
    ...(userSelect && { userSelect }),

    // Flex
    ...(flex && { flex }),
    ...(flexGrow !== undefined && { flexGrow }),
    ...(flexShrink !== undefined && { flexShrink }),
    ...(flexBasis && { flexBasis }),

    // Grid
    ...(gridColumn && { gridColumn }),
    ...(gridRow && { gridRow }),
    ...(gridArea && { gridArea }),

    // Text
    ...(textAlign && { textAlign }),
    ...(color && { color }),

    // Merge with style prop (style prop takes highest priority)
    ...style,
  };

  return computedStyles;
}

/**
 * Filter out Box-specific props from being passed to the DOM element
 */
export function filterBoxProps(props: BoxProps): Record<string, unknown> {
  const {
    // Remove Box-specific props
    as: _as,
    engine: _engine,
    padding: _padding, p: _p,
    paddingTop: _paddingTop, pt: _pt,
    paddingRight: _paddingRight, pr: _pr,
    paddingBottom: _paddingBottom, pb: _pb,
    paddingLeft: _paddingLeft, pl: _pl,
    paddingX: _paddingX, px: _px,
    paddingY: _paddingY, py: _py,
    margin: _margin, m: _m,
    marginTop: _marginTop, mt: _mt,
    marginRight: _marginRight, mr: _mr,
    marginBottom: _marginBottom, mb: _mb,
    marginLeft: _marginLeft, ml: _ml,
    marginX: _marginX, mx: _mx,
    marginY: _marginY, my: _my,
    display: _display,
    width: _width, w: _w,
    height: _height, h: _h,
    minWidth: _minWidth, minW: _minW,
    maxWidth: _maxWidth, maxW: _maxW,
    minHeight: _minHeight, minH: _minH,
    maxHeight: _maxHeight, maxH: _maxH,
    background: _background, bg: _bg,
    backgroundColor: _backgroundColor, bgColor: _bgColor,
    border: _border,
    borderWidth: _borderWidth,
    borderColor: _borderColor,
    borderStyle: _borderStyle,
    borderRadius: _borderRadius, rounded: _rounded,
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
    visibility: _visibility,
    pointerEvents: _pointerEvents,
    userSelect: _userSelect,
    flex: _flex,
    flexGrow: _flexGrow,
    flexShrink: _flexShrink,
    flexBasis: _flexBasis,
    gridColumn: _gridColumn,
    gridRow: _gridRow,
    gridArea: _gridArea,
    textAlign: _textAlign,
    color: _color,
    className: _className,
    style: _style,
    children: _children,
    ...rest
  } = props;

  return rest;
}

/**
 * Base Box component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseBox = forwardRef<HTMLElement, BoxProps>(
  (props, ref) => {
    const {
      as: Component = BOX_DEFAULTS.as,
      className = '',
      children,
    } = props;

    const computedStyle = buildBoxStyles(props);
    const filteredProps = filterBoxProps(props);

    // Cast Component to ElementType for createElement
    const ElementType = Component as ElementType;

    return React.createElement(
      ElementType,
      {
        ref: ref as Ref<HTMLElement>,
        className: `rottay-box ${className}`.trim(),
        style: computedStyle,
        ...filteredProps,
      },
      children
    );
  }
);

BaseBox.displayName = 'BaseBox';
