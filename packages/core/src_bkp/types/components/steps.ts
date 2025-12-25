/**
 * Steps Component Types
 *
 * Unified type definitions for Steps component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Status of a step
 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

/**
 * Individual step item definition
 */
export interface StepItem {
  // Required
  title: ReactNode;

  // Optional
  description?: ReactNode;
  icon?: ReactNode;
  status?: StepStatus;
  disabled?: boolean;
  subTitle?: ReactNode;
}

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface StepsBaseProps {
  // Step items (primary way to define steps)
  items?: StepItem[];

  // Current active step (0-based index)
  current?: number;

  // Callback when step is clicked (for clickable steps)
  onChange?: (current: number) => void;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Accessibility
  id?: string;
  'aria-label'?: string;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface StepsProps extends StepsBaseProps {
  // Direction of steps
  direction?: 'horizontal' | 'vertical';

  // Type of steps display
  type?: 'default' | 'navigation' | 'inline';

  // Size of steps
  size?: 'small' | 'default';

  // Status of current step (can override individual step status)
  status?: StepStatus;

  // Progress percentage (0-100) for current step
  percent?: number;

  // Label placement relative to icon/number
  labelPlacement?: 'horizontal' | 'vertical';

  // Responsive behavior
  responsive?: boolean;

  // Progress dot style (AntD specific)
  progressDot?: boolean | ((iconDot: ReactNode, step: StepItem & { index: number }) => ReactNode);

  // Initial step (for uncontrolled mode)
  initial?: number;
}

/**
 * Type guard to check if steps are controlled
 */
export function isControlledSteps(props: StepsProps): boolean {
  return props.current !== undefined;
}

/**
 * Type guard to check if steps are uncontrolled
 */
export function isUncontrolledSteps(props: StepsProps): boolean {
  return props.current === undefined && props.initial !== undefined;
}
