'use client';

/**
 * @fileoverview Tour Component - Rottay Design System
 * @description A multi-step guided tour component that highlights elements and displays
 * informational popovers. Perfect for onboarding flows, feature introductions,
 * interactive tutorials, and new user education.
 *
 * @remarks
 * The Tour component creates spotlight-guided experiences that walk users through
 * features and workflows. It's ideal for:
 * - New user onboarding flows
 * - Feature introduction after updates
 * - Interactive tutorials and help systems
 * - Complex workflow guidance
 * - Contextual product education
 *
 * Key features:
 * - **Multi-engine support**: Titan (Ant Design), Hermes (DaisyUI), Apollo (Vanilla)
 * - **Flexible targeting**: CSS selectors, React refs, or getter functions
 * - **Spotlight effect**: Highlights target with mask overlay
 * - **Step navigation**: Previous/Next buttons with step indicators
 * - **Callback hooks**: onChange, onClose, onFinish for full control
 * - **Visual types**: Default or primary styling
 *
 * @example Basic tour with CSS selector targets
 * ```tsx
 * import { Tour, Button } from '@rottay/design-system';
 *
 * const steps = [
 *   { target: '#step1', title: 'Welcome', description: 'Start here' },
 *   { target: '#step2', title: 'Next Step', description: 'Continue here' },
 *   { target: '.feature', title: 'Feature', description: 'Try this!' },
 * ];
 *
 * <Tour steps={steps} open={isOpen} onClose={() => setIsOpen(false)} />
 * ```
 *
 * @example Tour with React ref targets
 * ```tsx
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * const inputRef = useRef<HTMLInputElement>(null);
 *
 * const steps = [
 *   { target: buttonRef, title: 'Click here', description: 'Start the action' },
 *   { target: inputRef, title: 'Enter data', description: 'Type your info' },
 * ];
 *
 * <Tour steps={steps} open={tourOpen} onFinish={() => markComplete()} />
 * ```
 *
 * @example Primary styled tour with cover images
 * ```tsx
 * const steps = [
 *   {
 *     target: '#dashboard',
 *     title: 'Your Dashboard',
 *     description: 'View all your metrics here',
 *     cover: <img src="/dashboard-guide.png" alt="Guide" />,
 *   },
 *   {
 *     target: '#settings',
 *     title: 'Settings',
 *     description: 'Customize your experience',
 *   },
 * ];
 *
 * <Tour
 *   steps={steps}
 *   type="primary"
 *   open={isOpen}
 *   onFinish={() => console.log('Tour completed')}
 * />
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Titan engine (Ant Design - default)
 * <Tour engine="titan" steps={steps} open={isOpen} mask />
 *
 * // Hermes engine (DaisyUI/Tailwind)
 * <Tour engine="hermes" steps={steps} type="primary" open={isOpen} />
 *
 * // Apollo engine (Pure HTML/CSS)
 * <Tour engine="apollo" steps={steps} open={isOpen} zIndex={2000} />
 * ```
 *
 * @see {@link TourProps} for available props
 * @see {@link TourStepProps} for step configuration
 * @see {@link TourPlacement} for placement options
 * @module Tour
 * @category Overlay
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
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
