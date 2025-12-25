/**
 * Hermes Engine - Container Component
 *
 * Container implementation using DaisyUI classes.
 */

'use client';

import React from 'react';
import type { ContainerProps } from '../types';
import { getMaxWidth } from '../types';

const HermesContainer: React.FC<ContainerProps> = ({
  children,
  className = '',
  style,
  maxWidth = 'lg',
  padding = true,
  centered = true,
  fluid = false,
}) => {
  // Build class list
  const classes = [
    centered && 'mx-auto',
    padding && 'px-4',
    className,
  ].filter(Boolean).join(' ');

  const containerStyle: React.CSSProperties = {
    maxWidth: fluid ? '100%' : getMaxWidth(maxWidth),
    width: '100%',
    ...style,
  };

  return (
    <div className={classes} style={containerStyle}>
      {children}
    </div>
  );
};

HermesContainer.displayName = 'HermesContainer';

export default HermesContainer;
