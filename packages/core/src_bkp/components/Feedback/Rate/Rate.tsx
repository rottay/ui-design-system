import React from 'react';
import { Rate as AntRate } from 'antd';
import type { RateProps } from './types';

export const Rate: React.FC<RateProps> = (props) => {
  return <AntRate {...props} />;
};

Rate.displayName = 'Rate';
