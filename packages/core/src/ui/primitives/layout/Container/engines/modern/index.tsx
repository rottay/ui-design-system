"use client";

/**
 * @fileoverview Container Modern Engine - Rottay Design System.
 * Token-driven implementation: the engine projects only the instance values
 * (`--ds-container-instance-*` custom properties) and stamps the anatomy
 * (`data-part`/`data-centered`/`data-fluid`); the shared declarative skin
 * (`presentation/components/skin/layout-primitives.css`, Container section)
 * owns structure, paint and motion. No Tailwind utility classes.
 *
 * @remarks
 * **When to use Container vs the layout sisters (kept in sync with Box/Flex/Grid):**
 * - **Box** is the polymorphic single-element escape hatch.
 * - **Stack/Flex** own child rhythm along one axis; **Grid** owns two axes.
 * - **Container** owns the page-level measure: a max-inline-size on the
 *   tenant container scale (`--ds-container-{sm..2xl}`), logical auto
 *   margins when centered, and scale padding — the quiet canvas a view is
 *   framed inside. It composes AROUND the sisters, never instead of them.
 *
 * @example
 * ```tsx
 * <Container engine="modern" maxWidth="lg" padding="md" center>
 *   {children}
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
 * Modern Container component.
 *
 * Projects the named presets for maxWidth and padding onto the
 * `--ds-container-instance-*` custom properties the declarative skin
 * consumes; raw numbers become safe pixel values on the same channel
 * (arbitrary values a preset cannot name). The skin owns structure, paint
 * and motion, so every tenant restyles the same markup through Appearance.
 *
 * @param props - {@link ContainerProps} with maxWidth, padding, center, fluid, and styling overrides.
 * @returns A container div whose only inline declarations are the instance channels and the caller's style.
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
