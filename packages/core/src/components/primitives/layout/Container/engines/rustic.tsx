'use client';

/**
 * @fileoverview Container Rustic Engine - Rottay Design System.
 * Pure inline CSS container with zero external dependencies. Resolves named
 * presets to pixel values identically to the Classic engine, but applies
 * margin-left/right as explicit properties instead of the spread shorthand.
 * Ideal for embedded widgets and SSR without CSS extraction.
 *
 * @example
 * ```tsx
 * <Container engine="rustic" maxWidth={960} padding="lg" center>
 *   <p>Self-contained styling, no framework required</p>
 * </Container>
 * ```
 *
 * @see {@link Container} - The main engine-aware component
 * @module Container/Engines/Rustic
 * @category Layout
 * @package @rottay/design-system
 */

import React from 'react';
import type { ContainerProps } from '../Container.types';
import {
  CONTAINER_DEFAULTS,
  CONTAINER_MAX_WIDTHS,
  CONTAINER_PADDINGS,
} from '../Container.types';

/**
 * Rustic (vanilla CSS) Container component.
 *
 * Functionally equivalent to the Classic engine but uses explicit
 * `marginLeft`/`marginRight` properties (not a spread object) for centering.
 * This avoids issues in some SSR hydration scenarios where spread-based
 * conditional styles can produce mismatched markup.
 *
 * @param props - {@link ContainerProps} with maxWidth, padding, center, fluid, and styling overrides.
 * @returns A width-constrained container div with pure inline styles.
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

    // Resolve maxWidth: fluid forces 100%, otherwise lookup the named preset
    // or convert a raw number to a pixel string
    const computedMaxWidth = fluid
      ? '100%'
      : typeof maxWidth === 'number'
        ? `${maxWidth}px`
        : CONTAINER_MAX_WIDTHS[maxWidth as keyof typeof CONTAINER_MAX_WIDTHS] || CONTAINER_MAX_WIDTHS.lg;

    // Resolve padding from the preset map or convert numeric to px
    const computedPadding =
      typeof padding === 'number'
        ? `${padding}px`
        : CONTAINER_PADDINGS[padding as keyof typeof CONTAINER_PADDINGS] || CONTAINER_PADDINGS.md;

    // Explicit margin properties for centering (undefined when not centered
    // so they do not override user-provided margin in the style spread)
    const containerStyle: React.CSSProperties = {
      maxWidth: computedMaxWidth,
      width: '100%',
      padding: computedPadding,
      marginLeft: center ? 'auto' : undefined,
      marginRight: center ? 'auto' : undefined,
      boxSizing: 'border-box',
      ...style,
    };

    return (
      <div ref={ref} className={className} style={containerStyle} {...rest}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container.Rustic';

export default Container;
