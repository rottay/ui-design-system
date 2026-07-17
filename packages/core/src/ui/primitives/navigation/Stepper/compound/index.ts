/**
 * @fileoverview Stepper Compound Components - Rottay Design System
 * @description Exports for Stepper compound components (Step and Content).
 * These components are used with the compound component pattern for flexible stepper layouts.
 *
 * @remarks
 * Compound components allow for flexible composition of stepper elements.
 * They work with all three engines (Classic, Modern, Rustic) and inherit
 * the parent Stepper's configuration automatically.
 *
 * @example Using Compound Components
 * ```tsx
 * import { Stepper } from '@rottay/design-system';
 *
 * <Stepper current={currentStep} clickable onChange={setStep}>
 *   <Stepper.Step title="Step 1" description="First step" />
 *   <Stepper.Step title="Step 2" description="Second step" />
 *   <Stepper.Step title="Step 3" description="Third step" />
 *
 *   <Stepper.Content stepIndex={0}>
 *     <FirstStepContent />
 *   </Stepper.Content>
 *   <Stepper.Content stepIndex={1}>
 *     <SecondStepContent />
 *   </Stepper.Content>
 *   <Stepper.Content stepIndex={2}>
 *     <ThirdStepContent />
 *   </Stepper.Content>
 * </Stepper>
 * ```
 *
 * @see {@link StepperStep} for individual step component
 * @see {@link StepperContent} for step content panel component
 *
 * @module Stepper/Compound
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Component Exports
// ============================================================================

export { StepperStep } from './Step';
export { StepperContent } from './Content';

// ============================================================================
// Type Exports
// ============================================================================

export type { StepProps, StepContentProps } from '../contracts';
