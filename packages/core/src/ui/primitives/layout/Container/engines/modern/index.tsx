"use client";

/**
 * @fileoverview Container Modern Engine - Rottay Design System.
 * Tailwind CSS implementation that maps Container props to utility classes
 * (e.g., `max-w-screen-lg`, `mx-auto`, `p-4`). Falls back to inline styles
 * when numeric values are passed for maxWidth or padding.
 *
 * @example
 * ```tsx
 * <Container engine="modern" maxWidth="lg" padding="md" center>
 *   {/* renders: class="w-full box-border max-w-screen-lg mx-auto p-4" *\/}
 * </Container>
 * ```
 *
 * @see {@link Container} - The main engine-aware component
 * @module Container/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

import React from "react";
import type { ContainerProps } from "../../contracts";
import {
  CONTAINER_DEFAULTS,
  CONTAINER_MAX_WIDTHS,
  CONTAINER_PADDINGS,
} from "../../contracts";

function toSafePixels(value: number, fallback: string): string {
  return Number.isFinite(value) && value >= 0 ? `${value}px` : fallback;
}

function isSafeLength(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

type ContainerInstanceStyle = React.CSSProperties & {
  "--ds-container-instance-max-width"?: string;
  "--ds-container-instance-padding"?: string;
};

/**
 * Modern (Tailwind) Container component.
 *
 * Builds a class string from named presets for maxWidth and padding, then
 * merges any user-provided className. When the consumer passes a raw number
 * instead of a named preset, the value is applied as an inline style since
 * Tailwind classes cannot represent arbitrary pixel values.
 *
 * @param props - {@link ContainerProps} with maxWidth, padding, center, fluid, and styling overrides.
 * @returns A container div styled with Tailwind utility classes.
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (props, ref) => {
    const {
      maxWidth = CONTAINER_DEFAULTS.maxWidth,
      center = CONTAINER_DEFAULTS.center,
      padding = CONTAINER_DEFAULTS.padding,
      fluid = CONTAINER_DEFAULTS.fluid,
      children,
      className,
      style,
      ...rest
    } = props;

    const classes = ["rottay-container", "rottay-container--modern"];

    // React owns only the instance values. The skin owns structure, paint and
    // motion so every tenant can restyle the same markup through Appearance.
    const customStyle: ContainerInstanceStyle = {};
    if (!fluid) {
      if (typeof maxWidth === "string") {
        customStyle["--ds-container-instance-max-width"] =
          CONTAINER_MAX_WIDTHS[maxWidth] || CONTAINER_MAX_WIDTHS.lg;
      } else if (typeof maxWidth === "number") {
        customStyle["--ds-container-instance-max-width"] = toSafePixels(
          maxWidth,
          CONTAINER_MAX_WIDTHS.lg
        );
      }
    }
    if (typeof padding === "string") {
      customStyle["--ds-container-instance-padding"] =
        CONTAINER_PADDINGS[padding] || CONTAINER_PADDINGS.md;
    } else if (typeof padding === "number") {
      customStyle["--ds-container-instance-padding"] = toSafePixels(
        padding,
        CONTAINER_PADDINGS.md
      );
    }

    const combinedClassName = [classes.join(" "), className]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        {...rest}
        className={combinedClassName}
        style={{ ...customStyle, ...style }}
        data-part="root"
        data-max-width={
          fluid
            ? "fluid"
            : typeof maxWidth === "number" && !isSafeLength(maxWidth)
            ? "lg"
            : maxWidth
        }
        data-padding={
          typeof padding === "number" && !isSafeLength(padding) ? "md" : padding
        }
        data-centered={center || undefined}
        data-fluid={fluid || undefined}
        data-component="container"
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container.Modern";

export default Container;
