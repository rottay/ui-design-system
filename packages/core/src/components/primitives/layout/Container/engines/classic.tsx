'use client';

/**
 * @fileoverview Container Classic Engine - Rottay Design System.
 * Ant Design compatible container that uses inline CSS styles for
 * max-width, padding, and centering. Resolves named presets (sm/md/lg/xl/2xl)
 * to pixel values from CONTAINER_MAX_WIDTHS / CONTAINER_PADDINGS.
 *
 * @example
 * ```tsx
 * <Container engine="classic" maxWidth="lg" padding="md" center>
 *   <Form layout="vertical">...</Form>
 * </Container>
 * ```
 *
 * @see {@link Container} - The main engine-aware component
 * @module Container/Engines/Classic
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
 * Classic (Ant Design) Container component.
 *
 * Renders a single `<div>` with computed inline styles. Supports both named
 * presets ("sm", "lg", etc.) and raw numeric pixel values for maxWidth/padding.
 * When `fluid` is true, maxWidth is overridden to 100%.
 *
 * @param props - {@link ContainerProps} with maxWidth, padding, center, fluid, and styling overrides.
 * @returns A centered, width-constrained container div.
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

    // Resolve maxWidth: fluid overrides everything to 100%, numeric values
    // become px strings, and named presets are looked up in the constants map
    const computedMaxWidth = fluid
      ? '100%'
      : typeof maxWidth === 'number'
        ? `${maxWidth}px`
        : CONTAINER_MAX_WIDTHS[maxWidth as keyof typeof CONTAINER_MAX_WIDTHS] || CONTAINER_MAX_WIDTHS.lg;

    // Resolve padding: numeric values become px, named presets use the map
    const computedPadding =
      typeof padding === 'number'
        ? `${padding}px`
        : CONTAINER_PADDINGS[padding as keyof typeof CONTAINER_PADDINGS] || CONTAINER_PADDINGS.md;

    // Assemble the final style object; centering is achieved via margin auto
    // and box-sizing ensures padding is included within the max-width
    const containerStyle: React.CSSProperties = {
      maxWidth: computedMaxWidth,
      width: '100%',
      padding: computedPadding,
      ...(center && { marginLeft: 'auto', marginRight: 'auto' }),
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

Container.displayName = 'Container.Classic';

export default Container;
