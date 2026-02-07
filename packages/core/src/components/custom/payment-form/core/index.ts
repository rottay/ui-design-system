import type { EngineAwareProps } from '../../../../types';

export type PaymentFormPreset = 'standard' | 'compact';

export interface PaymentData {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
}

export interface PaymentFormProps extends EngineAwareProps {
  preset?: PaymentFormPreset;
  onSubmit?: (value: PaymentData) => void;
  onChange?: (value: PaymentData) => void;
  brands?: string[];
  className?: string;
  style?: React.CSSProperties;
}

export const PAYMENT_FORM_DEFAULTS = {
  preset: 'standard' as PaymentFormPreset,
  brands: ['visa', 'mastercard', 'amex', 'discover'],
};
