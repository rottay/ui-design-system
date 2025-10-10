import React from 'react';
import type { ContainerProps } from './types';

/**
 * Container component
 * Content container with max-width and automatic horizontal centering
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  padding = true,
  centered = true,
  fluid = false,
  className,
  style,
  ...rest
}) => {
  const maxWidths = {
    xs: '640px',
    sm: '768px',
    md: '1024px',
    lg: '1280px',
    xl: '1536px',
    '2xl': '1600px',
    full: '100%',
  };

  const paddings = {
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2rem',
    xl: '2rem',
    '2xl': '2rem',
    full: '2rem',
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: fluid ? '100%' : maxWidths[size],
    marginLeft: centered ? 'auto' : undefined,
    marginRight: centered ? 'auto' : undefined,
    paddingLeft: padding ? paddings[size] : undefined,
    paddingRight: padding ? paddings[size] : undefined,
    ...style,
  };

  return (
    <div className={className} style={containerStyle} {...rest}>
      {children}
    </div>
  );
};

Container.displayName = 'Container';
