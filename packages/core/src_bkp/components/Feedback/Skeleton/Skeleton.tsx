'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { SkeletonProps } from '../../../types/components/skeleton';

// Import Titan (AntD) engine directly for default usage
import TitanSkeleton from './engines/titan';

/**
 * Skeleton Component
 *
 * Multi-engine skeleton that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Skeleton (default)
 * - hermes: DaisyUI Skeleton (lazy loaded)
 * - apollo: Native HTML + Tailwind Skeleton with animate-pulse (lazy loaded)
 * - athena: Falls back to apollo implementation
 *
 * @example
 * ```tsx
 * <Skeleton active />
 *
 * <Skeleton avatar paragraph={{ rows: 4 }} />
 *
 * <Skeleton loading={isLoading}>
 *   <div>Content to show when loaded</div>
 * </Skeleton>
 * ```
 */
export const Skeleton = createEngineComponent<SkeletonProps>({
  titan: TitanSkeleton,
  hermes: lazyEngine(() =>
    import('./engines/hermes').then((m) => ({
      default: m.default,
    }))
  ),
  apollo: lazyEngine(() =>
    import('./engines/apollo').then((m) => ({
      default: m.default,
    }))
  ),
  athena: lazyEngine(() =>
    import('./engines/athena').then((m) => ({
      default: m.default,
    }))
  ),
}, { displayName: 'Skeleton' });

// Export unified type
export type { SkeletonProps } from '../../../types/components/skeleton';
