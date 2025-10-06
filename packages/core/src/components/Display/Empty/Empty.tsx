import React from 'react';
import { Empty as AntEmpty } from 'antd';
import type { EmptyProps } from './types';

export const Empty: React.FC<EmptyProps> = (props) => {
  return <AntEmpty {...props} />;
};

Empty.displayName = 'Empty';
