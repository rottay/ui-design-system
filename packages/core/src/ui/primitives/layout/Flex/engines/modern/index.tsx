"use client";

/**
 * @fileoverview Flex Modern Engine - Rottay Design System
 * @description Modern token-backed implementation of the Flex component.
 *
 * @remarks
 * **When to use Flex vs the layout sisters (kept in sync with Box):**
 * - **Box** is the polymorphic single-element escape hatch (spacing and paint
 *   for ONE element, no child rhythm).
 * - **Stack** owns one-dimensional child rhythm with preset spacing defaults
 *   (`direction` + `spacing`) — the everyday column/row of siblings.
 * - **Flex** (this primitive) owns the explicit axis composition Stack does
 *   not expose: `wrap`, `justify` distributions, `align` (incl. `baseline`),
 *   `inline`, and uniform or `[column, row]` split gaps on the tenant spacing
 *   ramp. If you only need a gap between siblings, Stack is the simpler call.
 * - **Grid** owns two-dimensional tracks.
 *
 * Scalar geometry projects to neutral `data-*` attributes consumed by the
 * shared declarative skin (`presentation/components/skin/layout-primitives.css`),
 * so tenant and white-label layers participate in the normal cascade; only
 * numeric parameters, the gap custom properties and the consumer's own
 * `style` remain inline (plus `min-inline-size: 0`, pinned by the quality
 * contract so flexible content can shrink and ellipsize).
 *
 * @module Flex/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

import React, { useId } from "react";
import type { FlexProps } from "../../contracts";
import { generateResponsiveCSS } from "@/infrastructure/runtime/responsive/runtime/style-properties";
import {
  resolveFlexAttributes,
  resolveFlexParameterStyle,
} from "../../runtime/presentation";
import { collectFlexResponsiveEntries } from "../../runtime/responsive";

/**
 * Modern Flex component using declarative skin attributes and bounded tokens.
 */
export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (props, ref) => {
    const {
      direction: _direction,
      wrap: _wrap,
      justify: _justify,
      align: _align,
      gap: _gap,
      flex: _flex,
      inline: _inline,
      width: _width,
      minWidth: _minWidth,
      maxWidth: _maxWidth,
      overflow: _overflow,
      motion: _motion,
      engine: _engine,
      children,
      className,
      style: consumerStyle,
      ...rest
    } = props;

    const presentationAttributes = resolveFlexAttributes(props);
    const parameterStyle = resolveFlexParameterStyle(props);
    const resolvedStyle =
      parameterStyle || consumerStyle
        ? { ...parameterStyle, ...consumerStyle }
        : undefined;

    const reactId = useId();
    const responsiveEntries = collectFlexResponsiveEntries(props);
    const needsResponsiveCSS = responsiveEntries.length > 0;

    const elementId = needsResponsiveCSS
      ? `flex-${reactId.replace(/:/g, "")}`
      : "";
    const responsive = needsResponsiveCSS
      ? generateResponsiveCSS(elementId, responsiveEntries)
      : null;

    const combinedClassName = ["rottay-flex", "rottay-flex--modern", className]
      .filter(Boolean)
      .join(" ");
    const modernStyle = {
      minInlineSize: 0,
      ...resolvedStyle,
    };

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <div
          {...rest}
          ref={ref}
          className={combinedClassName}
          style={modernStyle}
          {...presentationAttributes}
          {...(responsive ? responsive.attrs : {})}
          data-component="flex"
        >
          {children}
        </div>
      </>
    );
  }
);

Flex.displayName = "Flex.Modern";

export default Flex;
