/**
 * Skeleton - Titan Engine (Ant Design)
 */

import React from 'react';
import { Skeleton as AntSkeleton } from 'antd';
import type { SkeletonProps } from '../types';
import { SKELETON_DEFAULTS } from '../types';

export default function TitanSkeleton(props: SkeletonProps): React.ReactElement {
  const {
    variant = SKELETON_DEFAULTS.variant,
    width,
    height,
    animation = SKELETON_DEFAULTS.animation,
    rows = SKELETON_DEFAULTS.rows,
    active = SKELETON_DEFAULTS.active,
    avatar,
    avatarSize = SKELETON_DEFAULTS.avatarSize,
    avatarShape = SKELETON_DEFAULTS.avatarShape,
    paragraph,
    title,
    className,
    style,
  } = props;

  if (variant === 'circular' || variant === 'rectangular' || variant === 'rounded') {
    const skeletonStyle: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius:
        variant === 'circular' ? '50%' : variant === 'rounded' ? '6px' : 0,
      ...style,
    };

    return (
      <AntSkeleton.Button
        active={active}
        shape={variant === 'circular' ? 'circle' : 'square'}
        style={skeletonStyle}
        className={className}
      />
    );
  }

  const paragraphConfig =
    typeof paragraph === 'object' ? paragraph : paragraph ? { rows } : false;

  return (
    <AntSkeleton
      active={active}
      avatar={avatar ? { size: avatarSize, shape: avatarShape } : false}
      paragraph={paragraphConfig}
      title={title}
      className={className}
      style={style}
    />
  );
}
