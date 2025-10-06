import React from 'react';
import { Spin as AntSpin } from 'antd';
import type { SpinProps } from './types';

export const Spin: React.FC<SpinProps> = (props) => {
  return <AntSpin {...props} />;
};

Spin.displayName = 'Spin';
