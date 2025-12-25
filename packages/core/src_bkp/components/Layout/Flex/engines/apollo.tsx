/**
 * Apollo Engine - Flex Component
 *
 * Pure HTML + Tailwind implementation.
 */

'use client';

import React from 'react';
import type { FlexProps } from '../types';
import { getGapValue, getJustifyClass, getAlignClass, getWrapClass } from '../types';

const ApolloFlex: React.FC<FlexProps> = ({
  children,
  className = '',
  style,
  vertical = false,
  justify,
  align,
  gap,
  wrap,
  flex,
  inline,
}) => {
  // Build Tailwind class list
  const classes = [
    inline ? 'inline-flex' : 'flex',
    vertical ? 'flex-col' : 'flex-row',
    getJustifyClass(justify),
    getAlignClass(align),
    getWrapClass(wrap),
    className,
  ].filter(Boolean).join(' ');

  const flexStyle: React.CSSProperties = {
    gap: getGapValue(gap),
    flex: flex !== undefined ? flex : undefined,
    ...style,
  };

  return (
    <div className={classes} style={flexStyle}>
      {children}
    </div>
  );
};

ApolloFlex.displayName = 'ApolloFlex';

export default ApolloFlex;
