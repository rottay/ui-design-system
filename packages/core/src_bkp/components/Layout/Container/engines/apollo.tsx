/**
 * Apollo Engine - Container Component
 *
 * Pure HTML + Tailwind implementation.
 */

'use client';

import React from 'react';
import type { ContainerProps } from '../types';

// Tailwind max-width classes
const maxWidthClasses: Record<string, string> = {
  xs: 'max-w-[480px]',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

const ApolloContainer: React.FC<ContainerProps> = ({
  children,
  className = '',
  style,
  maxWidth = 'lg',
  padding = true,
  centered = true,
  fluid = false,
}) => {
  // Build Tailwind class list
  const classes = [
    'w-full',
    centered && 'mx-auto',
    padding && 'px-4',
    !fluid && (typeof maxWidth === 'string' ? maxWidthClasses[maxWidth] : ''),
    className,
  ].filter(Boolean).join(' ');

  // Handle numeric maxWidth via inline style
  const containerStyle: React.CSSProperties = {
    ...(typeof maxWidth === 'number' && !fluid && { maxWidth: `${maxWidth}px` }),
    ...(fluid && { maxWidth: '100%' }),
    ...style,
  };

  return (
    <div className={classes} style={containerStyle}>
      {children}
    </div>
  );
};

ApolloContainer.displayName = 'ApolloContainer';

export default ApolloContainer;
