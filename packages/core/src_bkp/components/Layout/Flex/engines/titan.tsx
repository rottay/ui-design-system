/**
 * Titan Engine - Flex Component
 *
 * Wraps Ant Design's Flex component.
 */

'use client';

import React from 'react';
import { Flex as AntFlex } from 'antd';
import type { FlexProps } from '../types';

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
  baseline: 'baseline',
  stretch: 'stretch',
};

const TitanFlex: React.FC<FlexProps> = ({
  children,
  className,
  style,
  vertical = false,
  justify,
  align,
  gap,
  wrap,
  flex,
  inline,
}) => {
  // Convert wrap to AntD format
  let wrapValue: boolean | 'nowrap' | 'wrap' | 'wrap-reverse' | undefined;
  if (typeof wrap === 'boolean') {
    wrapValue = wrap;
  } else if (wrap === 'nowrap') {
    wrapValue = false;
  } else if (wrap === 'wrap' || wrap === 'wrap-reverse') {
    wrapValue = wrap;
  }

  return (
    <AntFlex
      className={className}
      style={{
        display: inline ? 'inline-flex' : undefined,
        flex: flex !== undefined ? flex : undefined,
        ...style,
      }}
      vertical={vertical}
      justify={justify ? justifyMap[justify] : undefined}
      align={align ? alignMap[align] : undefined}
      gap={gap}
      wrap={wrapValue}
    >
      {children}
    </AntFlex>
  );
};

TitanFlex.displayName = 'TitanFlex';

export default TitanFlex;
