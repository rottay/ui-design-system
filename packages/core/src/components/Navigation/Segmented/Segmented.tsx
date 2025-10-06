import React from 'react';
import { Segmented as AntSegmented } from 'antd';
import type { SegmentedProps } from './types';

export const Segmented: React.FC<SegmentedProps> = (props) => {
  return <AntSegmented {...props} />;
};

Segmented.displayName = 'Segmented';
