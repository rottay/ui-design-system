'use client';

/**
 * @fileoverview Container Hermes Engine - Rottay Design System
 * @description Hermes (DaisyUI/Tailwind) implementation of the Container component.
 * Generates Tailwind CSS utility classes for responsive containers.
 *
 * @remarks
 * The Hermes engine translates Container props to Tailwind CSS classes:
 * - Max-width: `max-w-screen-sm`, `max-w-screen-lg`, etc.
 * - Centering: `mx-auto`
 * - Padding: `p-0`, `p-2`, `p-4`, `p-6`
 * - Width: `w-full` for full container width
 * - Box-sizing: `box-border`
 *
 * For custom numeric values (max-width or padding), inline styles are used.
 *
 * @example Using Hermes Engine
 * ```tsx
 * import { Container } from '@rottay/design-system';
 *
 * // Generates Tailwind classes
 * <Container engine="hermes" maxWidth="lg" padding="md" center>
 *   Outputs: class="max-w-screen-lg mx-auto p-4 w-full box-border"
 * </Container>
 * ```
 *
 * @see {@link Container} - The main engine-aware component
 * @module Container/Engines/Hermes
 * @category Layout
 * @package @rottay/design-system
 */

import React from 'react';
import type { ContainerProps } from '../../types';
import { CONTAINER_DEFAULTS } from '../../types';

const MAX_WIDTH_CLASSES: Record<string, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

const PADDING_CLASSES: Record<string, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

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

    const classes: string[] = ['w-full', 'box-border'];

    if (!fluid && typeof maxWidth === 'string') {
      classes.push(MAX_WIDTH_CLASSES[maxWidth] || MAX_WIDTH_CLASSES.lg);
    }

    if (center) {
      classes.push('mx-auto');
    }

    if (typeof padding === 'string') {
      classes.push(PADDING_CLASSES[padding] || PADDING_CLASSES.md);
    }

    const customStyle: React.CSSProperties = { ...style };
    if (typeof maxWidth === 'number') {
      customStyle.maxWidth = `${maxWidth}px`;
    }
    if (typeof padding === 'number') {
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

Container.displayName = 'Container.Hermes';

export default Container;
