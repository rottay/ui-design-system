/**
 * BhOnboardingFlow - Core Interface
 * DB Reference: DBRecruiter from @rottay/recruiter
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBRecruiter } from '@rottay/recruiter';

export type BhOnboardingFlowPreset = 'admin-setup' | 'recruiter-welcome';

/** Re-export for consumer convenience */
export type { DBRecruiter };

export interface OnboardingStep {
  key: string;
  label: string;
  description?: string;
  isComplete: boolean;
  isActive: boolean;
  icon?: ReactNode;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'file' | 'toggle' | 'number' | 'url';
  required?: boolean;
  value?: string | number | boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  helpText?: string;
  error?: string;
}

export interface PreviewItem {
  label: string;
  value: string | ReactNode;
}

export interface HelpTooltip {
  targetStep: string;
  content: string;
  title?: string;
  learnMoreUrl?: string;
}

export interface BhOnboardingFlowProps extends EngineAwareProps {
  preset?: BhOnboardingFlowPreset;
  steps: OnboardingStep[];
  currentStep: number;
  formData?: Record<string, any>;
  formFields?: FormField[];
  previewItems?: PreviewItem[];
  helpTooltips?: HelpTooltip[];
  onStepChange?: (step: number) => void;
  onFormChange?: (field: string, value: any) => void;
  onComplete?: () => void;
  onSkip?: (stepKey: string) => void;
  title?: string;
  subtitle?: string;
  logo?: ReactNode;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  completeLabel?: string;
  showPreview?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_ONBOARDING_FLOW_DEFAULTS: Partial<BhOnboardingFlowProps> = {
  preset: 'admin-setup',
  nextLabel: 'Continue',
  backLabel: 'Back',
  skipLabel: 'Skip for now',
  completeLabel: 'Complete Setup',
  showPreview: true,
};
