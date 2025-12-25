/**
 * Avatar - Titan Engine (Ant Design)
 */

import React from 'react';
import { Avatar as AntAvatar } from 'antd';
import type { AvatarProps } from '../types';
import { AVATAR_DEFAULTS, SIZE_MAP } from '../types';

export default function TitanAvatar(props: AvatarProps): React.ReactElement {
  const {
    src,
    alt,
    size = AVATAR_DEFAULTS.size,
    shape = AVATAR_DEFAULTS.shape,
    icon,
    children,
    onClick,
    className,
    style,
  } = props;

  return (
    <AntAvatar
      src={src}
      alt={alt}
      size={SIZE_MAP[size!]}
      shape={shape}
      icon={icon}
      onClick={onClick}
      className={className}
      style={style}
    >
      {children}
    </AntAvatar>
  );
}
