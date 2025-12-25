import React from 'react';
import type { WrapProps } from './types';

/**
 * Wrap component
 * Flexbox with flex-wrap enabled, automatically wraps children to new lines
 */
export const Wrap: React.FC<WrapProps> = ({
  children,
  gap = 'md',
  spacing,
  align,
  justify,
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

  // Use spacing if provided, otherwise use gap
  const effectiveGap = spacing || gap;

  const getGapValue = () => {
    return typeof effectiveGap === 'number' ? `${effectiveGap}px` : gaps[effectiveGap];
  };

  const wrapStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: getGapValue(),
    alignItems: align,
    justifyContent: justify,
    ...style,
  };

  return (
    <div className={className} style={wrapStyle} {...rest}>
      {children}
    </div>
  );
};

Wrap.displayName = 'Wrap';
