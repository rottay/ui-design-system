import React from 'react';
import { Anchor as AntAnchor } from 'antd';
import type { AnchorProps } from './types';

export const Anchor: React.FC<AnchorProps> = (props) => {
  return <AntAnchor {...props} />;
};

Anchor.displayName = 'Anchor';
