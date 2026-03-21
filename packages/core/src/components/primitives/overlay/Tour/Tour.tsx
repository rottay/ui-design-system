'use client';

/**
 * @fileoverview Tour - multi-step guided onboarding with spotlight and popovers.
 * Targets can be CSS selectors, React refs, or getter functions.
 * Provides mask overlay, step navigation, and onChange/onClose/onFinish callbacks.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * const steps = [
 *   { target: '#sidebar', title: 'Navigation', description: 'Browse sections here' },
 *   { target: btnRef, title: 'Create', description: 'Click to add a new item' },
 * ];
 * <Tour steps={steps} open={showTour} onFinish={() => markOnboarded()} />
 * ```
 *
 * @module Tour
 * @category Overlay
 */
import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { TourProps } from './Tour.types';

export {
  type TourProps,
  type TourStepProps,
  type TourPlacement,
  type TourType,
  TOUR_DEFAULTS,
} from './Tour.types';

/** Tour component with multi-engine support. No compound sub-components. */
export const Tour = createEngineComponent<TourProps>('Tour', {
  classic: () => import('./engines/classic'),  // Ant Design Tour
  modern: () => import('./engines/modern'),     // DaisyUI / Tailwind
  rustic: () => import('./engines/rustic'),      // Vanilla spotlight + popover
});

export default Tour;
