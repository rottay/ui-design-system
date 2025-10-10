import React from 'react';
import type { HStackProps } from './types';

/**
 * HStack component
 * Horizontal layout with automatic spacing between children
 */
export const HStack: React.FC<HStackProps> = ({
  children,
  gap = 'md',
  align,
  wrap = false,
  className,
  style,
  ...rest
}) => {
  const gaps = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  };

  const hstackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: typeof gap === 'number' ? `${gap}px` : gaps[gap],
    alignItems: align,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...style,
  };

  return (
    <div className={className} style={hstackStyle} {...rest}>
      {children}
    </div>
  );
};

HStack.displayName = 'HStack';
