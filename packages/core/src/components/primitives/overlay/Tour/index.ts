/**
 * Tour Component
 *
 * A multi-step guided tour component that highlights elements and displays
 * informational popovers. Perfect for onboarding flows, feature introductions,
 * and interactive tutorials.
 *
 * @component
 * @example
 * ```tsx
 * // Basic tour
 * const steps = [
 *   { target: '#step1', title: 'Welcome', description: 'Start here' },
 *   { target: '#step2', title: 'Next', description: 'Continue here' },
 *   { target: () => document.querySelector('.feature'), title: 'Feature' },
 * ];
 *
 * <Tour steps={steps} open={isOpen} onClose={() => setIsOpen(false)} />
 *
 * // With ref targets
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * const steps = [
 *   { target: buttonRef, title: 'Click here', description: 'Start action' },
 * ];
 *
 * // Primary styled tour
 * <Tour
 *   steps={steps}
 *   type="primary"
 *   open={isOpen}
 *   onFinish={() => console.log('Tour completed')}
 * />
 * ```
 *
 * @see {@link TourProps} for available props
 * @see {@link TourStepProps} for step configuration
 * @see {@link TourPlacement} for placement options
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { TourProps } from './types';

export {
  type TourProps,
  type TourStepProps,
  type TourPlacement,
  type TourType,
  TOUR_DEFAULTS,
} from './types';

/**
 * Tour component with multi-engine support.
 * Provides guided tours with spotlight effects and step navigation.
 *
 * @param props - Tour configuration props
 * @param props.steps - Array of tour steps with targets and content
 * @param props.current - Current step index (controlled mode)
 * @param props.open - Whether the tour is visible
 * @param props.onChange - Callback when step changes
 * @param props.onClose - Callback when tour is closed
 * @param props.onFinish - Callback when tour completes
 * @param props.type - Visual style ('default' | 'primary')
 * @param props.mask - Whether to show backdrop mask
 * @param props.arrow - Whether to show arrow pointing to target
 * @param props.placement - Default popover placement
 * @returns The tour overlay with spotlight and popover
 */
export const Tour = createEngineComponent<TourProps>('Tour', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Tour;
