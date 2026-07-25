"use client";

/**
 * @fileoverview Flex Modern Engine - Rottay Design System
 * @description Modern token-backed implementation of the Flex component.
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
