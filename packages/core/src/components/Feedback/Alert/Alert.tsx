import React from 'react';
import { Alert as AntAlert } from 'antd';
import type { AlertProps } from './types';

export const Alert: React.FC<AlertProps> = (props) => {
  return <AntAlert {...props} />;
};

Alert.displayName = 'Alert';
