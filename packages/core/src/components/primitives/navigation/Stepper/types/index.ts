/**
 * Stepper - Core Interface
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../../../types/common';
import type { EngineAwareProps } from '../../../../../types/engine';

/**
 * Stepper direction.
 */
export type StepperDirection = 'horizontal' | 'vertical';

/**
 * Stepper size.
 */
export type StepperSize = 'sm' | 'md' | 'lg';

/**
 * Stepper variant.
 */
export type StepperVariant = 'default' | 'simple' | 'circles';

/**
 * Step status.
 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

/**
 * Label placement.
 */
export type LabelPlacement = 'horizontal' | 'vertical';

/**
 * Base Stepper component props.
 */
export interface StepperProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Current step index (0-based, controlled).
   */
  current?: number;

  /**
   * Default current step (uncontrolled).
   * @default 0
   */
  defaultCurrent?: number;

  /**
   * Stepper direction.
   * @default 'horizontal'
   */
  direction?: StepperDirection;

  /**
   * Stepper size.
   * @default 'md'
   */
  size?: StepperSize;

  /**
   * Stepper variant/style.
   * @default 'default'
   */
  variant?: StepperVariant;

  /**
   * Current step status (overrides step's own status).
   */
  status?: StepStatus;

  /**
   * Label placement relative to icon.
   * @default 'horizontal'
   */
  labelPlacement?: LabelPlacement;

  /**
   * Whether steps are clickable to navigate.
   * @default false
   */
  clickable?: boolean;

  /**
   * Callback when step changes (when clickable is true).
   */
  onChange?: (current: number) => void;

  /**
   * Initial step index for uncontrolled mode.
   * @default 0
   */
  initial?: number;

  /**
   * Percentage of current step progress (0-100).
   * Only works for current step.
   */
  percent?: number;

  /**
   * Whether to show step progress line.
   * @default true
   */
  progressDot?: boolean | ((dot: ReactNode, info: { index: number; status: StepStatus; title: ReactNode; description: ReactNode }) => ReactNode);

  /**
   * Responsive breakpoint to switch to vertical.
   */
  responsive?: boolean;

  /**
   * Custom items (alternative to children).
   */
  items?: StepItem[];
}

/**
 * Step item interface for items prop.
 */
export interface StepItem {
  /**
   * Step title.
   */
  title: ReactNode;

  /**
   * Step description.
   */
  description?: ReactNode;

  /**
   * Step subtitle.
   */
  subTitle?: ReactNode;

  /**
   * Custom icon.
   */
  icon?: ReactNode;

  /**
   * Step status (overrides computed status).
   */
  status?: StepStatus;

  /**
   * Whether step is disabled.
   */
  disabled?: boolean;
}

/**
 * Stepper.Step component props.
 */
export interface StepProps extends BaseComponentProps, WithChildren {
  /**
   * Step title.
   */
  title: ReactNode;

  /**
   * Step description.
   */
  description?: ReactNode;

  /**
   * Step subtitle (displayed after title).
   */
  subTitle?: ReactNode;

  /**
   * Custom icon.
   */
  icon?: ReactNode;

  /**
   * Step status.
   */
  status?: StepStatus;

  /**
   * Whether step is disabled.
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

/**
 * Stepper.Content component props.
 */
export interface StepContentProps extends BaseComponentProps, WithChildren {
  /**
   * Which step this content belongs to (0-based index).
   */
  stepIndex: number;

  /**
   * Animation type when switching content.
   * @default 'fade'
   */
  animation?: 'fade' | 'slide' | 'none';

  /**
   * Whether to keep inactive content mounted.
   * @default false
   */
  keepMounted?: boolean;
}

/**
 * Default values for Stepper.
 */
export const STEPPER_DEFAULTS = {
  defaultCurrent: 0,
  direction: 'horizontal' as const,
  size: 'md' as const,
  variant: 'default' as const,
  labelPlacement: 'horizontal' as const,
  clickable: false,
  progressDot: false,
  responsive: false,
};

/**
 * Size mapping for step icons.
 */
export const SIZE_MAP: Record<StepperSize, number> = {
  sm: 24,
  md: 32,
  lg: 40,
};

/**
 * Font size mapping.
 */
export const FONT_SIZE_MAP: Record<StepperSize, { title: number; description: number }> = {
  sm: { title: 12, description: 11 },
  md: { title: 14, description: 12 },
  lg: { title: 16, description: 14 },
};
