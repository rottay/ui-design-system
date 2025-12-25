/**
 * Hermes Skeleton Engine
 *
 * DaisyUI Skeleton implementation with adapter for unified props.
 * Implements unified SkeletonProps interface.
 */

'use client';

import { cn } from '../../../../utils/cn';
import type { SkeletonProps } from '../../../../types/components/skeleton';

/**
 * Hermes Skeleton - DaisyUI implementation with unified SkeletonProps
 */
function HermesSkeleton({
  avatar,
  loading = true,
  paragraph,
  title = true,
  round = false,
  className,
  style,
  children,
}: SkeletonProps) {
  // If loading is false and children provided, show children
  if (!loading && children) {
    return <>{children}</>;
  }

  // Parse avatar configuration
  const avatarConfig = avatar
    ? typeof avatar === 'boolean'
      ? { shape: 'circle' as const, size: 'medium' as const }
      : { shape: avatar.shape ?? 'circle', size: avatar.size ?? 'medium' }
    : null;

  // Parse title configuration
  const titleConfig = title
    ? typeof title === 'boolean'
      ? { width: '40%' }
      : { width: title.width ?? '40%' }
    : null;

  // Parse paragraph configuration
  const paragraphConfig = paragraph
    ? typeof paragraph === 'boolean'
      ? { rows: 3, width: '100%' }
      : {
          rows: paragraph.rows ?? 3,
          width: paragraph.width ?? '100%',
        }
    : null;

  // Avatar size classes for DaisyUI
  const avatarSizeClass = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  }[avatarConfig?.size ?? 'medium'];

  // Avatar shape classes for DaisyUI
  const avatarShapeClass = avatarConfig?.shape === 'square' ? 'rounded' : 'rounded-full';

  // Round shape for simple skeleton
  const roundClass = round ? 'rounded-full' : 'rounded';

  // If only round prop is set (simple circular skeleton)
  if (round && !avatar && !title && !paragraph) {
    return (
      <div className={cn('skeleton w-12 h-12 rounded-full shrink-0', className)} style={style} />
    );
  }

  return (
    <div className={cn('flex gap-4', className)} style={style}>
      {avatarConfig && (
        <div className={cn('skeleton shrink-0', avatarSizeClass, avatarShapeClass)} />
      )}

      <div className="flex-1 space-y-3">
        {titleConfig && (
          <div
            className={cn('skeleton h-4', roundClass)}
            style={{
              width: typeof titleConfig.width === 'number' ? `${titleConfig.width}px` : titleConfig.width
            }}
          />
        )}

        {paragraphConfig && (
          <div className="space-y-2">
            {Array.from({ length: paragraphConfig.rows }).map((_, index) => {
              let rowWidth: string | number = '100%';

              if (Array.isArray(paragraphConfig.width)) {
                const w = paragraphConfig.width[index] ?? paragraphConfig.width[paragraphConfig.width.length - 1] ?? '100%';
                rowWidth = typeof w === 'number' ? `${w}px` : w;
              } else {
                // Last row is typically shorter
                if (index === paragraphConfig.rows - 1) {
                  rowWidth = '60%';
                } else {
                  const w = paragraphConfig.width;
                  rowWidth = typeof w === 'number' ? `${w}px` : (w ?? '100%');
                }
              }

              return (
                <div
                  key={index}
                  className={cn('skeleton h-3', roundClass)}
                  style={{
                    width: typeof rowWidth === 'number' ? `${rowWidth}px` : String(rowWidth),
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

HermesSkeleton.displayName = 'HermesSkeleton';

export default HermesSkeleton;
