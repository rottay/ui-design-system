/**
 * Steps Types
 *
 * Type definitions for the Steps component.
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Step status for indicating completion state.
 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

/**
 * Individual step item configuration.
 */
export interface StepItem {
  /** Step title. */
  title: ReactNode;
  /** Subtitle displayed after the title. */
  subTitle?: ReactNode;
  /** Step description text. */
  description?: ReactNode;
  /** Custom icon for the step. */
  icon?: ReactNode;
  /** Status of this specific step. */
  status?: StepStatus;
  /** Whether this step is disabled. */
  disabled?: boolean;
}

/**
 * Information passed to progressDot render function.
 */
export interface ProgressDotInfo {
  /** Step index (0-based). */
  index: number;
  /** Current status of the step. */
  status: StepStatus;
  /** Step title. */
  title: ReactNode;
  /** Step description. */
  description: ReactNode;
}

/**
 * Props for the Steps component.
 */
export interface StepsProps {
  /** Current step index (0-based). */
  current?: number;
  /** Direction of the steps. */
  direction?: 'horizontal' | 'vertical';
  /** Initial step index for uncontrolled mode. */
  initial?: number;
  /** Label placement relative to the step icon. */
  labelPlacement?: 'horizontal' | 'vertical';
  /** Percentage of current step progress (0-100). */
  percent?: number;
  /** Show progress dot instead of number/icon. */
  progressDot?: boolean | ((info: ProgressDotInfo) => ReactNode);
  /** Enable responsive behavior. */
  responsive?: boolean;
  /** Size of the steps. */
  size?: 'default' | 'small';
  /** Overall status of the current step. */
  status?: StepStatus;
  /** Type/style of the steps. */
  type?: 'default' | 'navigation' | 'inline';
  /** Callback when step changes. */
  onChange?: (current: number) => void;
  /** Array of step items to display. */
  items: StepItem[];
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
  /** Rendering engine override. */
  engine?: 'titan' | 'hermes' | 'apollo';
}

export const STEPS_DEFAULTS: Partial<StepsProps> = {
  current: 0,
  direction: 'horizontal',
  initial: 0,
  labelPlacement: 'horizontal',
  responsive: true,
  size: 'default',
  status: 'process',
  type: 'default',
};
