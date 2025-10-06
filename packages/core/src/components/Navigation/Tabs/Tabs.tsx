import React from 'react';
import { Tabs as AntTabs } from 'antd';
import type { TabsProps } from './types';

export const Tabs: React.FC<TabsProps> = (props) => {
  return <AntTabs {...props} />;
};

Tabs.displayName = 'Tabs';
