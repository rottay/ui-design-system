import React from 'react';
import { FloatButton as AntFloatButton } from 'antd';
import type { FloatButtonProps } from './types';

export const FloatButton: React.FC<FloatButtonProps> & {
  Group: typeof AntFloatButton.Group;
  BackTop: typeof AntFloatButton.BackTop;
} = (props) => {
  return <AntFloatButton {...props} />;
};

FloatButton.displayName = 'FloatButton';
FloatButton.Group = AntFloatButton.Group;
FloatButton.BackTop = AntFloatButton.BackTop;
