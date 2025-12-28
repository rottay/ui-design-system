/**
 * @fileoverview Stepper Component - Rottay Design System
 * @description A navigation component that guides users through multi-step processes
 * with visual feedback. Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The Stepper component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Titan (Ant Design), Hermes (DaisyUI), and Apollo
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - stepper styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage with Items
 * ```tsx
 * import { Stepper } from '@rottay/design-system';
 *
 * function CheckoutWizard() {
 *   const [current, setCurrent] = useState(0);
 *
 *   return (
 *     <Stepper
 *       items={[
 *         { title: 'Cart', description: 'Review items' },
 *         { title: 'Shipping', description: 'Enter address' },
 *         { title: 'Payment', description: 'Add payment method' },
 *         { title: 'Confirm', description: 'Place order' },
 *       ]}
 *       current={current}
 *     />
 *   );
 * }
 * ```
 *
 * @example With Compound Components
 * ```tsx
 * import { Stepper, Button } from '@rottay/design-system';
 *
 * <Stepper current={step} clickable onChange={setStep}>
 *   <Stepper.Step title="Account" description="Create your account" />
 *   <Stepper.Step title="Profile" description="Complete your profile" />
 *   <Stepper.Step title="Verify" description="Verify your email" />
 *   <Stepper.Content stepIndex={0}>
 *     <AccountForm onComplete={() => setStep(1)} />
 *   </Stepper.Content>
 *   <Stepper.Content stepIndex={1}>
 *     <ProfileForm onComplete={() => setStep(2)} />
 *   </Stepper.Content>
 *   <Stepper.Content stepIndex={2}>
 *     <VerificationForm />
 *   </Stepper.Content>
 * </Stepper>
 * ```
 *
 * @example Vertical Direction
 * ```tsx
 * // Vertical stepper for sidebar navigation
 * <Stepper
 *   direction="vertical"
 *   items={steps}
 *   current={current}
 *   clickable
 *   onChange={handleStepChange}
 * />
 * ```
 *
 * @example With Error State
 * ```tsx
 * // Show error on specific step
 * <Stepper
 *   items={[
 *     { title: 'Step 1', status: 'finish' },
 *     { title: 'Step 2', status: 'error', description: 'Validation failed' },
 *     { title: 'Step 3' },
 *   ]}
 *   current={1}
 * />
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Stepper automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Stepper items={steps} current={current}>
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *   </Stepper>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Stepper engine="hermes" items={steps} current={current}>
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 * </Stepper>
 * ```
 *
 * @see {@link StepperProps} for complete prop documentation
 * @see {@link StepperStep} for step compound component
 * @see {@link StepperContent} for content compound component
 * @see {@link Steps} for related Ant Design Steps component
 *
 * @module Stepper
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { StepperProps } from './types';
import { StepperStep, StepperContent } from './compound';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  StepperProps,
  StepItem,
  StepperDirection,
  StepperSize,
  StepperVariant,
  StepStatus,
  LabelPlacement,
  StepProps,
  StepContentProps,
} from './types';
export { STEPPER_DEFAULTS, SIZE_MAP, FONT_SIZE_MAP } from './types';

// ============================================================================
// Compound Component Exports
// ============================================================================

export { StepperStep, StepperContent };

// ============================================================================
// Base Component Export
// ============================================================================


// ============================================================================
// Main Component
// ============================================================================

/**
 * Stepper component with multi-engine support and compound components.
 *
 * @description
 * A navigation component that guides users through multi-step workflows. Ideal for:
 * - Checkout flows and wizards
 * - Form completion progress
 * - Onboarding sequences
 * - Multi-stage processes
 * - Tutorial walkthroughs
 *
 * @remarks
 * - Supports horizontal and vertical orientations
 * - Includes clickable step navigation
 * - Provides keyboard navigation (Apollo engine)
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 * - Supports progress percentage display
 *
 * @param props - {@link StepperProps}
 * @returns React component with Step and Content compound components
 *
 * @example
 * ```tsx
 * <Stepper
 *   items={[
 *     { title: 'Step 1', description: 'First step' },
 *     { title: 'Step 2', description: 'Second step' },
 *   ]}
 *   current={0}
 *   clickable
 *   onChange={(step) => setCurrent(step)}
 * />
 * ```
 */
export const Stepper = Object.assign(
  createEngineComponent<StepperProps>('Stepper', {
    /** Ant Design implementation - full-featured with animations */
    titan: () => import('./engines/titan'),
    /** DaisyUI/Tailwind implementation - utility-first styling */
    hermes: () => import('./engines/hermes'),
    /** Vanilla HTML/CSS implementation - maximum accessibility */
    apollo: () => import('./engines/apollo'),
  }),
  {
    /**
     * Individual step in the stepper.
     * Contains title, description, and optional icon.
     * @see {@link StepperStep}
     */
    Step: StepperStep,

    /**
     * Content panel for each step.
     * Supports fade/slide animations between steps.
     * @see {@link StepperContent}
     */
    Content: StepperContent,
  }
);
