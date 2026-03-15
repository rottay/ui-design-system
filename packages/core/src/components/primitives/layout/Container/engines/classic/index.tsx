'use client';

/**
 * @fileoverview Container Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Container component.
 * Uses inline CSS styles following Ant Design conventions.
 *
 * @remarks
 * The Classic engine provides:
 * - Inline CSS styling for compatibility with Ant Design themes
 * - Box-sizing: border-box for consistent sizing
 * - Margin-auto for horizontal centering
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Container } from '@rottay/design-system';
 *
 * <Container engine="classic" maxWidth="lg" padding="md">
 *   Ant Design compatible container
 * </Container>
 * ```
 *
 * @see {@link Container} - The main engine-aware component
 * @module Container/Engines/Classic
 * @category Layout
 * @package @rottay/design-system
 */

import React from 'react';
import type { ContainerProps } from '../../Container.types';
import {
  CONTAINER_DEFAULTS,
  CONTAINER_MAX_WIDTHS,
  CONTAINER_PADDINGS,
} from '../../Container.types';

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
