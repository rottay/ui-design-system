/**
 * @fileoverview Stepper Type Definitions - Rottay Design System
 * @description TypeScript interfaces and types for the Stepper component.
 * Provides comprehensive type safety for all stepper configurations.
 *
 * @remarks
 * These types support the multi-engine architecture of the Rottay Design System,
 * ensuring consistent API across Classic, Modern, and Rustic implementations.
 *
 * @module Stepper/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../../../types/common';
import type { EngineAwareProps } from '../../../../../types/engine';

// ============================================================================
// Direction Types
// ============================================================================

/**
 * Stepper layout direction.
 *
 * @description
 * - `horizontal`: Steps arranged in a row (default)
 * - `vertical`: Steps arranged in a column
 *
 * @example
 * ```tsx
 * <Stepper direction="vertical" items={steps} />
 * ```
 */
export type StepperDirection = 'horizontal' | 'vertical';

// ============================================================================
// Size Types
// ============================================================================

/**
 * Stepper size variants.
 *
 * @description
 * Controls the overall size of step icons, text, and spacing.
 * - `sm`: Compact size for tight spaces
 * - `md`: Standard size (default)
 * - `lg`: Large size for prominent display
 *
 * @example
 * ```tsx
 * <Stepper size="lg" items={steps} />
 * ```
 */
export type StepperSize = 'sm' | 'md' | 'lg';

// ============================================================================
// Variant Types
// ============================================================================

/**
 * Stepper visual variants.
 *
 * @description
 * - `default`: Standard stepper with numbered circles
 * - `simple`: Minimal styling without heavy decorations
 * - `circles`: Emphasized circular step indicators
 *
 * @example
 * ```tsx
 * <Stepper variant="simple" items={steps} />
 * ```
 */
export type StepperVariant = 'default' | 'simple' | 'circles';

// ============================================================================
// Status Types
// ============================================================================

/**
 * Individual step status.
 *
 * @description
 * - `wait`: Step not yet reached (future step)
 * - `process`: Currently active step
 * - `finish`: Completed step
 * - `error`: Step with an error
 *
 * @example
 * ```tsx
 * const steps = [
 *   { title: 'Done', status: 'finish' },
 *   { title: 'Error', status: 'error' },
 *   { title: 'Pending', status: 'wait' },
 * ];
 * ```
 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

// ============================================================================
// Label Placement Types
// ============================================================================

/**
 * Label placement relative to step icon.
 *
 * @description
 * - `horizontal`: Label appears beside the icon
 * - `vertical`: Label appears below the icon
 *
 * @example
 * ```tsx
 * <Stepper labelPlacement="vertical" items={steps} />
 * ```
 */
export type LabelPlacement = 'horizontal' | 'vertical';

// ============================================================================
// Main Component Props
// ============================================================================

/**
 * Main Stepper component props.
 *
 * @description
 * Complete configuration for the Stepper component, supporting both
 * controlled and uncontrolled modes, multiple layouts, and full
 * multi-engine compatibility.
 *
 * @example
 * ```tsx
 * const stepperProps: StepperProps = {
 *   items: [{ title: 'Step 1' }, { title: 'Step 2' }],
 *   current: 0,
 *   direction: 'horizontal',
 *   clickable: true,
 *   onChange: (step) => console.log('Changed to step:', step),
 * };
 * ```
 */
export interface StepperProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Current step index (0-based, controlled).
   * When provided, component operates in controlled mode.
   */
  current?: number;

  /**
   * Default current step (uncontrolled).
   * Used when `current` is not provided.
   * @default 0
   */
  defaultCurrent?: number;

  /**
   * Stepper layout direction.
   * @default 'horizontal'
   */
  direction?: StepperDirection;

  /**
   * Stepper size variant.
   * @default 'md'
   */
  size?: StepperSize;

  /**
   * Stepper visual style variant.
   * @default 'default'
   */
  variant?: StepperVariant;

  /**
   * Current step status override.
   * Overrides the computed status of the current step.
   */
  status?: StepStatus;

  /**
   * Label placement relative to step icon.
   * @default 'horizontal'
   */
  labelPlacement?: LabelPlacement;

  /**
   * Whether steps are clickable for navigation.
   * When true, users can click on steps to navigate.
   * @default false
   */
  clickable?: boolean;

  /**
   * Callback fired when step changes.
   * Only triggered when `clickable` is true.
   * @param current - The new current step index
   */
  onChange?: (current: number) => void;

  /**
   * Initial step index for uncontrolled mode.
   * @deprecated Use `defaultCurrent` instead
   * @default 0
   */
  initial?: number;

  /**
   * Progress percentage for current step (0-100).
   * Displays a progress indicator within the current step.
   */
  percent?: number;

  /**
   * Whether to show progress dots instead of numbers.
   * Can be a boolean or a render function for custom dots.
   * @default false
   */
  progressDot?: boolean | ((dot: ReactNode, info: { index: number; status: StepStatus; title: ReactNode; description: ReactNode }) => ReactNode);

  /**
   * Whether to switch to vertical layout on small screens.
   * Enables responsive behavior.
   * @default false
   */
  responsive?: boolean;

  /**
   * Step items array (alternative to compound components).
   * Use this for simple steppers without custom content.
   */
  items?: StepItem[];
}

// ============================================================================
// Step Item Interface
// ============================================================================

/**
 * Step item configuration for the `items` prop.
 *
 * @description
 * Defines individual step properties when using the items array pattern
 * instead of compound components.
 *
 * @example
 * ```tsx
 * const items: StepItem[] = [
 *   { title: 'Account', description: 'Create account', icon: <UserIcon /> },
 *   { title: 'Verify', description: 'Email verification' },
 *   { title: 'Complete', description: 'All done!' },
 * ];
 * ```
 */
export interface StepItem {
  /**
   * Step title text or element.
   * Main label displayed for the step.
   */
  title: ReactNode;

  /**
   * Step description text or element.
   * Additional context shown below the title.
   */
  description?: ReactNode;

  /**
   * Step subtitle text or element.
   * Displayed inline with the title.
   */
  subTitle?: ReactNode;

  /**
   * Custom icon for the step.
   * Replaces the default number/check icon.
   */
  icon?: ReactNode;

  /**
   * Step status override.
   * Overrides the computed status based on current step.
   */
  status?: StepStatus;

  /**
   * Whether the step is disabled.
   * Disabled steps cannot be clicked.
   */
  disabled?: boolean;
}

// ============================================================================
// Step Compound Component Props
// ============================================================================

/**
 * Stepper.Step compound component props.
 *
 * @description
 * Props for individual step components when using the compound pattern.
 *
 * @example
 * ```tsx
 * <Stepper.Step
 *   title="Account Setup"
 *   description="Create your account"
 *   icon={<UserIcon />}
 * />
 * ```
 */
export interface StepProps extends BaseComponentProps, WithChildren {
  /**
   * Step title text or element.
   */
  title: ReactNode;

  /**
   * Step description text or element.
   */
  description?: ReactNode;

  /**
   * Step subtitle (displayed after title).
   */
  subTitle?: ReactNode;

  /**
   * Custom icon for the step.
   */
  icon?: ReactNode;

  /**
   * Step status override.
   */
  status?: StepStatus;

  /**
   * Whether the step is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Step index (set internally by Stepper).
   * @internal
   */
  stepIndex?: number;

  /**
   * Whether this is the active step.
   * @internal
   */
  active?: boolean;

  /**
   * Click handler (set internally when clickable).
   * @internal
   */
  onClick?: () => void;
}

// ============================================================================
// Content Compound Component Props
// ============================================================================

/**
 * Stepper.Content compound component props.
 *
 * @description
 * Props for step content panels that display based on the current step.
 * Supports animations when transitioning between steps.
 *
 * @example
 * ```tsx
 * <Stepper.Content stepIndex={0} animation="slide">
 *   <AccountForm />
 * </Stepper.Content>
 * ```
 */
export interface StepContentProps extends BaseComponentProps, WithChildren {
  /**
   * Which step this content belongs to (0-based index).
   * Content is displayed when this matches the current step.
   */
  stepIndex: number;

  /**
   * Animation type when switching content.
   * - `fade`: Opacity transition
   * - `slide`: Horizontal slide transition
   * - `none`: No animation
   * @default 'fade'
   */
  animation?: 'fade' | 'slide' | 'none';

  /**
   * Whether to keep inactive content mounted in the DOM.
   * Useful for preserving form state between steps.
   * @default false
   */
  keepMounted?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for Stepper component.
 *
 * @description
 * Provides consistent default configuration across all engine implementations.
 */
export const STEPPER_DEFAULTS = {
  /** Default starting step */
  defaultCurrent: 0,
  /** Default layout direction */
  direction: 'horizontal' as const,
  /** Default size */
  size: 'md' as const,
  /** Default visual variant */
  variant: 'default' as const,
  /** Default label position */
  labelPlacement: 'horizontal' as const,
  /** Default clickable state */
  clickable: false,
  /** Default progress dot display */
  progressDot: false,
  /** Default responsive behavior */
  responsive: false,
};

// ============================================================================
// Size Mappings
// ============================================================================

/**
 * Size mapping for step icons.
 *
 * @description
 * Pixel dimensions for step icon containers at each size.
 */
export const SIZE_MAP: Record<StepperSize, number> = {
  sm: 24,
  md: 32,
  lg: 40,
};

/**
 * Font size mapping for step text.
 *
 * @description
 * Font sizes in pixels for title and description at each size.
 */
export const FONT_SIZE_MAP: Record<StepperSize, { title: number; description: number }> = {
  sm: { title: 12, description: 11 },
  md: { title: 14, description: 12 },
  lg: { title: 16, description: 14 },
};
