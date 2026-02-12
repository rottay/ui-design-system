/**
 * StepWizard - Type Definitions
 *
 * Multi-step form wizard with progress tracking and per-step validation.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

export interface WizardStep {
  /** Unique key for this step */
  key: string;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Step content */
  content: ReactNode;
  /** Optional icon */
  icon?: ReactNode;
  /** Whether this step can be skipped */
  optional?: boolean;
  /** Validation function - return true if valid, string for error message */
  validate?: () => boolean | string | Promise<boolean | string>;
}

export interface StepWizardProps extends PatternBaseProps {
  /** Ordered list of wizard steps */
  steps: WizardStep[];
  /** Current active step index (controlled) */
  currentStep?: number;
  /** Callback when step changes */
  onStepChange?: (step: number) => void;
  /** Callback when wizard is completed */
  onComplete?: () => void;
  /** Allow skipping optional steps */
  allowSkip?: boolean;
  /** Show progress indicator */
  showProgress?: boolean;
  /** Orientation of the step indicator */
  orientation?: 'horizontal' | 'vertical';
  /** Label for the next button */
  nextLabel?: string;
  /** Label for the previous button */
  prevLabel?: string;
  /** Label for the complete button */
  completeLabel?: string;
  /** Label for the skip button */
  skipLabel?: string;
  /** Extra content rendered in the footer area */
  footer?: ReactNode;
}
