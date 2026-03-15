import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type MultiStepFormPreset = 'stepper' | 'tabs' | 'card-stack';

export interface FormStep {
  key: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  content: ReactNode;
  /** Whether this step is valid/complete */
  isValid?: boolean;
  optional?: boolean;
}

export interface MultiStepFormProps extends EngineAwareProps {
  preset?: MultiStepFormPreset;
  steps: FormStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  nextLabel?: string;
  backLabel?: string;
  submitLabel?: string;
  cancelLabel?: string;
  /** Whether to allow clicking step indicators to navigate */
  allowStepClick?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const MULTI_STEP_FORM_DEFAULTS: Partial<MultiStepFormProps> = {
  preset: 'stepper',
  nextLabel: 'Next',
  backLabel: 'Back',
  submitLabel: 'Submit',
  cancelLabel: 'Cancel',
  allowStepClick: false,
};
