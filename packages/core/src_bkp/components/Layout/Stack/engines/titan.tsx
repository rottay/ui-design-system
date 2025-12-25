/**
 * Titan Engine - Stack Component
 *
 * Wraps Ant Design's Flex component with vertical direction.
 */

'use client';

import React from 'react';
import { Flex } from 'antd';
import type { StackProps } from '../types';

// Map simplified justify values to AntD values
const justifyMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

// Map simplified align values to AntD values
const alignMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  stretch: 'stretch',
};

const TitanStack: React.FC<StackProps> = ({
  children,
  className,
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

  // Render children with optional divider
  const items = React.Children.toArray(children).filter(Boolean);
  const renderedItems = divider
    ? items.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < items.length - 1 && divider}
        </React.Fragment>
      ))
    : items;

  return (
    <Flex
      className={className}
      style={style}
      vertical
      gap={actualGap}
      justify={justify ? justifyMap[justify] as any : undefined}
      align={align ? alignMap[align] as any : undefined}
      wrap={wrap}
    >
      {renderedItems}
    </Flex>
  );
};

TitanStack.displayName = 'TitanStack';

export default TitanStack;
