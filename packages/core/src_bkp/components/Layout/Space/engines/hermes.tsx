/**
 * Hermes Engine - Space Component
 *
 * DaisyUI + Tailwind implementation.
 */

'use client';

import React from 'react';
import type { SpaceProps } from '../types';
import { parseSpaceSize, getSpaceAlignClass } from '../types';

const HermesSpace: React.FC<SpaceProps> = ({
  children,
  className = '',
  style,
  size = 'small',
  direction = 'horizontal',
  align,
  wrap,
  split,
}) => {
  const [hGap, vGap] = parseSpaceSize(size);
  const isVertical = direction === 'vertical';

  const classes = [
    'flex',
    isVertical ? 'flex-col' : 'flex-row',
    wrap ? 'flex-wrap' : '',
    getSpaceAlignClass(align),
    className,
  ].filter(Boolean).join(' ');

  const spaceStyle: React.CSSProperties = {
    gap: isVertical ? vGap : hGap,
    ...style,
  };

  // Render children with optional split
  const items = React.Children.toArray(children).filter(Boolean);
  const renderedItems = split
    ? items.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < items.length - 1 && <span className="space-split">{split}</span>}
        </React.Fragment>
      ))
    : items;

  return (
    <div className={classes} style={spaceStyle}>
      {renderedItems}
    </div>
  );
};

HermesSpace.displayName = 'HermesSpace';

export default HermesSpace;
