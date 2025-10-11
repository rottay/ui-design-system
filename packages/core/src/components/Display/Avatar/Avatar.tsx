import React from 'react';
import { Avatar as AntAvatar } from 'antd';
import type { AvatarProps } from './types';

const AvatarComponent: React.FC<AvatarProps> = (props) => {
  return <AntAvatar {...props} />;
};

AvatarComponent.displayName = 'Avatar';

// Export Avatar with all its subcomponents
export const Avatar = Object.assign(AvatarComponent, {
  Group: AntAvatar.Group,
});
