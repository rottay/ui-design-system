import React from 'react';
import type { CenterProps } from './types';

/**
 * Center component
 * Centers content both vertically and horizontally
 */
export const Center: React.FC<CenterProps> = ({
  children,
  minHeight,
  inline = false,
  className,
  style,
  ...rest
}) => {
  const getMinHeight = () => {
    if (!minHeight) return undefined;
    if (minHeight === 'screen') return '100vh';
    if (minHeight === 'full') return '100%';
    return minHeight;
  };

  const centerStyle: React.CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getMinHeight(),
    ...style,
  };

  return (
    <div className={className} style={centerStyle} {...rest}>
      {children}
    </div>
  );
};

Center.displayName = 'Center';
