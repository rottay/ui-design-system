/**
 * Titan Skeleton Engine
 *
 * Adapter that converts unified SkeletonProps to Ant Design Skeleton.
 * Maps unified props to AntD-specific props.
 */

'use client';

import { Skeleton as AntSkeleton } from 'antd';
import type { SkeletonProps } from '../../../../types/components/skeleton';

/**
 * Titan Skeleton - Ant Design implementation with unified SkeletonProps
 */
function TitanSkeleton({
  active = true,
  avatar,
  loading = true,
  paragraph,
  title,
  round,
  className,
  style,
  children,
}: SkeletonProps) {
  // If loading is false and children provided, show children
  if (!loading && children) {
    return <>{children}</>;
  }

  // Map unified avatar prop to AntD format
  const antAvatar = avatar
    ? typeof avatar === 'boolean'
      ? true
      : {
          shape: (avatar.shape === 'square' ? 'square' : 'circle') as 'circle' | 'square',
          size: (avatar.size === 'small' ? 'small' : avatar.size === 'large' ? 'large' : 'default') as 'small' | 'large' | 'default',
        }
    : undefined;

  // Map unified title prop to AntD format
  const antTitle = title
    ? typeof title === 'boolean'
      ? true
      : {
          width: title.width,
        }
    : undefined;

  // Map unified paragraph prop to AntD format
  const antParagraph = paragraph
    ? typeof paragraph === 'boolean'
      ? true
      : {
          rows: paragraph.rows,
          width: paragraph.width,
        }
    : undefined;

  return (
    <AntSkeleton
      active={active}
      avatar={antAvatar}
      loading={loading}
      paragraph={antParagraph}
      title={antTitle}
      round={round}
      className={className}
      style={style}
    />
  );
}

TitanSkeleton.displayName = 'TitanSkeleton';

export default TitanSkeleton;
