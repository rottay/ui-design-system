/**
 * @fileoverview Type definitions for the StepWizard pattern component.
 * Defines the {@link WizardStep} interface representing a single step with
 * optional async validation, and the {@link StepWizardProps} controlling
 * step navigation, progress display, orientation, and completion actions.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

/**
 * Represents a single step in the wizard flow.
 *
 * Each step has a unique key, presentational fields (title, description, icon),
 * renderable content, and an optional validation function that gates forward
 * navigation. Validation may be synchronous or asynchronous.
 */
export interface WizardStep {
  /** Unique key used to identify and track this step internally. */
  key: string;

  /** Human-readable title displayed in the step indicator. */
  title: string;

  /** Optional description shown below the title in the step indicator. */
  description?: string;

  /** The renderable body of this step, displayed when the step is active. */
  content: ReactNode;

  /** Optional icon rendered alongside the step title in the indicator. */
  icon?: ReactNode;

  /**
   * Whether this step can be skipped via the skip button.
   * Only effective when `allowSkip` is enabled on the parent wizard.
   */
  optional?: boolean;

  /**
   * Validation function invoked before navigating away from this step.
   * Return `true` to allow navigation, or a `string` containing the error
   * message to block it. Supports async validators (e.g., server-side checks).
   */
  validate?: () => boolean | string | Promise<boolean | string>;
}

/**
 * Props for the StepWizard pattern component.
 *
 * Supports both controlled (`currentStep` + `onStepChange`) and uncontrolled
 * usage. The wizard renders an ordered sequence of steps with navigation
 * buttons, an optional progress indicator, and a final completion action.
 *
 * @example
 * ```tsx
 * <StepWizard
 *   steps={[
 *     { key: 'info', title: 'Basic Info', content: <InfoForm /> },
 *     { key: 'review', title: 'Review', content: <ReviewStep /> },
 *   ]}
 *   currentStep={0}
 *   onStepChange={(step) => setStep(step)}
 *   onComplete={() => handleSubmit()}
 *   showProgress
 *   orientation="horizontal"
 *   completeLabel="Submit"
 * />
 * ```
 */
export interface StepWizardProps extends PatternBaseProps {
  /** Ordered list of wizard steps to render. */
  steps: WizardStep[];

  /**
   * Current active step index (zero-based). When provided, the wizard
   * operates in controlled mode and requires `onStepChange` to update.
   */
  currentStep?: number;

  /** Callback fired when the active step index changes. */
  onStepChange?: (step: number) => void;

  /** Callback fired when the user clicks the final completion button. */
  onComplete?: () => void;

  /**
   * Disables all navigation actions (next, prev, skip, complete).
   * Useful while async work (e.g., form submission) is in flight.
   */
  actionsDisabled?: boolean;

  /**
   * Disables only the final completion action without affecting
   * step-to-step navigation buttons.
   */
  completeDisabled?: boolean;

  /**
   * Whether to render the final completion action button.
   * Set to `false` to hide it entirely (e.g., when completion is
   * handled externally).
   */
  showCompleteAction?: boolean;

  /**
   * Enables the skip button for steps marked as `optional`.
   * When `false`, optional steps still require forward navigation.
   */
  allowSkip?: boolean;

  /** Whether to render a progress bar or step counter above the content. */
  showProgress?: boolean;

  /**
   * Orientation of the step indicator rail.
   * - `'horizontal'`: Steps laid out left-to-right (default).
   * - `'vertical'`: Steps stacked top-to-bottom with content beside them.
   */
  orientation?: 'horizontal' | 'vertical';

  /** Custom label for the "Next" navigation button. */
  nextLabel?: string;

  /** Custom label for the "Previous" navigation button. */
  prevLabel?: string;

  /** Custom label for the final "Complete" button. */
  completeLabel?: string;

  /** Custom label for the "Skip" button on optional steps. */
  skipLabel?: string;

  /** Extra content rendered in the footer area below navigation buttons. */
  footer?: ReactNode;
}
