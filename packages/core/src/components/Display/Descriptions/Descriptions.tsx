import React from 'react';
import { Descriptions as AntDescriptions } from 'antd';
import type { DescriptionsProps } from './types';

export const Descriptions: React.FC<DescriptionsProps> & {
  Item: typeof AntDescriptions.Item;
} = (props) => {
  return <AntDescriptions {...props} />;
};

Descriptions.displayName = 'Descriptions';
Descriptions.Item = AntDescriptions.Item;
