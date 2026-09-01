/**
 * @fileoverview `structure/feedback/surface-lifecycle` -- the one canonical
 * family for everything a surface shows when it is not showing its content.
 *
 * @description Three owners, one row:
 *
 *   - `states/` -- the five lifecycle states, one per value of the
 *     `SurfaceState` union that can render (`loading`, `empty`, `error`,
 *     `stale`/`refreshing`, `offline`);
 *   - `use-surface-state/` -- the state machine that derives which of the five
 *     applies and renders it;
 *   - `error-boundary/` -- the React boundary that catches a crash inside a
 *     surface and turns it into a contained, retryable failure.
 *
 * They belong together because they are one contract seen from three angles:
 * the machine decides, the states render, and the boundary catches the case
 * the machine cannot observe -- a throw during render. Splitting them let the
 * lifecycle ship twice (see `states/index.tsx` for the convergence that ended
 * that) and let the boundary drift onto a surfaces support path where no
 * family row could claim it.
 *
 * This is the only surface-lifecycle family. There is no legacy path, no
 * alias, and no compatibility re-export; callers use these names.
 */

export {
  SurfaceLoadingSkeleton,
  SurfaceEmptyState,
  SurfaceErrorState,
  SurfaceStaleBanner,
  SurfaceOfflineBanner,
} from './states';

export type {
  SurfaceLoadingSkeletonProps,
  SurfaceEmptyStateProps,
  SurfaceErrorStateProps,
  SurfaceStaleBannerProps,
  SurfaceOfflineBannerProps,
} from './states';

export { useSurfaceState } from './use-surface-state';

export type {
  SurfaceState,
  SurfaceStateRenderConfig,
  UseSurfaceStateOptions,
  UseSurfaceStateReturn,
} from './use-surface-state';

export { SurfaceErrorBoundary } from './error-boundary';
export type { SurfaceErrorBoundaryProps } from './error-boundary';
