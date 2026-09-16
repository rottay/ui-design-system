"use client";

/**
 * @fileoverview Container Modern Engine - Rottay Design System.
 * The engine stamps the anatomy (`data-part`, `data-max-width`, `data-padding`,
 * `data-centered`, `data-fluid`); the Modern skin
 * (`runtime/engines/modern/skin/container/index.css`) owns every value through
 * the `--ds-container-*` channels. A caller's arbitrary measure or inset is the
 * only thing that travels inline, on those same two channels.
 *
 * @remarks
 * **When to use Container vs the layout sisters (kept in sync with Box/flex/Grid):**
 * - **Box** is the polymorphic single-element escape hatch.
 * - **Stack/Flex** own child rhythm along one axis; **Grid** owns two axes.
 * - **Container** owns the page-level measure: a max-inline-size on the
 *   tenant container scale (`--ds-container-{sm..2xl}`, the breakpoint ladder),
 *   logical auto margins when centered, and ramp padding — the quiet canvas a
 *   view is framed inside. It composes AROUND the sisters, never instead of them.
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
import type { ContainerMaxWidth, ContainerPadding, ContainerProps } from "../../contracts";
import { CONTAINER_DEFAULTS } from "../../contracts";

const MAX_WIDTH_RUNGS: readonly ContainerMaxWidth[] = [
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "full",
];
const PADDING_RUNGS: readonly ContainerPadding[] = ["none", "sm", "md", "lg"];

/** The rung an unusable number falls back to, read off the declared defaults. */
const FALLBACK_MAX_WIDTH =
  typeof CONTAINER_DEFAULTS.maxWidth === "string" ? CONTAINER_DEFAULTS.maxWidth : "lg";
const FALLBACK_PADDING =
  typeof CONTAINER_DEFAULTS.padding === "string" ? CONTAINER_DEFAULTS.padding : "md";

function isSafeLength(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

type ContainerInstanceStyle = React.CSSProperties & {
  "--ds-container-measure"?: string;
  "--ds-container-pad"?: string;
};

/**
 * Modern Container component.
 *
 * A named rung is stamped, never resolved here: the skin maps `data-max-width`
 * onto the breakpoint ladder and `data-padding` onto the spacing ramp. Only an
 * arbitrary number — the value no rung can name — is projected inline, and an
 * unusable number falls back to the rung the defaults declare.
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
      engine: _engine,
      children,
      className,
      style,
      ...rest
    } = props;

    const customStyle: ContainerInstanceStyle = {};

    const namedMaxWidth =
      typeof maxWidth === "string" && MAX_WIDTH_RUNGS.includes(maxWidth)
        ? maxWidth
        : undefined;
    const customMaxWidth =
      typeof maxWidth === "number" && isSafeLength(maxWidth) ? maxWidth : undefined;
    if (!fluid && customMaxWidth !== undefined) {
      customStyle["--ds-container-measure"] = `${customMaxWidth}px`;
    }

    const namedPadding =
      typeof padding === "string" && PADDING_RUNGS.includes(padding)
        ? padding
        : undefined;
    const customPadding =
      typeof padding === "number" && isSafeLength(padding) ? padding : undefined;
    if (customPadding !== undefined) {
      customStyle["--ds-container-pad"] = `${customPadding}px`;
    }

    const combinedClassName = ["ds-container", "ds-container--modern", className]
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
            : customMaxWidth !== undefined
              ? "custom"
              : (namedMaxWidth ?? FALLBACK_MAX_WIDTH)
        }
        data-padding={
          customPadding !== undefined
            ? "custom"
            : (namedPadding ?? FALLBACK_PADDING)
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
