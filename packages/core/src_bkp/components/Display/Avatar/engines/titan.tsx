/**
 * Titan Avatar Engine
 *
 * Adapter that converts unified AvatarProps to Ant Design Avatar.
 */

'use client';

import { Avatar as AntAvatar } from 'antd';
import type { AvatarProps } from '../../../../types/components/avatar';

/**
 * Titan Avatar - Ant Design implementation with unified AvatarProps
 */
function TitanAvatar({
  src,
  srcSet,
  alt,
  size,
  shape,
  icon,
  children,
  className,
  style,
  onError,
  draggable,
  crossOrigin,
  gap,
  'aria-label': ariaLabel,
}: AvatarProps) {
  // Map unified shape to AntD shape (AntD uses 'circle' | 'square')
  const antShape = shape === 'square' ? 'square' : 'circle';

  // Handle onError - AntD expects boolean return or void
  const handleError = onError
    ? () => {
        const result = onError();
        // Convert void to false for AntD
        return result === undefined ? false : result;
      }
    : undefined;

  return (
    <AntAvatar
      src={src}
      srcSet={srcSet}
      alt={alt}
      size={size}
      shape={antShape}
      icon={icon}
      className={className}
      style={style}
      onError={handleError}
      draggable={draggable}
      crossOrigin={crossOrigin}
      gap={gap}
      aria-label={ariaLabel}
    >
      {children}
    </AntAvatar>
  );
}

TitanAvatar.displayName = 'TitanAvatar';

export default TitanAvatar;
