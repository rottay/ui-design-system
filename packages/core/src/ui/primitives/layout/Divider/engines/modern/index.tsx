/**
 * @fileoverview Divider Modern Engine - Rottay Design System.
 * DS-owned implementation for the Modern engine. Layout and paint are
 * token-driven and do not depend on DaisyUI's generic `.divider` anatomy.
 *
 * @example
 * ```tsx
 * <ModernDivider textPosition="start">CHAPTER ONE</ModernDivider>
 * ```
 *
 * @module Divider/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

"use client";

import React, { forwardRef } from "react";
import type {
  DividerProps,
  DividerVariant,
  DividerLogicalTextPosition,
} from "../../contracts";
import {
  DIVIDER_DEFAULTS,
  SPACING_MAP,
  getThicknessValue,
  DEFAULT_COLORS,
  resolveDividerTextPosition,
} from "../../contracts";

/**
 * Modern Divider component.
 *
 * Uses logical text positioning and flexbox with a tokenized gap between the
 * line and inline text. The public component owns both line segments so a
 * framework bridge cannot add duplicate pseudo-elements or physical RTL
 * branching.
 *
 * @param props - {@link DividerProps} with orientation, variant, text, and styling options.
 * @returns A separator element with `role="separator"` and DaisyUI classes.
 */
const ModernDivider = forwardRef<HTMLDivElement, DividerProps>((props, ref) => {
  const {
    orientation: orientationProp,
    type,
    variant: variantProp,
    dashed = DIVIDER_DEFAULTS.dashed,
    children,
    textPosition: textPositionProp,
    orientationMargin,
    plain = DIVIDER_DEFAULTS.plain!,
    color,
    thickness = DIVIDER_DEFAULTS.thickness,
    spacing: spacingProp,
    margin,
    className = "",
    style = {},
    "data-testid": testId,
    "aria-label": ariaLabel,
    ...rest
  } = props;

  // Resolve prop aliases for backward compatibility with Ant Design API
  const orientation = orientationProp || type || DIVIDER_DEFAULTS.orientation!;
  const variant: DividerVariant = dashed
    ? "dashed"
    : variantProp || DIVIDER_DEFAULTS.variant!;
  const textPosition: DividerLogicalTextPosition = resolveDividerTextPosition(
    textPositionProp || orientationMargin || DIVIDER_DEFAULTS.textPosition
  );
  const spacing = spacingProp || margin || DIVIDER_DEFAULTS.spacing!;

  const isHorizontal = orientation === "horizontal";
  // Inline text is only supported in horizontal orientation
  const hasChildren =
    React.Children.toArray(children).length > 0 && isHorizontal;

  const lineThickness = getThicknessValue(thickness);
  const lineColor = color || DEFAULT_COLORS.modern;
  const spacingValue = SPACING_MAP[spacing];

  const classNames = ["rottay-divider", "rottay-divider--modern", className]
    .filter(Boolean)
    .join(" ");

  // Flex container with alignSelf: stretch so vertical dividers fill
  // the height of their parent flex container
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: isHorizontal ? "row" : "column",
    width: isHorizontal ? "100%" : "auto",
    height: isHorizontal ? "auto" : "100%",
    minWidth: 0,
    // A percentage block-size cannot resolve inside intrinsically-sized
    // inline containers such as Space separators. Keep a tokenized 1em floor
    // so vertical dividers remain visible there, while `height: 100%` still
    // lets them stretch in parents with a definite block-size.
    minHeight: isHorizontal
      ? 0
      : "var(--ds-divider-vertical-min-block-size, 1em)",
    gap: "var(--ds-divider-content-gap, var(--ds-spacing-4, 1rem))",
    margin: isHorizontal ? `${spacingValue} 0` : `0 ${spacingValue}`,
    ...style,
  };

  // Line uses border (not a pseudo-element) for inline style portability.
  // `color`/`thickness` are caller-overridable free-form props (see
  // Divider.types.ts), so the resolved value can't be enumerated into a
  // finite data-* lookup -- it rides `--ds-divider-line` instead, read via
  // `var()` by engines/modern/skin/divider.css and gated on
  // `data-orientation` there to land on border-top vs border-left.
  const lineStyle: React.CSSProperties = {
    flex: 1,
    height: isHorizontal ? "0" : "100%",
    // A horizontal line is sized by flex, not by a physical 100% width.
    // Giving both segments width:100% forces the label to absorb all flex
    // shrink on narrow canvases, turning short localized labels into one
    // character per line. `auto` preserves a readable, intrinsic label while
    // the segments still consume the remaining inline space through flex: 1.
    width: isHorizontal ? "auto" : "0",
    "--ds-divider-line": `${lineThickness} ${variant} ${lineColor}`,
  } as React.CSSProperties;

  // flexGrow/flexBasis control asymmetric line lengths around the text
  const lineBeforeStyle: React.CSSProperties = {
    ...lineStyle,
    flexGrow: textPosition === "start" ? 0 : 1,
    flexBasis:
      textPosition === "start"
        ? "var(--ds-divider-edge-segment, 5%)"
        : undefined,
    minWidth: isHorizontal ? "var(--ds-divider-min-segment, 5%)" : 0,
    minHeight: isHorizontal ? 0 : "var(--ds-divider-min-segment, 5%)",
  };

  const lineAfterStyle: React.CSSProperties = {
    ...lineStyle,
    flexGrow: textPosition === "end" ? 0 : 1,
    flexBasis:
      textPosition === "end" ? "var(--ds-divider-edge-segment, 5%)" : undefined,
    minWidth: isHorizontal ? "var(--ds-divider-min-segment, 5%)" : 0,
    minHeight: isHorizontal ? 0 : "var(--ds-divider-min-segment, 5%)",
  };

  const inferredLabel =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : undefined;

  // Two render paths: with inline text or simple line
  if (hasChildren) {
    return (
      <div
        ref={ref}
        {...rest}
        className={classNames}
        style={containerStyle}
        role="separator"
        aria-orientation={orientation}
        aria-label={ariaLabel || inferredLabel}
        data-testid={testId}
        data-part="root"
        data-orientation={orientation}
        data-with-text="true"
        data-text-position={textPosition}
        data-plain={plain ? "true" : "false"}
        data-component="divider"
      >
        <span
          aria-hidden="true"
          className="divider-line divider-line-before"
          data-part="line-before"
          style={lineBeforeStyle}
        />
        <span className="divider-content" data-part="text">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="divider-line divider-line-after"
          data-part="line-after"
          style={lineAfterStyle}
        />
      </div>
    );
  }

  // Simple divider: merge container and line styles into one element
  return (
    <div
      ref={ref}
      {...rest}
      className={classNames}
      style={{ ...containerStyle, ...lineStyle }}
      role="separator"
      aria-orientation={orientation}
      aria-label={ariaLabel}
      data-testid={testId}
      data-part="root"
      data-orientation={orientation}
      data-with-text="false"
      data-text-position={undefined}
      data-plain={plain ? "true" : "false"}
      data-component="divider"
    />
  );
});

ModernDivider.displayName = "ModernDivider";

export default ModernDivider;
