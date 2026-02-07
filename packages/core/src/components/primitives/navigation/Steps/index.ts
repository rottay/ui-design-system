'use client';

/**
 * @fileoverview Steps Component - Rottay Design System
 * @description A navigation component that displays progress through a sequence
 * of logical and numbered steps. Part of the Rottay Design System's navigation
 * primitives collection.
 *
 * @remarks
 * The Steps component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - steps styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage
 * ```tsx
 * import { Steps } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   const [current, setCurrent] = useState(0);
 *
 *   return (
 *     <Steps
 *       items={[
 *         { title: 'Login', description: 'Enter credentials' },
 *         { title: 'Verify', description: 'Confirm identity' },
 *         { title: 'Done', description: 'Complete registration' },
 *       ]}
 *       current={current}
 *       onChange={setCurrent}
 *     />
 *   );
 * }
 * ```
 *
 * @example Vertical Steps
 * ```tsx
 * import { Steps } from '@rottay/design-system';
 *
 * <Steps
 *   direction="vertical"
 *   items={[
 *     { title: 'Step 1', description: 'First step description' },
 *     { title: 'Step 2', description: 'Second step description' },
 *     { title: 'Step 3', description: 'Third step description' },
 *   ]}
 *   current={1}
 * />
 * ```
 *
 * @example With Custom Icons
 * ```tsx
 * import { Steps } from '@rottay/design-system';
 * import { UserIcon, CheckIcon, MailIcon } from '@heroicons/react/24/outline';
 *
 * <Steps
 *   items={[
 *     { title: 'Account', icon: <UserIcon /> },
 *     { title: 'Verification', icon: <MailIcon /> },
 *     { title: 'Complete', icon: <CheckIcon /> },
 *   ]}
 *   current={0}
 * />
 * ```
 *
 * @example Navigation Type Steps
 * ```tsx
 * // Navigation style for wizard-like interfaces
 * <Steps
 *   type="navigation"
 *   items={[
 *     { title: 'Personal Info', subTitle: 'Required' },
 *     { title: 'Payment', subTitle: 'Optional' },
 *     { title: 'Confirmation' },
 *   ]}
 *   current={1}
 * />
 * ```
 *
 * @example Progress Dot Style
 * ```tsx
 * // Simple dot indicators instead of numbers
 * <Steps
 *   progressDot
 *   items={[
 *     { title: 'Pending', description: 'Waiting for review' },
 *     { title: 'In Progress', description: 'Being processed' },
 *     { title: 'Completed', description: 'All done' },
 *   ]}
 *   current={1}
 * />
 * ```
 *
 * @example With Status Indicators
 * ```tsx
 * // Show error or custom status on specific steps
 * <Steps
 *   items={[
 *     { title: 'Finished', status: 'finish' },
 *     { title: 'Error', status: 'error', description: 'Validation failed' },
 *     { title: 'Waiting', status: 'wait' },
 *   ]}
 *   current={1}
 * />
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Steps automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Steps items={items} current={current}>
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *   </Steps>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Steps engine="modern" items={items} current={0}>
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 * </Steps>
 * ```
 *
 * @see {@link StepsProps} for complete prop documentation
 * @see {@link StepItem} for step item configuration
 * @see {@link StepStatus} for available status types
 * @see {@link ProgressDotInfo} for custom progress dot rendering
 *
 * @module Steps
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { StepsProps } from './types';

// ============================================================================
// Type Exports
// ============================================================================

export {
  type StepsProps,
  type StepItem,
  type StepStatus,
  type ProgressDotInfo,
  STEPS_DEFAULTS,
} from './types';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Steps component with multi-engine support for displaying sequential progress.
 *
 * @description
 * A navigation component that guides users through a multi-step process. Ideal for:
 * - Form wizards and multi-step forms
 * - Checkout processes
 * - Onboarding flows
 * - Progress tracking
 * - Status timelines
 *
 * @remarks
 * - Supports horizontal and vertical layouts
 * - Multiple display types: default, navigation, inline
 * - Progress dot mode for simplified indicators
 * - Custom icons per step
 * - Individual step status (wait, process, finish, error)
 * - Clickable steps with onChange callback
 * - Fully responsive with size variants
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link StepsProps}
 * @returns React component for step-by-step navigation
 *
 * @example
 * ```tsx
 * <Steps
 *   items={[
 *     { title: 'Step 1', description: 'Description' },
 *     { title: 'Step 2', description: 'Description' },
 *     { title: 'Step 3', description: 'Description' },
 *   ]}
 *   current={1}
 *   onChange={(step) => setCurrentStep(step)}
 * />
 * ```
 */
export const Steps = createEngineComponent<StepsProps>('Steps', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic'),
});

export default Steps;
