'use client';

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

import React from 'react';
import type { ContainerProps } from '../../contracts';
import { CONTAINER_DEFAULTS, CONTAINER_MAX_WIDTHS, CONTAINER_PADDINGS } from '../../contracts';

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

    // Base layout classes (structural only, not spacing/sizing)
    const classes: string[] = ['w-full', 'box-border'];
    if (center) classes.push('mx-auto');

    // Max-width and padding resolved via DS CSS custom properties.
    // This ensures tenant overrides flow through --ds-container-* and --ds-spacing-*.
    const customStyle: React.CSSProperties = { ...style };
    if (!fluid) {
      if (typeof maxWidth === 'string') {
        customStyle.maxWidth = CONTAINER_MAX_WIDTHS[maxWidth] || CONTAINER_MAX_WIDTHS.lg;
      } else if (typeof maxWidth === 'number') {
        customStyle.maxWidth = `${maxWidth}px`;
      }
    }
    if (typeof padding === 'string') {
      customStyle.padding = CONTAINER_PADDINGS[padding] || CONTAINER_PADDINGS.md;
    } else if (typeof padding === 'number') {
      customStyle.padding = `${padding}px`;
    }

    const combinedClassName = [classes.join(' '), className]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={Object.keys(customStyle).length > 0 ? customStyle : undefined}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container.Modern';

export default Container;
