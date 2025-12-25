import React from 'react';
import type { StackProps } from './types';

/**
 * Stack component
 * Vertical layout with automatic spacing between children
 */
export const Stack: React.FC<StackProps> = ({
  children,
  gap = 'md',
  align,
  divider,
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

  const stackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: typeof gap === 'number' ? `${gap}px` : gaps[gap],
    alignItems: align,
    ...style,
  };

  if (!divider) {
    return (
      <div className={className} style={stackStyle} {...rest}>
        {children}
      </div>
    );
  }

  // If divider is provided, insert it between children
  const childrenArray = React.Children.toArray(children);
  const childrenWithDividers = childrenArray.reduce<React.ReactNode[]>((acc, child, index) => {
    acc.push(child);
    if (index < childrenArray.length - 1) {
      acc.push(
        <div key={`divider-${index}`} style={{ width: '100%' }}>
          {divider}
        </div>
      );
    }
    return acc;
  }, []);

  return (
    <div className={className} style={stackStyle} {...rest}>
      {childrenWithDividers}
    </div>
  );
};

Stack.displayName = 'Stack';
