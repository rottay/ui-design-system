/**
 * @fileoverview Box Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Box component.
 * Provides a dependency-free Box using inline styles for maximum compatibility.
 *
 * @module Box/Engines/Rustic
 * @category Layout
 * @package @rottay/design-system
 */

"use client";

import React, {
  forwardRef,
  useId,
  type ElementType,
  type Ref,
  type CSSProperties,
} from "react";
import type { BoxProps, BoxSpacing } from "../../contracts";
import { BOX_DEFAULTS, SPACING_MAP, isVoidElement } from "../../contracts";
import {
  generateResponsiveCSS,
  isResponsiveValue,
  scalarOrUndefined,
} from "@/infrastructure/runtime/responsive/runtime/style-properties";
import { collectBoxResponsiveEntries } from "../../runtime/responsive";

// Rustic engine converts ALL layout props to inline CSSProperties.
function buildBoxStyles(props: BoxProps): CSSProperties {
  const style: CSSProperties = {};

  // Padding - only inline when NOT responsive
  const paddingValue =
    scalarOrUndefined(props.padding) || scalarOrUndefined(props.p);
  if (paddingValue && paddingValue !== "none") {
    style.padding = SPACING_MAP[paddingValue];
  }
  const pxValue =
    scalarOrUndefined(props.paddingX) || scalarOrUndefined(props.px);
  if (pxValue && pxValue !== "none") {
    style.paddingLeft = SPACING_MAP[pxValue];
    style.paddingRight = SPACING_MAP[pxValue];
  }
  const pyValue =
    scalarOrUndefined(props.paddingY) || scalarOrUndefined(props.py);
  if (pyValue && pyValue !== "none") {
    style.paddingTop = SPACING_MAP[pyValue];
    style.paddingBottom = SPACING_MAP[pyValue];
  }
  const ptValue =
    scalarOrUndefined(props.paddingTop) || scalarOrUndefined(props.pt);
  if (ptValue && ptValue !== "none") {
    style.paddingTop = SPACING_MAP[ptValue];
  }
  const prValue =
    scalarOrUndefined(props.paddingRight) || scalarOrUndefined(props.pr);
  if (prValue && prValue !== "none") {
    style.paddingRight = SPACING_MAP[prValue];
  }
  const pbValue =
    scalarOrUndefined(props.paddingBottom) || scalarOrUndefined(props.pb);
  if (pbValue && pbValue !== "none") {
    style.paddingBottom = SPACING_MAP[pbValue];
  }
  const plValue =
    scalarOrUndefined(props.paddingLeft) || scalarOrUndefined(props.pl);
  if (plValue && plValue !== "none") {
    style.paddingLeft = SPACING_MAP[plValue];
  }

  // Margin - only inline when NOT responsive
  const marginValue =
    scalarOrUndefined(props.margin) || scalarOrUndefined(props.m);
  if (marginValue && marginValue !== "none") {
    style.margin = SPACING_MAP[marginValue];
  }
  const mxValue =
    scalarOrUndefined(props.marginX) || scalarOrUndefined(props.mx);
  if (mxValue && mxValue !== "none") {
    style.marginLeft = SPACING_MAP[mxValue];
    style.marginRight = SPACING_MAP[mxValue];
  }
  const myValue =
    scalarOrUndefined(props.marginY) || scalarOrUndefined(props.my);
  if (myValue && myValue !== "none") {
    style.marginTop = SPACING_MAP[myValue];
    style.marginBottom = SPACING_MAP[myValue];
  }
  const mtValue =
    scalarOrUndefined(props.marginTop) || scalarOrUndefined(props.mt);
  if (mtValue && mtValue !== "none") {
    style.marginTop = SPACING_MAP[mtValue];
  }
  const mrValue =
    scalarOrUndefined(props.marginRight) || scalarOrUndefined(props.mr);
  if (mrValue && mrValue !== "none") {
    style.marginRight = SPACING_MAP[mrValue];
  }
  const mbValue =
    scalarOrUndefined(props.marginBottom) || scalarOrUndefined(props.mb);
  if (mbValue && mbValue !== "none") {
    style.marginBottom = SPACING_MAP[mbValue];
  }
  const mlValue =
    scalarOrUndefined(props.marginLeft) || scalarOrUndefined(props.ml);
  if (mlValue && mlValue !== "none") {
    style.marginLeft = SPACING_MAP[mlValue];
  }

  // Dimensions - only inline when NOT responsive
  const widthValue =
    scalarOrUndefined(props.width) || scalarOrUndefined(props.w);
  if (widthValue !== undefined) {
    style.width = widthValue;
  }
  const heightValue =
    scalarOrUndefined(props.height) ?? scalarOrUndefined(props.h);
  if (heightValue !== undefined) {
    style.height = heightValue;
  }
  const minWidthValue =
    scalarOrUndefined(props.minWidth) || scalarOrUndefined(props.minW);
  if (minWidthValue !== undefined) {
    style.minWidth = minWidthValue;
  }
  const maxWidthValue =
    scalarOrUndefined(props.maxWidth) || scalarOrUndefined(props.maxW);
  if (maxWidthValue !== undefined) {
    style.maxWidth = maxWidthValue;
  }
  const minHeightValue =
    scalarOrUndefined(props.minHeight) ?? scalarOrUndefined(props.minH);
  if (minHeightValue !== undefined) {
    style.minHeight = minHeightValue;
  }
  const maxHeightValue =
    scalarOrUndefined(props.maxHeight) ?? scalarOrUndefined(props.maxH);
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

  // Display & Position - only display inline when NOT responsive
  const displayValue = scalarOrUndefined(props.display);
  if (displayValue !== undefined) {
    style.display = displayValue;
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
  const overflowValue = scalarOrUndefined(props.overflow);
  if (overflowValue !== undefined) {
    style.overflow = overflowValue;
  }
  const overflowXValue = scalarOrUndefined(props.overflowX);
  if (overflowXValue !== undefined) {
    style.overflowX = overflowXValue;
  }
  const overflowYValue = scalarOrUndefined(props.overflowY);
  if (overflowYValue !== undefined) {
    style.overflowY = overflowYValue;
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
 * Rustic Box component.
 * Uses pure HTML and inline CSS styles for maximum compatibility
 * and accessibility without external dependencies.
 */
const RusticBox = forwardRef<HTMLElement, BoxProps>((props, ref) => {
  const {
    as: Component = BOX_DEFAULTS.as,
    className = "",
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

  // Responsive CSS generation
  const reactId = useId();
  const responsiveEntries = collectBoxResponsiveEntries(props);
  const needsResponsiveCSS = responsiveEntries.length > 0;

  const elementId = needsResponsiveCSS
    ? `box-${reactId.replace(/:/g, "")}`
    : "";
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  // Build class names with Rustic-specific prefixes
  const classNames = ["rottay-box", "rottay-box--rustic", className]
    .filter(Boolean)
    .join(" ");

  // Box stamps NO data-part of its own. It is the style-injection escape hatch
  // every other component composes with, so a default part would put
  // `data-part='root'` on every nested Box in the fleet: a skin rule of the form
  // `.rottay-x [data-part='root']` would then reach into X's Boxes, and any query
  // for X's own root would match them too. Box's skin anchors on its class.
  const ElementType = Component as ElementType;
  const radiusValue = props.borderRadius || props.rounded;
  const callerOwnsRadius = Object.prototype.hasOwnProperty.call(
    props.style ?? {},
    "borderRadius"
  );
  const callerOwnsShadow = Object.prototype.hasOwnProperty.call(
    props.style ?? {},
    "boxShadow"
  );
  const elementProps = {
    ...htmlAttributes,
    ref: ref as Ref<HTMLElement>,
    className: classNames,
    "data-radius":
      !callerOwnsRadius && radiusValue && radiusValue !== "none"
        ? radiusValue
        : undefined,
    "data-shadow":
      !callerOwnsShadow && props.shadow && props.shadow !== "none"
        ? props.shadow
        : undefined,
    style: computedStyle,
    ...(responsive ? responsive.attrs : {}),
  };

  // Void elements (input, img, br, hr, ...) reject a children argument in
  // React-DOM; create them with no children so a void `Box` renders cleanly.
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

RusticBox.displayName = "RusticBox";

export default RusticBox;
