/**
 * @fileoverview Box Apollo Engine - Rottay Design System
 * @description Apollo (Pure HTML/CSS) implementation of the Box component.
 * Provides a dependency-free Box using inline styles for maximum compatibility.
 *
 * @remarks
 * The Apollo engine uses pure inline CSS styles without any external CSS framework
 * dependencies. This makes it ideal for:
 * - Server-side rendering without CSS extraction
 * - Embedding in third-party applications
 * - Maximum browser compatibility
 * - Accessibility-focused implementations
 *
 * All styles are computed and applied inline, ensuring consistent rendering
 * regardless of the host application's CSS setup.
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Box } from '@rottay/design-system';
 *
 * // Use Apollo for dependency-free styling
 * <Box engine="apollo" p="md" shadow="sm">
 *   Pure inline CSS, no framework dependencies
 * </Box>
 *
 * // Ideal for embedded widgets
 * <EngineProvider engine="apollo">
 *   <Box p="lg" bg="white" rounded="md">
 *     Self-contained styling
 *   </Box>
 * </EngineProvider>
 * ```
 *
 * @see {@link Box} - The main engine-aware component
 * @see {@link TitanBox} - Ant Design implementation
 * @see {@link HermesBox} - Tailwind implementation
 * @module Box/Engines/Apollo
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, type ElementType, type Ref, type CSSProperties } from 'react';
import type { BoxProps, BoxSpacing, BoxBorderRadius, BoxShadow } from '../../types';
import { BOX_DEFAULTS } from '../../types';

/**
 * Spacing value mapping (matches design tokens)
 */
const SPACING_MAP: Record<BoxSpacing, string> = {
  none: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
  '4xl': '4rem',
};

/**
 * Border radius value mapping
 */
const RADIUS_MAP: Record<BoxBorderRadius, string> = {
  none: '0',
  xs: '0.125rem',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

/**
 * Shadow value mapping
 */
const SHADOW_MAP: Record<BoxShadow, string> = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

/**
 * Builds CSSProperties from BoxProps
 */
function buildBoxStyles(props: BoxProps): CSSProperties {
  const style: CSSProperties = {};

  // Padding
  const paddingValue = props.padding || props.p;
  if (paddingValue && paddingValue !== 'none') {
    style.padding = SPACING_MAP[paddingValue];
  }
  const pxValue = props.paddingX || props.px;
  if (pxValue && pxValue !== 'none') {
    style.paddingLeft = SPACING_MAP[pxValue];
    style.paddingRight = SPACING_MAP[pxValue];
  }
  const pyValue = props.paddingY || props.py;
  if (pyValue && pyValue !== 'none') {
    style.paddingTop = SPACING_MAP[pyValue];
    style.paddingBottom = SPACING_MAP[pyValue];
  }
  const ptValue = props.paddingTop || props.pt;
  if (ptValue && ptValue !== 'none') {
    style.paddingTop = SPACING_MAP[ptValue];
  }
  const prValue = props.paddingRight || props.pr;
  if (prValue && prValue !== 'none') {
    style.paddingRight = SPACING_MAP[prValue];
  }
  const pbValue = props.paddingBottom || props.pb;
  if (pbValue && pbValue !== 'none') {
    style.paddingBottom = SPACING_MAP[pbValue];
  }
  const plValue = props.paddingLeft || props.pl;
  if (plValue && plValue !== 'none') {
    style.paddingLeft = SPACING_MAP[plValue];
  }

  // Margin
  const marginValue = props.margin || props.m;
  if (marginValue && marginValue !== 'none') {
    style.margin = SPACING_MAP[marginValue];
  }
  const mxValue = props.marginX || props.mx;
  if (mxValue && mxValue !== 'none') {
    style.marginLeft = SPACING_MAP[mxValue];
    style.marginRight = SPACING_MAP[mxValue];
  }
  const myValue = props.marginY || props.my;
  if (myValue && myValue !== 'none') {
    style.marginTop = SPACING_MAP[myValue];
    style.marginBottom = SPACING_MAP[myValue];
  }
  const mtValue = props.marginTop || props.mt;
  if (mtValue && mtValue !== 'none') {
    style.marginTop = SPACING_MAP[mtValue];
  }
  const mrValue = props.marginRight || props.mr;
  if (mrValue && mrValue !== 'none') {
    style.marginRight = SPACING_MAP[mrValue];
  }
  const mbValue = props.marginBottom || props.mb;
  if (mbValue && mbValue !== 'none') {
    style.marginBottom = SPACING_MAP[mbValue];
  }
  const mlValue = props.marginLeft || props.ml;
  if (mlValue && mlValue !== 'none') {
    style.marginLeft = SPACING_MAP[mlValue];
  }

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

  // Border radius
  const radiusValue = props.borderRadius || props.rounded;
  if (radiusValue && radiusValue !== 'none') {
    style.borderRadius = RADIUS_MAP[radiusValue];
  }

  // Shadow
  if (props.shadow && props.shadow !== 'none') {
    style.boxShadow = SHADOW_MAP[props.shadow];
  }

  // Display & Position
  if (props.display !== undefined) {
    style.display = props.display;
  }
  if (props.position !== undefined) {
    style.position = props.position;
  }
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

  // Overflow
  if (props.overflow !== undefined) {
    style.overflow = props.overflow;
  }
  if (props.overflowX !== undefined) {
    style.overflowX = props.overflowX;
  }
  if (props.overflowY !== undefined) {
    style.overflowY = props.overflowY;
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
 * Apollo Box component.
 * Uses pure HTML and inline CSS styles for maximum compatibility
 * and accessibility without external dependencies.
 */
const ApolloBox = forwardRef<HTMLElement, BoxProps>((props, ref) => {
  const {
    as: Component = BOX_DEFAULTS.as,
    className = '',
    children,
  } = props;

  const computedStyle = buildBoxStyles(props);

  // Build class names with Apollo-specific prefixes
  const classNames = [
    'rottay-box',
    'rottay-box--apollo',
    className,
  ].filter(Boolean).join(' ');

  const ElementType = Component as ElementType;

  return React.createElement(
    ElementType,
    {
      ref: ref as Ref<HTMLElement>,
      className: classNames,
      style: computedStyle,
    },
    children
  );
});

ApolloBox.displayName = 'ApolloBox';

export default ApolloBox;
