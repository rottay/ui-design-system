'use client';

/**
 * @fileoverview Container Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Container component.
 * Uses inline CSS styles for maximum compatibility without external dependencies.
 *
 * @remarks
 * The Rustic engine provides:
 * - Pure inline CSS styling without external dependencies
 * - Full max-width, padding, and centering support
 * - Box-sizing: border-box for consistent sizing
 *
 * This implementation is ideal for:
 * - Embedded widgets in third-party applications
 * - Server-side rendering without CSS extraction
 * - Maximum browser compatibility
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Container } from '@rottay/design-system';
 *
 * // Pure inline CSS container
 * <Container engine="rustic" maxWidth="lg" padding="md">
 *   Self-contained styling, no framework dependencies
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

    const computedMaxWidth = fluid
      ? '100%'
      : typeof maxWidth === 'number'
        ? `${maxWidth}px`
        : CONTAINER_MAX_WIDTHS[maxWidth as keyof typeof CONTAINER_MAX_WIDTHS] || CONTAINER_MAX_WIDTHS.lg;

    const computedPadding =
      typeof padding === 'number'
        ? `${padding}px`
        : CONTAINER_PADDINGS[padding as keyof typeof CONTAINER_PADDINGS] || CONTAINER_PADDINGS.md;

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
