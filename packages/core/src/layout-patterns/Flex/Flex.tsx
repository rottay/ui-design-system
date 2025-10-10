import React from 'react';
import type { FlexProps } from './types';

/**
 * Flex component
 * Flexible flexbox wrapper with full control over flex properties
 */
export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  align,
  justify,
  wrap = false,
  gap,
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

  const getGapValue = () => {
    if (!gap) return undefined;
    return typeof gap === 'number' ? `${gap}px` : gaps[gap];
  };

  const flexStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    gap: getGapValue(),
    ...style,
  };

  return (
    <div className={className} style={flexStyle} {...rest}>
      {children}
    </div>
  );
};

Flex.displayName = 'Flex';
