import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type OnboardingWizardPreset = 'stepper' | 'cards' | 'minimal';

export interface OnboardingStep {
  key: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  content: ReactNode;
  optional?: boolean;
}

export interface OnboardingWizardProps extends EngineAwareProps {
  preset?: OnboardingWizardPreset;
  steps: OnboardingStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  completeLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ONBOARDING_WIZARD_DEFAULTS: Partial<OnboardingWizardProps> = {
  preset: 'stepper',
  nextLabel: 'Continue',
  backLabel: 'Back',
  skipLabel: 'Skip',
  completeLabel: 'Complete',
};
