import React from 'react';
import type { SpacerProps } from './types';

/**
 * Spacer component
 * Takes up remaining space in a flex container to push elements apart
 */
export const Spacer: React.FC<SpacerProps> = ({
  className,
  style,
  ...rest
}) => {
  const spacerStyle: React.CSSProperties = {
    flex: 1,
    ...style,
  };

  return (
    <div className={className} style={spacerStyle} {...rest} />
  );
};

Spacer.displayName = 'Spacer';
