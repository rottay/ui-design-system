import React from 'react';
import { Avatar as AntAvatar } from 'antd';
import type { AvatarProps } from './types';

export const Avatar: React.FC<AvatarProps> = (props) => {
  return <AntAvatar {...props} />;
};

Avatar.displayName = 'Avatar';
