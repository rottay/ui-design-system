import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type CheckoutFormPreset = 'multi-step' | 'single-page';

export interface CheckoutStep {
  key: string;
  title: string;
  content: ReactNode;
}

export interface CheckoutFormProps extends EngineAwareProps {
  preset?: CheckoutFormPreset;
  steps: CheckoutStep[];
  onSubmit?: () => void;
  onBack?: () => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  orderSummary?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CHECKOUT_FORM_DEFAULTS = {
  preset: 'multi-step' as CheckoutFormPreset,
  currentStep: 0,
};
