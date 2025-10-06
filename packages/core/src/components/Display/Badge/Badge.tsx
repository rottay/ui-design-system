import React from 'react';
import { Badge as AntBadge } from 'antd';
import type { BadgeProps } from './types';

export const Badge: React.FC<BadgeProps> = (props) => {
  return <AntBadge {...props} />;
};

Badge.displayName = 'Badge';
