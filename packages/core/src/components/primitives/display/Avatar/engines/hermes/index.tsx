/**
 * Avatar - Hermes Engine (DaisyUI)
 */

import React from 'react';
import type { AvatarProps } from '../types';
import { AVATAR_DEFAULTS, SIZE_MAP } from '../types';

export default function HermesAvatar(props: AvatarProps): React.ReactElement {
  const {
    src,
    alt,
    size = AVATAR_DEFAULTS.size,
    shape = AVATAR_DEFAULTS.shape,
    icon,
    children,
    onClick,
    className = '',
    style,
  } = props;

  const sizeValue = SIZE_MAP[size!];
  const maskClass = shape === 'circle' ? 'mask-circle' : 'mask-squircle';

  return (
    <div className={`avatar ${className}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined, ...style }}>
      <div className={`mask ${maskClass}`} style={{ width: sizeValue, height: sizeValue }}>
        {src ? <img src={src} alt={alt || ''} /> : <div className="bg-neutral text-neutral-content flex items-center justify-center" style={{ width: '100%', height: '100%' }}>{icon || children}</div>}
      </div>
    </div>
  );
}
