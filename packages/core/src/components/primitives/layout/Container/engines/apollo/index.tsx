'use client';

/**
 * Container - Apollo Engine (Vanilla HTML/CSS)
 */
import React from 'react';
import type { ContainerProps } from '../../types';
import {
  CONTAINER_DEFAULTS,
  CONTAINER_MAX_WIDTHS,
  CONTAINER_PADDINGS,
} from '../../types';

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

Container.displayName = 'Container.Apollo';

export default Container;
