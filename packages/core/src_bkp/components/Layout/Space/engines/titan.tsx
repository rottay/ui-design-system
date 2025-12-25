/**
 * Titan Engine - Space Component
 *
 * Wraps Ant Design's Space component.
 */

'use client';

import React from 'react';
import { Space as AntSpace } from 'antd';
import type { SpaceProps } from '../types';

const TitanSpace: React.FC<SpaceProps> = ({
  children,
  className,
  style,
  size = 'small',
  direction = 'horizontal',
  align,
  wrap,
  split,
}) => {
  return (
    <AntSpace
      className={className}
      style={style}
      size={size}
      direction={direction}
      align={align}
      wrap={wrap}
      split={split}
    >
      {children}
    </AntSpace>
  );
};

TitanSpace.displayName = 'TitanSpace';

export default TitanSpace;
