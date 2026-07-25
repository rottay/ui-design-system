"use client";

/**
 * @fileoverview Flex Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Flex component.
 * Uses the shared declarative layout skin without external dependencies.
 *
 * @module Flex/Engines/Rustic
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
 * Rustic Flex component using neutral attributes and bounded parameters.
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

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <div
          ref={ref}
          className={["rottay-flex", "rottay-flex--rustic", className]
            .filter(Boolean)
            .join(" ")}
          style={resolvedStyle}
          {...presentationAttributes}
          {...(responsive ? responsive.attrs : {})}
          {...rest}
        >
          {children}
        </div>
      </>
    );
  }
);

Flex.displayName = "Flex.Rustic";

export default Flex;
