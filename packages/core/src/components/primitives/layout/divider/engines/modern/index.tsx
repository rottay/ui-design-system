/**
 * @fileoverview Divider Modern Engine - Rottay Design System.
 * The engine owns semantics and anatomy; the Modern skin
 * (`runtime/engines/modern/skin/divider/index.css`) owns every value through the
 * `--ds-divider-*` channels. Only the resolved hairline travels inline, on
 * `--ds-divider-line`: `color`, `thickness` and `variant` are free-form props,
 * so the shorthand they compose cannot be enumerated into a closed `data-*`
 * domain the way orientation, inset and label placement can.
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

import React, { forwardRef, useId } from "react";
import type {
  DividerProps,
  DividerVariant,
  DividerLogicalTextPosition,
} from "../../contracts";
import {
  DIVIDER_DEFAULTS,
  getThicknessValue,
  DEFAULT_COLORS,
  resolveDividerTextPosition,
} from "../../contracts";

type DividerLineStyle = React.CSSProperties & {
  "--ds-divider-line"?: string;
};

/**
 * Modern Divider component.
 *
 * Uses logical text positioning and flexbox with a tokenized gap between the
 * line and inline text. The public component owns both line segments so a
 * framework bridge cannot add duplicate pseudo-elements or physical RTL
 * branching.
 *
 * @param props - {@link DividerProps} with orientation, variant, text, and styling options.
 * @returns A separator element with `role="separator"` and the divider anatomy.
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
    style,
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

  const classNames = ["ds-divider", "ds-divider--modern", className]
    .filter(Boolean)
    .join(" ");

  // The one runtime-computed channel: the resolved hairline shorthand. The skin
  // gates it on `data-orientation` so it lands on the block edge or the inline
  // start edge, and on `data-with-text` so it lands on the root or on the two
  // segments.
  const lineStyle: DividerLineStyle = {
    "--ds-divider-line": `${lineThickness} ${variant} ${lineColor}`,
    ...style,
  };

  const inferredLabel =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : undefined;

  // `separator` has presentational children, so composite label content is
  // never exposed by name-from-content: point at it instead of losing the name.
  const contentId = useId();
  const labelsFromContent = !ariaLabel && inferredLabel === undefined;

  // Two render paths: with inline text or simple line
  if (hasChildren) {
    return (
      <div
        ref={ref}
        aria-labelledby={labelsFromContent ? contentId : undefined}
        {...rest}
        className={classNames}
        style={lineStyle}
        role="separator"
        aria-orientation={orientation}
        aria-label={ariaLabel || inferredLabel}
        data-testid={testId}
        data-part="root"
        data-orientation={orientation}
        data-spacing={spacing}
        data-with-text="true"
        data-text-position={textPosition}
        data-plain={plain ? "true" : "false"}
        data-component="divider"
      >
        <span aria-hidden="true" data-part="line-before" />
        <span data-part="text" id={contentId}>
          {children}
        </span>
        <span aria-hidden="true" data-part="line-after" />
      </div>
    );
  }

  // Simple divider: the root IS the line.
  return (
    <div
      ref={ref}
      {...rest}
      className={classNames}
      style={lineStyle}
      role="separator"
      aria-orientation={orientation}
      aria-label={ariaLabel}
      data-testid={testId}
      data-part="root"
      data-orientation={orientation}
      data-spacing={spacing}
      data-with-text="false"
      data-text-position={undefined}
      data-plain={plain ? "true" : "false"}
      data-component="divider"
    />
  );
});

ModernDivider.displayName = "ModernDivider";

export default ModernDivider;
