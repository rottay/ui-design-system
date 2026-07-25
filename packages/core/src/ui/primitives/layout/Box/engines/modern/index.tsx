/**
 * @fileoverview Box Modern Engine - Rottay Design System
 * @description Modern, token-aware implementation of the Box component.
 * Provides deterministic structure and responsive styles without generated classes.
 *
 * @module Box/Engines/Modern
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
  scalarOrUndefined,
} from "@/infrastructure/runtime/responsive/runtime/style-properties";
import { collectBoxResponsiveEntries } from "../../runtime/responsive";

// Deterministic style builder. Consumer-supplied paint stays available through
// `style`, while DS-owned spacing and motion remain connected to tokens.
function resolveSpacing(value: BoxSpacing | undefined): string | undefined {
  if (!value) return undefined;
  return SPACING_MAP[value];
}

function buildBoxStyles(props: BoxProps): CSSProperties {
  const style: CSSProperties = {};

  // Spacing — resolved via DS CSS custom properties (tenant-overrideable)
  const padding =
    scalarOrUndefined(props.padding) ?? scalarOrUndefined(props.p);
  if (padding !== undefined) style.padding = resolveSpacing(padding);
  const pxVal =
    scalarOrUndefined(props.paddingX) ?? scalarOrUndefined(props.px);
  const pyVal =
    scalarOrUndefined(props.paddingY) ?? scalarOrUndefined(props.py);
  if (pxVal !== undefined) {
    style.paddingLeft = resolveSpacing(pxVal);
    style.paddingRight = resolveSpacing(pxVal);
  }
  if (pyVal !== undefined) {
    style.paddingTop = resolveSpacing(pyVal);
    style.paddingBottom = resolveSpacing(pyVal);
  }
  const ptVal =
    scalarOrUndefined(props.paddingTop) ?? scalarOrUndefined(props.pt);
  if (ptVal !== undefined) style.paddingTop = resolveSpacing(ptVal);
  const prVal =
    scalarOrUndefined(props.paddingRight) ?? scalarOrUndefined(props.pr);
  if (prVal !== undefined) style.paddingRight = resolveSpacing(prVal);
  const pbVal =
    scalarOrUndefined(props.paddingBottom) ?? scalarOrUndefined(props.pb);
  if (pbVal !== undefined) style.paddingBottom = resolveSpacing(pbVal);
  const plVal =
    scalarOrUndefined(props.paddingLeft) ?? scalarOrUndefined(props.pl);
  if (plVal !== undefined) style.paddingLeft = resolveSpacing(plVal);

  const paddingInline = scalarOrUndefined(props.paddingInline);
  if (paddingInline !== undefined) {
    style.paddingInline = resolveSpacing(paddingInline);
  }
  const paddingBlock = scalarOrUndefined(props.paddingBlock);
  if (paddingBlock !== undefined) {
    style.paddingBlock = resolveSpacing(paddingBlock);
  }
  const paddingInlineStart = scalarOrUndefined(props.paddingInlineStart);
  if (paddingInlineStart !== undefined) {
    style.paddingInlineStart = resolveSpacing(paddingInlineStart);
  }
  const paddingInlineEnd = scalarOrUndefined(props.paddingInlineEnd);
  if (paddingInlineEnd !== undefined) {
    style.paddingInlineEnd = resolveSpacing(paddingInlineEnd);
  }
  const paddingBlockStart = scalarOrUndefined(props.paddingBlockStart);
  if (paddingBlockStart !== undefined) {
    style.paddingBlockStart = resolveSpacing(paddingBlockStart);
  }
  const paddingBlockEnd = scalarOrUndefined(props.paddingBlockEnd);
  if (paddingBlockEnd !== undefined) {
    style.paddingBlockEnd = resolveSpacing(paddingBlockEnd);
  }

  const margin = scalarOrUndefined(props.margin) ?? scalarOrUndefined(props.m);
  if (margin !== undefined) style.margin = resolveSpacing(margin);
  const mxVal = scalarOrUndefined(props.marginX) ?? scalarOrUndefined(props.mx);
  const myVal = scalarOrUndefined(props.marginY) ?? scalarOrUndefined(props.my);
  if (mxVal !== undefined) {
    style.marginLeft = resolveSpacing(mxVal);
    style.marginRight = resolveSpacing(mxVal);
  }
  if (myVal !== undefined) {
    style.marginTop = resolveSpacing(myVal);
    style.marginBottom = resolveSpacing(myVal);
  }
  const mtVal =
    scalarOrUndefined(props.marginTop) ?? scalarOrUndefined(props.mt);
  if (mtVal !== undefined) style.marginTop = resolveSpacing(mtVal);
  const mrVal =
    scalarOrUndefined(props.marginRight) ?? scalarOrUndefined(props.mr);
  if (mrVal !== undefined) style.marginRight = resolveSpacing(mrVal);
  const mbVal =
    scalarOrUndefined(props.marginBottom) ?? scalarOrUndefined(props.mb);
  if (mbVal !== undefined) style.marginBottom = resolveSpacing(mbVal);
  const mlVal =
    scalarOrUndefined(props.marginLeft) ?? scalarOrUndefined(props.ml);
  if (mlVal !== undefined) style.marginLeft = resolveSpacing(mlVal);

  const marginInline = scalarOrUndefined(props.marginInline);
  if (marginInline !== undefined) {
    style.marginInline = resolveSpacing(marginInline);
  }
  const marginBlock = scalarOrUndefined(props.marginBlock);
  if (marginBlock !== undefined) {
    style.marginBlock = resolveSpacing(marginBlock);
  }
  const marginInlineStart = scalarOrUndefined(props.marginInlineStart);
  if (marginInlineStart !== undefined) {
    style.marginInlineStart = resolveSpacing(marginInlineStart);
  }
  const marginInlineEnd = scalarOrUndefined(props.marginInlineEnd);
  if (marginInlineEnd !== undefined) {
    style.marginInlineEnd = resolveSpacing(marginInlineEnd);
  }
  const marginBlockStart = scalarOrUndefined(props.marginBlockStart);
  if (marginBlockStart !== undefined) {
    style.marginBlockStart = resolveSpacing(marginBlockStart);
  }
  const marginBlockEnd = scalarOrUndefined(props.marginBlockEnd);
  if (marginBlockEnd !== undefined) {
    style.marginBlockEnd = resolveSpacing(marginBlockEnd);
  }

  // Dimensions - only inline when NOT responsive
  const widthValue =
    scalarOrUndefined(props.width) ?? scalarOrUndefined(props.w);
  if (widthValue !== undefined) {
    style.width = widthValue;
  }
  const heightValue =
    scalarOrUndefined(props.height) ?? scalarOrUndefined(props.h);
  if (heightValue !== undefined) {
    style.height = heightValue;
  }
  const minWidthValue =
    scalarOrUndefined(props.minWidth) ?? scalarOrUndefined(props.minW);
  if (minWidthValue !== undefined) {
    style.minWidth = minWidthValue;
  }
  const maxWidthValue =
    scalarOrUndefined(props.maxWidth) ?? scalarOrUndefined(props.maxW);
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
  } else if (props.motion === "resize") {
    style.transition = "var(--ds-transition-resize)";
  } else if (props.motion === "rearrange") {
    style.transition = "var(--ds-transition-rearrange)";
  } else if (props.motion === "none") {
    style.transition = "none";
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

  const display = scalarOrUndefined(props.display);
  if (display !== undefined) style.display = display;
  if (props.position !== undefined) style.position = props.position;
  const overflow = scalarOrUndefined(props.overflow);
  const overflowX = scalarOrUndefined(props.overflowX);
  const overflowY = scalarOrUndefined(props.overflowY);
  if (overflow !== undefined) style.overflow = overflow;
  if (overflowX !== undefined) style.overflowX = overflowX;
  if (overflowY !== undefined) style.overflowY = overflowY;

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

// Spacing is resolved inline through DS custom properties. Radius and shadow
// are selected by data attributes in the Box skin so tenant overrides still
// flow through the same token values without static paint living in JS.

/**
 * Modern Box component.
 * Uses deterministic DOM styles and token-backed skin attributes, without
 * relying on runtime-generated utility classes being present in the bundle.
 */
const ModernBox = forwardRef<HTMLElement, BoxProps>((props, ref) => {
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
    paddingInline: _paddingInline,
    paddingBlock: _paddingBlock,
    paddingInlineStart: _paddingInlineStart,
    paddingInlineEnd: _paddingInlineEnd,
    paddingBlockStart: _paddingBlockStart,
    paddingBlockEnd: _paddingBlockEnd,
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
    marginInline: _marginInline,
    marginBlock: _marginBlock,
    marginInlineStart: _marginInlineStart,
    marginInlineEnd: _marginInlineEnd,
    marginBlockStart: _marginBlockStart,
    marginBlockEnd: _marginBlockEnd,
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
    motion: _motion,
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

  // Stable engine hooks only; dynamic utility names are intentionally avoided.
  const classNames = ["rottay-box", "rottay-box--modern", className]
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
    "data-layout-motion":
      props.motion && props.motion !== "none" ? props.motion : undefined,
    "data-component": "box",
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

ModernBox.displayName = "ModernBox";

export default ModernBox;
