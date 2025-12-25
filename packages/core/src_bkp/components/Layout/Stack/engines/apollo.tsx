/**
 * Apollo Engine - Stack Component
 *
 * Pure HTML + Tailwind implementation of vertical flex.
 */

'use client';

import React from 'react';
import type { StackProps } from '../types';
import { getStackGapValue, getStackJustifyClass, getStackAlignClass } from '../types';

const ApolloStack: React.FC<StackProps> = ({
  children,
  className = '',
  style,
  gap,
  spacing,
  justify,
  align,
  wrap,
  divider,
}) => {
  // spacing is alias for gap
  const actualGap = gap ?? spacing;

  const classes = [
    'flex',
    'flex-col',
    getStackJustifyClass(justify),
    getStackAlignClass(align),
    wrap ? 'flex-wrap' : '',
    className,
  ].filter(Boolean).join(' ');

  const stackStyle: React.CSSProperties = {
    gap: getStackGapValue(actualGap),
    ...style,
  };

  // Render children with optional divider
  const items = React.Children.toArray(children).filter(Boolean);
  const renderedItems = divider
    ? items.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < items.length - 1 && <div className="stack-divider">{divider}</div>}
        </React.Fragment>
      ))
    : items;

  return (
    <div className={classes} style={stackStyle}>
      {renderedItems}
    </div>
  );
};

ApolloStack.displayName = 'ApolloStack';

export default ApolloStack;
