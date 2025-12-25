/**
 * Skeleton - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { SkeletonProps } from './types';

export {
  type SkeletonProps,
  type SkeletonVariant,
  type SkeletonAnimation,
  SKELETON_DEFAULTS,
} from './types';

export { BaseSkeleton } from './base';

export const Skeleton = createEngineComponent<SkeletonProps>('Skeleton', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
