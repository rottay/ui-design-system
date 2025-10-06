import React from 'react';
import { Affix as AntAffix } from 'antd';
import type { AffixProps } from './types';

export const Affix: React.FC<AffixProps> = (props) => {
  return <AntAffix {...props} />;
};

Affix.displayName = 'Affix';
