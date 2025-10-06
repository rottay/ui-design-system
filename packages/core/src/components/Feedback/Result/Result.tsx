import React from 'react';
import { Result as AntResult } from 'antd';
import type { ResultProps } from './types';

export const Result: React.FC<ResultProps> = (props) => {
  return <AntResult {...props} />;
};

Result.displayName = 'Result';
