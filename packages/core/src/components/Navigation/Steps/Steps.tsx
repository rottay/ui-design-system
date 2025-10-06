import React from 'react';
import { Steps as AntSteps } from 'antd';
import type { StepsProps } from './types';

export const Steps: React.FC<StepsProps> = (props) => {
  return <AntSteps {...props} />;
};

Steps.displayName = 'Steps';
