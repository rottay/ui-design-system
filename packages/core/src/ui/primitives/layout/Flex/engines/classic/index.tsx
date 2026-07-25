"use client";

/**
 * @fileoverview Flex Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Flex component.
 * Uses Ant Design's Flex component for consistent styling with the Ant ecosystem.
 *
 * @module Flex/Engines/Classic
 * @category Layout
 * @package @rottay/design-system
 */

import React, { useId } from "react";
import { Flex as AntFlex } from "antd";
import type { FlexProps } from "../../contracts";
import { generateResponsiveCSS } from "@/infrastructure/runtime/responsive/runtime/style-properties";
import {
  resolveFlexAttributes,
  resolveFlexParameterStyle,
} from "../../runtime/presentation";
import { collectFlexResponsiveEntries } from "../../runtime/responsive";

/**
 * Classic Flex component backed by Ant Design's Flex primitive.
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
        <AntFlex
          ref={ref}
          className={["rottay-flex", "rottay-flex--classic", className]
            .filter(Boolean)
            .join(" ")}
          style={resolvedStyle}
          {...presentationAttributes}
          {...(responsive ? responsive.attrs : {})}
          {...rest}
        >
          {children}
        </AntFlex>
      </>
    );
  }
);

Flex.displayName = "Flex.Classic";

export default Flex;
