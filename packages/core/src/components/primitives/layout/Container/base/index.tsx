/**
 * @fileoverview Container Base Component - Rottay Design System
 * @description Core implementation of the Container component using CSS variables.
 * This base component is extended by engine-specific implementations.
 *
 * @remarks
 * The base component handles:
 * - Max-width computation from presets or numeric values
 * - Padding resolution from presets or numeric values
 * - Horizontal centering via margin-auto
 * - CSS variable injection for theming
 *
 * CSS Custom Properties set by this component:
 * - `--container-max-width`: Resolved max-width value
 * - `--container-padding`: Resolved padding value
 *
 * @example Using Base Component
 * ```tsx
 * import { BaseContainer } from '@rottay/design-system';
 *
 * // The base component is typically used by engine implementations
 * <BaseContainer maxWidth="lg" padding="md" center>
 *   Page content
 * </BaseContainer>
 * ```
 *
 * @see {@link Container} - The main engine-aware component
 * @module Container/Base
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useMemo } from 'react';
import type { ContainerProps } from '../types';
import {
  CONTAINER_DEFAULTS,
  CONTAINER_MAX_WIDTHS,
  CONTAINER_PADDINGS,
} from '../types';

/**
 * Base Container component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseContainer = forwardRef<HTMLDivElement, ContainerProps>(
  (props, ref) => {
    const {
      maxWidth = CONTAINER_DEFAULTS.maxWidth,
      center = CONTAINER_DEFAULTS.center,
      padding = CONTAINER_DEFAULTS.padding,
      fluid = CONTAINER_DEFAULTS.fluid,
      children,
      className = '',
      style = {},
    } = props;

    // Compute max width value
    const computedMaxWidth = useMemo(() => {
      if (fluid) return '100%';
      if (typeof maxWidth === 'number') return `${maxWidth}px`;
      return CONTAINER_MAX_WIDTHS[maxWidth as keyof typeof CONTAINER_MAX_WIDTHS] || CONTAINER_MAX_WIDTHS.lg;
    }, [fluid, maxWidth]);

    // Compute padding value
    const computedPadding = useMemo(() => {
      if (typeof padding === 'number') return `${padding}px`;
      return CONTAINER_PADDINGS[padding as keyof typeof CONTAINER_PADDINGS] || CONTAINER_PADDINGS.md;
    }, [padding]);

    // CSS variables
    const containerVars = useMemo<React.CSSProperties>(() => ({
      '--container-max-width': computedMaxWidth,
      '--container-padding': computedPadding,
    } as React.CSSProperties), [computedMaxWidth, computedPadding]);

    const containerStyle: React.CSSProperties = {
      ...containerVars,
      maxWidth: 'var(--container-max-width)',
      width: '100%',
      padding: 'var(--container-padding)',
      boxSizing: 'border-box',
      ...(center && {
        marginLeft: 'auto',
        marginRight: 'auto',
      }),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-container ${fluid ? 'rottay-container--fluid' : ''} ${className}`}
        style={containerStyle}
      >
        {children}
      </div>
    );
  }
);

BaseContainer.displayName = 'BaseContainer';
