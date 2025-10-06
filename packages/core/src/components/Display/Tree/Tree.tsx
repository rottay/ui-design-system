import React from 'react';
import { Tree as AntTree } from 'antd';
import type { TreeProps } from './types';

export const Tree: React.FC<TreeProps> = (props) => {
  return <AntTree {...props} />;
};

Tree.displayName = 'Tree';
