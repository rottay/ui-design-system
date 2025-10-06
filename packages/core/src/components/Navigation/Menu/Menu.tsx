import React from 'react';
import { Menu as AntMenu } from 'antd';
import type { MenuProps } from './types';

export const Menu: React.FC<MenuProps> = (props) => {
  return <AntMenu {...props} />;
};

Menu.displayName = 'Menu';
