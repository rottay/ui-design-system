import React from 'react';
import { Progress as AntProgress } from 'antd';
import type { ProgressProps } from './types';

export const Progress: React.FC<ProgressProps> = (props) => {
  return <AntProgress {...props} />;
};

Progress.displayName = 'Progress';
