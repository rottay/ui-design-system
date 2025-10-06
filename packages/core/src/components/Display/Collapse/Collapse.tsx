import React from 'react';
import { Collapse as AntCollapse } from 'antd';
import type { CollapseProps } from './types';

export const Collapse: React.FC<CollapseProps> = (props) => {
  return <AntCollapse {...props} />;
};

Collapse.displayName = 'Collapse';
