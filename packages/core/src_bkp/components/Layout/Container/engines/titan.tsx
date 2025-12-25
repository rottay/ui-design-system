/**
 * Titan Engine - Container Component
 *
 * Container implementation for Ant Design.
 * Since AntD doesn't have a native Container component,
 * this provides a custom implementation with consistent API.
 */

'use client';

import React from 'react';
import type { ContainerProps } from '../types';
import { getMaxWidth } from '../types';

const TitanContainer: React.FC<ContainerProps> = ({
  children,
  className,
  style,
  maxWidth = 'lg',
  padding = true,
  centered = true,
  fluid = false,
}) => {
  const containerStyle: React.CSSProperties = {
    maxWidth: fluid ? '100%' : getMaxWidth(maxWidth),
    width: '100%',
    ...(centered && {
      marginLeft: 'auto',
      marginRight: 'auto',
    }),
    ...(padding && {
      paddingLeft: '16px',
      paddingRight: '16px',
    }),
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      {children}
    </div>
  );
};

TitanContainer.displayName = 'TitanContainer';

export default TitanContainer;
