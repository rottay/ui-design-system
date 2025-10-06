import React from 'react';
import { FloatButton } from 'antd';
import type { BackTopProps } from './types';

export const BackTop: React.FC<BackTopProps> = (props) => {
  return <FloatButton.BackTop {...props} />;
};

BackTop.displayName = 'BackTop';
