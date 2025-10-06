import React from 'react';
import { Tag as AntTag } from 'antd';
import type { TagProps } from './types';

export const Tag: React.FC<TagProps> = (props) => {
  return <AntTag {...props} />;
};

Tag.displayName = 'Tag';
