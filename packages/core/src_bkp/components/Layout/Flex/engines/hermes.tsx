/**
 * Hermes Engine - Flex Component
 *
 * DaisyUI + Tailwind implementation.
 */

'use client';

import React from 'react';
import type { FlexProps } from '../types';
import { getGapValue, getJustifyClass, getAlignClass, getWrapClass } from '../types';

const HermesFlex: React.FC<FlexProps> = ({
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

HermesFlex.displayName = 'HermesFlex';

export default HermesFlex;
