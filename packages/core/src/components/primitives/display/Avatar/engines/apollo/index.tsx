/**
 * Avatar - Apollo Engine (Pure HTML/CSS)
 */

import React from 'react';
import type { AvatarProps } from '../types';
import { AVATAR_DEFAULTS, SIZE_MAP } from '../types';

export default function ApolloAvatar(props: AvatarProps): React.ReactElement {
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

  const sizeValue = SIZE_MAP[size!];
  
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeValue,
    height: sizeValue,
    borderRadius: shape === 'circle' ? '50%' : '8px',
    overflow: 'hidden',
    backgroundColor: 'var(--color-neutral-200, #e5e5e5)',
    color: 'var(--color-neutral-600, #525252)',
    fontSize: sizeValue * 0.4,
    fontWeight: 500,
    cursor: onClick ? 'pointer' : undefined,
    ...style,
  };

  return (
    <div className={className} style={containerStyle} onClick={onClick}>
      {src ? <img src={src} alt={alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (icon || children)}
    </div>
  );
}
