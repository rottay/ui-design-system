/**
 * Skeleton Component with compound components
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { SkeletonProps } from './types';
import { SkeletonAvatar, SkeletonText, SkeletonButton } from './compound';

export {
  type SkeletonProps,
  type SkeletonVariant,
  type SkeletonAnimation,
  SKELETON_DEFAULTS,
} from './types';

export { BaseSkeleton } from './base';

export { SkeletonAvatar, SkeletonText, SkeletonButton };
export type { SkeletonAvatarProps, SkeletonTextProps, SkeletonButtonProps } from './compound';

export const Skeleton = Object.assign(
  createEngineComponent<SkeletonProps>('Skeleton', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Avatar: SkeletonAvatar,
    Text: SkeletonText,
    Button: SkeletonButton,
  }
);
