/**
 * EvOnboardingFlow - Core Interface
 * Platform onboarding wizard
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvOnboardingFlowPreset = 'organizer' | 'venue';

export interface OnboardingStep {
  key: string;
  label: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
  icon?: ReactNode;
}

export interface OnboardingFormData {
  organizationName?: string;
  contactEmail?: string;
  venueAddress?: string;
  capacity?: number;
  eventType?: string;
}

export interface EvOnboardingFlowProps extends EngineAwareProps {
  preset?: EvOnboardingFlowPreset;
  steps?: OnboardingStep[];
  currentStep?: number;
  formData?: Partial<OnboardingFormData>;
  onStepComplete?: (step: number) => void;
  onFinish?: (data: OnboardingFormData) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_ONBOARDING_FLOW_DEFAULTS: Partial<EvOnboardingFlowProps> = {
  preset: 'organizer',
  currentStep: 0,
};
